import { Component } from '@angular/core';
import { ChatService } from '../chat-service/chat.service';
import { Message } from '../../../../assets/models/message.class';
import { NgFor } from '@angular/common';
import { CustomDatePipe } from './date-pipe/custom-date.pipe';
import { CustomTimePipe } from './time-pipe/custom-time.pipe';
import { MatIcon, MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [NgFor, CustomDatePipe, CustomTimePipe, MatIconModule, MatIcon],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss'
})

export class MessagesComponent {

  messages;
  time: any;
  date: any;

  constructor(private chatService: ChatService) {
    this.messages = this.chatService.messages;
  }


  getList(): Message[] {
    this.messages = this.chatService.messages;
    return this.chatService.messages;
  }
}