import { ChangeDetectorRef, Component } from '@angular/core';
import tinymce, { RawEditorOptions } from 'tinymce';
import { EditorModule } from '@tinymce/tinymce-angular';
import { Message } from '../../../../../assets/models/message.class';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../../../../assets/services/chat-service/chat.service';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-reply-input-box',
  standalone: true,
  imports: [EditorModule, CommonModule, MatIcon],
  templateUrl: './reply-input-box.component.html',
  styleUrl: './reply-input-box.component.scss'
})
export class ReplyInputBoxComponent {

  public editorId: string = `inputReply-${Date.now()}`;

  public inputInit: RawEditorOptions = {
    base_url: '/tinymce',
    suffix: '.min',
    menubar: false,
    toolbar_location: 'bottom',
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
        // this.checkButtonState();
        this.isContentEmpty = !content;
        this.cdr.detectChanges();
      });
      editor.on('init', () => {
        editor.focus();
      });
      this.chatService.editorReply = editor;
    }
  };

  isContentEmpty: boolean = true;
  selectedFiles: File[] = [];
  selectedFileNames: string[] = [];
  fileUrls: SafeResourceUrl[] = [];
  data: any = {};
  safeUrl: SafeResourceUrl | undefined;
  isEditing: boolean = false;
  editMessageId: string = 'editOver';

  public sendButtonDisabled: boolean = true;


  constructor(public dialog: MatDialog, private chatService: ChatService, private cdr: ChangeDetectorRef, private sanitizer: DomSanitizer) {

  }


  /**
 * Retrieves the text content from a given input object using the 'text' format.
 * @param {any} input - The input object, typically from a text editor instance.
 * @returns {string} The trimmed text content from the input.
 */
  getInputContent(input: any) {
    return input.getContent({ format: 'text' }).trim();
  }


  /**
 * Checks and updates the state of the send message button based on input content and selected files.
 * Updates the 'isContentEmpty' flag to indicate whether content is empty.
 */
  checkButtonState() {
    const editorContent = this.getInputContent(this.chatService.editorReply);
    this.isContentEmpty = !editorContent && this.selectedFiles.length === 0;
  }


  /**
 * Sends a single message, including text content and selected files, to the current channel.
 * Clears selected files and resets editor content after sending the message.
 * @returns {Promise<void>} A Promise that resolves once the message is sent.
 */
  async sendMessage() {
    let replyData = tinymce.get(this.editorId);
    if (replyData) {
      await this.sendSingleMessage(replyData, this.chatService.currentChannel$.value);
      this.clearSelectedFiles();
      replyData.setContent('');
      // this.cdr.detectChanges();
      this.updateSendButtonState();

      const input = document.getElementById('fileInputReply') as HTMLInputElement;
      if (input) {
        input.value = '';
      }
    }
  }


  //   /**
  //  * Clears the list of selected files and their names.
  //  */
  clearSelectedFiles() {
    this.selectedFileNames = [];
    this.selectedFiles = [];
    this.fileUrls = [];
    this.data = {};
  }


  /**
 * Sends a single message to the specified channel, including text content and uploaded file URLs.
 * @param {any} data - The data containing the message content (usually from an editor instance).
 * @param {string} channel - The ID of the channel where the message will be sent.
 * @returns {Promise<void>} A Promise that resolves once the message is successfully sent.
 */
  async sendSingleMessage(data: any, channel: string) {
    if (data && this.getInputContent(data) || this.selectedFileNames.length > 0) {
      let content = data.getContent({ format: 'text' });
      let message = new Message();
      message.content = content;
      message.sendId = this.chatService.currentUser.userId;

      if (this.selectedFiles.length > 0) {
        const file = this.selectedFiles[0];
        const fileUrl = await this.chatService.uploadFile(file);
        message.fileUrls.push(fileUrl);
      }

      await this.chatService.addReply(message);
    }
  }


  /**
 * Handles the event when files are selected for upload.
 * Validates file sizes and updates selected files and file names accordingly.
 * @param {Event} event - The event containing the selected files.
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
 * Removes a selected file from the list of selected files and updates button state.
 * @param {number} index - The index of the file to be removed in the 'selectedFiles' array.
 */
  removeFile() {
    this.selectedFiles = [];
    this.selectedFileNames = [];
    this.fileUrls = [];
    this.cdr.detectChanges();

    const input = document.getElementById('fileInputReply') as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  }


  /**
 * Decodes HTML entities from an encoded string.
 * @param {string} encodedString - The encoded string containing HTML entities.
 * @returns {string} The decoded string with HTML entities replaced by their corresponding characters.
 */
  decodeHtmlEntities(encodedString: string) {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = encodedString;
    return textArea.value;
  }


  //   /**
  //  * Initiates the editing mode for a selected message.
  //  * Sets the editingMessageId and populates the editor content with the message content.
  //  * @param {Message} message - The message object to be edited.
  //  */
  editMessage(message: Message) {
    this.isEditing = true;
    this.editMessageId = message.messageId;
    this.chatService.editorReply.setContent(message.content);
    this.chatService.editorReply.focus();
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


  /**
 * Updates the state of the send button based on the content in the editor and selected files.
 */
  updateSendButtonState() {
    const editor = tinymce.get(this.editorId);
    this.isContentEmpty = !this.getInputContent(editor);
    this.sendButtonDisabled = this.isContentEmpty && this.selectedFileNames.length === 0;
    this.cdr.detectChanges();
  }
}