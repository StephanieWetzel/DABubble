import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ProfileDialogComponent } from './profile-dialog/profile-dialog.component';
import { User } from '../../assets/models/user.class';
import { ProfileAuthentication } from '../../assets/services/profileAuth.service';
import { MobileService } from '../../assets/services/mobile.service';
import { Subscription } from 'rxjs';
import { ChatService } from '../../assets/services/chat-service/chat.service';
import { FormsModule, NgModel } from '@angular/forms';
import { FirebaseService } from '../../assets/services/firebase-service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIcon,
    ProfileDialogComponent,
    FormsModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  isProfilMenuOpen: boolean = false;
  isProfileEditOpen: boolean = false;
  user: User | null = null;
  currentUserID: string | any;
  screenWidth: number = window.innerWidth;
  isChannelOpen!: boolean;
  isChannelOpenSub!: Subscription;
  keepMenuOpen: boolean = window.innerWidth <= 520;
  selectedChannel: string | null = 'pSBwciqiaOgtUayZaIgj';
  @Output() openSidenav = new EventEmitter<void>();

  constructor(private profileAuth: ProfileAuthentication, public mobileService: MobileService, public chatService: ChatService, private firestore: FirebaseService, private mobilService: MobileService) {
  }

  /**
   * Handles the window resize event to dynamically adjust UI elements based on the screen width.
   *
   * @listens window:resize - Listens for resize events on the window to trigger this method.
   */
  @HostListener('window:resize')
  checkScreenWidth() {
    this.screenWidth = window.innerWidth
    if (window.innerWidth < 520) {
      this.keepMenuOpen = true;
    }
  }

  /**
   * Resets navigation settings by closing any open channel, toggling the navigation drawer,
   */
  getBackToNav() {
    this.mobileService.openChannel(false);
    this.mobileService.toggleDrawe(true);
    this.mobileService.setActiveChannel('');
  }


  /**
   * Initializes the component by fetching and subscribing to the user data from the authentication service.
   */
  ngOnInit() {
    this.profileAuth.initializeUser();
    this.profileAuth.user$.subscribe((user) => {
      this.user = user;
    });
    this.isChannelOpenSub = this.mobileService.channelOpened$.subscribe(
      (isChannelOpen) => {
        this.isChannelOpen = isChannelOpen;
      }
    )
  }

  /**
   * Logs out the current user using the authentication service.
   */
  logout() {
    this.chatService.messages = [];
    this.chatService.currentChannel$.next('pSBwciqiaOgtUayZaIgj');
    this.chatService.isFirstLoad = true
    this.chatService.setIsDmRoom(false);
    this.chatService.setIsNewMessage(false);
    // this.chatService.unsubscribe();
    this.mobileService.setActiveChannel('pSBwciqiaOgtUayZaIgj');
    this.chatService.isFirstLoad = true;
    this.profileAuth.userLogout();
  }

  

  /**
   * Closes the profile menu if a click occurs outside of it.
   * @param {MouseEvent} event - The mouse event that triggered this method.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const profileMenuElement = document.getElementById('profileMenu');
    const clickedInsideMenu =
      profileMenuElement && profileMenuElement.contains(event.target as Node);
    if (this.isProfilMenuOpen && !clickedInsideMenu && !this.keepMenuOpen || !this.isProfileEditOpen) {
      this.isProfilMenuOpen = false;
    }
  }

  /**
   * Toggles the visibility of the profile menu.
   */
  openProfileMenu() {
    if (this.isProfilMenuOpen && !this.keepMenuOpen) {
      this.isProfilMenuOpen = false;
    } else {
      setTimeout(() => {
        this.isProfilMenuOpen = true;
      }, 10);
    }
  }

  /**
  * Opens the profile edit view and closes the profile menu.
  */
  openProfile() {
    if (this.keepMenuOpen) {
      this.isProfileEditOpen = true;
    } else {
      this.isProfileEditOpen = true;
      this.isProfilMenuOpen = false;
    }

  }

  /**
   * Handles navigation back from the profile edit view to the profile menu.
   * @param {boolean} profileMenu - Indicates whether to open the profile menu after closing the edit view.
   */
  userWantsBackEvent(profileMenu: boolean) {
    this.isProfileEditOpen = false;
    setTimeout(() => {
      this.isProfilMenuOpen = profileMenu;
    }, 20);
  }

  async onSearchInputChange(event: any) {
    const searchInput = event.target.value;
    await this.chatService.search(searchInput)
  }

  jumpToChannel(result: any, channelId: string) {
    this.chatService.currentChannel$.next(channelId);
    this.chatService.setIsDmRoom(false);
    this.chatService.setIsNewMessage(false);
    this.checkScreenWidth();
    this.mobileService.setActiveChannel(channelId);
    this.chatService.searchInput = '';
    this.chatService.searchResults = [];
    this.chatService.highlightMessage(result.data.messageId, channelId);
  }

  openDM(userId: string) {
    this.chatService.messages = [];
    this.chatService.isFirstLoad = true
    const roomId = this.generateRoomId(this.user?.userId, userId);
    this.firestore.checkIfRoomExists(roomId, this.user?.userId, userId);
    this.chatService.currentChannel$.next(roomId);
    this.chatService.setCurrenDmPartner(userId);
    this.chatService.setIsDmRoom(true);
    this.checkScreenWidth();
    this.mobilService.setActiveChannel(userId);
    this.chatService.searchInput = '';
    this.chatService.searchResults = [];
    this.selectedChannel = this.mobilService.getActiveChannel();
    this.chatService.setIsNewMessage(false);
  }

  generateRoomId(userId1: string | undefined, userId2: string) {
    //sort the userId's aplhabetical then add them together seperated with a _
    return [userId1, userId2].sort().join('_');
  }

}
