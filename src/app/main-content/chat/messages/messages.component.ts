import { OnInit, Component, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { ChatService } from '../../../../assets/services/chat-service/chat.service';
import { Message } from '../../../../assets/models/message.class';
import { CommonModule, KeyValuePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { CustomDatePipe } from './date-pipe/custom-date.pipe';
import { CustomTimePipe } from './time-pipe/custom-time.pipe';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Reaction } from '../../../../assets/models/reactions.class';
import tinymce, { RawEditorOptions } from 'tinymce';
import { EditorModule } from '@tinymce/tinymce-angular';
import { FormsModule, NgModel } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Subscription, debounceTime } from 'rxjs';
import { ProfileAuthentication } from '../../../../assets/services/profileAuth.service';
import { User } from '../../../../assets/models/user.class';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { FirebaseService } from '../../../../assets/services/firebase-service';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [NgFor,
    NgIf,
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

  messages;
  time: any;
  date: any;
  menuEditMessage = false;
  customDatePipe = new CustomDatePipe();
  editingMessageId: string = '';
  currentContent!: string;
  currentEditingContent: string = '';
  subscription = new Subscription();
  isShowingProfile: boolean = false;
  selectedProfileId: string = '';

  currentUser!: User;


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


  constructor(public chatService: ChatService, private profileAuth: ProfileAuthentication, private changeDetRef: ChangeDetectorRef, public firebaseService: FirebaseService) {
    this.messages = this.chatService.messages;
  }

  showID(id: string) {
    this.selectedProfileId = id;
    this.isShowingProfile = true
  }

  handleProfile(hasClosed: boolean) {
    this.isShowingProfile = !hasClosed;
  }

  ngAfterViewInit() {
    this.subscription.add(this.chatService.scrollToBottom$.subscribe(shouldScroll => {
      if (shouldScroll) {
        setTimeout(() => {
          this.scrollToBottom();
          this.chatService.scrollToBottom$.next(false);
        }, 100);
      }
    }));
  }

  ngAfterViewChecked(): void {
    this.changeDetRef.detectChanges();
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
          lastMessageElement.scrollIntoView({ block: 'end', behavior: 'auto' });
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
   * Prepares a message for editing by setting necessary states.
   * @param {string} id - The ID of the message to edit.
   * @param {string} content - The current content of the message.
   */
  editMessage(id: string, content: string) {
    this.closeEditor();
    this.editingMessageId = id;
    this.currentEditingContent = content
  }


  /**
   * Closes the message editor and clears related states.
   */
  closeEditor() {
    const editorInstance = tinymce.get('editData-' + this.editingMessageId);
    if (editorInstance) {
      editorInstance.remove();
    }
    this.editingMessageId = '';
  }


  /**
  * Saves the edited message content.
  * @param {boolean} safe - Determines whether to save the changes.
  * @param {string} messageId - The ID of the message being saved.
  */
  safeMessage(safe: boolean, messageId: string = '') {
    if (safe) {
      this.chatService.editMessage(messageId, this.getInputContent(tinymce.get('editData-' + messageId)));
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
    if (index === 0) return true; // Die erste Nachricht zeigt immer das Datum an
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
    // // if (!this.chatService.searchInput) return this.getList();
    // return this.getList().filter(message =>
    //   message.content.toLowerCase().includes(this.chatService.searchInput.toLowerCase())
    // );
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


  openEditMessage() {
    this.menuEditMessage = !this.menuEditMessage;
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
      console.error('Error downloading the file:', error);
    }
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
}