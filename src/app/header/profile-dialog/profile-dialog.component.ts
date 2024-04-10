import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ProfileEditDialogComponent } from './profile-edit-dialog/profile-edit-dialog.component';
import { ProfileAuthentication } from '../../../assets/services/profileAuth.service';
import { User } from '../../../assets/models/user.class';

@Component({
  selector: 'app-profile-dialog',
  standalone: true,
  imports: [CommonModule, MatIconModule, ProfileEditDialogComponent],
  templateUrl: './profile-dialog.component.html',
  styleUrl: './profile-dialog.component.scss'
})
export class ProfileDialogComponent {
  isEditing: boolean = false;
  user: User | null = null;
  @Output() closeEvent = new EventEmitter<boolean>();

  constructor(private profileAuth: ProfileAuthentication){}

  ngOnInit() {
    this.profileAuth.initializeUser();
    this.profileAuth.user$.subscribe((user) => {
      this.user = user;
    })
  }

  closeProfileMenu() {
    this.closeEvent.emit(true);
  }

  userIsEditing() {
    this.isEditing = !this.isEditing;
  }
}
