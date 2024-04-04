import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-add-channel-dialog',
  standalone: true,
  imports: [CommonModule ,MatIconModule, MatInputModule, ReactiveFormsModule],
  templateUrl: './add-channel-dialog.component.html',
  styleUrl: './add-channel-dialog.component.scss'
})
export class AddChannelDialogComponent {
  firstDialogGroup: FormGroup | any;

  constructor(public dialogRef: MatDialogRef<AddChannelDialogComponent>) {
    this.firstDialogGroup = new FormGroup({
      channelName: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required])
    })
  }

  onClose(): void {
    if (this.firstDialogGroup.valid) {
      this.dialogRef.close(this.firstDialogGroup.value)
    }
  }
}
