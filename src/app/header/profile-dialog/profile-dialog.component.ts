import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ProfileEditDialogComponent } from './profile-edit-dialog/profile-edit-dialog.component';
import { ProfileAuthentication } from '../../../assets/services/profileAuth.service';
import { User } from '../../../assets/models/user.class';
import { ProfileAvatarEditComponent } from './profile-avatar-edit/profile-avatar-edit.component';

@Component({
  selector: 'app-profile-dialog',
  standalone: true,
  imports: [CommonModule, MatIconModule, ProfileEditDialogComponent, ProfileAvatarEditComponent],
  templateUrl: './profile-dialog.component.html',
  styleUrl: './profile-dialog.component.scss'
})
export class ProfileDialogComponent {
  isEditing: boolean = false;
  user: User | null = null;
  isAvatarEditing: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();

  constructor(private profileAuth: ProfileAuthentication){}

  /**
   * Initializes the component by setting up user authentication and subscribing to user data changes.
   * This method subscribes to the user observable to reactively update the component with the user's data.
   */
  ngOnInit() {
    this.profileAuth.initializeUser();
    this.profileAuth.user$.subscribe((user) => {
      this.user = user;
    })
  }

  /**
   * Emits an event to close the profile menu. This method can be tied to UI elements to close the profile menu
   * through an event binding, improving component interaction.
   */
  closeProfileMenu() {
    this.closeEvent.emit(true);
  }

  /**
   * Toggles the editing state of the user's profile. This method switches the state of `isEditing`,
   * allowing the component to react dynamically to user actions for editing the profile.
   */
  userIsEditing() {
    this.isEditing = !this.isEditing;
  }

  openEditAvatar() {
    this.isAvatarEditing = !this.isAvatarEditing;
  }

}
