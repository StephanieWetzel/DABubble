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
  constructor(private firestore: FirebaseService) {}

  ngOnInit() {
    if (this.user) {
      this.userAvatar = this.user.avatar;
    }
  }

  closeAvatar() {
    this.closeAvatarEditing.emit(true);
  }

  selectAvatar(avatar: string) {
    this.userAvatar = avatar;
  }

  onFileSelected(event:any) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.userAvatar = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  saveAvatar() {
    if (this.user?.userId) {
      this.firestore.updateAvatar(this.userAvatar, this.user?.userId)
      this.closeAvatar();
    }
  }

  uploadPic() {
    this.file.nativeElement.click();
  }

}
