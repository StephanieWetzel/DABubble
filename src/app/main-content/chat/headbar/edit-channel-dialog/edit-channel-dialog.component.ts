import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { Channel } from '../../../../../assets/models/channel.class';
import { FirebaseService } from '../../../../../assets/services/firebase-service';
import { FormsModule } from '@angular/forms';
import { User } from '../../../../../assets/models/user.class';
import { ProfileAuthentication } from '../../../../../assets/services/profileAuth.service';
import { ChatService } from '../../../../../assets/services/chat-service/chat.service';
import { MemberOversightComponent } from '../member-oversight/member-oversight.component';
import { AddMemberComponent } from '../add-member/add-member.component';

@Component({
  selector: 'app-edit-channel-dialog',
  standalone: true,
  imports: [CommonModule, MatIcon, FormsModule, MemberOversightComponent, AddMemberComponent],
  templateUrl: './edit-channel-dialog.component.html',
  styleUrl: './edit-channel-dialog.component.scss',
})
export class EditChannelDialogComponent {
  isEditNameOpen: boolean = false;
  isEditDescOpen: boolean = false;
  isMobileOverlayOpen: boolean = false;
  channel: Channel | null = null;
  user: User | null = null;
  currentUser: string = '';
  channelData: any = {
    name: '',
    description: '',
  };

  constructor(
    // public dialogref: MatDialogRef<EditChannelDialogComponent>,
    //@Inject(MAT_DIALOG_DATA) public data: any,
    public firestore: FirebaseService,
    private auth: ProfileAuthentication,
    private chatService: ChatService
  ) {}

  @Input() currentChannel!: string;
  @Input() channelMobile: Channel | null = null;
  @Input() membersMobile: User[] | null = null;
  @Output() closeDialog = new EventEmitter<boolean>();

  async ngOnInit() {
    this.channel = await this.firestore.getCurrentChannelData(this.currentChannel)
    if (this.channel) {
      this.user = await this.firestore.getCreator(this.channel.creator);
      this.auth.fetchLoggedUser().then((userID) => {
        this.currentUser = userID
      })
    }
  }

  close() {
    this.closeDialog.emit(false)
  }

  leaveChannel() {
    const updatedMember = this.channel?.member.filter(member => member.id !== this.currentUser);
    console.log("member: ", updatedMember)
    this.firestore.updateChannelInfo(this.channel?.channelId, updatedMember, 'member');
    this.chatService.currentChannel$.next('pSBwciqiaOgtUayZaIgj');
    this.closeDialog.emit(false);
  }

  editChName() {
    this.channelData.name = this.channel?.name;
    this.isEditNameOpen = !this.isEditNameOpen;
  }

  editChDesc() {
    this.channelData.description = this.channel?.description;
    this.isEditDescOpen = !this.isEditDescOpen;
  }

  safeEdit(edit: string, editedAttribut: string) {
    if (editedAttribut === 'name' && editedAttribut.length > 1) {
      this.channelData.name = edit;
      this.safeEditedChannelLokal(edit, editedAttribut);
      this.safeEditToFirestore(editedAttribut, edit);
      this.isEditNameOpen = false;
    } else if (editedAttribut === 'description' && editedAttribut.length > 1) {
      this.channelData.description = edit;
      this.safeEditedChannelLokal(edit, editedAttribut)
      this.safeEditToFirestore(editedAttribut, edit);
      this.isEditDescOpen = false;
    }
  }

  safeEditToFirestore(editedAttribut: string, edit:string) {
    if (editedAttribut === "name") {
      this.firestore.updateChannelInfo(this.channel?.channelId, edit, editedAttribut)
    } else if (editedAttribut === "description") {
      this.firestore.updateChannelInfo(this.channel?.channelId, edit, editedAttribut)
    }
  }

  safeEditedChannelLokal(edit: string, editedAttribut: string) {
    if (this.channel && editedAttribut === "name") {
      this.channel.name = edit;
    } else if (this.channel && editedAttribut === "description") {
      this.channel.description = edit;
    }
  }

  handleMobileOverlay(event:boolean) {
    this.isMobileOverlayOpen = event;
  }

  closeAddMember(event:boolean) {
    this.isMobileOverlayOpen = !event
  }

  closeInfo(event: boolean) {
    this.closeAddMember(!event);
    this.close();
  }

}
