import { Component, HostListener } from '@angular/core';

import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ProfileDialogComponent } from './profile-dialog/profile-dialog.component';

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
  constructor() {}

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
