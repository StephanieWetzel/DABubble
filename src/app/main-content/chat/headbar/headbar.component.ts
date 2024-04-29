import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
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
import { AddMemberComponent } from './add-member/add-member.component';

@Component({
  selector: 'app-headbar',
  standalone: true,
  imports: [MatIconModule,
     MatMenuModule, 
     MatButtonModule, 
     CommonModule, 
     MatDialogModule, 
     EditChannelDialogComponent, 
     MatChip, 
     MatChipListbox, 
     ReactiveFormsModule, 
     MemberOversightComponent,
     AddMemberComponent
    ],
  templateUrl: './headbar.component.html',
  styleUrl: './headbar.component.scss'
})
export class HeadbarComponent {
  isOpen = false;
  openMenu = false;
  currentChannelId: string | any;
  isDmRoomOpen: boolean = false;
  isNewMessage: boolean = false;
  isInfoOpen: boolean = false;
  isMemberOversight: boolean = false;
  isSearching:boolean = false;
  currentUser = '';
  isSearchOpen: boolean = false;
  members: User[] | null = null;
  unsubscribeFromChannel: (() => void) | undefined;

  channel: Channel | null = null;
  avatars: any[] = [];
  currentPartner: string = '';
  currentPartnerUser: User | null = null;
  searchResults: any[] = [];
  selectedUsers: any[] = [];
  searchInput;
  filteredChannels: Channel[] = [];
  selectedChannels: Channel[] = [];




  constructor(public chatService: ChatService, private auth: ProfileAuthentication, public dialog: MatDialog, public firestore: FirebaseService) {
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
    this.chatService.currentChannel$.subscribe(channelID => {
      this.currentChannelId = channelID;
      if (this.unsubscribeFromChannel) {
        this.unsubscribeFromChannel();
      }
      this.unsubscribeFromChannel = this.firestore.subscribeToChannel(this.currentChannelId, (channelData) => {
        this.channel = channelData;
        if (this.channel) {
          this.safeUserAvatars();
          this.getAuthUserID();
          this.getMember();
        }
      })
    });
    

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

  ngOnDestroy() {
    if (this.unsubscribeFromChannel) {
      this.unsubscribeFromChannel();
    }
  }

  getAuthUserID() {
    this.auth.fetchLoggedUser().then((userId) => {
      this.currentUser = userId;
    })
  }

  async getMember() {
    if (this.channel) {
      this.members = await this.firestore.getChannelMember(this.channel);
      if (this.members && this.currentUser) {
        this.members = this.prioritizeCurrentUser(this.members, this.currentUser)
      }
    }
  }

  searchClosed(event:boolean) {
    this.isSearchOpen = !this.isSearchOpen
  }

  prioritizeCurrentUser(users: User[], currentUserId: string): User[] {
    const index = users.findIndex(user => user.userId === currentUserId);
    if (index > -1) {
      const currentUser = users.splice(index, 1)[0];
      users.unshift(currentUser);
    }
    return users
  }

  changeWidth(event: boolean) {
    this.isSearching = event;
  }

  openMemberOversight() {
    if (this.isMemberOversight) {
      this.isMemberOversight = !this.isMemberOversight
    } else {
      setTimeout(() => {
        this.isMemberOversight = true;
      }, 10);
    }
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
    const oversightDialog = document.getElementById('memberOversight');
    const clickedInsideOversightDialog = oversightDialog && oversightDialog.contains(event.target as Node);
    const memberSearchDialog = document.getElementById('memberSearch');
    const clickedInsideMemberSearch = memberSearchDialog && memberSearchDialog.contains(event.target as Node);
    // for edit channel dialog
    if (this.isInfoOpen && !clickedInsideMenu) {
      this.isInfoOpen = false;
    }
    // for member oversight dialog
    if (this.isMemberOversight && !clickedInsideOversightDialog) {
      this.isMemberOversight = false;
    }
    // for add member / search member dialog
    if (this.isSearchOpen && !clickedInsideMemberSearch) {
      this.isSearchOpen = false;
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

  handleCloseEvent(event: boolean) {
    this.isInfoOpen = event;
  }

  handleCloseEventMember(event:boolean) {
    this.isMemberOversight = event;
  }

  openMemberSearch() {
    if (this.isSearchOpen) {
      this.isSearchOpen = !this.isSearchOpen;
    } else {
      setTimeout(() => {
        this.isSearchOpen = true;
      }, 10);
    }
  }

  selectUser(user: any): void {
    if (!this.selectedUsers.some(u => u.userId === user.userId)) {
      this.selectedUsers.push(user);
      this.searchResults = this.findResults(this.searchInput.value || "");
    }
  }

  findResults(searchTerm: string): any[] {
    return this.chatService.users.filter(
      item => item.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !this.selectedUsers.find(user => user.name === item.name)
    );
  }

  selectChannel(channel: any): void {
    if (!this.selectedChannels.some(c => c.channelId === channel.channelId)) {
        this.selectedChannels.push(channel);
        // this.filteredChannels = []; // Optional: Clear filteredChannels if you don't need it anymore
    }
}
  


  findChannels(searchTerm: string): any[] {
    return this.chatService.allChannels.filter(channel => channel.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }
}