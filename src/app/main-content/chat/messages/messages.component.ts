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
    // this.subscription.add(this.chatService.messageCount$.subscribe({
    //   next: (count) => {
    //     this.scrollToBottom();
    //   }
    // }));
    this.subscription.add(this.chatService.messageCount$.pipe(
      debounceTime(300) // oder throttleTime
    ).subscribe({
      next: (count) => {
        this.scrollToBottom();
      }
    }));
  }

  ngAfterViewChecked(): void {
    this.changeDetRef.detectChanges();
  }

  ngOnInit() {
    this.profileAuth.initializeUser();
    this.profileAuth.user$.subscribe((user) => {
      if (user) {
        this.currentUser = new User(user);
      }
    })
  }

  isDirectMessage() {
    return this.chatService.currentChannel$.value.length > 25
  }

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

  getLastReplyTime(replies: any[]): number {
    if (!replies || replies.length === 0) return 0;
    const lastReply = replies.reduce((latest, reply) => {
      return latest.time > reply.time ? latest : reply;
    });
    return lastReply.time;
  }

  editMessage(id: string, content: string) {
    
    this.closeEditor();
    this.editingMessageId = id;
    this.currentEditingContent = content
  }

  closeEditor() {
    const editorInstance = tinymce.get('editData-' + this.editingMessageId);
    if (editorInstance) {
      editorInstance.remove();
    }
    this.editingMessageId = '';
  }

  safeMessage(safe: boolean, messageId: string = '') {
    if (safe) {
      this.chatService.editMessage(messageId, this.getInputContent(tinymce.get('editData-' + messageId)));
    }
    this.closeEditor();
  }

  getInputContent(input: any) {
    const content = input.getContent({ format: 'text' });
    return content;
  }

  isDateDifferent(index: number) {
    if (index === 0) return true; // Die erste Nachricht zeigt immer das Datum an
    const currentDateFormatted = this.customDatePipe.transform(this.messages[index].time);
    const previousDateFormatted = this.customDatePipe.transform(this.messages[index - 1].time);
    return currentDateFormatted !== previousDateFormatted;
  }


  getList(): Message[] {
    this.messages = this.chatService.messages;
    return this.chatService.messages;
  }


  getFilteredMessages(): Message[] {
    if (!this.chatService.searchInput) return this.getList();
    return this.getList().filter(message =>
      message.content.toLowerCase().includes(this.chatService.searchInput.toLowerCase())
    );
  }


  isCurrentUserSender(sender: string) {
    return sender === this.currentUser.userId;
  }


  showReply(message: Message) {
    this.chatService.initialMessageForThread = message;
    this.chatService.showReply = true;
    this.chatService.messageIdReply = message.messageId;
    this.chatService.getReplies();
    this.chatService.setEditorFocusReply();
  }

  toggleChatAndThread(){
    return 
  }

  getReactionEmote1(): string {
    return this.currentUser.lastReaction1 && this.currentUser.lastReaction1 ? this.currentUser.lastReaction1 : '🙌🏻';
  }

  getReactionEmote2(): string {
    return this.currentUser.lastReaction2 && this.currentUser.lastReaction2 ? this.currentUser.lastReaction2 : '✅';
  }


  addReaction(messageId: string, emote: string) {
    this.chatService.reactOnMessage(messageId, emote, this.currentUser.name, false)
    this.addToLastReaction(emote);
  }


  addToLastReaction(emote: string){
    if(emote != this.getReactionEmote1()){
      this.currentUser.lastReaction2 = this.getReactionEmote1()
      this.currentUser.lastReaction1 = emote
    }
    this.firebaseService.updateLastReaction(this.currentUser.lastReaction1, this.currentUser.lastReaction2, this.currentUser.userId)
  }

  formatUsernames(users: string[]): string {
    if (users.length <= 2) {
      return users.join(' und ');
    } else {
      return `${users.slice(0, -1).join(', ')} und ${users[users.length - 1]}`;
    }
  }


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

  getCustomDate(value: number){
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
      }else{
        const options: Intl.DateTimeFormatOptions = {
        weekday: 'long', 
        day: '2-digit', 
        month: 'long'
      };
      return inputDate.toLocaleDateString('de-DE', options);
      }
  }


  getOtherUserImg() {
    const ids = this.chatService.currentChannel$.value.split('_')
    const userId = ids.filter(id => id !== this.chatService.currentUser.userId)[0];
    const user = this.chatService.users.find(user => user.userId === userId);
    return user ? user.avatar : 'assets/img/avatar_clean1.png';
  }

  getOtherUserName() {
    const ids = this.chatService.currentChannel$.value.split('_')
    const userId = ids.filter(id => id !== this.chatService.currentUser.userId)[0];
    const user = this.chatService.users.find(user => user.userId === userId);
    return user ? user.name : 'Noah Braun';
  }

  wantToWriteNewMessage() {
    return this.chatService.currentChannel$.value === 'writeANewMessage';
  }

  trackByMessageId(index: number, message: Message): string {
    return message.messageId;
  }
}