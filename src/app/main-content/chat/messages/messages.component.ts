import { Component } from '@angular/core';
import { ChatService } from '../chat-service/chat.service';
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

export class MessagesComponent {

  messages;
  time: any;
  date: any;
  emoticons = ['👍', '👎', '😂', '😅', '🚀', '💯', '🥳', '🤯', '🤷‍♂️', '🤷', '👏', '🤩']

  constructor(private chatService: ChatService) {
    this.messages = this.chatService.messages;
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
}