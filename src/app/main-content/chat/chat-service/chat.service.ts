import { Injectable, inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { getFirestore, collection, addDoc, doc, onSnapshot, Unsubscribe } from "firebase/firestore";
import { Message } from '../../../../assets/models/message.class';

@Injectable({
  providedIn: 'root'
})
export class ChatService  {
  private firestore: Firestore = inject(Firestore);

  unsubMessage;

  messages: Message[] = [];

  constructor() {
    this.unsubMessage = this.getMessages();
  }

  async addMessage(message: Message) {
    message = this.toJSON(message)
    await addDoc(this.getMessagesRef(), message);
  }


  getMessages() {
    onSnapshot(this.getMessagesRef(), (collection) => {
      this.messages = [];
      collection.forEach(doc => {
        let data = doc.data();
        let message = new Message({ data, id: doc.id})
        message.content = doc.data()['content'];
        message.time = doc.data()['content'];
        this.messages.push(message);
        console.log('im Service',this.messages);
      });
    })
    
  }


  getMessagesRef() {
    return collection(this.firestore, 'messages')
  }


  toJSON(obj: Message) {
    return {
      sendId: obj.sendId,
      getId: obj.getId,
      time: obj.time,
      content: obj.content,
      id: obj.id
    }
  }
}
