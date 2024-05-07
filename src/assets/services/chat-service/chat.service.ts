import { Injectable, OnDestroy, inject } from '@angular/core';
import { Firestore, deleteDoc, getDoc, orderBy, query, updateDoc } from '@angular/fire/firestore';
import { getFirestore, getDocs, DocumentReference, collection, addDoc, doc, onSnapshot, Unsubscribe, DocumentData, QuerySnapshot } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { Message } from '../../models/message.class';
import { Reaction } from '../../models/reactions.class';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProfileAuthentication } from '../profileAuth.service';
import { User } from '../../models/user.class';
import { Channel } from '../../models/channel.class';
import { Editor } from 'tinymce';


@Injectable({
  providedIn: 'root'
})
export class ChatService implements OnDestroy {
  private firestore: Firestore = inject(Firestore);
  emoticons = ['👍', '👎', '😂', '😅', '🚀', '💯', '🥳', '🤯', '🤷‍♂️', '🤷', '👏', '🤩']
  showReply: boolean = false;
  messageIdReply = '';
  messages: any[] = [];
  replies: Message[] = [];
  currentChannel$: BehaviorSubject<string> = new BehaviorSubject<string>('pSBwciqiaOgtUayZaIgj');
  messageCount = new BehaviorSubject<number>(0); // initialer Wert
  messageCount$ = this.messageCount.asObservable(); // Veröffentlichtes Observable
  dmPartnerID = new BehaviorSubject<string>('');
  dmPartnerID$ = this.dmPartnerID.asObservable();
  isDmRoom = new BehaviorSubject<boolean>(false);
  isDmRoom$ = this.isDmRoom.asObservable();
  allChannels: Channel[] = [];
  newMessage = new BehaviorSubject<boolean>(false);
  newMessage$ = this.newMessage.asObservable();

  replyCount = new BehaviorSubject<number>(0); // initialer Wert
  replyCount$ = this.replyCount.asObservable(); // Veröffentlichtes Observable
  currentUser!: User;
  userInitialized = new BehaviorSubject<boolean>(false);

  users: User[] = [];

  editorMessage!: Editor;
  editorReply!: Editor;

  isChannel = true;

  initialMessageForThread!: Message;

  searchInput: string = '';


  selectedUsers!: User[];
  selectedChannels!: Channel[];

  unsubscribe!: Unsubscribe;
  unsubreplies!: Unsubscribe;
  // unsubDirectMessages!: Unsubscribe;
  // unsubReplies!: Unsubscribe;

  constructor(private profileAuth: ProfileAuthentication) {
    this.initializeUserAndMessages();
    this.safeUsers();
  }
  ngOnDestroy(): void {
    this.unsubreplies();
    this.unsubscribe();
  }


  safeUsers() {

  }

  openNewMessage(){
    
  }


  initializeUserAndMessages() {
    this.profileAuth.user$.subscribe(user => {
      if (user) {
        this.currentUser = new User(user);
        this.userInitialized.next(true);
        this.updateMessages();
        console.log('mein user im cs:', user);
        
      }
    });

    this.currentChannel$.subscribe(channel => {
      this.updateMessages();
    });
  }


  getUserAvatar(sendId: string){
    const user = this.users.find(user => user.userId === sendId);
    return user ? user.avatar : 'assets/img/avatar_clean1.png';
  }


  setCurrenDmPartner(value: string) {
    this.dmPartnerID.next(value);
  }


  setIsDmRoom(value: boolean) {
    this.isDmRoom.next(value);
  }

  setIsNewMessage(value: boolean) {
    this.newMessage.next(value)
  }


  async addMessage(message: Message, channel: string) {
    
    if(channel.length <= 27){
      const docRef = await addDoc(this.getChannelMessagesRef(channel), message.toJSON(message));
      const docRefId = docRef.id;
      await updateDoc(doc(this.firestore, `channel/${channel}/messages`, docRefId), { messageId: docRefId });
    }else{
      const docRef = await addDoc(this.getDirectMessagesRef(channel), message.toJSON(message));
      const docRefId = docRef.id;
      await updateDoc(doc(this.firestore, `directMessages/${channel}/messages`, docRefId), { messageId: docRefId });
    }
  }

  async getRepliesLength(){
    
    await getDoc(doc(this.firestore, `channel/${this.currentChannel$.value}/messages/${this.messageIdReply}/replies`))
  }

  // updateMessages() {
  //   const ref = this.currentChannel$.value.length <= 25 ? this.getChannelMessagesQ() : this.getDirectMessagesQ();
  //   if (!this.currentChannel$.value && !this.users) {
  //     console.error("currentChannel$ ist undefined.");
  //     return; // Abbruch, wenn kein gültiger Kanal gesetzt ist.
  //   }
  //   if (this.unsubscribe) {
  //     this.unsubscribe();
  //   }
  //   console.log('users in the chat service:', this.users);
  //   this.unsubscribe = onSnapshot(ref, (snapshot) => {
  //     this.messages = snapshot.docs.map(doc => doc.data() as Message);
  //     console.log(this.currentChannel$.value);
  //     console.log(this.messages);
  //     this.messageCount.next(this.messages.length);
  //   },);
  // }


  updateMessages() {
    
    const ref = this.currentChannel$.value.length <= 25 ? this.getChannelMessagesQ() : this.getDirectMessagesQ(this.currentChannel$.value); 
    if (!this.currentChannel$.value || !this.users) {
      console.error("currentChannel$ ist undefined.");
      return; // Abbruch, wenn kein gültiger Kanal gesetzt ist.
    }

    if (this.unsubscribe) {
      this.unsubscribe();
    }
    if(this.currentChannel$.value === 'writeANewMessage'){
      this.messages = [];
      if (this.unsubscribe) {
        this.unsubscribe();
      }
      return;
    }
    this.unsubscribe = onSnapshot(ref, async (snapshot) => {
      const messagesWithReplies = await Promise.all(snapshot.docs.map(async (doc) => {
        const messageData = new Message(doc.data() as Message);
        const repliesRef = collection(doc.ref, 'replies'); // Verwende die collection Methode von Firestore direkt
        const repliesSnapshot = await getDocs(repliesRef);
        const replies = repliesSnapshot.docs.map(replyDoc => replyDoc.data());
        return { ...messageData, replies };  // Fügt die Replies zur Message hinzu
      }));
      this.messages = messagesWithReplies ;
      this.messageCount.next(this.messages.length);
    });
  }

  getFilteredMessages(): Message[] {
    
    if (!this.searchInput) return this.messages;
    return this.messages.filter(message =>
      message.content.toLowerCase().includes(this.searchInput.toLowerCase())
    );
  }

  // getList(): Message[] {
  //   this.messages = this.chatService.messages;
  //   return this.chatService.messages;
  // }


  getReplies() {
    
    this.unsubreplies = onSnapshot(this.getRepliesQ(), (list) => {
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
    await updateDoc(doc(this.firestore, `channel/${this.currentChannel$.value}/messages`, messageId), { content: input });
  }


  async addReply(message: Message) {
    const docRef = await addDoc(this.getReplyRef(), message.toJSON(message));
    const docRefId = docRef.id;
    await updateDoc(doc(this.firestore, `channel/${this.currentChannel$.value}/messages/${this.messageIdReply}/replies`, docRefId), { messageId: docRefId });
  }


  async uploadFile(file: File) {
    
    const storage = getStorage();
    const storageRef = ref(storage, `uploads/${new Date().getTime()}_${file.name}`);
    try {
      const uploadFile = await uploadBytes(storageRef, file);
      const downloadURL: string = await getDownloadURL(uploadFile.ref);
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
    
    let path;
    if (reply) {
      path = `channel/${this.currentChannel$.value}/messages/${this.messageIdReply}/replies`
    } else {
      path = `channel/${this.currentChannel$.value}/messages`
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
      // console.log("Dokument existiert nicht!");
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

  getUserName(sendId: string): string {
    const user = this.users.find(user => user.userId === sendId);
    return user ? user.name : 'Noah Braun'; 
  }

  getChannelName(){
    const channel = this.allChannels.find(channel => channel.channelId === this.currentChannel$.value);
    return channel ? channel.name : 'abc'; 
  }


  getReactionIndex(reactions: Reaction[], emote: string) {
    let reactionIndex = reactions.findIndex((r: Reaction) => r.emote === emote);
    return reactionIndex
  }


  getChannelMessagesQ() {
    return query(this.getChannelMessagesRef(this.currentChannel$.value), orderBy('time', 'asc'));
  }

  getChannelMessagesRef(channel: string) {
    return collection(this.firestore, `channel/${channel}/messages`)
  }


  getDirectMessagesQ(channel: string) {
    return query(this.getDirectMessagesRef(channel), orderBy('time', 'asc'));
  }

  getDirectMessagesRef(channel: string) {
    return collection(this.firestore, `directMessages/${channel}/messages`)
  }


  getRepliesQ() {
    return query(this.getReplyRef(), orderBy('time', 'asc'));
  }

  getReplyRef() {
    return collection(this.firestore, `channel/${this.currentChannel$.value}/messages/${this.messageIdReply}/replies`)
  }

  setEditorFocusMessage(){
    this.editorMessage.focus()
  }

  setEditorFocusReply(){
    this.editorReply.focus()
  }
}
