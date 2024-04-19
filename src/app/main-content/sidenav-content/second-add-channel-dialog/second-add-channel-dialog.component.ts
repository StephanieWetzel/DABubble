import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormControl,
} from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { User } from '../../../../assets/models/user.class';
import { MatChipsModule } from '@angular/material/chips';
import { FirebaseService } from '../../../../assets/services/firebase-service';

@Component({
  selector: 'app-second-add-channel-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatChipsModule,
  ],
  templateUrl: './second-add-channel-dialog.component.html',
  styleUrls: [
    './second-add-channel-dialog.component.scss',
    '../add-channel-dialog/add-channel-dialog.component.scss',
  ],
})
export class SecondAddChannelDialogComponent {
  secondDialogGroup: FormGroup | any;
  searchResults: any[] = [];
  fetchedUser: any[] = [];
  user: User = new User();
  selectedUsers: any[] = [];
  unsubUser;

  constructor(
    public dialogRef: MatDialogRef<SecondAddChannelDialogComponent>,
    private firestore: FirebaseService
  ) {
    this.secondDialogGroup = new FormGroup({
      selectedOption: new FormControl('', [Validators.required]),
      searchInput: new FormControl(''),
    });
    this.secondDialogGroup
      .get('searchInput')
      .valueChanges.subscribe((searchTerm: string) => {
        this.searchResults = searchTerm ? this.findResults(searchTerm) : [];
      });

    this.unsubUser = this.firestore.fetchCollection('user').subscribe((users) => {
      this.fetchedUser = users;
    });
  }

  /**
   * Cleans up the component by unsubscribing from any active subscriptions to prevent memory leaks.
   */  
  ngOnDestroy() {
    this.unsubUser.unsubscribe();
  }

  /**
   * Filters the fetched users based on the search term and excludes already selected users.
   * @param {string} searchTerm - The term used to filter user results.
   * @returns {any[]} An array of users that match the search criteria.
   * 
   */  
  private findResults(searchTerm: string): any[] {
    return this.fetchedUser.filter(
      (item) =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !this.selectedUsers.find((user) => user.name === item.name)
    );
  }

  /**
   * Handles the closure of the dialog, returning the selected option and users if applicable.
   */  
  onClose(): void {
    if (this.secondDialogGroup.get('selectedOption').value === 'chooseUser') {
      this.dialogRef.close({
        formValue: this.secondDialogGroup.get('selectedOption').value,
        selectedUsers: this.selectedUsers,
      });
    } else {
      this.dialogRef.close(this.secondDialogGroup.get('selectedOption').value);
    }
  }

  /**
   * Adds a user to the list of selected users and updates the search results.
   * @param {any} user - The user to add to the selected list.
   * 
   */  
  selectUser(user: any): void {
    if (!this.selectedUsers.includes(user)) {
      this.selectedUsers.push(user);
      this.searchResults = this.findResults(
        this.secondDialogGroup.get('searchInput').value
      );
    }
  }

  /**
   * Removes a user from the list of selected users.
   * @param {any} user - The user to remove from the selected list.
   * 
   */  
  removeUser(user: any): void {
    this.selectedUsers = this.selectedUsers.filter((u) => u !== user);
  }
}
