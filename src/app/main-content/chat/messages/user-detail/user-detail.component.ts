import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { User } from '../../../../../assets/models/user.class';
import { FirebaseService } from '../../../../../assets/services/firebase-service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss'
})
export class UserDetailComponent {

  pUser: User | null = null;
  @Input() userID: string | undefined;
  @Output() hasClosed = new EventEmitter<boolean>();

  constructor(private firestore: FirebaseService) {
    console.log(this.userID)
  }

  closeProfile(value: boolean) {
    this.hasClosed.emit(value);
  }

  ngOnChanges(changes: SimpleChanges):void {
    if (changes['userID']) {
      const newUserID = changes['userID'].currentValue;
      if (newUserID) {
        this.loadUser(newUserID)
      }
    }
  }

  
  async loadUser(userId: string):Promise<void> {
    this.pUser = await this.firestore.getCurrentUser(userId);
    if (this.pUser) {
      console.log("User loaded", this.pUser);
    } else {
      console.log("Failed to load user.");
    }
  }

}