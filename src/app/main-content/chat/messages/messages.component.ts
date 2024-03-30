import { Component } from '@angular/core';
import { ChatService } from '../chat-service/chat.service';
import { Message } from '../../../../assets/models/message.class';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [NgFor],
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