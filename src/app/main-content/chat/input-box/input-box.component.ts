import { Component, ChangeDetectorRef } from '@angular/core';
import { EditorModule } from '@tinymce/tinymce-angular';
import tinymce, { RawEditorOptions } from 'tinymce';
import { ChatService } from '../chat-service/chat.service';
import { Message } from '../../../../assets/models/message.class';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FilePreviewDialogComponent } from './file-preview-dialog/file-preview-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-input-box',
  standalone: true,
  imports: [EditorModule, CommonModule, MatInputModule, MatIconModule, MatButtonModule, FilePreviewDialogComponent],
  templateUrl: './input-box.component.html',
  styleUrl: './input-box.component.scss'
})


export class InputBoxComponent {
  public editorInit: RawEditorOptions = {
    selector: '#inputData',
    id: 'inputData',
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
        console.log(this.isContentEmpty);
      });
    }
  };

  isContentEmpty: boolean = true;

  selectedFiles: File[] = []; // Speichert mehrere Dateien
  selectedFileNames: string[] = []; // Optional: Speichert Dateinamen für die Anzeige
  safeUrl: any;


  constructor(private chatService: ChatService, private cdr: ChangeDetectorRef, public dialog: MatDialog, private sanitizer: DomSanitizer) {

  }


  getInputContent(input: any): boolean {
    const content = input.getContent({ format: 'text' }).trim();
    console.log(content);
    return content;
  }


  sendMessage() {
    let data = tinymce.get("inputData")
    console.log('my data: ', data?.getContent());
    if (data && this.getInputContent(data)) {
      let content = data.getContent({ format: 'text' });
      // content = this.decodeHtmlEntities(content);
      let message = new Message();
      message.content = content;
      this.chatService.addMessage(message);
      data.setContent('');
    }
    this.selectedFiles.forEach(file => {
      this.chatService.uploadFile(file)
    });
  }


  openSelectedFile(event: Event){
    console.log(event);
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFiles.push(input.files[0]);
      this.selectedFileNames.push(input.files[0].name);
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
   
  removeFile(index: number){
    this.selectedFiles.splice(index,1)
    this.selectedFileNames.splice(index,1);
  }

  decodeHtmlEntities(encodedString: string) {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = encodedString;
    return textArea.value;
  }
}
