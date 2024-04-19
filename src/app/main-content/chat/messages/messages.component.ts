import { OnInit, Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ChatService } from '../../../../assets/services/chat-service/chat.service';
import { Message } from '../../../../assets/models/message.class';
import { CommonModule, KeyValuePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { CustomDatePipe } from './date-pipe/custom-date.pipe';
import { CustomTimePipe } from './time-pipe/custom-time.pipe';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Reaction } from '../../../../assets/models/reactions.class';
import tinymce, { RawEditorOptions  } from 'tinymce';
import { EditorModule } from '@tinymce/tinymce-angular';
import { FormsModule, NgModel } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Subscription } from 'rxjs';
import { ProfileAuthentication } from '../../../../assets/services/profileAuth.service';
import { User } from '../../../../assets/models/user.class';

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
    NgClass
  ],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss'
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


  constructor(public chatService: ChatService, private profileAuth: ProfileAuthentication) {
    this.messages = this.chatService.messages;
  }


  ngAfterViewInit() {
    this.subscription.add(this.chatService.messageCount$.subscribe({
      next: (count) => {
        console.log('Aktualisierte Nachrichtenanzahl:', count);
        this.scrollToBottom();
      }
    }));
  }

  ngOnInit() {
    this.profileAuth.initializeUser();
    this.profileAuth.user$.subscribe((user) => {
      if(user){
        this.currentUser = new User(user);
      }
    })
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

  editMessage(id:string, content: string){
    this.closeEditor();
    this.editingMessageId = id;
    this.currentEditingContent = content
    console.log(this.editingMessageId);    
  }

  closeEditor(){
    const editorInstance = tinymce.get('editData-' + this.editingMessageId);
    if(editorInstance){
      editorInstance.remove();
    }
    this.editingMessageId = '';
  }

  safeMessage(safe: boolean, messageId: string = ''){
    if (safe){
      this.chatService.editMessage(messageId, this.getInputContent(tinymce.get('editData-' + messageId)));
    }
    this.closeEditor();
  }

  getInputContent(input: any){
    const content = input.getContent({ format: 'text' });
    console.log(content);
    return content;
  }
  
  isDateDifferent(index: number){
    if (index === 0) return true; // Die erste Nachricht zeigt immer das Datum an
    const currentDateFormatted = this.customDatePipe.transform(this.messages[index].time);
    const previousDateFormatted = this.customDatePipe.transform(this.messages[index - 1].time);
    return currentDateFormatted !== previousDateFormatted;
  }


  getList(): Message[] {
    this.messages = this.chatService.messages;
    return this.chatService.messages;
  }


  isCurrentUserSender(sender: string){
    return sender === this.currentUser.userId;
  }


  showReply(messageId: string){
    this.chatService.showReply = true;
    this.chatService.messageIdReply = messageId;
    this.chatService.getReplies();
  }


  addReaction(messageId: string, emote: string){
    this.chatService.reactOnMessage(messageId, emote, this.currentUser.name, false)
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


  openEditMessage(){
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
      // Additional debugging information
      console.error('Failed URL:', url);
    }
  }

  getUserName(sendId: string): string {
    const user = this.chatService.users.find(user => user.userId === sendId);
    return user ? user.name : 'Noah Braun'; 
  }
  // sendIdToName(id: string){
  //   this.chatService.getUser(id);
  // }
  }