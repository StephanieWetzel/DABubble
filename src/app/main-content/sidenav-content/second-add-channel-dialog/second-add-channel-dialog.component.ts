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
import { FirebaseService } from '../firebase-service';
import { MatChipsModule } from '@angular/material/chips';

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

  ngOnDestroy() {
    this.unsubUser.unsubscribe();
  }

  private findResults(searchTerm: string): any[] {
    return this.fetchedUser.filter(
      (item) =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !this.selectedUsers.find((user) => user.name === item.name)
    );
  }

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

  selectUser(user: any): void {
    if (!this.selectedUsers.includes(user)) {
      this.selectedUsers.push(user);
      this.searchResults = this.findResults(
        this.secondDialogGroup.get('searchInput').value
      );
    }
  }

  removeUser(user: any): void {
    this.selectedUsers = this.selectedUsers.filter((u) => u !== user);
  }
}
