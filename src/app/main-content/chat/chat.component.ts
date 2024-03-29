import { Component } from '@angular/core';
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
export class ChatComponent {
 
}