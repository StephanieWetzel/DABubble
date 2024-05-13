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

  constructor(private profileAuth: ProfileAuthentication){}

  ngOnInit() {
    this.profileAuth.initializeUser();
    this.profileAuth.user$.subscribe((user) => {
      this.user = user;
    })
    this.displayProfileData();
  }

  /**
   * Delays the retrieval and display of user profile data in a form group.
   * This method sets a timeout to delay the fetching of profile information (name and email)
   * from the user object. If the user's name or email isn't defined, it defaults to null.
   * After the delay, it populates the 'editGroup' form group with the retrieved data.
   */
  displayProfileData() {
    setTimeout(() => {
      const profileData = {profileName: this.user?.name ?? null, profileMail: this.user?.email ?? null};
      this.editGroup.setValue(profileData);
    }, 50);
  }

  /**
   * Saves changes to the user's profile data and initiates a close event after a delay.
   * This method calls `updateUserEdit` on `profileAuth` to save the updated profile name and email,
   * based on the values provided in `editGroup`. It sets `isSaving` to true indicating that a save operation is ongoing.
   * A close event is emitted after a 2005 milliseconds delay to signify the end of the edit process.
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
