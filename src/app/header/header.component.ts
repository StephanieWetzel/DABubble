import { Component, HostListener } from '@angular/core';

import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ProfileDialogComponent } from './profile-dialog/profile-dialog.component';
import { User } from '../../assets/models/user.class';
import { FirebaseService } from '../main-content/sidenav-content/firebase-service';
import { AuthenticationService } from '../registration/authentication.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatInputModule, MatFormFieldModule, MatIcon, ProfileDialogComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  isProfilMenuOpen: boolean = false;
  isProfileEditOpen: boolean = false;
  user: User | null = new User();
  currentUserID: string | any;

  constructor(
    private firestore: FirebaseService,
    private auth: AuthenticationService
  ) {
    console.log("da bitte",this.displayCuser());
  }

  displayCuser() {
    this.auth.fetchCUser((userID) => {
      if (userID) {
        return userID;
      } else {
        return null
      }
    });
  }

  ngOnInit() {
    this.fetchUserFromFirestore();
  }

  async fetchUserFromFirestore() {
    try {
      const userId = await this.fetchUserFromAuthentication(); // fetch id from auth
      if (userId) {
        console.log('Fetching user from Firestore with ID: ', userId);
        this.firestore.subscribeCurrentUser(userId, (user) => {
          this.user = user;
        })
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  }

  fetchUserFromAuthentication(): Promise<string> {
    return new Promise((resolve, reject) => {
      // a promise which gives a resolve back, if there is a current user
      //logged in -> gives uid back, and a reject back if
      //no user is currently logged in
      this.auth
        .fetchLoggedUser()
        .then((userId: string | any) => {
          console.log('Current user:', userId);
          resolve(userId);
        })
        .catch((error) => {
          console.error('No user to fetch', error);
          reject(error);
        });
    });
  }




  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const profileMenuElement = document.getElementById('profileMenu');
    const clickedInsideMenu = profileMenuElement && profileMenuElement.contains(event.target as Node);
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

}
