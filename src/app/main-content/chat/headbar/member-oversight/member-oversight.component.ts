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
  imports: [CommonModule, MatIconModule, UserDetailComponent, AddMemberComponent],
  templateUrl: './member-oversight.component.html',
  styleUrl: './member-oversight.component.scss'
})
export class MemberOversightComponent {

  @Input() currentChannel: Channel | null = null;
  @Output() hasClosed = new EventEmitter<boolean>();
  @Output() isSearchOpen = new EventEmitter<boolean>();

  members: User[] | null = null
  currentUser = '';
  isAddMember = false;
  isShowingProfile:boolean = false;
  selectedProfileId: string = '';
  isAdding:boolean = false;

  constructor(private firestore: FirebaseService, private auth: ProfileAuthentication){}

  async ngOnInit() {
    this.getAuthUserID();
    if (this.currentChannel) {
      this.members = await this.firestore.getChannelMember(this.currentChannel);
      if (this.members && this.currentUser) {
        this.members = this.prioritizeCurrentUser(this.members, this.currentUser);
      }
    }
    
  }

  close() {
    this.hasClosed.emit(false);
  }

  searchClosed(event:boolean) {
    this.isAdding = !event;
    this.isSearchOpen.emit(false);
  }

  getAuthUserID() {
    this.auth.fetchLoggedUser().then((userId) => {
      this.currentUser = userId;
    })
  }

  prioritizeCurrentUser(users: User[], currentUserId: string): User[] {
    const index = users.findIndex(user => user.userId === currentUserId);
    if (index > -1) {
      const currentUser = users.splice(index, 1)[0];
      users.unshift(currentUser);
    }
    return users
  }

  showProfile(userId :string) {
    this.selectedProfileId = userId;
    this.isShowingProfile = true;
  }

  handleProfile(event: boolean) {
    this.isShowingProfile = false;
  }

  toggleAddMember() {
    this.isAdding = !this.isAdding;
    this.isSearchOpen.emit(true);
  }

}
