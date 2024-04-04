import { Injectable, inject } from '@angular/core';
import { Firestore, arrayUnion, deleteDoc, getDoc, orderBy, query, updateDoc } from '@angular/fire/firestore';
import { getFirestore, collection, addDoc, doc, onSnapshot, Unsubscribe } from "firebase/firestore";
import { Message } from '../../../../assets/models/message.class';
import { Reaction } from '../../../../assets/models/reactions.class';

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
      const docRef = await addDoc(this.getMessagesRef(), message.toJSON(message));
      const docRefId = docRef.id;
      await updateDoc(doc(this.firestore, 'messages', docRefId), { messageId: docRefId });
  }


  getMessages() {
    onSnapshot(this.getMessagesQ(), (queryCollection) => {
      this.messages = [];
      queryCollection.forEach(doc => {
        let message = new Message({ ...doc.data() })
        this.createReactionArray(message);
        this.messages.push(message);
        console.log(this.messages);
      });
    })
  }

  createReactionArray(message: Message){
    if (message.reactions) {
      for (let i = 0; i < message.reactions.length; i++) {
        message.reactions[i] = new Reaction(message.reactions[i])
      }
    }
  }

  async reactOnMessage(messageId: string , emote: string, user: string){
    const messageRef = doc(this.firestore, 'messages', messageId);
    const docSnap = await getDoc(messageRef);
    
    if (docSnap.exists()) {
      let reactions = docSnap.data()['reactions'] || [];
      let reactedEmote = this.removeAllUserReactions(reactions, user);
      const reactionIndex = this.getReactionIndex(reactions, emote)
      this.checkIfReactionExists(reactionIndex, reactions, user, emote, reactedEmote);
      await updateDoc(messageRef, { reactions: reactions });
    } else {
      console.log("Dokument existiert nicht!");
    }
  }


  removeAllUserReactions(reactions: Reaction[], user: string) {
    let reactedEmote = '';
    reactions.forEach((reaction, index) => {
      const userIndex = reaction.users.indexOf(user);
      if (userIndex > -1) {
        reactedEmote = reaction.emote
        reaction.users.splice(userIndex, 1);
        reaction.count--;
        this.deleteReactionAtZero(reactions, reaction, index);
      }
    });
    return reactedEmote;
  }


  checkIfReactionExists(reactionIndex: number, reactions: Reaction[], user: string, emote: string, reactedEmote:string){
    if (reactionIndex > -1) {
      let reaction = reactions[reactionIndex];
      this.checkIfUserReacted(reactions, reaction, user, emote, reactedEmote);
    } else {
      this.addTheNewReaction(reactions, user, emote);
    }
  }

  addTheNewReaction(reactions: Object[], user: string, emote: string){
    reactions.push({
      users: [user],
      emote: emote,
      count: 1
    });
  }

  checkIfUserReacted(reactions: Reaction[], reaction: Reaction, user: string, emote: string, reactedEmote: string){
    debugger
    if (this.userReactedWithEmote(reaction, user, emote, reactedEmote)) {
      // Benutzer hat noch nicht reagiert, füge ihn hinzu
      reaction.users.push(user);
      reaction.count ++;
    }
  }

  deleteReactionAtZero(reactions: Reaction[], reaction: Reaction, reactionIndex: number){
    if (reaction.count === 0){
      reactions.splice(reactionIndex, 1);
    }
  }


  userReactedWithEmote(reaction: Reaction, user: string, emote: string, reactedEmote: string){
    let addedEmote = emote;
    return !reaction.users.includes(user) && reactedEmote != addedEmote;
  }


  getReactionIndex(reactions: Reaction[], emote: string){
    let reactionIndex = reactions.findIndex((r: Reaction) => r.emote === emote);
    return reactionIndex
  }

  getMessagesQ(){
    return query(this.getMessagesRef(), orderBy('time', 'asc'));
  }

  getMessagesRef() {
    return collection(this.firestore, 'messages')
  }
}
