import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import { ChatService } from '../../../../assets/services/chat-service/chat.service';
import { User } from '../../../../assets/models/user.class';
import { ProfileAuthentication } from '../../../../assets/services/profileAuth.service';
import { user } from '@angular/fire/auth';

@Component({
  selector: 'app-headbar',
  standalone: true,
  imports: [MatIconModule, MatMenuModule, MatButtonModule, CommonModule],
  templateUrl: './headbar.component.html',
  styleUrl: './headbar.component.scss'
})
export class HeadbarComponent  {
  isOpen = false;
  openMenu = false;
  isDmRoomOpen: boolean = false;
  currentPartner: string = '';
  currentPartnerUser: User | null = null;

  constructor(private chatService: ChatService, private auth: ProfileAuthentication){}

  ngOnInit() {
    this.chatService.isDmRoom$.subscribe(isOpen => {
      this.isDmRoomOpen = isOpen;
    })
    this.chatService.dmPartnerID$.subscribe(async userId => {
      this.currentPartner = userId;
      this.currentPartnerUser = await this.auth.fetchPartnerFromFirestore(userId)
      console.log(this.currentPartnerUser)
    })
  }

  toggleMenu(){
    this.openMenu = !this.openMenu;
  }

  showUserId() {
    console.log(this.currentPartner)
  }
}
