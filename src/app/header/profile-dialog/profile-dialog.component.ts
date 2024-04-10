import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ProfileEditDialogComponent } from './profile-edit-dialog/profile-edit-dialog.component';

@Component({
  selector: 'app-profile-dialog',
  standalone: true,
  imports: [CommonModule, MatIconModule, ProfileEditDialogComponent],
  templateUrl: './profile-dialog.component.html',
  styleUrl: './profile-dialog.component.scss'
})
export class ProfileDialogComponent {
  isEditing: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();

  closeProfileMenu() {
    this.closeEvent.emit(true);
  }

  userIsEditing() {
    this.isEditing = !this.isEditing;
  }
}
