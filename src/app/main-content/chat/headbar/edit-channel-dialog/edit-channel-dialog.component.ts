import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { Channel } from '../../../../../assets/models/channel.class';
import { FirebaseService } from '../../../../../assets/services/firebase-service';

@Component({
  selector: 'app-edit-channel-dialog',
  standalone: true,
  imports: [CommonModule, MatIcon],
  templateUrl: './edit-channel-dialog.component.html',
  styleUrl: './edit-channel-dialog.component.scss',
})
export class EditChannelDialogComponent {
  isEditNameOpen: boolean = false;
  isEditDescOpen: boolean = false;
  channel: Channel | null = null;

  constructor(
    public dialogref: MatDialogRef<EditChannelDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public firestore: FirebaseService
  ) {}

  async ngOnInit() {
    this.channel = await this.firestore.getCurrentChannelData(this.data.channelID);
  }

  editChName() {
    this.isEditNameOpen = !this.isEditNameOpen
  }

  editChDesc() {
    this.isEditDescOpen = !this.isEditDescOpen;
  }

}
