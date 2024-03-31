import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import {MatRadioModule} from '@angular/material/radio';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-second-add-channel-dialog',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatInputModule, ReactiveFormsModule, MatRadioModule],
  templateUrl: './second-add-channel-dialog.component.html',
  styleUrls: ['./second-add-channel-dialog.component.scss', '../add-channel-dialog/add-channel-dialog.component.scss']
})
export class SecondAddChannelDialogComponent {
  secondDialogGroup: FormGroup | any;

  constructor(public dialogRef: MatDialogRef<SecondAddChannelDialogComponent>) {
    this.secondDialogGroup = new FormGroup({

    })
  }

}
