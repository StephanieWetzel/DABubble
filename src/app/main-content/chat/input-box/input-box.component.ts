import { Component, ChangeDetectorRef, ViewChild, AfterViewInit, OnInit, ElementRef } from '@angular/core';
import { EditorModule } from '@tinymce/tinymce-angular';
import tinymce, { RawEditorOptions } from 'tinymce';
import { ChatService } from './../../../../assets/services/chat-service/chat.service';
import { Message } from '../../../../assets/models/message.class';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FilePreviewDialogComponent } from './file-preview-dialog/file-preview-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ProfileAuthentication } from '../../../../assets/services/profileAuth.service';
import { User } from '../../../../assets/models/user.class';
import { FirebaseService } from '../../../../assets/services/firebase-service';

@Component({
  selector: 'app-input-box',
  standalone: true,
  imports: [EditorModule, CommonModule, MatInputModule, MatIconModule, MatButtonModule, FilePreviewDialogComponent],
  templateUrl: './input-box.component.html',
  styleUrl: './input-box.component.scss'
})


export class InputBoxComponent {
  @ViewChild('inputData', { static: false }) myEditor!: ElementRef;

  public editorInit: RawEditorOptions = {
    base_url: '/tinymce',
    suffix: '.min',
    menubar: false,
    toolbar_location: 'bottom',
    border: 'none',
    plugins: 'autoresize emoticons link',
    autoresize_bottom_margin: 0,
    max_height: 500,
    placeholder: 'Nachricht an Chat ... ',
    statusbar: false,
    toolbar: 'link emoticons',
    entity_encoding: 'raw',
    setup: (editor) => {
      editor.on('input', () => {
        const content = this.getInputContent(editor)
        this.isContentEmpty = !content;
        this.cdr.detectChanges();
      });
      editor.on('init', () => {
        editor.focus();
      });
      this.chatService.editorMessage = editor;
    }
  };



  isContentEmpty: boolean = true;
  selectedFiles: File[] = []; // Speichert mehrere Dateien
  selectedFileNames: string[] = []; // Optional: Speichert Dateinamen für die Anzeige
  safeUrl: any;
  currentUser!: User;


  constructor(private chatService: ChatService, private cdr: ChangeDetectorRef, public dialog: MatDialog, private sanitizer: DomSanitizer, private profileAuth: ProfileAuthentication, public firestore: FirebaseService) {
  }


  getInputContent(input: any): boolean {
    const content = input.getContent({ format: 'text' }).trim();
    return content;
  }


  async sendMessage() {
    let data = tinymce.get("inputData")
    if (this.isInNewMessageInterface()) {
      await this.sendNewMessage(data);
    } else {
      await this.sendSingleMessage(data, this.chatService.currentChannel$.value);
    }
    this.clearSelectedFiles();
    this.clearInput(data);
  }

  isInNewMessageInterface() {
    return this.chatService.currentChannel$.value === 'writeANewMessage'
  }


  async sendNewMessage(data: any) {
    if(this.chatService.selectedChannels && this.chatService.selectedChannels.length > 0){
      this.chatService.isChannel = true
      this.chatService.selectedChannels.forEach(async channel => {
        await this.sendSingleMessage(data, channel.channelId)
      });
    }
    
    if (this.chatService.selectedUsers && this.chatService.selectedUsers.length > 0) {
      this.chatService.isChannel = false;
      console.log(this.chatService.selectedUsers);
      
      this.chatService.selectedUsers.forEach(async (user: User) => {
        console.log(user.userId)
        await this.sendDM(data, user.userId)
      });
    }
  }


  async sendSingleMessage(data: any, channel: string) {
    if (data && this.getInputContent(data)) {
      let content = data.getContent({ format: 'text' });
      let message = new Message();
      message.content = content;
      message.sendId = this.chatService.currentUser.userId;
      for (const file of this.selectedFiles) {
        const fileUrl = await this.chatService.uploadFile(file);
        message.fileUrls.push(fileUrl);
      }
      await this.chatService.addMessage(message, channel);
    }
  }

  clearInput(data: any) {
    data.setContent('');
  }

  clearSelectedFiles() {
    this.selectedFileNames = [];
    this.selectedFiles = [];
  }


  async sendDM(data: string, userId: string) {
    console.log('in sendDM', this.chatService.currentUser.userId, userId);
    const roomId = this.generateRoomId(this.chatService.currentUser.userId, userId);
   
    
    this.firestore.checkIfRoomExists(roomId, this.chatService.currentUser.userId, userId);
    this.chatService.currentChannel$.next(roomId);
    await this.sendSingleMessage(data, roomId);
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


  openSelectedFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input && input.files) {
      const files = input.files;
      let totalSize = 0;
      this.selectedFiles = [];
      this.selectedFileNames = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        totalSize += file.size;
        if (file.size > 5242880) { // 5 MB für Bilder
          alert("Dateien dürfen nicht größer als 5 MB sein.");
        } else {
          this.selectedFiles.push(file);
          this.selectedFileNames.push(file.name);
        }
      }

      if (totalSize > 20971520) { // 20 MB Gesamtgröße pro Nachricht
        alert("Die Gesamtgröße der Dateien pro Nachricht darf 20 MB nicht überschreiten.");
        this.selectedFiles = []; // Löscht die ausgewählten Dateien, falls die Gesamtgröße überschritten wird
      }
    }
  }




  openFilePreview(index: number) {
    const file = this.selectedFiles[index];
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(e.target.result);
      this.dialog.open(FilePreviewDialogComponent, {
        data: { fileUrl: this.safeUrl, fileType: file.type }
      });
    };
    reader.readAsDataURL(file);
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1)
    this.selectedFileNames.splice(index, 1);
  }

  decodeHtmlEntities(encodedString: string) {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = encodedString;
    return textArea.value;
  }

}
