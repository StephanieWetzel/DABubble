import { Injectable, inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { getFirestore, collection, addDoc, doc, onSnapshot } from "firebase/firestore";
import { Message } from '../../../../assets/models/message.class';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private firestore: Firestore = inject(Firestore);

  unsubMessage;

  constructor() {
    this.unsubMessage = onSnapshot(this.getMessagesRef(), (collection) => {
      collection.forEach(element => {
        console.log("Current data: ", element.data());
      }); 
    })
  }

  async addMessage(message: Message){
    message = this.toJSON(message)
    await addDoc(this.getMessagesRef(), message);
  }





  getMessagesRef(){
    return collection(this.firestore, 'messages')
  }

  toJSON(obj: Message){
    return{
      sendId: obj.sendId,
      getId: obj.getId,
      time: obj.time,
      content: obj.content,
    }
  }
}
