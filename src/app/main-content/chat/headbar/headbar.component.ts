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
import { MobileService } from '../../../../assets/services/mobile.service';
import { Subscription } from 'rxjs';

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
  isSearching: boolean = false;
  currentUser = '';
  isSearchOpen: boolean = false;
  members: User[] | null = null;
  unsubscribeFromChannel: (() => void) | undefined;
  isDrawerOpenedSub!: Subscription;
  isDrawerOpen!: boolean;
  screenWidth: number = window.innerWidth;
  channel: Channel | null = null;
  avatars: any[] = [];
  currentPartner: string = '';
  currentPartnerUser: User | null = null;
  searchResults: any[] = [];
  selectedUsers: any[] = [];
  searchInput;
  filteredChannels: Channel[] = [];
  selectedChannels: Channel[] = [];

  @ViewChild('inputArea', { static: false }) inputArea!: ElementRef;

  constructor(
    public chatService: ChatService, 
    private auth: ProfileAuthentication, 
    public dialog: MatDialog, 
    public firestore: FirebaseService,
    public mobileService: MobileService
  ) {
    this.searchInput = new FormControl('');
  }

  async ngOnInit() {
    this.isDrawerOpenedSub = this.mobileService.drawerOpened$.subscribe(isOpen => {
      this.isDrawerOpen = isOpen;
    })
    this.chatService.isDmRoom.subscribe(isOpen => {
      this.isDmRoomOpen = isOpen;
    })
    this.chatService.dmPartnerID$.subscribe(async userId => {
      if (userId) {
        this.currentPartner = userId;
        this.currentPartnerUser = await this.auth.fetchPartnerFromFirestore(userId)
      }
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

  /**
   * Retrieves the user ID of the currently logged-in user from an authentication service.
   */
  getAuthUserID() {
    this.auth.fetchLoggedUser().then((userId) => {
      this.currentUser = userId;
    })
  }

  /**
   * Fetches members from the specified channel in Firestore and prioritizes the current user in the list.
   * 
   * @returns {Promise<void>} A promise that resolves once the members have been fetched and reordered.
   */
  async getMember() {
    if (this.channel) {
      this.members = await this.firestore.getChannelMember(this.channel);
      if (this.members && this.currentUser) {
        this.members = this.prioritizeCurrentUser(this.members, this.currentUser)
      }
    }
  }

  searchClosed(event: boolean) {
    this.isSearchOpen = !this.isSearchOpen
  }

  /**
   * Modifies an array of users to prioritize the current user by moving their entry to the front of the array.
   * 
   * @param {User[]} users - The array of user objects to be modified.
   * @param {string} currentUserId - The unique identifier of the current user to be prioritized.
   * @returns {User[]} The modified array with the current user prioritized at the front.
   */
  prioritizeCurrentUser(users: User[], currentUserId: string): User[] {
    const index = users.findIndex(user => user.userId === currentUserId);
    if (index > -1) {
      const currentUser = users.splice(index, 1)[0];
      users.unshift(currentUser);
    }
    return users
  }

  /**
   * Sets the searching status based on the given boolean event.
   *
   * @param {boolean} event - The boolean value indicating the new status for searching, either true or false.
   */
  changeWidth(event: boolean) {
    this.isSearching = event;
  }

  /**
   * Toggles the member oversight status. If already enabled, it disables it immediately.
   * If disabled, it enables the oversight after a brief delay.
   */
  openMemberOversight() {
    if (this.isMemberOversight) {
      this.isMemberOversight = !this.isMemberOversight
    } else {
      setTimeout(() => {
        this.isMemberOversight = true;
      }, 10);
    }
  }

  /**
   * Asynchronously fetches and stores the avatars of channel members.
   * Ensures that only non-null avatars are kept. This method only operates if the channel and its members are defined.
   * 
   * @returns {Promise<void>} A promise that resolves when all avatars have been updated.
   */
  async safeUserAvatars() {
    this.avatars = [];
    if (this.channel && this.channel.member) {
      const avatarPromises = this.channel?.member.map(member => this.firestore.getAvatar(member.id) || []);
      const avatars = await Promise.all(avatarPromises);
      this.avatars = avatars.filter(avatar => avatar != null);
    }
  }

  /**
   * Handles document-wide click events to manage visibility of various UI dialogs.
   * This method checks if the click was outside the info menu, member oversight dialog,
   * or member search dialog, and closes these dialogs if they are open and the click was outside their area.
   * Additionally, it clears the search input if the click is outside the input message area.
   * 
   * @param {MouseEvent} event - The mouse event that triggered the handler.
   */
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
    // for input new message
    if (this.inputArea && this.inputArea.nativeElement && !this.inputArea.nativeElement.contains(event.target as Node)) {
        this.searchInput.setValue('');
    }
  }

  
  /**
   * Listens for window resize events and updates the screenWidth property with the current window width.
   * This method is decorated with @HostListener to automatically capture window resize events.
   */
  @HostListener('window:resize')
  checkScreenWidth() {
    this.screenWidth = window.innerWidth
  }


  /**
   * Toggles the visibility of the edit channel information dialog.
   */
  openEditChannelDialog() {
    if (this.isInfoOpen) {
      this.isInfoOpen = !this.isInfoOpen
    } else {
      setTimeout(() => {
        this.isInfoOpen = true;
      }, 10)
    }
  }
  /**
   * Handles the close event for an information dialog by setting its visibility state.
   * 
   * @param {boolean} event - The boolean value indicating whether the information dialog should be open or closed.
   */
  handleCloseEvent(event: boolean) {
    this.isInfoOpen = event;
  }
  /**
   * Handles the close event for an information dialog by setting its visibility state.
   * 
   * @param {boolean} event - The boolean value indicating whether the information dialog should be open or closed.
   */
  handleCloseEventMember(event: boolean) {
    this.isMemberOversight = event;
  }

  /**
   * Toggles the visibility of the member search dialog.
   */
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
      this.chatService.selectedUsers = this.selectedUsers;
      this.searchInput.setValue(this.searchInput.value);
      // this.searchResults = this.findResults(this.searchInput.value || "");
    }

  }

  findResults(searchTerm: string): any[] {
    return this.chatService.users.filter(
      item => item.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !this.selectedUsers.find(user => user.name === item.name)
    );
  }

  

  removeUser(userToRemove: User){
    this.selectedUsers = this.selectedUsers.filter(user => user.userId !== userToRemove.userId);
    this.searchInput.setValue(this.searchInput.value);
  }

  selectChannel(channel: any): void {
    if (!this.selectedChannels.some(c => c.channelId === channel.channelId)) {
      this.selectedChannels.push(channel);
      this.chatService.selectedChannels = this.selectedChannels;
      this.searchInput.setValue(this.searchInput.value);
      // this.filteredChannels = []; // Optional: Clear filteredChannels if you don't need it anymore
    }
  }


  findChannels(searchTerm: string): any[] {
    return this.chatService.allChannels.filter(channel =>
      channel.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !this.selectedChannels.some(c => c.channelId === channel.channelId) 
    );  
  }

  removeChannel(channelToRemove: Channel){
    this.selectedChannels = this.selectedChannels.filter(channel => channel.channelId !== channelToRemove.channelId);
    this.searchInput.setValue(this.searchInput.value);
  }
}