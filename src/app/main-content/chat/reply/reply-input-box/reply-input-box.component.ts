import { ChangeDetectorRef, Component } from '@angular/core';
import tinymce, { RawEditorOptions } from 'tinymce';
import { EditorModule } from '@tinymce/tinymce-angular';
import { Message } from '../../../../../assets/models/message.class';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../../../../assets/services/chat-service/chat.service';

@Component({
  selector: 'app-reply-input-box',
  standalone: true,
  imports: [EditorModule, CommonModule],
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
        this.cdr.detectChanges();
      });
      editor.on('init', () => {
        editor.focus();
      });
      this.chatService.editorReply = editor;
    }
  };

  isContentEmpty: boolean = true;

  constructor(private chatService: ChatService, private cdr: ChangeDetectorRef) {

  }

  getInputContent(input: any) {
    return input.getContent({ format: 'text' }).trim();
  }

  sendMessage() {
    
    let replyData = tinymce.get('inputReply');

    if (replyData && this.getInputContent(replyData)) {
      let content = replyData.getContent({ format: 'text' });
      let message = new Message();
      message.content = content;
      message.sendId = this.chatService.currentUser.userId;
      this.chatService.addReply(message);
      replyData.setContent('');

    }
  }

  decodeHtmlEntities(encodedString: string) {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = encodedString;
    return textArea.value;
  }
}
