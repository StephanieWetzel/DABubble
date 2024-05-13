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

 

  

  constructor(public chatService: ChatService) {}

  handleProfile(event: {opened: boolean, userId: string}) {
    this.isShowingProfile = event.opened;
    this.selectedProfileId = event.userId;   
  }

  closeProfile(event: boolean) {
    this.isShowingProfile = false;
  }

  @HostListener('window:resize')
  onResize() {
    this.screenWidth = window.innerWidth
  };

}
