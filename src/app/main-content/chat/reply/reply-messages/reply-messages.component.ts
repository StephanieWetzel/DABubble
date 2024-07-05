import { AfterViewInit, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { CustomDatePipe } from "../../messages/date-pipe/custom-date.pipe";
import { NgClass, NgFor, NgIf } from '@angular/common';
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

@Component({
  selector: 'app-reply-messages',
  standalone: true,
  templateUrl: './reply-messages.component.html',
  styleUrl: './../../messages/messages.component.scss',
  imports: [CustomDatePipe, NgIf, NgFor, NgClass, CustomTimePipe, MatIconModule, MatMenuModule, EditorModule]
})
export class ReplyMessagesComponent implements AfterViewInit, OnInit {
  @ViewChild('replyContainer') private replyContainer!: ElementRef<HTMLDivElement>;
  subscription = new Subscription;
  replies!: Message[];
  customDatePipe = new CustomDatePipe();
  currentUser!: User;
  currentContent!: string;
  editingMessageId: string = '';
  currentEditingContent: string = '';
  menuEditMessage: boolean = false;

  highlightSubscription!: Subscription;


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


  constructor(public chatService: ChatService, private profileAuth: ProfileAuthentication, public firebaseService: FirebaseService) {
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
   * Initializes the component by fetching and subscribing to the current user information.
   * Updates the currentUser property with the fetched user information.
   */
  ngOnInit(): void {
    this.profileAuth.initializeUser();
    this.profileAuth.user$.subscribe((user) => {
      if (user) {
        this.currentUser = new User(user);
      }
    })
  }


  /**
   * Subscribes to message count changes and scrolls to the bottom of the view.
   */
  ngAfterViewInit() {
    this.subscription.add(this.chatService.scrollToBottom$.subscribe(shouldScroll => {
      // if (shouldScroll) {
      setTimeout(() => {
        this.scrollToBottom();
        this.chatService.scrollToBottom$.next(false);
      }, 300);
      // }
    }));
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
* Extracts the file name from a URL.
* @param {string} url - The URL from which to extract the file name.
* @returns {string} - The extracted file name.
*/
  urlToFileName(url: string): string {
    const decodedUrl = decodeURIComponent(url);
    const parts = decodedUrl.split('/');
    let fileName = parts[parts.length - 1];
    fileName = fileName.split('?')[0];
    return fileName;
  }


  /**
   * Initiates the file download process from a specified URL.
   * @param {string} url - The URL of the file to download.
   * @param {string} filename - The name to assign to the downloaded file.
   */
  async downloadFile(url: string, filename: string): Promise<void> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Network response was not ok. Status: ${response.status}`);
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename || 'downloaded-file';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch (error) {
    }
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
 * @returns {void}
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
 * @returns {void}
 */
  addToLastReaction(emote: string) {
    if (emote != this.getReactionEmote1()) {
      this.currentUser.lastReaction2 = this.getReactionEmote1()
      this.currentUser.lastReaction1 = emote
    }
    this.firebaseService.updateLastReaction(this.currentUser.lastReaction1, this.currentUser.lastReaction2, this.currentUser.userId)
  }


  /**
 * Prepares the editing state for a message with the provided ID and content.
 * Sets the editingMessageId to the provided ID and currentEditingContent to the provided content.
 * Closes any open message editor.
 *
 * @param {string} id The ID of the message to edit.
 * @param {string} content The content of the message to edit.
 * @returns {void}
 */
  editMessage(id: string, content: string) {
    this.closeEditor();
    this.editingMessageId = id;
    this.currentEditingContent = content;
  }


  /**
 * Closes the editor instance associated with the currently editing message ID.
 * If an editor instance exists for the current editing message, it removes the instance.
 * Sets the editingMessageId to 'editOver' to indicate the editor is closed.
 *
 * @returns {void}
 */
  closeEditor() {
    const editorInstance = tinymce.get('editData-' + this.editingMessageId);
    if (editorInstance) {
      editorInstance.remove();
    }
    this.editingMessageId = 'editOver';
  }


  /**
   * Saves the edited message content if safe is true, updates the reply, and closes the editor.
   *
   * @param {boolean} safe - Whether to save the edited content.
   * @param {string} [messageId=''] - Optional. ID of the message being edited.
   * @returns {void}
   */
  safeMessage(safe: boolean, messageId: string = '') {
    if (safe) {
      const content = this.getInputContent(tinymce.get('editData-' + messageId));
      const message = this.replies.find(msg => msg.messageId === messageId);
      if (message) {
        message.content = content;
      }
      this.chatService.editReplyMessage(messageId, content);
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
 * Toggles the edit message menu.
 */
  openEditMessage() {
    this.menuEditMessage = !this.menuEditMessage;
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