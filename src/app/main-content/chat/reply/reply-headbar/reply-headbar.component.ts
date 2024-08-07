import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ChatService } from '../../../../../assets/services/chat-service/chat.service';

@Component({
  selector: 'app-reply-headbar',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './reply-headbar.component.html',
  styleUrl: './reply-headbar.component.scss'
})
export class ReplyHeadbarComponent {
  constructor(private chatService: ChatService) {
  }


  /**
 * Closes the reply section in the chat interface.
 * Sets the 'showReply' property in the 'chatService' to false.
 */
  closeReply() {
    this.chatService.showReply = false;
  }

}
