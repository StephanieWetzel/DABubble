import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { User } from '../../../../../assets/models/user.class';
import { FirebaseService } from '../../../../../assets/services/firebase-service';
import { MatIconModule } from '@angular/material/icon';
import { ChatService } from '../../../../../assets/services/chat-service/chat.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss',
})
export class UserDetailComponent {
  pUser: User | null = null;
  @Input() userID: string | any;
  @Output() hasClosed = new EventEmitter<boolean>();

  constructor(
    private firestore: FirebaseService,
    private chatService: ChatService
  ) { }

  /**
   * Emits an event to indicate that the profile is being closed with the provided value.
   * @param {boolean} value - Boolean value indicating the state of closure.
   */
  closeProfile(value: boolean) {
    this.hasClosed.emit(value);
  }

  /**
   * Lifecycle hook that is called when one or more data-bound input properties of a directive or a component change.
   * @param {SimpleChanges} changes - An object containing each previous and current value of the properties that changed.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userID']) {
      const newUserID = changes['userID'].currentValue;
      if (newUserID) {
        this.loadUser(newUserID);
      }
    }
  }

  /**
   * Loads user data asynchronously.
   * @param {string} userId - The ID of the user to load.
   * @returns {Promise<void>} - A Promise that resolves once the user data is loaded.
   */
  async loadUser(userId: string): Promise<void> {
    this.pUser = await this.firestore.getCurrentUser(userId);
  }

  /**
   * Opens a direct message (DM) room between the current user and another user.
   */
  openDM() {
    const roomId = this.generateRoomId(
      this.chatService.currentUser.userId,
      this.userID
    );
    this.firestore.checkIfRoomExists(
      roomId,
      this.chatService.currentUser.userId,
      this.userID
    );
    this.chatService.currentChannel$.next(roomId);
    this.chatService.setCurrenDmPartner(this.userID);
    this.chatService.setIsDmRoom(true);
    this.closeProfile(true);
    this.chatService.showReply = false;
  }

  /**
   * Generates a unique room ID for a DM between two users.
   * @param {string} userId1 - The ID of the first user.
   * @param {string} userId2 - The ID of the second user.
   * @returns {string} - The generated room ID.
   */
  generateRoomId(userId1: string, userId2: string) {
    return [userId1, userId2].sort().join('_');
  }
}
