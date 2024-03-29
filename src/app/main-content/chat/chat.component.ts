import { Component } from '@angular/core';
import { InputBoxComponent } from './input-box/input-box.component';



@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [InputBoxComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
 
}