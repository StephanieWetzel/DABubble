import { Component, ElementRef, ViewChild, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { ChatService } from '../../../../assets/services/chat-service/chat.service';
import { Message } from '../../../../assets/models/message.class';
import { CommonModule, KeyValuePipe, NgClass } from '@angular/common';
import { CustomDatePipe } from './date-pipe/custom-date.pipe';
import { CustomTimePipe } from './time-pipe/custom-time.pipe';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import tinymce, { RawEditorOptions } from 'tinymce';
import { EditorModule } from '@tinymce/tinymce-angular';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Subscription } from 'rxjs';
import { ProfileAuthentication } from '../../../../assets/services/profileAuth.service';
import { User } from '../../../../assets/models/user.class';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { FirebaseService } from '../../../../assets/services/firebase-service';
import { MatDialog } from '@angular/material/dialog';
import { FilePreviewDialogComponent } from '../input-box/file-preview-dialog/file-preview-dialog.component';
import { SafeResourceUrl } from '@angular/platform-browser';



@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule,
    CustomDatePipe,
    CustomTimePipe,
    MatIconModule,
    MatIcon,
    MatMenuModule,
    KeyValuePipe,
    EditorModule,
    FormsModule,
    MatButtonModule,
    NgClass,
    UserDetailComponent
  ],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MessagesComponent implements AfterViewInit {
  @ViewChild('chatContainer') private chatContainer!: ElementRef<HTMLDivElement>;

  public editorId: string = `messages-${Date.now()}`;

  public editEditorInit: RawEditorOptions = {
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
        if (this.menuEditMessage) {
          editor.setContent(this.currentEditingContent);
        }
      });
    }
  };


  messages;
  time: any;
  date: any;
  menuEditMessage = false;
  customDatePipe = new CustomDatePipe();
  editingMessageId: string = 'editOver';
  currentContent!: string;
  currentEditingContent: string = '';

  currentEditingFileUrls: string[] = [];
  originalEditingFileUrls: string[] = [];

  subscription = new Subscription();
  isShowingProfile: boolean = false;
  selectedProfileId: string = '';
  highlightSubscription!: Subscription;
  currentUser!: User;

  fileUrls: SafeResourceUrl[] = [];


  constructor(
    public chatService: ChatService,
    private profileAuth: ProfileAuthentication,
    public firebaseService: FirebaseService,
    public dialog: MatDialog
  ) {
    this.messages = this.chatService.messages;
  }


  /**
  * Initializes user information when the component is first created.
  */
  ngOnInit() {
    this.profileAuth.initializeUser();
    this.profileAuth.user$.subscribe((user) => {
      if (user) {
        this.currentUser = new User(user);
      }
    })
  }


  /**
 * Sets the selected profile ID and displays the profile details.
 * @param {string} id - The ID of the profile to display.
 */
  showID(id: string) {
    this.selectedProfileId = id;
    this.isShowingProfile = true
  }


  /**
 * Handles the profile closing action.
 * Toggles the 'isShowingProfile' property based on whether the profile has been closed.
 * @param {boolean} hasClosed - Indicates whether the profile has been closed.
 */
  handleProfile(hasClosed: boolean) {
    this.isShowingProfile = !hasClosed;
  }


  /**
 * Subscribes to 'scrollToBottom$' observable from 'chatService'.
 * Scrolls to the bottom of the view when 'shouldScroll' is true.
 * Unsubscribes after scrolling.
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

    this.highlightSubscription = this.chatService.messageId$.subscribe(messageId => {
      if (messageId) {
        this.highlightMessage(messageId);
      }
    });
  }


  /**
 * Highlights a message in the UI by scrolling it into view and applying a CSS class for a brief period.
 * @param {string} messageId - The ID of the message element to highlight.
 */
  highlightMessage(messageId: string) {
    setTimeout(() => {
      const messageElement = document.getElementById(messageId);
      if (messageElement) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        messageElement.classList.add('highlight');
        setTimeout(() => {
          messageElement.classList.remove('highlight');
        }, 4000);
      }
    }, 500);
  }


  /**
   * Determines if the current channel is a direct message based on the length of the channel ID.
   * @returns {boolean} - True if it's a direct message channel, false otherwise.
   */
  isDirectMessage() {
    return this.chatService.currentChannel$.value.length > 25
  }


  /**
   * Scrolls to the bottom of the chat container, typically to show the latest message.
   */
  scrollToBottom(): void {
    requestAnimationFrame(() => {
      if (this.chatContainer && this.chatContainer.nativeElement) {
        const lastMessageElement = this.chatContainer.nativeElement.lastElementChild;
        if (lastMessageElement) {
          lastMessageElement.scrollIntoView({ block: 'end', behavior: 'smooth' });
        }
      }
    });
  }


  /**
  * Calculates the time of the last reply in a list of replies.
  * @param {any[]} replies - Array of reply objects.
  * @returns {number} - The timestamp of the last reply.
  */
  getLastReplyTime(replies: any[]): number {
    if (!replies || replies.length === 0) return 0;
    const lastReply = replies.reduce((latest, reply) => {
      return latest.time > reply.time ? latest : reply;
    });
    return lastReply.time;
  }


  /**
   * Edits a message identified by its ID, updating the editor state with new content and file URLs.
   * @param {string} id - The ID of the message being edited.
   * @param {string} content - The new content of the message.
   * @param {string[]} fileUrls - The new file URLs associated with the message.
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
 * Removes an image from the current editing session for a message.
 * @param {string} messageId - The ID of the message from which the image is being removed.
 * @param {number} imgIndex - The index of the image to be removed from `currentEditingFileUrls`.
 */
  async removeImage(messageId: string, imgIndex: number) {
    const imageUrl = this.currentEditingFileUrls[imgIndex];
    await this.chatService.deleteMessageImage(messageId, imageUrl);
    this.currentEditingFileUrls.splice(imgIndex, 1);
  }


  /**
 * Closes the message editor, resetting all editing-related state variables.
 */
  closeEditor() {
    this.editingMessageId = '';
    this.currentEditingContent = '';
    this.currentEditingFileUrls = [...this.originalEditingFileUrls];
    this.originalEditingFileUrls = [];
  }


  /**
   * Saves the edited message content and file URLs. If no content or file URLs are present,
   * sets the message content to "Nachricht wurde gelöscht".
   * @param {string} messageId - The ID of the message being edited.
   */
  saveEdit(messageId: string) {
    const content = this.getInputContent(tinymce.get('editData-' + messageId));
    const message = this.messages.find((msg: any) => msg.messageId === messageId);

    if (message) {
      if (content.trim() === '' && this.currentEditingFileUrls.length === 0) {
        message.content = 'Nachricht wurde gelöscht';
      } else {
        message.content = content;
        message.fileUrls = this.currentEditingFileUrls;
      }
    }

    this.chatService.editMessage(messageId, message.content, message.fileUrls);
    this.closeEditor();
  }


  /**
 * Cancels the editing of a message and restores original file URLs.
 * @param {string} messageId - The ID of the message being edited.
 */
  cancelEdit(messageId: string) {
    const originalMessage = this.messages.find((msg: any) => msg.messageId === messageId);
    if (originalMessage) {
      originalMessage.fileUrls = [...this.originalEditingFileUrls];
      this.currentEditingFileUrls = [...this.originalEditingFileUrls];
    }
    this.closeEditor();
  }



  /**
   * Retrieves the text content from a TinyMCE editor instance.
   * @param {any} input - The TinyMCE editor instance.
   * @returns {string} - The text content of the editor.
   */
  getInputContent(input: any) {
    const content = input.getContent({ format: 'text' });
    return content;
  }


  /**
   * Determines if the date of a message differs from the previous message in the list.
   * @param {number} index - The index of the message in the list.
   * @returns {boolean} - True if the date is different from the previous message's date.
   */
  isDateDifferent(index: number) {
    if (index === 0) return true;
    const currentDateFormatted = this.customDatePipe.transform(this.messages[index].time);
    const previousDateFormatted = this.customDatePipe.transform(this.messages[index - 1].time);
    return currentDateFormatted !== previousDateFormatted;
  }


  /**
   * Retrieves a list of messages from the chat service.
   * @returns {Message[]} - Array of messages.
   */
  getList(): Message[] {
    this.messages = this.chatService.messages;
    return this.chatService.messages;
  }


  /**
   * Filters messages based on the search input.
   * @returns {Message[]} - Array of filtered messages.
   */
  getFilteredMessages(): Message[] {
    return this.getList()
  }


  /**
   * Determines if the current user is the sender of a message.
   * @param {string} sender - The ID of the sender.
   * @returns {boolean} - True if the current user is the sender.
   */
  isCurrentUserSender(sender: string) {
    return sender === this.currentUser.userId;
  }


  /**
   * Prepares the reply view for a specific message.
   * @param {Message} message - The message to reply to.
   */
  showReply(message: Message) {
    this.chatService.initialMessageForThread = message;
    this.chatService.showReply = true;
    this.chatService.messageIdReply = message.messageId;
    this.chatService.getReplies();
    this.chatService.setEditorFocusReply();
  }


  /**
   * Retrieves the first custom reaction emote set by the user.
   * @returns {string} - The emote or a default if not set.
   */
  getReactionEmote1(): string {
    return this.currentUser.lastReaction1 && this.currentUser.lastReaction1 ? this.currentUser.lastReaction1 : '🙌🏻';
  }


  /**
   * Retrieves the second custom reaction emote set by the user.
   * @returns {string} - The emote or a default if not set.
   */
  getReactionEmote2(): string {
    return this.currentUser.lastReaction2 && this.currentUser.lastReaction2 ? this.currentUser.lastReaction2 : '✅';
  }


  /**
   * Adds a reaction to a message and updates the user's last used reactions.
   * @param {string} messageId - The ID of the message to react to.
   * @param {string} emote - The emote to use for the reaction.
   */
  addReaction(messageId: string, emote: string) {
    this.chatService.reactOnMessage(messageId, emote, this.currentUser.name, false)
    this.addToLastReaction(emote);
  }


  /**
   * Updates the user's last used reactions.
   * @param {string} emote - The new emote to set as the last reaction.
   */
  addToLastReaction(emote: string) {
    if (emote != this.getReactionEmote1()) {
      this.currentUser.lastReaction2 = this.getReactionEmote1()
      this.currentUser.lastReaction1 = emote
    }
    this.firebaseService.updateLastReaction(this.currentUser.lastReaction1, this.currentUser.lastReaction2, this.currentUser.userId)
  }


  /**
   * Formats a list of usernames into a readable string with conjunctions.
   * @param {string[]} users - The list of usernames to format.
   * @returns {string} - A formatted string listing the usernames.
   */
  formatUsernames(users: string[]): string {
    if (users.length <= 2) {
      return users.join(' und ');
    } else {
      return `${users.slice(0, -1).join(', ')} und ${users[users.length - 1]}`;
    }
  }


  /**
 * Toggles the state of the edit message menu.
 * If the menu is currently open, it closes it; if closed, it opens it.
 */
  openEditMessage() {
    this.menuEditMessage = !this.menuEditMessage;
  }


  /**
   * Converts a timestamp into a formatted date string.
   * @param {number} value - The timestamp to format.
   * @returns {string} - The formatted date string.
   */
  getCustomDate(value: number) {
    const inputDate = new Date(value);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1)
    const inputDateString = inputDate.toLocaleDateString('de-DE');
    const todayString = today.toLocaleDateString('de-DE');
    const yesterdayString = yesterday.toLocaleDateString('de-DE');
    if (inputDateString === todayString) {
      return 'Heute';
    } else if (inputDateString === yesterdayString) {
      return 'Gestern';
    } else {
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: '2-digit',
        month: 'long'
      };
      return inputDate.toLocaleDateString('de-DE', options);
    }
  }


  /**
   * Retrieves the image URL for another user in a direct message channel.
   * @returns {string} - The avatar URL or a default if not found.
   */
  getOtherUserImg() {
    const ids = this.chatService.currentChannel$.value.split('_')
    const userId = ids.filter(id => id !== this.chatService.currentUser.userId)[0];
    const user = this.chatService.users.find(user => user.userId === userId);
    return user ? user.avatar : 'assets/img/avatar_clean1.png';
  }


  /**
   * Retrieves the name for another user in a direct message channel.
   * @returns {string} - The user's name or a default if not found.
   */
  getOtherUserName() {
    const ids = this.chatService.currentChannel$.value.split('_')
    const userId = ids.filter(id => id !== this.chatService.currentUser.userId)[0];
    const user = this.chatService.users.find(user => user.userId === userId);
    return user ? user.name : 'Noah Braun';
  }


  /**
   * Determines if the user wants to start a new message thread.
   * @returns {boolean} - True if the current channel indicates a new message thread.
   */
  wantToWriteNewMessage() {
    return this.chatService.currentChannel$.value === 'writeANewMessage';
  }


  /**
   * Provides a tracking identifier for Angular's ngFor directive to optimize list rendering.
   * @param {number} index - The index of the message in the list.
   * @param {Message} message - The message object.
   * @returns {string} - The message ID used for tracking changes.
   */
  trackByMessageId(index: number, message: Message): string {
    return message.messageId;
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
