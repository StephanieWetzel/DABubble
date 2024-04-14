import { Component, ViewEncapsulation } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { AddChannelDialogComponent } from "./add-channel-dialog/add-channel-dialog.component";
import { SecondAddChannelDialogComponent } from './second-add-channel-dialog/second-add-channel-dialog.component';
import { DialogRef } from '@angular/cdk/dialog';
import { Channel } from '../../../assets/models/channel.class';
import { Subscription } from 'rxjs';
import { User } from '../../../assets/models/user.class';
import { ProfileAuthentication } from '../../../assets/services/profileAuth.service';
import { ChatService } from '../../../assets/services/chat-service/chat.service';
import { FirebaseService } from '../../../assets/services/firebase-service';
import { onValue, ref } from '@angular/fire/database';

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
  currentUser: string = '';

  constructor(public dialog: MatDialog, private firestore: FirebaseService, private chatService: ChatService, private auth: ProfileAuthentication) {
    this.getAuthUserId();
    this.fetchNavContent('channel', 'user', 'createdAt', 'asc');

  }

  fetchNavContent(channelCollId: string, userColId: string, orderByField: string, orderDirection: 'asc' | 'desc') {
    this.unsubChannels = this.firestore.fetchCollection(channelCollId, orderByField, orderDirection).subscribe((channels) => {
      this.fetchedChannels = channels.filter(channel => channel.member.some((member: { id: string; }) => member.id === this.currentUser));
      console.log(this.fetchedChannels)
    });
    this.unsubUsers = this.firestore.fetchCollection(userColId).subscribe((users) => {
      this.fetchedUser = this.prioritizeCurrentUser(users, this.currentUser);
      this.attachStateToUsers(this.fetchedUser);
      console.log(this.fetchedUser)
    });
  }

  getAuthUserId() {
    this.auth.fetchLoggedUser().then((userID) => {
      this.currentUser = userID;
      console.log("Current User: ", this.currentUser)
    })
  }

  attachStateToUsers(users: User[]) {
    users.forEach(user => {
      const stateRef = ref(this.auth.realTimeDB, `state/${user.userId}`); //ref for realtime db
      onValue(stateRef, (snapshot) => { // listener for realtime db -> is called if the state is changing (through logout, or connection lost i.e clsoing tab or window)
        const state = snapshot.val(); // state value from user
        const userToUpdate = this.fetchedUser.find(u => u.userId === user.userId); // search for specific user with the on top given user.userId at -> const stateRef; checks if the user in fetchedUser-Array matches the user whose status has updated 
        if (userToUpdate) { // if a user has found, the state will be updated with the state from the realtime db
          userToUpdate.state = state?.state || false;  
        }
      })
    })
}
 

  prioritizeCurrentUser(users: any[], currentUserID: string): any[] {
    const index = users.findIndex(user => user.userId === currentUserID);
    if (index > -1) {
      const currentUser = users.splice(index, 1)[0];
      users.unshift(currentUser); //füge den user an die erste stelle des arrays
    }
    return users
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

  cacheChannel(firstDialogData: any, secondDialogData: any) {
    let members;
    if (secondDialogData.selectedUsers) {
      members = secondDialogData.selectedUsers.map((user: any) => {
        return { id: user.userId, name: user.name }
      })
    } else {
      members = this.fetchedUser.map((user: any) => {
        return { id: user.userId, name: user.name }
      })
    }
    const dialogData = this.transformChannelData(firstDialogData, members)
    const channel = new Channel(dialogData)
    return channel;
  }

  transformChannelData(firstDialogData: any, members: any) {
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
    this.chatService.currentChannel = channelID;
    this.chatService.getMessages();
  }
}

