import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { Channel } from '../../../../../assets/models/channel.class';
import {
  MatChip,
  MatChipListbox,
  MatChipsModule,
} from '@angular/material/chips';
import { User } from '../../../../../assets/models/user.class';
import { FirebaseService } from '../../../../../assets/services/firebase-service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-member',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatChipListbox,
    MatChipsModule,
    MatChip,
    ReactiveFormsModule,
    MatIcon,
  ],
  templateUrl: './add-member.component.html',
  styleUrl: './add-member.component.scss',
})
export class AddMemberComponent {
  searchResults: any[] = [];
  selectedUsers: any[] = [];
  fetchedUser: any[] = [];
  user: User = new User();
  unsubUser;
  searchInput = new FormControl('');

  @Input() channel: Channel | null = null;
  @Input() currentMembers: User[] | null = null;
  @Output() isClosed = new EventEmitter<boolean>();
  @Output() hasAdded = new EventEmitter<boolean>();


  constructor(private firestore: FirebaseService) {
    this.unsubUser = this.firestore
      .fetchCollection('user')
      .subscribe((users) => {
        this.fetchedUser = users;
      });
    this.searchInput.valueChanges.subscribe((searchTerm: string | any) => {
      this.findResults(searchTerm);
    });
  }


  /**
   * Finds and updates search results based on the given search term.
   * Clears search results if the search term is empty.
   * Filters fetched users to exclude current members and selected users.
   * @param {string} searchTerm - The term to search for among users' names.
   */
  findResults(searchTerm: string) {
    if (!searchTerm) {
      this.searchResults = [];
      return;
    }
    const currentMemberIds = new Set(
      this.currentMembers?.map((member) => member.userId) || []
    );
    const selectedUserIds = new Set(
      this.selectedUsers?.map((user) => user.userId) || []
    );
    this.searchResults =
      this.fetchedUser?.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !currentMemberIds.has(user.userId) &&
          !selectedUserIds.has(user.userId)
      ) || [];
  }


  /**
   * Selects a user from the search results and adds them to the selected users list.
   * @param {any} user - The user to select.
   */
  selectUser(user: any) {
    if (!this.selectedUsers.includes(user)) {
      this.selectedUsers.push(user);
      this.searchInput.setValue('');
      this.searchResults = [];
    }
  }


  /**
   * Adds selected users as members to the current channel and emits an event to indicate the addition.
   */
  addMember() {
    let members = this.selectedUsers.map((user: User) => ({
      id: user.userId,
      name: user.name,
    }));
    if (this.channel) {
      this.firestore.updateChannelMembers(this.channel.channelId, members);
      this.close();
      this.hasAdded.emit(true);
    }
  }


  /**
   * Removes a user from the selected users list.
   * @param {User} user - The user to remove.
   */
  removeUser(user: User) {
    this.selectedUsers = this.selectedUsers.filter((u) => u !== user);
  }


  /**
   * Closes the component by emitting an event with a true value.
   */
  close() {
    this.isClosed.emit(true);
  }


  /**
 * Cleans up resources before component destruction.
 * Unsubscribes from user subscription to avoid memory leaks.
 */
  ngOnDestroy() {
    this.unsubUser.unsubscribe();
  }
}