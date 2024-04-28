import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { Channel } from '../../../../../assets/models/channel.class';
import { MatChip, MatChipListbox, MatChipsModule } from '@angular/material/chips';
import { User } from '../../../../../assets/models/user.class';
import { FirebaseService } from '../../../../../assets/services/firebase-service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-member',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatChipListbox, MatChipsModule,MatChip, ReactiveFormsModule, MatIcon],
  templateUrl: './add-member.component.html',
  styleUrl: './add-member.component.scss'
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


  constructor(private firestore: FirebaseService){
    this.unsubUser = this.firestore.fetchCollection('user').subscribe((users) => {
      this.fetchedUser = users;
    });
    this.searchInput.valueChanges.subscribe((searchTerm: string | any) => {
      this.findResults(searchTerm)
    });
  }

  ngOnDestroy() {
    this.unsubUser.unsubscribe();
  }

  findResults(searchTerm: string) {
    if (!searchTerm) {
      this.searchResults = []
      return;
    }
    const currentMemberIds = new Set(this.currentMembers?.map(member => member.userId) || []);
    this.searchResults = this.fetchedUser?.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
      !currentMemberIds.has(user.userId)
    ) || [];
  }

  selectUser(user: any) {
    if (!this.selectedUsers.includes(user)) {
      this.selectedUsers.push(user);
      this.searchInput.setValue('');
      this.searchResults = [];
    }
  }

  addMember() {
    let members = this.selectedUsers.map((user: User) => ({
      id: user.userId,
      name: user.name
    }));
    if (this.channel) {
      this.firestore.updateChannelMembers(this.channel.channelId, members)
      this.close();
      this.hasAdded.emit(true);
    }
  }

  removeUser(user: User) {
    this.selectedUsers = this.selectedUsers.filter((u) => u !== user);
  }

  close() {
    this.isClosed.emit(true);
  }

}
