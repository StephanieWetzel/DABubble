import { AfterViewInit, Component } from '@angular/core';
import { InputBoxComponent } from './input-box/input-box.component';
import { MessagesComponent } from './messages/messages.component';
import { HeadbarComponent } from './headbar/headbar.component';



@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [InputBoxComponent, MessagesComponent, HeadbarComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    throw new Error('Method not implemented.');
  }

  // scrollToBottom(): void {
  //   try {
  //     this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
  //   } catch(err) { }
  // }
}