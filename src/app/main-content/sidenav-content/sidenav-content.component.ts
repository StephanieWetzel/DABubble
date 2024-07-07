import { Component, EventEmitter, HostListener, Output, ViewEncapsulation } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { AddChannelDialogComponent } from "./add-channel-dialog/add-channel-dialog.component";
import { SecondAddChannelDialogComponent } from './second-add-channel-dialog/second-add-channel-dialog.component';
import { Channel } from '../../../assets/models/channel.class';
import { Subscription } from 'rxjs';
import { User } from '../../../assets/models/user.class';
import { ProfileAuthentication } from '../../../assets/services/profileAuth.service';
import { ChatService } from '../../../assets/services/chat-service/chat.service';
import { FirebaseService } from '../../../assets/services/firebase-service';
import { onValue } from '@angular/fire/database';
import { UserSync } from '../../../assets/services/userSync.service';
import { MobileService } from '../../../assets/services/mobile.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sidenav-content',
  standalone: true,
  templateUrl: './sidenav-content.component.html',
  styleUrl: './sidenav-content.component.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, MatExpansionModule, MatIconModule, AddChannelDialogComponent, MatDialogModule, SecondAddChannelDialogComponent, FormsModule]
})
export class SidenavContentComponent {
  isUserOnline: boolean = true;
  fetchedChannels: Channel[] = [];
  fetchedUser: User[] = [];
  unsubChannels: Subscription | undefined;
  unsubUsers: Subscription | undefined;
  currentUser: string = '';
  screenWidth: number;
  selectedChannel: string | null = 'V4fl3CDNCrJMOp6Dro36';
  selectedChannelSub!: Subscription;
  showBlueEdit: boolean = false;
  debounceTime: any;
  @Output() closeSidenav = new EventEmitter<void>();


  constructor(public dialog: MatDialog, private firestore: FirebaseService, public chatService: ChatService, private auth: ProfileAuthentication, private realTimeDB: UserSync, private mobilService: MobileService) {
    this.getAuthUserId();
    this.fetchNavContent('channel', 'user', 'createdAt', 'asc');
    this.screenWidth = window.innerWidth;
    this.realTimeDB.startMonitoringActivity(this.currentUser);
  }


  /**
 * Initializes the component when it is being loaded.
 * Sets the selected channel to the last active channel retrieved from the `mobileService`.
 *
 * This method retrieves the last active channel from `mobileService` and assigns it to
 * the `selectedChannel` property if available.
 *
 * @returns {void} Returns nothing.
 */
  ngOnInit() {
    this.mobilService.getActiveChannel();
    this.selectedChannelSub = this.mobilService.activeChannel$.subscribe(
      (isActiveChannel) => {
        this.selectedChannel = isActiveChannel
      }
    )
  }


  /**
   * Listens for user activity events such as mousemove and keydown on the window.
   * Resets the timer in the real-time database for the current user to maintain active session.
   *
   * This method is triggered whenever there is mouse movement or key press events on the window.
   * It invokes the `resetTimer` method of the `realTimeDB` service to reset the timer for the current user.
   *
   * @returns {void} Returns nothing.
   */
  @HostListener('window:mousemove')
  @HostListener('window:keydown')
  onUserActivity() {
    this.realTimeDB.resetTimer(this.currentUser)
  }


  /**
 * Listens for the window resize event to update the screenWidth property.
 * Updates the screenWidth property with the current inner width of the window.
 *
 * This method is triggered whenever the window is resized.
 * It sets the screenWidth property of the component to the inner width of the window.
 *
 * @returns {void} Returns nothing.
 */
  @HostListener('window:resize')
  checkScreenWisth() {
    this.screenWidth = window.innerWidth;
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
      this.chatService.allChannels = this.fetchedChannels
    });
    this.unsubUsers = this.firestore.fetchCollection(userColId).subscribe((users) => {
      this.fetchedUser = this.prioritizeCurrentUser(users, this.currentUser);
      this.attachStateToUsers(this.fetchedUser);
      this.chatService.users = this.fetchedUser
    });
  }


  /**
   * Retrieves the authenticated user's ID and assigns it to the currentUser property.
   * Uses the authentication service to fetch the currently logged-in user's ID.
   * Updates the component's currentUser property with the fetched user ID.
   *
   * @returns {void} Returns nothing.
   */
  getAuthUserId() {
    this.auth.fetchLoggedUser().then((userID) => {
      this.currentUser = userID;
    })
  }


  /**
   * Attaches real-time state updates to an array of users.
   *
   * For each user, this function sets up a listener on the real-time database to update the user's state
   * and refreshes the state in the authentication service whenever a state change is detected.
   *
   * @param {User[]} users - The array of users to attach state updates to.
   */
  attachStateToUsers(users: User[]) {
    users.forEach(user => {
      const stateRef = this.realTimeDB.getDbRef(user.userId);
      onValue(stateRef, (snapshot) => {
        const state = snapshot.val();
        const userToUpdate = this.fetchedUser.find(u => u.userId === user.userId);
        if (userToUpdate) {
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
      users.unshift(currentUser);
    }
    return users
  }


  /**
   * Opens a dialog to add a new channel and handles the result.
   * If a result is received from the dialog, opens a second dialog based on the result.
   *
   * @returns {void} Returns nothing.
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
      if (secondDialogData) {
        this.cacheChannel(firstDialogData, secondDialogData).then(channel => {
          this.firestore.saveChannel(channel);
        })
      }
    });
  }


  /**
   * Transforms data from dialogs into a channel object for storage.
   * @param {any} firstDialogData - Data from the first dialog.
   * @param {any} secondDialogData - Data from the second dialog including selected users.
   * @returns {Channel} The new channel object ready to be saved.
   */
  async cacheChannel(firstDialogData: any, secondDialogData: any) {
    const currentUser = await this.firestore.getCurrentUser(this.currentUser)
    let members;
    if (secondDialogData.selectedUsers) {
      members = secondDialogData.selectedUsers.map((user: any) => {
        return { id: user.userId, name: user.name }
      })
      members.push({ id: currentUser?.userId, name: currentUser?.name });
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
      creator: this.currentUser
    }
  }


  /**
   * Checks the current screen width and performs actions based on the width threshold.
   * If the screen width is less than 820 pixels, opens the channel in mobile view and emits a signal to close the sidenav.
   *
   * @returns {void} Returns nothing.
   */
  checkScreenWidth() {
    if (this.screenWidth < 820) {
      this.mobilService.openChannel(true);
      this.closeSidenav.emit()
    }
  }


  /**
   * Handles the click event when a channel is clicked.
   * Opens the channel in mobile view using the MobileService.
   *
   * @returns {void} Returns nothing.
   */
  onChannelClick() {
    this.mobilService.openChannel(true);
  }


  /**
   * Opens a chat channel or DM based on the given channel ID.
   * @param {string} channelID - The ID of the channel to open.
   * 
   */
  openChannel(channelID: string) {
    this.chatService.messages = [];
    this.chatService.currentChannel$.next(channelID);
    this.chatService.isFirstLoad = true
    this.chatService.setIsDmRoom(false);
    this.chatService.setIsNewMessage(false);
    this.checkScreenWidth();
    this.mobilService.setActiveChannel(channelID);
    this.mobilService.getActiveChannel();
  }


  /**
   * Opens a direct message session between the current user and another user.
   * @param {string} userId - ID of the user to open DM with.
   */
  openDM(userId: string) {
    this.chatService.messages = [];
    this.chatService.isFirstLoad = true
    const roomId = this.generateRoomId(this.currentUser, userId);
    this.firestore.checkIfRoomExists(roomId, this.currentUser, userId);
    this.chatService.currentChannel$.next(roomId);
    this.chatService.setCurrenDmPartner(userId);
    this.chatService.setIsDmRoom(true);
    this.checkScreenWidth();
    this.chatService.setEditorFocusMessage();
    this.mobilService.setActiveChannel(userId);
    this.mobilService.getActiveChannel();
    this.chatService.setIsNewMessage(false);
  }


  /**
   * Generates a room ID for a DM session by concatenating the user IDs in alphabetical order.
   * @param {string} userId1 - First user ID.
   * @param {string} userId2 - Second user ID.
   * @returns {string} The generated room ID.
   */
  generateRoomId(userId1: string, userId2: string) {
    return [userId1, userId2].sort().join('_');
  }


  /**
 * Jumps to the specified channel ID, updating relevant states and services.
 *
 * @param {string} channelID The ID of the channel to jump to.
 * @returns {void} Returns nothing.
 */
  jumpToChannel(channelID: string) {
    this.chatService.currentChannel$.next(channelID);
    this.chatService.setIsDmRoom(false);
    this.chatService.setIsNewMessage(false);
    this.checkScreenWidth();
    this.mobilService.setActiveChannel(channelID);
    this.chatService.searchInput = '';
    this.chatService.searchResults = [];
  }


  /**
 * Handles the change event when the search input value changes.
 *
 * @param {any} event The event object containing the search input value.
 * @returns {Promise<void>} A Promise that resolves once the search operation is completed.
 */
  async onSearchInputChange(event: any) {
    const searchInput = event.target.value;
    if (this.debounceTime) {
      clearTimeout(this.debounceTime)
    }
    this.debounceTime = setTimeout(async () => {
      await this.chatService.search(searchInput);
    }, 500)
  }


  /**
 * Initiates the process to write a new message in the chat.
 * Sets the appropriate states and triggers necessary updates.
 */
  writeNewMessage() {
    this.chatService.setIsNewMessage(true);
    this.chatService.isDmRoom.next(false);
    this.chatService.currentChannel$.next('writeANewMessage');
    this.chatService.updateMessages();
    this.checkScreenWidth();
    this.mobilService.setActiveChannel('writeANewMessage');
    this.selectedChannel = 'writeANewMessage'
  }
}