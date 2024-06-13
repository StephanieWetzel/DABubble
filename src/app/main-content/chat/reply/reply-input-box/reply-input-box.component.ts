import { ChangeDetectorRef, Component } from '@angular/core';
import tinymce, { RawEditorOptions } from 'tinymce';
import { EditorModule } from '@tinymce/tinymce-angular';
import { Message } from '../../../../../assets/models/message.class';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../../../../assets/services/chat-service/chat.service';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { FilePreviewDialogComponent } from '../../input-box/file-preview-dialog/file-preview-dialog.component';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-reply-input-box',
  standalone: true,
  imports: [EditorModule, CommonModule, MatIcon],
  templateUrl: './reply-input-box.component.html',
  styleUrl: './reply-input-box.component.scss'
})
export class ReplyInputBoxComponent {
  public inputInit: RawEditorOptions = {
    id: 'inputReply',
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
        this.isContentEmpty = !content;
        this.checkButtonState();
        this.cdr.detectChanges();
      });
      editor.on('init', () => {
        editor.focus();
      });
      this.chatService.editorReply = editor;
    }
  };

  isContentEmpty: boolean = true;
  selectedFiles: File[] = []; // Speichert mehrere Dateien
  selectedFileNames: string[] = []; // Optional: Speichert Dateinamen für die Anzeige
  safeUrl: any;
  isEditing: boolean = false;
  editMessageId: string   = 'editOver';

  constructor(public dialog: MatDialog, private chatService: ChatService, private cdr: ChangeDetectorRef, private sanitizer: DomSanitizer) {

  }

  getInputContent(input: any) {
    return input.getContent({ format: 'text' }).trim();
  }

  async sendMessage() {
    
    let replyData = tinymce.get('inputReply');
    if (replyData){
      await this.sendSingleMessage(replyData, this.chatService.currentChannel$.value);
      this.clearSelectedFiles();
      replyData.setContent('');
      this.cdr.detectChanges();
    }
  }

  clearSelectedFiles() {
    this.selectedFileNames = [];
    this.selectedFiles = [];
  }


  async sendSingleMessage(data: any, channel: string) {
    if (data && this.getInputContent(data) || this.selectedFileNames.length > 0) {
      let content = data.getContent({ format: 'text' });
      let message = new Message();
      message.content = content;
      message.sendId = this.chatService.currentUser.userId;
      for (const file of this.selectedFiles) {
        const fileUrl = await this.chatService.uploadFile(file);
        message.fileUrls.push(fileUrl);
      }
      await this.chatService.addReply(message);
    }
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
    this.cdr.detectChanges();
  }

  decodeHtmlEntities(encodedString: string) {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = encodedString;
    return textArea.value;
  }

  editMessage(message: Message) {
    this.isEditing = true;
    this.editMessageId = message.messageId;
    this.chatService.editorReply.setContent(message.content);
    this.chatService.editorReply.focus();
  }

  checkButtonState() {
    const editorContent = this.getInputContent(this.chatService.editorReply);
    this.isContentEmpty = !editorContent && this.selectedFiles.length === 0;
  }

}