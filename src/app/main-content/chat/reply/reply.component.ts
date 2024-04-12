import { Component } from '@angular/core';
import { ReplyHeadbarComponent } from './reply-headbar/reply-headbar.component';
import { ReplyInputBoxComponent } from './reply-input-box/reply-input-box.component';
import { ReplyMessagesComponent } from './reply-messages/reply-messages.component';
import { ChatService } from '../../../../assets/services/chat-service/chat.service';

@Component({
  selector: 'app-reply',
  standalone: true,
  imports: [ReplyHeadbarComponent, ReplyInputBoxComponent, ReplyMessagesComponent],
  templateUrl: './reply.component.html',
  styleUrl: './reply.component.scss'
})
export class ReplyComponent {

  constructor(public chatService: ChatService) {

  }
}
