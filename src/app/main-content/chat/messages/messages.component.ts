import { AfterViewChecked, Component, ElementRef, ViewChild } from '@angular/core';
import { ChatService } from '../../../../assets/services/chat-service/chat.service';
import { Message } from '../../../../assets/models/message.class';
import { KeyValuePipe, NgFor, NgIf } from '@angular/common';
import { CustomDatePipe } from './date-pipe/custom-date.pipe';
import { CustomTimePipe } from './time-pipe/custom-time.pipe';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Reaction } from '../../../../assets/models/reactions.class';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [NgFor, NgIf, CustomDatePipe, CustomTimePipe, MatIconModule, MatIcon, MatMenuModule, KeyValuePipe],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss'
})

export class MessagesComponent implements AfterViewChecked {
  @ViewChild('chatContainer') private chatContainer!: ElementRef<HTMLDivElement>;

  messages;
  time: any;
  date: any;
  emoticons = ['👍', '👎', '😂', '😅', '🚀', '💯', '🥳', '🤯', '🤷‍♂️', '🤷', '👏', '🤩']
  menuEditMessage = false;

  constructor(private chatService: ChatService) {
    this.messages = this.chatService.messages;
  }


  ngAfterViewChecked(): void {
    this.scrollToBottom(); 
    
  }

  
  scrollToBottom(): void {
    const lastMessageElement = this.chatContainer.nativeElement.lastElementChild;
    if (lastMessageElement) {
      lastMessageElement.scrollIntoView({ block: 'end' });
    }
  }

  customDatePipe = new CustomDatePipe();

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