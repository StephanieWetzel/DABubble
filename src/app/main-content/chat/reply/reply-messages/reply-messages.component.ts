import { AfterViewInit, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { CustomDatePipe } from "../../messages/date-pipe/custom-date.pipe";
import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { ChatService } from '../../../../../assets/services/chat-service/chat.service';
import { Subscription } from 'rxjs';
import { Message } from '../../../../../assets/models/message.class';
import { User } from '../../../../../assets/models/user.class';
import { ProfileAuthentication } from '../../../../../assets/services/profileAuth.service';
import { CustomTimePipe } from "../../messages/time-pipe/custom-time.pipe";
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { FirebaseService } from '../../../../../assets/services/firebase-service';
import tinymce, { RawEditorOptions } from 'tinymce';
import { EditorModule } from '@tinymce/tinymce-angular';
import { MatDialog } from '@angular/material/dialog';
import { FilePreviewDialogComponent } from '../../input-box/file-preview-dialog/file-preview-dialog.component';
import { SafeResourceUrl } from '@angular/platform-browser';


@Component({
  selector: 'app-reply-messages',
  standalone: true,
  templateUrl: './reply-messages.component.html',
  styleUrl: './../../messages/messages.component.scss',
  imports: [CustomDatePipe, NgIf, NgFor, NgClass, CustomTimePipe, MatIconModule, MatMenuModule, EditorModule, CommonModule]
})
export class ReplyMessagesComponent implements AfterViewInit, OnInit {
  @ViewChild('replyContainer') private replyContainer!: ElementRef<HTMLDivElement>;

  public editorId: string = `replyMessages-${Date.now()}`;

  public replyEditEditorInit: RawEditorOptions = {
    suffix: '.min',
    menubar: false,
    toolbar_location: 'bottom',
    border: 'none',
    plugins: 'autoresize emoticons link',
    autoresize_bottom_margin: 0,
    max_height: 500,
    placeholder: 'Nachricht an Chat ... ',
    statusbar: false,
    toolbar: 'emoticons',
    entity_encoding: 'raw',
    setup: editor => {
      editor.on('init', () => {
        if (this.editingMessageId) {
          editor.setContent(this.currentEditingContent);
        }
      });
    }
  };

  @Output() hasOpened = new EventEmitter<{ opened: boolean, userId: string }>();

  subscription = new Subscription;
  replies!: Message[];
  customDatePipe = new CustomDatePipe();
  currentUser!: User;
  currentContent!: string;
  editingMessageId: string = '';
  currentEditingContent: string = '';
  currentEditingFileUrls: string[] = [];
  originalEditingFileUrls: string[] = [];
  menuEditMessage: boolean = false;
  highlightSubscription!: Subscription;
  fileUrls: SafeResourceUrl[] = [];
  deletedImageUrls: string[] = [];

  replyCount: number | any;


  constructor(
    public chatService: ChatService,
    private profileAuth: ProfileAuthentication,
    public firebaseService: FirebaseService,
    public dialog: MatDialog
  ) {
  }


  /**
 * Initializes the component by fetching and subscribing to the current user information.
 * Updates the currentUser property with the fetched user information.
 */
  ngOnInit(): void {
    this.getReplyCount();
    this.profileAuth.initializeUser();
    this.profileAuth.user$.subscribe((user) => {
      if (user) {
        this.currentUser = new User(user);
      }
    })
  }


  /**
 * Subscribes to the replyCount observable from the ChatService to get the latest reply count.
 * Updates the local replyCount variable with the latest value and logs it to the console.
 */
  getReplyCount() {
    this.chatService.replyCount$.subscribe(count => {
      this.replyCount = count;
      console.log(this.replyCount)
    });
  }


  /**
 * Subscribes to message count changes and scrolls to the bottom of the view.
 */
  ngAfterViewInit() {
    this.subscription.add(this.chatService.scrollToBottom$.subscribe(shouldScroll => {
      if (shouldScroll) {
        setTimeout(() => {
          this.scrollToBottom();
          this.chatService.scrollToBottom$.next(false);
        }, 300);
      }
    }));
  }


  /**
 * Emits an event indicating that a profile with the specified ID should be opened.
 * @param id The ID of the profile to open.
 */
  openProfile(id: string) {
    const opened = true;
    const userId = id
    this.hasOpened.emit({ opened, userId });
  }


  /**
 * Scrolls to the bottom of the reply container using smooth animation.
 * Uses requestAnimationFrame for optimal performance.
 * @returns {void} Returns nothing.
 */
  scrollToBottom(): void {
    requestAnimationFrame(() => {
      if (this.replyContainer && this.replyContainer.nativeElement) {
        const lastMessageElement = this.replyContainer.nativeElement.lastElementChild;
        if (lastMessageElement) {
          lastMessageElement.scrollIntoView({ block: 'end', behavior: 'smooth' });
        }
      }
    });
  }


  /**
 * Retrieves the list of replies from the chat service.
 * Updates the local replies property and returns the list of replies.
 * @returns {Message[]} The list of replies retrieved from the chat service.
 */
  getList(): Message[] {
    this.replies = this.chatService.replies;
    return this.chatService.replies;
  }


  /**
 * Checks if the current user ID matches the sender's user ID.
 * @param {string} sender The user ID of the message sender to compare against the current user.
 * @returns {boolean} Returns true if the current user ID matches the sender's user ID, otherwise false.
 */
  isCurrentUserSender(sender: string) {
    return sender === this.currentUser.userId;
  }


  /**
 * Checks if the date of the message at the specified index is different from the previous message.
 * @param {number} index The index of the message to compare with the previous one.
 * @returns {boolean} Returns true if the date of the current message is different from the previous one, otherwise false.
 */
  isDateDifferent(index: number) {
    if (index === 0) return true;
    const currentDateFormatted = this.customDatePipe.transform(this.replies[index].time);
    const previousDateFormatted = this.customDatePipe.transform(this.replies[index - 1].time);
    return currentDateFormatted !== previousDateFormatted;
  }


  /**
 * Formats an array of usernames into a readable string.
 * If there are 1 or 2 usernames, they are joined with ' und '.
 * If there are more than 2 usernames, all but the last are joined with ', ' and the last with ' und '.
 *
 * @param {string[]} users An array of usernames to format.
 * @returns {string} The formatted string of usernames.
 */
  formatUsernames(users: string[]): string {
    if (users.length <= 2) {
      return users.join(' und ');
    } else {
      return `${users.slice(0, -1).join(', ')} und ${users[users.length - 1]}`;
    }
  }


  /**
 * Adds a reaction (emote) to a message identified by its ID.
 * This function calls the 'reactOnMessage' method from 'chatService' to add the reaction and then adds the emote to the last reactions list.
 *
 * @param {string} messageId The ID of the message to react to.
 * @param {string} emote The emote (reaction) to add to the message.
 */
  addReaction(messageId: string, emote: string) {
    this.chatService.reactOnMessage(messageId, emote, this.currentUser.name, true)
    this.addToLastReaction(emote);
  }


  /**
 * Updates the user's last reaction preferences with the provided emote.
 * If the emote is different from the current primary reaction, it updates the secondary and primary reactions accordingly.
 * Then, it updates these preferences in the Firebase service.
 *
 * @param {string} emote The emote (reaction) to add/update.
 */
  addToLastReaction(emote: string) {
    if (emote != this.getReactionEmote1()) {
      this.currentUser.lastReaction2 = this.getReactionEmote1()
      this.currentUser.lastReaction1 = emote
    }
    this.firebaseService.updateLastReaction(this.currentUser.lastReaction1, this.currentUser.lastReaction2, this.currentUser.userId)
  }


  /**
   * Edits a message by initializing the editor with the specified content and file URLs.
   *
   * @param {string} id - The ID of the message to be edited.
   * @param {string} content - The content of the message to be edited.
   * @param {string[]} fileUrls - The file URLs associated with the message.
   */
  editMessage(id: string, content: string, fileUrls: string[]) {
    this.closeEditor();
    this.editingMessageId = id;
    this.currentEditingContent = content;
    this.currentEditingFileUrls = [...fileUrls];
    this.originalEditingFileUrls = [...fileUrls];
    const editorInstance = tinymce.get('editData-' + id);
    if (editorInstance) {
      editorInstance.setContent(content);
    }
  }


  /**
   * Removes an image from the current editing session.
   *
   * @param {number} imgIndex - The index of the image to be removed.
   */
  removeImage(imgIndex: number) {
    const imageUrl = this.currentEditingFileUrls[imgIndex];
    this.deletedImageUrls.push(imageUrl);
    this.currentEditingFileUrls.splice(imgIndex, 1);
  }


  /**
 * Closes the message editor, resetting all editing-related state variables.
 */
  closeEditor() {
    this.editingMessageId = '';
    this.currentEditingContent = '';
    this.currentEditingFileUrls = [];
    this.originalEditingFileUrls = [];
  }


  /**
   * Saves the edited message content and file URLs.
   * If no content or file URLs are present, sets the message content to "Nachricht wurde gelöscht".
   *
   * @param {string} messageId - The ID of the message being edited.
   */
  async saveEdit(messageId: string) {
    const content = this.getInputContent(tinymce.get('editData-' + messageId));
    const message = this.replies.find((msg: any) => msg.messageId === messageId);

    if (message) {
      if (content.trim() === '' && this.currentEditingFileUrls.length === 0) {
        message.content = 'Nachricht wurde gelöscht';
      } else {
        message.content = content;
        message.fileUrls = this.currentEditingFileUrls;
      }

      await this.chatService.editReplyMessage(messageId, message.content, message.fileUrls);

      for (const url of this.deletedImageUrls) {
        await this.chatService.deleteReplyImage(messageId, url);
      }

      this.deletedImageUrls = [];
    }

    this.closeEditor();
  }


  /**
 * Cancels the editing of a message and restores original file URLs.
 * @param {string} messageId - The ID of the message being edited.
 */
  cancelEdit(messageId: string) {
    const originalMessage = this.replies.find((msg: any) => msg.messageId === messageId);
    if (originalMessage) {
      this.currentEditingFileUrls = [...this.originalEditingFileUrls];
      this.deletedImageUrls = [];
    }
    this.closeEditor();
  }


  /**
 * Retrieves the plain text content from a TinyMCE editor instance.
 *
 * @param {any} input - The TinyMCE editor instance.
 * @returns {string} The plain text content of the editor.
 */
  getInputContent(input: any) {
    const content = input.getContent({ format: 'text' });
    return content;
  }


  /**
 * Returns the first reaction emote of the current user.
 * If no reaction is set, returns a default emote.
 * 
 * @returns {string} The first reaction emote of the current user.
 */
  getReactionEmote1(): string {
    return this.currentUser.lastReaction1 && this.currentUser.lastReaction1 ? this.currentUser.lastReaction1 : '🙌🏻';
  }


  /**
 * Returns the second reaction emote of the current user.
 * If no reaction is set, returns a default emote.
 * 
 * @returns {string} The second reaction emote of the current user.
 */
  getReactionEmote2(): string {
    return this.currentUser.lastReaction2 && this.currentUser.lastReaction2 ? this.currentUser.lastReaction2 : '✅';
  }


  /**
   * Opens a file preview dialog for the selected file.
   */
  openFilePreview(url: string) {
    this.dialog.open(FilePreviewDialogComponent, {
      data: { fileUrl: url, fileType: 'image' }
    });
  }


  /**
* Determines the border radius style based on whether the sender matches the current user.
* @param {string} sender - The ID of the message sender.
* @returns {object} CSS style object with border-radius property.
*/
  getMessageStyle(sender: string) {
    return this.isCurrentUserSender(sender) ?
      { 'border-radius': '30px 0 30px 30px' } :
      { 'border-radius': '0 30px 30px 30px' };
  }


  /**
 * Lifecycle hook that is called when the component is destroyed.
 * 
 * This method ensures that any subscriptions are properly unsubscribed to prevent memory leaks.
 */
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}