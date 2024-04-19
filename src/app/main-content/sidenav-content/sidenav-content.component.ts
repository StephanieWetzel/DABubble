import { Component, HostListener, ViewEncapsulation } from '@angular/core';
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
import { user } from '@angular/fire/auth';
import { UserSync } from '../../../assets/services/userSync.service';

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

  constructor(public dialog: MatDialog, private firestore: FirebaseService, private chatService: ChatService, private auth: ProfileAuthentication, private realTimeDB: UserSync) {
    this.getAuthUserId();
    this.fetchNavContent('channel', 'user', 'createdAt', 'asc');
    this.realTimeDB.startMonitoringActivity(this.currentUser);
  }
  /**
   * Listens to user activity events like mouse move and key down to reset the activity timer.
   */
  @HostListener('window:mousemove')
  @HostListener('window:keydown')
  onUserActivity() {
    this.realTimeDB.resetTimer(this.currentUser)
  }

  /**
   * Fetches navigation content for channels and users from Firestore.
   * @param {string} channelCollId - Firestore collection ID for channels.
   * @param {string} userColId - Firestore collection ID for users.
   * @param {string} orderByField - Field to order the fetched documents by.
   * @param {'asc' | 'desc'} orderDirection - Direction to order the fetched documents.
   * 
   */
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

  /**
   * Retrieves the authenticated user's ID and sets it as the current user.
   */
  getAuthUserId() {
    this.auth.fetchLoggedUser().then((userID) => {
      this.currentUser = userID;
      console.log("Current User: ", this.currentUser)
    })
  }

  /**
   * Attaches real-time state listeners to each fetched user to track and update their state.
   * @param {User[]} users - Array of users to attach state listeners to.
   * 
   */  
  attachStateToUsers(users: User[]) {
    users.forEach(user => {
      const stateRef = this.realTimeDB.getDbRef(user.userId); //ref for realtime db
      onValue(stateRef, (snapshot) => { // listener for realtime db -> is called if the state is changing (through logout, or connection lost i.e clsoing tab or window)
        const state = snapshot.val(); // state value from user
        const userToUpdate = this.fetchedUser.find(u => u.userId === user.userId); // search for specific user with the on top given user.userId at -> const stateRef; checks if the user in fetchedUser-Array matches the user whose status has updated 
        if (userToUpdate) { // if a user has found, the state will be updated with the state from the realtime db
          userToUpdate.state = state?.state || false; 
          this.auth.refreshState(userToUpdate.userId, userToUpdate.state); 
        }
      })
    })
}
 
  /**
   * Prioritizes the current user in the list of fetched users, moving them to the top of the list.
   * @param {any[]} users - The list of users.
   * @param {string} currentUserID - The ID of the current user.
   * @returns {any[]} The reordered list of users with the current user at the top.
   */
  prioritizeCurrentUser(users: any[], currentUserID: string): any[] {
    const index = users.findIndex(user => user.userId === currentUserID);
    if (index > -1) {
      const currentUser = users.splice(index, 1)[0];
      users.unshift(currentUser); //füge den user an die erste stelle des arrays
    }
    return users
  }

  /**
   * Opens a dialog to add a new channel.
   */  
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

  /**
   * Opens a second dialog based on data from the first add channel dialog.
   * @param {any} firstDialogData - Data returned from the first dialog.
   */  
  openSecondDialog(firstDialogData: any): void {
    const secondDialogRef = this.dialog.open(SecondAddChannelDialogComponent, {
      panelClass: 'custom-add-channel-dialog'
    });
    secondDialogRef.afterClosed().subscribe(secondDialogData => {
      this.firestore.saveChannel(this.cacheChannel(firstDialogData, secondDialogData))
    });
  }

  /**
   * Transforms data from dialogs into a channel object for storage.
   * @param {any} firstDialogData - Data from the first dialog.
   * @param {any} secondDialogData - Data from the second dialog including selected users.
   * @returns {Channel} The new channel object ready to be saved.
   */
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

/**
 * Transforms data from channel creation dialogs into a structured format for a new channel.
 * 
 * @param {any} firstDialogData - Data returned from the first channel creation dialog, containing channel name and description.
 * @param {any[]} members - Array of members to be included in the channel, typically derived from user selections in a dialog.
 * @returns {object} A new channel object with properties set from dialog data and defaults for others like channelId and messages.
 */
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

  /**
   * Opens a chat channel or DM based on the given channel ID.
   * @param {string} channelID - The ID of the channel to open.
   * 
   */
  openChannel(channelID: string) {
    // logik open channel 
    console.log("Channel with ID:", channelID, ' opened.')
    this.chatService.currentChannel = channelID;
    this.chatService.getChannelMessages();
    this.chatService.setIsDmRoom(false);
  }

  /**
   * Opens a direct message session between the current user and another user.
   * @param {string} userId - ID of the user to open DM with.
   */  
  openDM(userId:string) {
    const roomId = this.generateRoomId(this.currentUser, userId);
    this.firestore.checkIfRoomExists(roomId, this.currentUser, userId);
    this.chatService.currentChannel = roomId;
    this.chatService.setCurrenDmPartner(userId);
    this.chatService.setIsDmRoom(true);
    //this.chatService.getMessages();
  }

  /**
   * Generates a room ID for a DM session by concatenating the user IDs in alphabetical order.
   * @param {string} userId1 - First user ID.
   * @param {string} userId2 - Second user ID.
   * @returns {string} The generated room ID.
   */  
  generateRoomId(userId1:string, userId2: string) {
    //sort the userId's aplhabetical then add them together seperated with a _
    return [userId1, userId2].sort().join('_');
  }
}

