import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../../../assets/models/user.class';
import { FirebaseService } from '../../../../assets/services/firebase-service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-profile-avatar-edit',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './profile-avatar-edit.component.html',
  styleUrl: './profile-avatar-edit.component.scss',
})
export class ProfileAvatarEditComponent {
  userAvatar: string = '';
  AVATAR_LIST: string[] = [
    './assets/img/avatar_clean0.png',
    './assets/img/avatar_clean1.png',
    './assets/img/avatar_clean2.png',
    './assets/img/avatar_clean3.png',
    './assets/img/avatar_clean4.png',
    './assets/img/avatar_clean5.png',
  ];

  @Input() user: User | null = null;
  @Output() closeAvatarEditing = new EventEmitter<boolean>();
  @ViewChild('file') file: ElementRef | any;

  constructor(private firestore: FirebaseService) { }


  /**
 * Initializes the component by setting the userAvatar property to the avatar of the current user, if available.
 * Checks if the user object is defined and assigns the avatar to the userAvatar property.
 */
  ngOnInit() {
    if (this.user) {
      this.userAvatar = this.user.avatar;
    }
  }


  /**
   * Closes the avatar editing overlay by emitting the closing event.
   */
  closeAvatar() {
    this.closeAvatarEditing.emit(true);
  }


  /**
   * Sets the selected avatar for the user.
   *
   * @param {string} avatar - The avatar image URL or identifier to set as the user's avatar.
   */
  selectAvatar(avatar: string) {
    this.userAvatar = avatar;
  }


  /**
   * Handles the event when a file is selected.
   * Reads the selected file using FileReader and sets the userAvatar to the resulting data URL.
   * @param {any} event - The event object containing information about the selected file.
   */
  onFileSelected(event: any) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.userAvatar = e.target.result;
    };
    reader.readAsDataURL(file);
  }


  /**
   * Saves the user's avatar if the user is authenticated.
   */
  saveAvatar() {
    if (this.user?.userId) {
      this.firestore.updateAvatar(this.userAvatar, this.user?.userId)
      this.closeAvatar();
    }
  }


  /**
   * Triggers the file input element to open a file selection dialog for uploading a picture.
   */
  uploadPic() {
    this.file.nativeElement.click();
  }
}