import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import { ChatService } from '../../../../assets/services/chat-service/chat.service';
import { User } from '../../../../assets/models/user.class';
import { ProfileAuthentication } from '../../../../assets/services/profileAuth.service';
import { EditChannelDialogComponent } from './edit-channel-dialog/edit-channel-dialog.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-headbar',
  standalone: true,
  imports: [MatIconModule, MatMenuModule, MatButtonModule, CommonModule,MatDialogModule ,EditChannelDialogComponent],
  templateUrl: './headbar.component.html',
  styleUrl: './headbar.component.scss'
})
export class HeadbarComponent  {
  isOpen = false;
  openMenu = false;
  currentChannelId: string | any;
  isDmRoomOpen: boolean = false;
  newMessage: boolean = false;
  isInfoOpen: boolean = false;

  currentPartner: string = '';
  currentPartnerUser: User | null = null;

  constructor(public chatService: ChatService, private auth: ProfileAuthentication, public dialog: MatDialog){}

  ngOnInit() {
    this.chatService.isDmRoom$.subscribe(isOpen => {
      this.isDmRoomOpen = isOpen;
    })
    this.chatService.dmPartnerID$.subscribe(async userId => {
      this.currentPartner = userId;
      this.currentPartnerUser = await this.auth.fetchPartnerFromFirestore(userId)
      console.log(this.currentPartnerUser)
    })
    this.chatService.currentChannel$.subscribe(channelID => {
      this.currentChannelId = channelID;
    })
  }

  // openMobileEditChannelDialog() {
  //   // const dialogRef = this.dialog.open(EditChannelDialogComponent, {
  //   //   panelClass: 'custom-edit-channel-dialog',
  //   //   data: { channelID: this.currentChannelId }
  //   // })
  // }


  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const infoDialog = document.getElementById('infoMenu');
    const clickedInsideMenu = infoDialog && infoDialog.contains(event.target as Node);
    if (this.isInfoOpen && !clickedInsideMenu) {
      this.isInfoOpen = false;
    }
  }

  openEditChannelDialog() {
    if (this.isInfoOpen) {
      this.isInfoOpen = !this.isInfoOpen
    } else {
      setTimeout(() => {
        this.isInfoOpen = true;
      }, 10)
    }
  }

  handleCloseEvent(event:boolean) {
    this.isInfoOpen = event;
  }

  toggleMenu(){
    this.openMenu = !this.openMenu;
  }

}
