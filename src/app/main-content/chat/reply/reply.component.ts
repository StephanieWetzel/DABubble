import { Component, HostListener } from '@angular/core';
import { ReplyHeadbarComponent } from './reply-headbar/reply-headbar.component';
import { ReplyInputBoxComponent } from './reply-input-box/reply-input-box.component';
import { ReplyMessagesComponent } from './reply-messages/reply-messages.component';
import { ChatService } from '../../../../assets/services/chat-service/chat.service';
import { CommonModule } from '@angular/common';
import { UserDetailComponent } from '../messages/user-detail/user-detail.component';

@Component({
  selector: 'app-reply',
  standalone: true,
  imports: [ReplyHeadbarComponent, ReplyInputBoxComponent, ReplyMessagesComponent, CommonModule, UserDetailComponent],
  templateUrl: './reply.component.html',
  styleUrl: './reply.component.scss'
})
export class ReplyComponent {
  isShowingProfile: boolean = false;
  selectedProfileId: string = '';
  screenWidth: number = window.innerWidth;

  constructor(public chatService: ChatService) { }


  /**
 * Handles the profile opening event.
 *
 * @param event The event object containing 'opened' and 'userId' properties.
 */
  handleProfile(event: { opened: boolean, userId: string }) {
    this.isShowingProfile = event.opened;
    this.selectedProfileId = event.userId;
  }


  /**
 * Closes the user profile display.
 *
 * @param event A boolean indicating whether the profile should be closed.
 */
  closeProfile(event: boolean) {
    this.isShowingProfile = false;
  }


  /**
 * Event handler for window resize events.
 * Updates the screenWidth property with the current inner width of the window.
 */
  @HostListener('window:resize')
  onResize() {
    this.screenWidth = window.innerWidth
  };
}