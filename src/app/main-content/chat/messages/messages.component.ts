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
  emoticons = ['👍', '👎', '😂', '😅', '🚀', '💯', '🥳', '🤯', '🤷‍♂️', '🤷', '👏', '🤩']
  menuEditMessage = false;
  customDatePipe = new CustomDatePipe();
  editingMessageId: string = '';
  currentContent!: string;
  currentEditingContent: string = '';
  subscription = new Subscription();

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

  constructor(private chatService: ChatService) {
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
    debugger
    this.editingMessageId = id;
    this.currentEditingContent = content
    console.log(this.editingMessageId);    
  }

  closeEditor(){
    debugger
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


  showReply(){
    this.chatService.showReply = true;
  }


  addReaction(messageId: string, emote: string){
    this.chatService.reactOnMessage(messageId, emote, 'Sebastian')
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
    // try {
    //   // Die Datei als Blob abrufen
    //   const response = await fetch(url);
    //   if (!response.ok) throw new Error('Netzwerkantwort war nicht ok.');
    //   const blob = await response.blob();
  
    //   // Eine temporäre URL aus dem Blob erstellen
    //   const blobUrl = window.URL.createObjectURL(blob);
  
    //   // Ein temporäres <a>-Element für den Download erzeugen
    //   const a = document.createElement('a');
    //   a.href = blobUrl;
    //   a.download = filename || 'downloaded-file';
  
    //   // Den Download auslösen
    //   document.body.appendChild(a);
    //   a.click();
  
    //   // Aufräumen
    //   window.URL.revokeObjectURL(blobUrl);
    //   document.body.removeChild(a);
    // } catch (error) {
    //   console.error('Fehler beim Herunterladen der Datei:', error);
    // }
  }
}