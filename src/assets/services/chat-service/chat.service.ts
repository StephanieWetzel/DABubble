import { Injectable, inject } from '@angular/core';
import { Firestore, deleteDoc, getDoc, orderBy, query, updateDoc } from '@angular/fire/firestore';
import { getFirestore, collection, addDoc, doc, onSnapshot, Unsubscribe, DocumentData, QuerySnapshot } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { Message } from '../../models/message.class';
import { Reaction } from '../../models/reactions.class';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProfileAuthentication } from '../profileAuth.service';
import { User } from '../../models/user.class';


@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private firestore: Firestore = inject(Firestore);
  emoticons = ['👍', '👎', '😂', '😅', '🚀', '💯', '🥳', '🤯', '🤷‍♂️', '🤷', '👏', '🤩']
  showReply: boolean = false;
  messageIdReply = '';
  messages: Message[] = [];
  replies: Message[] = [];
  currentChannel = '5fHcCmtyJtEnYzrdngTd';
  messageCount = new BehaviorSubject<number>(0); // initialer Wert
  messageCount$ = this.messageCount.asObservable(); // Veröffentlichtes Observable
  dmPartnerID = new BehaviorSubject<string>('');
  dmPartnerID$ = this.dmPartnerID.asObservable();
  isDmRoom = new BehaviorSubject<boolean>(false);
  isDmRoom$ = this.isDmRoom.asObservable();

  replyCount = new BehaviorSubject<number>(0); // initialer Wert
  replyCount$ = this.replyCount.asObservable(); // Veröffentlichtes Observable
  currentUser!: User;
  userInitialized = new BehaviorSubject<boolean>(false);

  isChannel = true;



  // unsubChannels!: Unsubscribe;
  // unsubDirectMessages!: Unsubscribe;
  // unsubReplies!: Unsubscribe;

  constructor(private profileAuth: ProfileAuthentication) {
    this.initializeUserAndMessages();
    this.safeUsers();
  }

  safeUsers() {

  }


  initializeUserAndMessages() {
    this.profileAuth.user$.subscribe(user => {
      if (user) {
        this.currentUser = new User(user);
        this.userInitialized.next(true);
        this.getChannelMessages();
      }
    });
  }

  setCurrenDmPartner(value: string) {
    this.dmPartnerID.next(value);
  }

  setIsDmRoom(value: boolean) {
    this.isDmRoom.next(value);
  }

  async addMessage(message: Message) {
    if(this.isChannel){
      const docRef = await addDoc(this.getChannelMessagesRef(), message.toJSON(message));
      const docRefId = docRef.id;
      await updateDoc(doc(this.firestore, `channel/${this.currentChannel}/messages`, docRefId), { messageId: docRefId });
    }else{
      const docRef = await addDoc(this.getDirectMessagesRef(), message.toJSON(message));
      const docRefId = docRef.id;
      await updateDoc(doc(this.firestore, `directMessages/${this.currentChannel}/messages`, docRefId), { messageId: docRefId });
    }
  }


  getChannelMessages() {
    let ref;
    if (this.isChannel) {
      ref = this.getChannelMessagesQ();
    } else {
      ref = this.getDirectMessagesQ();
    }
    onSnapshot(ref, (list) => {
      this.messages = [];
      this.messages = this.loadMessages(list);
      console.log(this.currentChannel);
      console.log(this.messages);
      this.messageCount.next(this.messages.length);
    })
  }


  getReplies() {
    onSnapshot(this.getRepliesQ(), (list) => {
      this.replies = [];
      this.replies = this.loadMessages(list);
      this.replyCount.next(this.replies.length)
    })
  }

  loadMessages(list: QuerySnapshot<DocumentData>) {
    let temporaryMessages: Message[] = [];
    list.forEach(doc => {
      let message = new Message({ ...doc.data() })
      this.createReactionArray(message);
      temporaryMessages.push(message);
    });
    return temporaryMessages
  }

  async editMessage(messageId: string, input: string) {
    console.log(input);
    await updateDoc(doc(this.firestore, `channel/${this.currentChannel}/messages`, messageId), { content: input });
  }


  async addReply(message: Message) {
    const docRef = await addDoc(this.getReplyRef(), message.toJSON(message));
    const docRefId = docRef.id;
    await updateDoc(doc(this.firestore, `channel/${this.currentChannel}/messages/${this.messageIdReply}/replies`, docRefId), { messageId: docRefId });
  }


  async uploadFile(file: File) {
    const storage = getStorage();
    const storageRef = ref(storage, `uploads/${new Date().getTime()}_${file.name}`);
    try {
      const uploadFile = await uploadBytes(storageRef, file);
      const downloadURL: string = await getDownloadURL(uploadFile.ref);
      console.log('File uploaded and available at', downloadURL);
      return downloadURL;
    } catch (error) {
      console.error("Upload failed", error);
      throw new Error("Upload failed");
    }
  }


  createReactionArray(message: Message) {
    if (message.reactions) {
      for (let i = 0; i < message.reactions.length; i++) {
        message.reactions[i] = new Reaction(message.reactions[i])
      }
    }
  }


  async reactOnMessage(messageId: string, emote: string, user: string, reply: boolean) {
    debugger
    let path;
    if (reply) {
      path = `channel/${this.currentChannel}/messages/${this.messageIdReply}/replies`
    } else {
      path = `channel/${this.currentChannel}/messages`
    }
    const messageRef = doc(this.firestore, path, messageId);
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


  checkIfReactionExists(reactionIndex: number, reactions: Reaction[], user: string, emote: string, reactedEmote: string) {
    let addedEmote = emote;
    if (reactionIndex > -1) {
      let reaction = reactions[reactionIndex];
      this.checkIfUserReacted(reactions, reaction, user, emote, reactedEmote);
    }
    if (reactionIndex === -1 && reactedEmote != addedEmote) {
      this.addTheNewReaction(reactions, user, emote);
    }
  }


  addTheNewReaction(reactions: Object[], user: string, emote: string) {
    reactions.push({
      users: [user],
      emote: emote,
      count: 1
    });
  }


  checkIfUserReacted(reactions: Reaction[], reaction: Reaction, user: string, emote: string, reactedEmote: string) {
    if (this.userReactedWithEmote(reaction, user, emote, reactedEmote)) {
      // Benutzer hat noch nicht reagiert, füge ihn hinzu
      reaction.users.push(user);
      reaction.count++;
    }
  }


  deleteReactionAtZero(reactions: Reaction[], reaction: Reaction, reactionIndex: number) {
    if (reaction.count === 0) {
      reactions.splice(reactionIndex, 1);
    }
  }


  userReactedWithEmote(reaction: Reaction, user: string, emote: string, reactedEmote: string) {
    let addedEmote = emote;
    return !reaction.users.includes(user) && reactedEmote != addedEmote;
  }


  getReactionIndex(reactions: Reaction[], emote: string) {
    let reactionIndex = reactions.findIndex((r: Reaction) => r.emote === emote);
    return reactionIndex
  }


  getChannelMessagesQ() {
    return query(this.getChannelMessagesRef(), orderBy('time', 'asc'));
  }

  getChannelMessagesRef() {
    return collection(this.firestore, `channel/${this.currentChannel}/messages`)
  }


  getDirectMessagesQ() {
    return query(this.getDirectMessagesRef(), orderBy('time', 'asc'));
  }

  getDirectMessagesRef() {
    return collection(this.firestore, `directMessages/${this.currentChannel}/messages`)
  }


  getRepliesQ() {
    return query(this.getReplyRef(), orderBy('time', 'asc'));
  }

  getReplyRef() {
    return collection(this.firestore, `channel/${this.currentChannel}/messages/${this.messageIdReply}/replies`)
  }
}
