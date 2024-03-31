import { Component } from '@angular/core';
import { EditorModule } from '@tinymce/tinymce-angular';
import tinymce, { RawEditorOptions } from 'tinymce';
import { ChatService } from '../chat-service/chat.service';
import { Message } from '../../../../assets/models/message.class';

@Component({
  selector: 'app-input-box',
  standalone: true,
  imports: [EditorModule],
  templateUrl: './input-box.component.html',
  styleUrl: './input-box.component.scss'
})


export class InputBoxComponent {
  public editorInit: RawEditorOptions = {
    id: 'inputData',
    selector: '#inputData',
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
    entity_encoding: 'raw'
  };


  constructor(private chatService: ChatService){
    
  }

  sendMessage() {

    let data = tinymce.get("inputData")
    if (data) {
      let content = data.getContent();
      let message = new Message();
      message.content = content;
      this.chatService.addMessage(message);
      data.setContent('');
    } else {
      console.log('no data available');
    }
  }
  
}
