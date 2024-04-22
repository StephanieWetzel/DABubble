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

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIcon,
    ProfileDialogComponent,
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
  @Output() openSidenav = new EventEmitter<void>();

  constructor(private profileAuth: ProfileAuthentication, public mobileService: MobileService) {
  }


  @HostListener('window:resize')
  checkScreenWidth() {
    this.screenWidth = window.innerWidth
    if (window.innerWidth < 520) {
      this.keepMenuOpen = true;
      console.log(this.keepMenuOpen)
    }
  }

  getBackToNav() {
    this.mobileService.openChannel(false);
    this.mobileService.toggleDrawe(true);
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
      console.log('Menü wird geschlossen', this.keepMenuOpen)
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
}
