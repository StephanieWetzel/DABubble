import { Component, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { EditorModule } from '@tinymce/tinymce-angular';
import tinymce, { RawEditorOptions } from 'tinymce';
import { ChatService } from './../../../../assets/services/chat-service/chat.service';
import { Message } from '../../../../assets/models/message.class';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ProfileAuthentication } from '../../../../assets/services/profileAuth.service';
import { User } from '../../../../assets/models/user.class';
import { FirebaseService } from '../../../../assets/services/firebase-service';
import { MatDialog } from '@angular/material/dialog';
import { FilePreviewDialogComponent } from './file-preview-dialog/file-preview-dialog.component';

@Component({
  selector: 'app-input-box',
  standalone: true,
  imports: [EditorModule, CommonModule, MatInputModule, MatIconModule, MatButtonModule],
  templateUrl: './input-box.component.html',
  styleUrls: ['./input-box.component.scss']
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
        const content = this.getInputContent(editor);
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
  selectedFiles: File[] = [];
  selectedFileNames: string[] = [];
  fileUrls: SafeResourceUrl[] = [];
  data: any = {};
  safeUrl: SafeResourceUrl | undefined;
  currentUser!: User;

  constructor(
    private chatService: ChatService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private profileAuth: ProfileAuthentication,
    public firestore: FirebaseService,
    public dialog: MatDialog
  ) { }


  /**
   * Gets the plain text content from an input editor, trimming any leading or trailing whitespace.
   * @param {any} input - The editor instance from which to retrieve content.
   * @returns {boolean} - The trimmed text content from the editor.
   */
  getInputContent(input: any): boolean {
    const content = input.getContent({ format: 'text' }).trim();
    return content;
  }


  /**
   * Handles sending messages based on the context (new message interface or existing conversation).
   * Clears input and selected files after sending.
   */
  async sendMessage() {
    let data = tinymce.get("inputData");
    if (this.isInNewMessageInterface()) {
      await this.sendNewMessage(data);
    } else {
      await this.sendSingleMessage(data, this.chatService.currentChannel$.value);
    }
    this.clearSelectedFiles();
    this.clearInput(data);
    this.cdr.detectChanges();
  }


  /**
   * Checks if the current interface is for sending new messages.
   * @returns {boolean} - True if the current interface is for new messages, false otherwise.
   */
  isInNewMessageInterface() {
    return this.chatService.currentChannel$.value === 'writeANewMessage';
  }


  /**
   * Handles sending new messages either to selected channels or direct messages to selected users.
   * @param {any} data - The message data from the input editor.
   */
  async sendNewMessage(data: any) {
    if (this.chatService.selectedChannels && this.chatService.selectedChannels.length > 0) {
      this.chatService.isChannel = true;
      for (const channel of this.chatService.selectedChannels) {
        await this.sendSingleMessage(data, channel.channelId);
      }
    }
    if (this.chatService.selectedUsers && this.chatService.selectedUsers.length > 0) {
      this.chatService.isChannel = false;
      for (const user of this.chatService.selectedUsers) {
        await this.sendDM(data, user.userId);
      }
    }
  }


  /**
   * Sends a message to a specific channel or user.
   * @param {any} data - The message content from the input editor.
   * @param {string} channel - The channel ID to send the message to.
   */
  async sendSingleMessage(data: any, channel: string) {
    if (data && this.getInputContent(data)) {
      let content = data.getContent({ format: 'text' });
      let message = new Message();
      message.content = content;
      message.sendId = this.chatService.currentUser.userId;

      if (this.selectedFiles.length > 0) {
        const file = this.selectedFiles[0]; // Es wird nur die erste Datei verwendet
        const fileUrl = await this.chatService.uploadFile(file);
        message.fileUrls.push(fileUrl);
      }

      await this.chatService.addMessage(message, channel);
    }
  }

  /**
   * Clears the input in the editor.
   * @param {any} data - The editor instance whose content is to be cleared.
   */
  clearInput(data: any) {
    data.setContent('');
  }


  /**
   * Clears the selected files list.
   */
  clearSelectedFiles() {
    this.selectedFileNames = [];
    this.selectedFiles = [];
    this.fileUrls = [];
    this.data = {};
  }


  /**
   * Sends a direct message to a specific user.
   * @param {any} data - The message content.
   * @param {string} userId - The user ID of the recipient.
   */
  async sendDM(data: string, userId: string) {
    const roomId = this.generateRoomId(this.chatService.currentUser.userId, userId);
    await this.firestore.checkAndCreateRoom(roomId, this.chatService.currentUser.userId, userId);
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


  /**
   * Handles the selection of a file from an input element.
   * Allows only one file to be selected and checks if the file size exceeds 1 MB.
   * Displays an alert if the file size limit is exceeded.
   * 
   * @param {Event} event - The event triggered when a file is selected.
   */
  openSelectedFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input && input.files && input.files.length > 0) {
      const file = input.files[0];

      if (file.size > 1024 * 1024) {
        alert("Dateien dürfen nicht größer als 1 MB sein.");
      } else {
        this.selectedFiles = [file];
        this.selectedFileNames = [file.name];
        this.previewFile(file);
      }
    }
  }


  /**
 * Reads the contents of a file and generates a secure URL for previewing.
 *
 * @param {File} file - The file object to preview.
 * @param {number} index - The index of the file in the collection.
 */
  previewFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.fileUrls[0] = this.sanitizer.bypassSecurityTrustResourceUrl(e.target.result);
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }


  /**
   * Opens a file preview dialog for the selected file.
   * @param {number} index - The index of the file in the selectedFiles array.
   */
  openFilePreview() {
    const file = this.selectedFiles[0];
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(e.target.result);
      this.dialog.open(FilePreviewDialogComponent, {
        data: { fileUrl: this.safeUrl, fileType: file.type }
      });
    };
    reader.readAsDataURL(file);
  }


  /**
   * Clears the selected file and its associated data, and resets the file input element.
   */
  removeFile() {
    this.selectedFiles = [];
    this.selectedFileNames = [];
    this.fileUrls = [];
    this.cdr.detectChanges();

    const input = document.getElementById('fileInput') as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  }


  /**
   * Decodes HTML entities in a string.
   * @param {string} encodedString - The string with encoded HTML entities.
   * @returns {string} - The decoded string.
   */
  decodeHtmlEntities(encodedString: string) {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = encodedString;
    return textArea.value;
  }


  /**
 * Checks if the given file is an image based on its MIME type.
 *
 * @param {File} file - The file to check.
 * @returns {boolean} True if the file is an image; otherwise, false.
 */
  isImageFile(file: File): boolean {
    return file.type.startsWith('image');
  }
}