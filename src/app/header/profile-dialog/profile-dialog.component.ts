import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-profile-dialog',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './profile-dialog.component.html',
  styleUrl: './profile-dialog.component.scss'
})
export class ProfileDialogComponent {

}
