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
import { MatChip, MatChipListbox } from '@angular/material/chips';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Channel } from '../../../../assets/models/channel.class';
import { FirebaseService } from '../../../../assets/services/firebase-service';
import { MemberOversightComponent } from './member-oversight/member-oversight.component';

@Component({
  selector: 'app-headbar',
  standalone: true,
  imports: [MatIconModule, MatMenuModule, MatButtonModule, CommonModule,MatDialogModule ,EditChannelDialogComponent, MatChip, MatChipListbox, ReactiveFormsModule, MemberOversightComponent],
  templateUrl: './headbar.component.html',
  styleUrl: './headbar.component.scss'
})
export class HeadbarComponent  {
  isOpen = false;
  openMenu = false;
  currentChannelId: string | any;
  isDmRoomOpen: boolean = false;
  isNewMessage: boolean = false;
  isInfoOpen: boolean = false;
  isMemberOversight: boolean = false;
  isSearching:boolean = false;

  channel: Channel | null = null;
  avatars: any[] = [];
  currentPartner: string = '';
  currentPartnerUser: User | null = null;
  searchResults: any[] = [];
  selectedUsers: any[] = [];
  searchInput;
  filteredChannels: Channel[] = [];



  constructor(public chatService: ChatService, private auth: ProfileAuthentication, public dialog: MatDialog, public firestore: FirebaseService){
    this.searchInput = new FormControl('');
  }

  async ngOnInit() {
    this.chatService.isDmRoom$.subscribe(isOpen => {
      this.isDmRoomOpen = isOpen;
    })
    this.chatService.dmPartnerID$.subscribe(async userId => {
      this.currentPartner = userId;
      this.currentPartnerUser = await this.auth.fetchPartnerFromFirestore(userId)
      console.log(this.currentPartnerUser)
    })
    this.chatService.currentChannel$.subscribe(async channelID => {
      this.currentChannelId = channelID;
      this.channel = await this.firestore.getCurrentChannelData(this.currentChannelId);
      if (this.channel) {
        this.safeUserAvatars();
      }
    })


    this.chatService.newMessage$.subscribe(newMessage => {
      this.isNewMessage = newMessage;
      this.chatService.updateMessages();
      console.log(this.isNewMessage);
    })

    this.searchInput.valueChanges.subscribe(value => {
      if (value!.startsWith('@')) {
        // Ruft Suchfunktion auf und zeigt Ergebnisse an
        this.searchResults = this.findResults(value!.slice(1)); // Ignoriert das '@'
      } else {
        this.searchResults = [];
      }
    });

    this.searchInput.valueChanges.subscribe(value => {
      if (value!.startsWith('#')) {
        this.filteredChannels = this.findChannels(value!.slice(1));
      } else {
        this.filteredChannels = [];
      }
    });
  }

  changeWidth(event: boolean) {
    this.isSearching = event;
  }

  openMemberOversight() {
    this.isMemberOversight = !this.isMemberOversight;
  }

  async safeUserAvatars() {
    this.avatars = [];
    if (this.channel && this.channel.member) {
      const avatarPromises = this.channel?.member.map(member => this.firestore.getAvatar(member.id) || []);
      const avatars = await Promise.all(avatarPromises);
      this.avatars = avatars.filter(avatar => avatar != null);
    }
    //console.log("hier die Avatare: ", this.avatars)
  }


  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const infoDialog = document.getElementById('infoMenu');
    const clickedInsideMenu = infoDialog && infoDialog.contains(event.target as Node);
    if (this.isInfoOpen && !clickedInsideMenu) {
      this.isInfoOpen = false;
    }
  }

  openEditChannelDialog() {
    // const dialogRef = this.dialog.open(EditChannelDialogComponent, {
    //   panelClass: 'custom-edit-channel-dialog',
    //   data: { channelID: this.currentChannelId }
    // })
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

  handleCloseEventMember(event:boolean) {
    this.isMemberOversight = event;
  }

  toggleMenu(){
    this.openMenu = !this.openMenu;
  }

  selectUser(user: any): void {
    console.log(user);
    if (!this.selectedUsers.some(u => u.userId  === user.userId )) { 
      this.selectedUsers.push(user);
      this.searchResults = this.findResults(this.searchInput.value || "");
    }
    console.log(this.selectedUsers);
  }

  findResults(searchTerm: string): any[] {
    return this.chatService.users.filter(
      item => item.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
              !this.selectedUsers.find(user => user.name === item.name)
    );
  }

  selectChannel(channel: any): void {
    if (!this.filteredChannels.some(c => c.channelId  === channel.channelId )) { 
      this.filteredChannels.push(channel);
      this.searchResults = this.findResults(this.searchInput.value || "");
    }
  }

  findChannels(searchTerm: string): any[] {
    return this.chatService.allChannels.filter(channel => channel.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }
}