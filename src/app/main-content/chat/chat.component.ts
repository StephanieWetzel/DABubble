import { Component, HostListener } from '@angular/core';
import { InputBoxComponent } from './input-box/input-box.component';
import { MessagesComponent } from './messages/messages.component';
import { HeadbarComponent } from './headbar/headbar.component';
import { ReplyComponent } from './reply/reply.component';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../../assets/services/chat-service/chat.service';
@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, InputBoxComponent, MessagesComponent, HeadbarComponent, ReplyComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
  screenWidth: number = window.innerWidth;

  constructor(public chatService: ChatService) {
  }


  /**
 * Listens to the window resize event and updates the screenWidth property accordingly.
 */
  @HostListener('window:resize')
  onResize() {
    this.screenWidth = window.innerWidth
  };
}