import { Injectable, inject } from '@angular/core';
import { Firestore, orderBy, query } from '@angular/fire/firestore';
import { getFirestore, collection, addDoc, doc, onSnapshot, Unsubscribe } from "firebase/firestore";
import { Message } from '../../../../assets/models/message.class';

@Injectable({
  providedIn: 'root'
})
export class ChatService  {
  private firestore: Firestore = inject(Firestore);

  showReply: boolean = true;

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
    onSnapshot(this.getMessagesQ(), (queryCollection) => {
      this.messages = [];
      queryCollection.forEach(doc => {
        let data = doc.data();
        let message = new Message({ data, id: doc.id})
        message.content = doc.data()['content'];
        message.time = doc.data()['time'];
        this.messages.push(message);
      });
    })
  }

  getMessagesQ(){
    return query(this.getMessagesRef(), orderBy('time', 'asc'));
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

  // removePTags(text: string) {
  //   return text.replace(/^<p>/i, '').replace(/<\/p>$/i, '');
  // }
}
