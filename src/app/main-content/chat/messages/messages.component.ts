import { Component, inject } from '@angular/core';
import { ChatService } from '../chat-service/chat.service';
import { Message } from '../../../../assets/models/message.class';
import { NgFor } from '@angular/common';
import { Firestore, collection, onSnapshot } from '@angular/fire/firestore';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [NgFor],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss'
})

export class MessagesComponent {
  private firestore: Firestore = inject(Firestore);

  messages;
  // unsubMessage;

  constructor(private chatService: ChatService) {
    this.messages = this.chatService.messages;
    // this.unsubMessage = this.getMessages();
  }

  getList(): Message[] {
    this.messages = this.chatService.messages;
    console.log(this.chatService.messages);
    return this.chatService.messages;
  }

  // getMessages() {
  //   onSnapshot(this.getMessagesRef(), (collection) => {
  //     this.messages = [];
  //     collection.forEach(doc => {
  //       let data = doc.data();
  //       let message = new Message({ data, id: doc.id})
  //       this.messages.push(message);
  //       console.log(this.messages);
  //     });
  //   })

  // }


  // getMessagesRef() {
  //   return collection(this.firestore, 'messages');
  // }
}