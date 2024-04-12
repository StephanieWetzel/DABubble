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

  displayProfileData() {
    setTimeout(() => {
      const profileData = {profileName: this.user?.name ?? null, profileMail: this.user?.email ?? null};
      this.editGroup.setValue(profileData);
    }, 50);
  }

  safeUserEdit() {
    this.profileAuth.updateUserEdit(this.user?.userId, this.editGroup.value.profileName, this.editGroup.value.profileMail);
    this.isSaving = true;
    setTimeout(() => {
      this.closeEvent.emit();
    }, 2005);
  }

  closeEditDialog() {
    this.closeEvent.emit();
  }
}
