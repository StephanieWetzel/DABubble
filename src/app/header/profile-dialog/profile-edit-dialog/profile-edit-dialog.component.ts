import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../../../assets/models/user.class';
import { ProfileAuthentication } from '../../../../assets/services/profileAuth.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile-edit-dialog',
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule],
  templateUrl: './profile-edit-dialog.component.html',
  styleUrl: './profile-edit-dialog.component.scss'
})
export class ProfileEditDialogComponent {
  @Output() closeEvent = new EventEmitter<void>();
  user: User | null = null;
  isSaving: boolean = false;
  editGroup = new FormGroup({
    profileName: new FormControl(''),
    profileMail: new FormControl('')
  })

  constructor(private profileAuth: ProfileAuthentication) { }


  /**
 * Initializes the component by initializing the user profile.
 * Subscribes to changes in the user profile and updates the local user object accordingly.
 * Calls `displayProfileData()` to display profile information after a short delay.
 */
  ngOnInit() {
    this.profileAuth.initializeUser();
    this.profileAuth.user$.subscribe((user) => {
      this.user = user;
    })
    this.displayProfileData();
  }


  /**
 * Displays profile data in the form after a short delay.
 * Uses the `editGroup` form group to display profile name and email.
 */
  displayProfileData() {
    setTimeout(() => {
      const profileData = { profileName: this.user?.name ?? null, profileMail: this.user?.email ?? null };
      this.editGroup.setValue(profileData);
    }, 50);
  }


  /**
 * Safely updates the user profile data.
 * Updates the user's profile using `profileAuth.updateUserEdit`.
 * Sets `isSaving` to true to indicate that saving is in progress.
 * Emits a close event after a delay to close the profile editing dialog.
 */
  safeUserEdit() {
    this.profileAuth.updateUserEdit(this.user?.userId, this.editGroup.value.profileName, this.editGroup.value.profileMail);
    this.isSaving = true;
    setTimeout(() => {
      this.closeEvent.emit();
    }, 2005);
  }


  /**
   * Closes the overlay, by emitting the closing event.
   */
  closeEditDialog() {
    this.closeEvent.emit();
  }
}