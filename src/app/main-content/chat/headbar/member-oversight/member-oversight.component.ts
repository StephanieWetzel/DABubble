import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Channel } from '../../../../../assets/models/channel.class';
import { FirebaseService } from '../../../../../assets/services/firebase-service';
import { User } from '../../../../../assets/models/user.class';
import { MatIconModule } from '@angular/material/icon';
import { ProfileAuthentication } from '../../../../../assets/services/profileAuth.service';
import { UserDetailComponent } from '../../messages/user-detail/user-detail.component';
import { AddMemberComponent } from '../add-member/add-member.component';

@Component({
  selector: 'app-member-oversight',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    UserDetailComponent,
    AddMemberComponent,
  ],
  templateUrl: './member-oversight.component.html',
  styleUrl: './member-oversight.component.scss',
})
export class MemberOversightComponent {
  @Input() currentChannel: Channel | null = null;
  @Input() openedInChannel: boolean | any;
  @Output() hasClosed = new EventEmitter<boolean>();
  @Output() isSearchOpen = new EventEmitter<boolean>();
  @Output() isMobileOverlay = new EventEmitter<boolean>();

  members: User[] | null = null;
  currentUser = '';
  isAddMember = false;
  isShowingProfile: boolean = false;
  selectedProfileId: string = '';
  isAdding: boolean = false;

  constructor(
    private firestore: FirebaseService,
    private auth: ProfileAuthentication
  ) {}

  async ngOnInit() {
    this.getAuthUserID();
    if (this.currentChannel) {
      this.members = await this.firestore.getChannelMember(this.currentChannel);
      if (this.members && this.currentUser) {
        this.members = this.prioritizeCurrentUser(
          this.members,
          this.currentUser
        );
      }
    }
  }

  /**
   * Closes the oversight component based on the event boolean.
   * Emits an event indicating that the oversight has been closed if the event is true.
   * @param {boolean} event - Boolean indicating whether the oversight should be closed.
   */
  closeOversight(event: boolean) {
    if (event) {
      this.hasClosed.emit();
    }
  }
  /**
   * Closes the oversight component by emitting an event with a false value.
   */
  close() {
    this.hasClosed.emit(false);
  }

  /**
   * Handles the search closed event by updating the component state.
   * @param {boolean} event - Boolean indicating whether the search is closed.
   */
  searchClosed(event: boolean) {
    this.isAdding = !event;
    this.isSearchOpen.emit(false);
  }

  /**
   * Fetches the ID of the currently authenticated user.
   */
  getAuthUserID() {
    this.auth.fetchLoggedUser().then((userId) => {
      this.currentUser = userId;
    });
  }

  /**
   * Prioritizes the current user within a list of users.
   * @param {User[]} users - Array of user objects.
   * @param {string} currentUserId - ID of the current user.
   * @returns {User[]} - The array of users with the current user moved to the front.
   */
  prioritizeCurrentUser(users: User[], currentUserId: string): User[] {
    const index = users.findIndex((user) => user.userId === currentUserId);
    if (index > -1) {
      const currentUser = users.splice(index, 1)[0];
      users.unshift(currentUser);
    }
    return users;
  }

  /**
   * Sets the selected profile ID and updates the state to show the profile.
   * @param {string} userId - ID of the selected user profile.
   */
  showProfile(userId: string) {
    this.selectedProfileId = userId;
    this.isShowingProfile = true;
  }

  /**
   * Handles the profile event by updating the state to hide the profile.
   * @param {boolean} event - Boolean indicating whether to hide the profile.
   */
  handleProfile(event: boolean) {
    this.isShowingProfile = false;
  }

  /**
   * Toggles the state of adding a member and emits an event to indicate whether the search is open.
   */
  toggleAddMember() {
    this.isAdding = !this.isAdding;
    this.isSearchOpen.emit(true);
  }

  /**
   * Opens the mobile add member overlay by emitting an event.
   */
  openMobileAddMemberOverlay() {
    this.isMobileOverlay.emit(true);
  }
}
