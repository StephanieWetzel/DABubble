import { Injectable, OnDestroy, inject } from '@angular/core';
import { Firestore, deleteDoc, getDoc, orderBy, query, updateDoc, where } from '@angular/fire/firestore';
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
  scrollToBottom$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  replyCount = new BehaviorSubject<number>(0); // initialer Wert
  replyCount$ = this.replyCount.asObservable(); // Veröffentlichtes Observable
  currentUser!: User;
  userInitialized = new BehaviorSubject<boolean>(false);
  messageIdSource = new BehaviorSubject<string | null>(null);
  channelIdSource = new BehaviorSubject<string | null>(null);

  messageId$ = this.messageIdSource.asObservable();
  channelId$ = this.channelIdSource.asObservable();

  isLoadingMessages = new BehaviorSubject<boolean>(false);
  isLoadingMessages$ = this.isLoadingMessages.asObservable();

  users: User[] = [];
  isFirstLoad = true;
  editorMessage!: Editor;
  editorReply!: Editor;

  isChannel = true;

  initialMessageForThread!: Message;

  searchInput: string = '';
  searchResults: any[] = [];


  selectedUsers!: User[];
  selectedChannels!: Channel[];

  unsubscribe!: Unsubscribe;
  unsubreplies!: Unsubscribe;
  noMessages: boolean = false;
  // unsubDirectMessages!: Unsubscribe;
  // unsubReplies!: Unsubscribe;

  constructor(private profileAuth: ProfileAuthentication) {
    const activeChannel = this.getActiveChannel();
    if (activeChannel) {
      this.currentChannel$.next(activeChannel);
    }
    this.initializeUserAndMessages();
  }


  /** Clean up subscriptions on component destroy */
  ngOnDestroy(): void {
    this.unsubreplies();
    this.unsubscribe();
  }

  /** Initialize user and message subscriptions */
  initializeUserAndMessages() {
    this.profileAuth.user$.subscribe(user => {
      if (user) {
        this.currentUser = new User(user);
        this.userInitialized.next(true);
        this.updateMessages();
      }
    });

    this.currentChannel$.subscribe(channel => {
      this.updateMessages();
    });
  }

  highlightMessage(messageId: string, channelId: string) {
    this.channelIdSource.next(channelId);
    this.messageIdSource.next(messageId);
  }

  async getNameChannel(channelId: string): Promise<string> {
    const channelDoc = await getDoc(doc(this.firestore, `channel/${channelId}`));
    return channelDoc.exists() ? channelDoc.data()['name'] : 'Unknown Channel';
  }

  async getNameUser(userId: string): Promise<string> {
    const userDoc = await getDoc(doc(this.firestore, `user/${userId}`));
    return userDoc.exists() ? userDoc.data()['name'] : 'Unknown User';
  }

  async search(searchInput: string) {
    this.searchResults = [];
    if (!searchInput) return;
    const channelsSnapshot = await getDocs(collection(this.firestore, 'channel'));
    for (const channelDoc of channelsSnapshot.docs) {
      const channelId = channelDoc.id;
      const messagesSnapshot = await getDocs(collection(this.firestore, `channel/${channelId}/messages`));
      for (const messageDoc of messagesSnapshot.docs) {
        const messageData = messageDoc.data();
        if (messageData['content'].toLowerCase().includes(searchInput.toLowerCase())) {
          const channelName = await this.getNameChannel(channelId);
          const userName = await this.getNameUser(messageData['sendId']);
          this.searchResults.push({ data: messageData, channelId, channelName, userName });
        };
      };
    };
  }

  /**
   * Get the avatar of a user by their ID
   * @param {string} sendId - The ID of the user
   * @returns {string} - The avatar URL or default avatar
   */
  getUserAvatar(sendId: string) {
    const user = this.users.find(user => user.userId === sendId);
    return user ? user.avatar : 'assets/img/avatar_clean1.png';
  }

  /**
   * Set the current direct message partner
   * @param {string} value - The ID of the direct message partner
   */
  setCurrenDmPartner(value: string) {
    this.dmPartnerID.next(value);
  }

  /**
   * Set the direct message room status
   * @param {boolean} value - The direct message room status
   */
  setIsDmRoom(value: boolean) {
    this.isDmRoom.next(value);
  }


  /**
   * Set the status of a new message
   * @param {boolean} value - The new message status
   */
  setIsNewMessage(value: boolean) {
    this.newMessage.next(value)
  }

  /** Get the length of the replies for the current message */
  async getRepliesLength() {
    await getDoc(doc(this.firestore, `channel/${this.currentChannel$.value}/messages/${this.messageIdReply}/replies`))
  }

  async addMessage(message: Message, channel: string) {
    let docRef;
    if (channel.length <= 27) {
      docRef = await addDoc(this.getChannelMessagesRef(channel), message.toJSON(message));
    } else {
      docRef = await addDoc(this.getDirectMessagesRef(channel), message.toJSON(message));
    }
    const docRefId = docRef.id;
    await updateDoc(docRef, { messageId: docRefId });
    this.scrollToBottom$.next(true);
  }

  /**
   * Update the messages array with new messages and remove duplicates
   * @param {Message[]} newMessages - The new messages to add
   */
  private updateMessagesArray(newMessages: Message[]) {
    const newMessagesMap = new Map(newMessages.map(msg => [msg.messageId, msg]));
    const updatedMessages: Message[] = [];

    this.messages.forEach(currentMessage => {
      if (!currentMessage.messageId) return;  // Skip messages without a valid messageId
      const newMessage = newMessagesMap.get(currentMessage.messageId);
      if (newMessage) {
        updatedMessages.push(newMessage);
        newMessagesMap.delete(currentMessage.messageId); // Ensure we don't add the same message twice
      } else {
        updatedMessages.push(currentMessage);
      }
    });

    newMessagesMap.forEach(newMessage => {
      updatedMessages.push(newMessage);
    });

    updatedMessages.sort((a, b) => a.time - b.time);
    this.messages = this.removeDuplicates(updatedMessages);
  }

  async updateMessages() {
    const ref = this.currentChannel$.value.length <= 25 ? this.getChannelMessagesQ() : this.getDirectMessagesQ(this.currentChannel$.value);
    if (!this.currentChannel$.value || !this.users) {
      console.error("currentChannel$ ist undefined.");
      return;
    }
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    if (this.currentChannel$.value === 'writeANewMessage') {
      this.messages = [];
      this.isLoadingMessages.next(false); // Nachrichten sind geladen, auch wenn keine Nachrichten vorhanden sind
      return;
    }
    if (this.isFirstLoad) {
      this.isLoadingMessages.next(true); // Nachrichten werden geladen
    }

    this.unsubscribe = onSnapshot(ref, async (snapshot) => {
      const messagesWithReplies = await Promise.all(snapshot.docs.map(async (doc) => {
        const messageData = new Message(doc.data());
        const repliesRef = collection(doc.ref, 'replies');
        const repliesSnapshot = await getDocs(repliesRef);
        const replies = repliesSnapshot.docs.map(replyDoc => new Message(replyDoc.data()));
        messageData.replies = replies;
        return messageData;
      }));

      this.updateMessagesArray(messagesWithReplies);
      this.messageCount.next(this.messages.length);

      if (this.isFirstLoad) {
        this.scrollToBottom$.next(true);
        this.isFirstLoad = false;
      }

      setTimeout(() => {
        this.isLoadingMessages.next(false);
      }, 200);

      this.noMessages = this.messages.length === 0;
    });
  }

  private removeDuplicates(messages: Message[]): Message[] {
    const uniqueMessagesMap = new Map<number, Message>();

    messages.forEach(message => {
      if (!uniqueMessagesMap.has(message.time)) {
        uniqueMessagesMap.set(message.time, message);
      }
    });

    return Array.from(uniqueMessagesMap.values());
  }

  /** Get the list of replies for the current message */
  getReplies() {
    this.unsubreplies = onSnapshot(this.getRepliesQ(), (list) => {
      this.replies = [];
      this.replies = this.loadMessages(list);
      this.replyCount.next(this.replies.length)
    })
  }

  /**
   * Retrieves the currently active channel ID from local storage.
   * @returns {string} The ID of the currently active channel.
   */
  getActiveChannel() {
    return localStorage.getItem('selectedChannelId');
  }


  /**
   * Load messages from a query snapshot
   * @param {QuerySnapshot<DocumentData>} list - The query snapshot of messages
   * @returns {Message[]} - The loaded messages
   */
  loadMessages(list: QuerySnapshot<DocumentData>) {
    let temporaryMessages: Message[] = [];
    list.forEach(doc => {
      let message = new Message({ ...doc.data() })
      this.createReactionArray(message);
      temporaryMessages.push(message);
    });
    return temporaryMessages
  }


  /**
   * Edit the content of a message
   * @param {string} messageId - The ID of the message
   * @param {string} input - The new content of the message
   */
  async editMessage(messageId: string, input: string) {
    await updateDoc(doc(this.firestore, `channel/${this.currentChannel$.value}/messages`, messageId), { content: input });
  }


  /**
  * Add a reply to a message
  * @param {Message} message - The reply message object
  */
  async addReply(message: Message) {
    const docRef = await addDoc(this.getReplyRef(), message.toJSON(message));
    const docRefId = docRef.id;
    await updateDoc(doc(this.firestore, `channel/${this.currentChannel$.value}/messages/${this.messageIdReply}/replies`, docRefId), { messageId: docRefId });
  }


  /**
  * Upload a file to Firebase storage
  * @param {File} file - The file to be uploaded
  * @returns {Promise<string>} - The download URL of the uploaded file
  * @throws Will throw an error if the upload fails
  */
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


  /**
   * Create reaction objects from raw data
   * @param {Message} message - The message object to update
   */
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
      path = `channel/${this.currentChannel$.value}/messages/${this.messageIdReply}/replies`;
    } else {
      path = `channel/${this.currentChannel$.value}/messages`;
    }
    const messageRef = doc(this.firestore, path, messageId);
    const docSnap = await getDoc(messageRef);

    if (docSnap.exists()) {
      let reactions = docSnap.data()['reactions'] || [];
      const reactionIndex = this.getReactionIndex(reactions, emote);
      this.checkIfReactionExists(reactionIndex, reactions, user, emote);
      await updateDoc(messageRef, { reactions: reactions });
    } else {
      console.log("Dokument existiert nicht!");
    }
  }

  /**
 * Check if a reaction exists and handle it
 * @param {number} reactionIndex - The index of the reaction
 * @param {Reaction[]} reactions - The list of reactions
 * @param {string} user - The user reacting
 * @param {string} emote - The emoticon being added
 */
  checkIfReactionExists(reactionIndex: number, reactions: Reaction[], user: string, emote: string) {
    if (reactionIndex > -1) {
      let reaction = reactions[reactionIndex];
      const userIndex = reaction.users.indexOf(user);
      if (userIndex > -1) {
        // Remove the user's reaction
        reaction.users.splice(userIndex, 1);
        reaction.count--;
        this.deleteReactionAtZero(reactions, reaction, reactionIndex);
      } else {
        // Add the user's reaction
        reaction.users.push(user);
        reaction.count++;
      }
    } else {
      this.addTheNewReaction(reactions, user, emote);
    }
  }


  // /**
  //  * React to a message with an emoticon
  //  * @param {string} messageId - The ID of the message
  //  * @param {string} emote - The emoticon to react with
  //  * @param {string} user - The user reacting
  //  * @param {boolean} reply - Whether the reaction is to a reply
  //  */
  // async reactOnMessage(messageId: string, emote: string, user: string, reply: boolean) {
  //   let path;
  //   if (reply) {
  //     path = `channel/${this.currentChannel$.value}/messages/${this.messageIdReply}/replies`
  //   } else {
  //     path = `channel/${this.currentChannel$.value}/messages`
  //   }
  //   const messageRef = doc(this.firestore, path, messageId);
  //   const docSnap = await getDoc(messageRef);

  //   if (docSnap.exists()) {
  //     let reactions = docSnap.data()['reactions'] || [];
  //     let reactedEmote = this.removeAllUserReactions(reactions, user);
  //     const reactionIndex = this.getReactionIndex(reactions, emote)
  //     this.checkIfReactionExists(reactionIndex, reactions, user, emote, reactedEmote);
  //     await updateDoc(messageRef, { reactions: reactions });
  //   } else {
  //     console.log("Dokument existiert nicht!");
  //   }
  // }


  // /**
  //  * Remove all reactions by a user
  //  * @param {Reaction[]} reactions - The list of reactions
  //  * @param {string} user - The user removing reactions
  //  * @returns {string} - The emoticon that was removed
  //  */
  // removeAllUserReactions(reactions: Reaction[], user: string) {
  //   let reactedEmote = '';
  //   reactions.forEach((reaction, index) => {
  //     const userIndex = reaction.users.indexOf(user);
  //     if (userIndex > -1) {
  //       reactedEmote = reaction.emote
  //       reaction.users.splice(userIndex, 1);
  //       reaction.count--;
  //       this.deleteReactionAtZero(reactions, reaction, index);
  //     }
  //   });
  //   return reactedEmote;
  // }


  // /**
  //  * Check if a reaction exists and handle it
  //  * @param {number} reactionIndex - The index of the reaction
  //  * @param {Reaction[]} reactions - The list of reactions
  //  * @param {string} user - The user reacting
  //  * @param {string} emote - The emoticon being added
  //  * @param {string} reactedEmote - The emoticon that was reacted with
  //  */
  // checkIfReactionExists(reactionIndex: number, reactions: Reaction[], user: string, emote: string, reactedEmote: string) {
  //   let addedEmote = emote;
  //   if (reactionIndex > -1) {
  //     let reaction = reactions[reactionIndex];
  //     this.checkIfUserReacted(reactions, reaction, user, emote, reactedEmote);
  //   }
  //   if (reactionIndex === -1 && reactedEmote != addedEmote) {
  //     this.addTheNewReaction(reactions, user, emote);
  //   }
  // }


  /**
   * Add a new reaction to the list
   * @param {Object[]} reactions - The list of reactions
   * @param {string} user - The user reacting
   * @param {string} emote - The emoticon being added
   */
  addTheNewReaction(reactions: Object[], user: string, emote: string) {
    reactions.push({
      users: [user],
      emote: emote,
      count: 1
    });
  }


  /**
   * Check if a user has reacted with a specific emoticon
   * @param {Reaction[]} reactions - The list of reactions
   * @param {Reaction} reaction - The reaction object
   * @param {string} user - The user reacting
   * @param {string} emote - The emoticon being added
   * @param {string} reactedEmote - The emoticon that was reacted with
   */
  checkIfUserReacted(reactions: Reaction[], reaction: Reaction, user: string, emote: string, reactedEmote: string) {
    if (this.userReactedWithEmote(reaction, user, emote, reactedEmote)) {
      // Benutzer hat noch nicht reagiert, füge ihn hinzu
      reaction.users.push(user);
      reaction.count++;
    }
  }


  /**
   * Delete a reaction if the count is zero
   * @param {Reaction[]} reactions - The list of reactions
   * @param {Reaction} reaction - The reaction object
   * @param {number} reactionIndex - The index of the reaction
   */
  deleteReactionAtZero(reactions: Reaction[], reaction: Reaction, reactionIndex: number) {
    if (reaction.count === 0) {
      reactions.splice(reactionIndex, 1);
    }
  }


  /**
   * Check if a user has reacted with a specific emoticon
   * @param {Reaction} reaction - The reaction object
   * @param {string} user - The user reacting
   * @param {string} emote - The emoticon being added
   * @param {string} reactedEmote - The emoticon that was reacted with
   * @returns {boolean} - Whether the user has reacted with the emoticon
   */
  userReactedWithEmote(reaction: Reaction, user: string, emote: string, reactedEmote: string): boolean {
    let addedEmote = emote;
    return !reaction.users.includes(user) && reactedEmote != addedEmote;
  }


  /**
   * Retrieves the name of the user based on the provided user ID.
   * @param {string} sendId - The ID of the user whose name is to be retrieved.
   * @returns {string} - The name of the user or a default name if not found.
   */
  getUserName(sendId: string): string {
    const user = this.users.find(user => user.userId === sendId);
    return user ? user.name : 'Noah Braun';
  }


  /**
  * Retrieves the name of the current channel.
  * @returns {string} - The name of the current channel or a default name if not found.
  */
  getChannelName() {
    const channel = this.allChannels.find(channel => channel.channelId === this.currentChannel$.value);
    return channel ? channel.name : 'abc';
  }


  /**
  * Finds the index of a reaction based on the provided emote.
  * @param {Reaction[]} reactions - The array of reactions.
  * @param {string} emote - The emote to find in the reactions array.
  * @returns {number} - The index of the reaction or -1 if not found.
  */
  getReactionIndex(reactions: Reaction[], emote: string) {
    let reactionIndex = reactions.findIndex((r: Reaction) => r.emote === emote);
    return reactionIndex
  }


  /**
  * Constructs a Firestore query for channel messages ordered by time.
  * @returns {Query} - The Firestore query for channel messages.
  */
  getChannelMessagesQ() {
    return query(this.getChannelMessagesRef(this.currentChannel$.value), orderBy('time', 'asc'));
  }


  /**
  * Gets a Firestore reference to the messages of a specific channel.
  * @param {string} channel - The ID of the channel.
  * @returns {CollectionReference} - The Firestore collection reference.
  */
  getChannelMessagesRef(channel: string) {
    return collection(this.firestore, `channel/${channel}/messages`)
  }


  /**
  * Constructs a Firestore query for direct messages ordered by time.
  * @param {string} channel - The ID of the direct message channel.
  * @returns {Query} - The Firestore query for direct messages.
  */
  getDirectMessagesQ(channel: string) {
    return query(this.getDirectMessagesRef(channel), orderBy('time', 'asc'));
  }


  /**
  * Gets a Firestore reference to the messages of a specific direct message channel.
  * @param {string} channel - The ID of the direct message channel.
  * @returns {CollectionReference} - The Firestore collection reference.
  */
  getDirectMessagesRef(channel: string) {
    return collection(this.firestore, `directMessages/${channel}/messages`)
  }


  /**
  * Constructs a Firestore query for replies ordered by time.
  * @returns {Query} - The Firestore query for replies.
  */
  getRepliesQ() {
    return query(this.getReplyRef(), orderBy('time', 'asc'));
  }


  /**
  * Gets a Firestore reference to the replies of a specific message.
  * @returns {CollectionReference} - The Firestore collection reference.
  */
  getReplyRef() {
    return collection(this.firestore, `channel/${this.currentChannel$.value}/messages/${this.messageIdReply}/replies`)
  }


  /**
  * Sets focus to the message editor.
  */
  setEditorFocusMessage() {
    this.editorMessage.focus()
  }


  /**
  * Sets focus to the reply editor, if it exists.
  */
  setEditorFocusReply() {
    if (this.editorReply) {
      this.editorReply.focus()
    }
  }
}
