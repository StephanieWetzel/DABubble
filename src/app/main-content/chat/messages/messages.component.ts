import { Component } from '@angular/core';
import { ChatService } from '../chat-service/chat.service';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss'
})

export class MessagesComponent {
  constructor(private chatService: ChatService){
    
  }
}
