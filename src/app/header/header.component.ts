import { Component, HostListener } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ProfileDialogComponent } from './profile-dialog/profile-dialog.component';
import { User } from '../../assets/models/user.class';
import { ProfileAuthentication } from '../../assets/services/profileAuth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIcon,
    ProfileDialogComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  isProfilMenuOpen: boolean = false;
  isProfileEditOpen: boolean = false;
  user: User | null = null;
  currentUserID: string | any;

  constructor(
    private profileAuth: ProfileAuthentication
  ) { }


  ngOnInit() {
    this.profileAuth.initializeUser();
    this.profileAuth.user$.subscribe((user) => {
      this.user = user;
    })
  }

  logout() {
    this.profileAuth.userLogout();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const profileMenuElement = document.getElementById('profileMenu');
    const clickedInsideMenu =
      profileMenuElement && profileMenuElement.contains(event.target as Node);
    if (this.isProfilMenuOpen && !clickedInsideMenu) {
      this.isProfilMenuOpen = false;
    }
  }


  openProfileMenu() {
    if (this.isProfilMenuOpen) {
      this.isProfilMenuOpen = false;
    } else {
      setTimeout(() => {
        this.isProfilMenuOpen = true;
      }, 10);
    }
  }


  openProfile() {
    this.isProfileEditOpen = true;
    this.isProfilMenuOpen = false;
  }


  userWantsBackEvent(profileMenu: boolean) {
    this.isProfileEditOpen = false;
    setTimeout(() => {
      this.isProfilMenuOpen = profileMenu;
    }, 20);
  }


}
