import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-profile-edit-dialog',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './profile-edit-dialog.component.html',
  styleUrl: './profile-edit-dialog.component.scss'
})
export class ProfileEditDialogComponent {

}
