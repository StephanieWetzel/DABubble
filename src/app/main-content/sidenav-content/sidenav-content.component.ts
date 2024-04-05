import { Component, ViewEncapsulation } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { AddChannelDialogComponent } from "./add-channel-dialog/add-channel-dialog.component";
import { SecondAddChannelDialogComponent } from './second-add-channel-dialog/second-add-channel-dialog.component';
import { DialogRef } from '@angular/cdk/dialog';
import { Channel } from '../../../assets/models/channel.class';
import { FirebaseService } from './firebase-service';
import { Subscription } from 'rxjs';
import { User } from '../../../assets/models/user.class';

@Component({
    selector: 'app-sidenav-content',
    standalone: true,
    templateUrl: './sidenav-content.component.html',
    styleUrl: './sidenav-content.component.scss',
    encapsulation: ViewEncapsulation.None,
    imports: [CommonModule, MatExpansionModule, MatIconModule, AddChannelDialogComponent, MatDialogModule, SecondAddChannelDialogComponent]
})
export class SidenavContentComponent {
  isUserOnline: boolean = true;
  fetchedChannels: Channel[] = [];
  fetchedUser: User[] = [];
  unsubChannels: Subscription | undefined;
  unsubUsers: Subscription | undefined;
  
  constructor(public dialog: MatDialog, private firestore: FirebaseService) {
    this.fetchNavContent('channel', 'user', 'createdAt', 'asc');
  }

  fetchNavContent(channelCollId: string, userColId: string, orderByField: string, orderDirection: 'asc' | 'desc'){
    this.unsubChannels = this.firestore.fetchCollection(channelCollId, orderByField, orderDirection).subscribe((channels) => {
      this.fetchedChannels = channels;
      console.log(this.fetchedChannels)
    });
    this.unsubUsers = this.firestore.fetchCollection(userColId).subscribe((user) => {
      this.fetchedUser = user;
      console.log(this.fetchedUser)
    });
  }

  openAddChannel() {
    const dialogRef = this.dialog.open(AddChannelDialogComponent, {
      panelClass: 'custom-add-channel-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.openSecondDialog(result);
      }
    });
  }

  openSecondDialog(firstDialogData: any): void {
    const secondDialogRef = this.dialog.open(SecondAddChannelDialogComponent, {
      panelClass: 'custom-add-channel-dialog'
    });
    secondDialogRef.afterClosed().subscribe(secondDialogData => {
    this.firestore.saveChannel(this.cacheChannel(firstDialogData, secondDialogData))
    });
  }

  cacheChannel(firstDialogData:any, secondDialogData:any) {
    const members = secondDialogData.selectedUsers.map((user: any) => {
      return {id: user.userId, name: user.name}
    })
    const dialogData = this.transformChannelData(firstDialogData, members)
    const channel = new Channel(dialogData)
    return channel;
  }

  transformChannelData(firstDialogData:any, members: any) {
    return {
      name: firstDialogData.channelName,
      channelId: '',
      description: firstDialogData.description,
      member: members,
      messages: [{}],
      createdAt: new Date().getTime(),
    }
  }

  openChannel(channelID: string) {
    // logik open channel 
    console.log("Channel with ID:", channelID, ' opened.')
  }

}

