import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  Unsubscribe,
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Channel } from '../models/channel.class';
import { User } from '../models/user.class';
import { AuthenticationService } from './authentication.service';
import { DirectMessage } from '../models/directMessage.class';
import { ChatService } from './chat-service/chat.service';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  firestore: Firestore = inject(Firestore);

  constructor(private auth: AuthenticationService, private chatService: ChatService) { };


  /**
 * Fetches a collection of documents from a Firestore collection.
 * @param {string} colID - The ID of the collection to fetch.
 * @param {string} orderByField - The field by which to order the documents (optional, defaults to empty string).
 * @param {'asc' | 'desc'} orderDirection - The direction of the order ('asc' for ascending, 'desc' for descending, optional, defaults to 'asc').
 * @returns {Observable<any[]>} An observable that emits an array of documents from the specified collection.
 */
  fetchCollection(colID: string, orderByField: string = '', orderDirection: 'asc' | 'desc' = 'asc'): Observable<any[]> {
    let collectionQuery = query(this.getColl(colID));

    if (orderByField) {
      collectionQuery = query(this.getColl(colID), orderBy(orderByField, orderDirection));
    }

    return new Observable((subscriber) => {
      const unsubscribe = onSnapshot(
        collectionQuery,
        (list) => {
          const collectionArray = list.docs.map((doc) => doc.data());
          subscriber.next(collectionArray);
        },
        (error) => subscriber.error(error)
      );
      return () => unsubscribe();
    });
  }


  /**
 * Retrieves a reference to a Firestore collection with the specified ID.
 * @param {string} colId - The ID of the Firestore collection.
 * @returns {CollectionReference} A reference to the Firestore collection.
 */
  getColl(colId: string) {
    let userRef = collection(this.firestore, colId);
    return userRef;
  }


  /**
 * Saves a channel document to the Firestore database.
 * @param {Channel} channel - The channel object to save.
 * @returns {Promise<void>} A promise that resolves when the channel is successfully saved.
 */
  async saveChannel(channel: Channel) {
    await addDoc(this.getColl('channel'), channel.toJSON())
      .catch((err) => {
      })
      .then((dockRef) => {
        this.addIdToChannel(dockRef);
      });
  }


  /**
 * Retrieves the user document with the specified ID from the Firestore database.
 * @param {string} userID - The ID of the user document to retrieve.
 * @returns {Promise<User | null>} A promise that resolves with the user object if found, or null if not found.
 */
  async getCurrentUser(userID: string) {
    const dockRef = doc(this.getColl("user"), userID);
    const docSnap = await getDoc(dockRef);
    if (docSnap.exists()) {
      return docSnap.data() as User;
    } else {
      return null
    }
  }


  /**
 * Retrieves the data of the channel with the specified ID from the Firestore database.
 * @param {string} channelId - The ID of the channel to retrieve data for.
 * @returns {Promise<Channel | null>} A promise that resolves with the channel data if found, or null if not found.
 */
  async getCurrentChannelData(channelId: string): Promise<Channel | null> {
    const dockRef = doc(this.getColl("channel"), channelId);
    try {
      const docSnap = await getDoc(dockRef);
      if (docSnap.exists()) {
        return docSnap.data() as Channel
      } else {
        return null;
      }
    } catch (error) {
      return null
    }
  }


  /**
 * Subscribes to updates for the channel with the specified ID in the Firestore database.
 * @param {string} channelId - The ID of the channel to subscribe to.
 * @param {(channel: Channel | null) => void} callback - The callback function to handle updates to the channel.
 * @returns {() => void} A function to unsubscribe from channel updates.
 */
  subscribeToChannel(channelId: string, callback: (channel: Channel | null) => void): () => void {
    const dockRef = doc(this.getColl("channel"), channelId);
    const unsubscribe = onSnapshot(dockRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data() as Channel);
      } else {
        callback(null);
      }
    });
    return unsubscribe
  }


  /**
   * Retrieves the members of the specified channel from the Firestore database.
   * @param {Channel | null} channel - The channel object containing member IDs.
   * @returns {Promise<User[]>} A promise that resolves with an array of user objects representing the members of the channel.
   */
  async getChannelMember(channel: Channel | null): Promise<User[]> {
    if (!channel || !channel.member) {
      return []
    }
    const membersData: User[] = [];
    const memberPromises = channel?.member.map(member => this.getCurrentUser(member.id) || []);
    try {
      const members = await Promise.all(memberPromises!);
      members.forEach(doc => {
        if (doc) {
          membersData.push(doc)
        }
      });
    } catch (error) {
    }
    return membersData
  }


  /**
 * Updates the member list of the specified channel in the Firestore database.
 * @param {string} channelId - The ID of the channel to update.
 * @param {Array<{id: string, name: string}>} membersToAdd - The array of members to add to the channel.
 * @returns {Promise<void>} A promise that resolves when the channel members are successfully updated.
 */
  async updateChannelMembers(channelId: string, membersToAdd: { id: string, name: string }[]) {
    const dockRef = doc(this.getColl("channel"), channelId);
    await updateDoc(dockRef, {
      member: arrayUnion(...membersToAdd)
    })
  }


  /**
 * Adds the ID of the newly created channel document to the channel itself in the Firestore database.
 * @param {any} dockRef - The reference to the newly created channel document.
 */
  addIdToChannel(dockRef: any) {
    const channelRef = doc(this.getColl('channel'), `${dockRef?.id}`);
    updateDoc(channelRef, {
      channelId: dockRef?.id,
    });
  }


  /**
 * Updates information about the specified channel in the Firestore database.
 * @param {string | undefined} channelId - The ID of the channel to update.
 * @param {string | undefined | any} edit - The new value or object to update the channel information with.
 * @param {string} whatToUpdate - The field of the channel information to update.
 * @returns {Promise<void>} A promise that resolves when the channel information is successfully updated.
 */
  async updateChannelInfo(channelId: string | undefined, edit: string | undefined | any, whatToUpdate: string) {
    const dockRef = doc(this.getColl('channel'), channelId)
    await updateDoc(dockRef, {
      [whatToUpdate]: edit
    })
  }


  /**
 * Retrieves the creator of a channel from the Firestore database.
 * @param {string} creatorID - The ID of the channel creator.
 * @returns {Promise<User>} A promise that resolves with the user object representing the channel creator.
 */
  async getCreator(creatorID: string) {
    const dockRef = doc(this.getColl("user"), creatorID);
    const dockSnap = await getDoc(dockRef);
    return dockSnap.data() as User;
  }


  /**
 * Creates a reference to a direct message room in the Firestore database.
 * @param {string} roomId - The ID of the direct message room.
 * @returns {DocumentReference} A reference to the direct message room document.
 */
  createRoomRef(roomId: string) {
    return doc(this.getColl("directMessages"), roomId);
  }


  /**
 * Checks if a direct message room exists in the Firestore database with the specified ID.
 * If the room does not exist, it creates a new room.
 * @param {string} roomId - The ID of the direct message room to check.
 * @param {string} currentUserID - The ID of the current user.
 * @param {string} otherUserID - The ID of the other user in the direct message conversation.
 */
  checkIfRoomExists(roomId: string, currentUserID: string | undefined, otherUserID: string) {
    const roomRef = doc(this.getColl("directMessages"), roomId)
    onSnapshot(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        this.chatService.isChannel = false;
        this.chatService.currentChannel$.next(docSnap.data()['id']);
      } else {
        const transformedRoomData = new DirectMessage(this.transformDmRoom(currentUserID, otherUserID, roomId));
        setDoc(roomRef, transformedRoomData.toJSON());
      }
    })
  }


  /**
   * Checks if a direct message room exists in the Firestore database; if not, it creates a new room.
   * This function first checks for the existence of a document corresponding to `roomId`.
   * If the document does not exist, it creates a new `DirectMessage` instance using the provided user IDs
   * and the room ID, then saves this new room data to Firestore.
   * 
   * @param {string} roomId - The unique identifier for the room.
   * @param {string} currentUserID - The user ID of the current user.
   * @param {string} otherUserID - The user ID of the other user involved in the direct message.
   * @returns {Promise<void>} A promise that resolves when the check is complete and the room is created if necessary.
   */
  async checkAndCreateRoom(roomId: string, currentUserID: string, otherUserID: string): Promise<void> {
    const roomRef = doc(this.firestore, "directMessages", roomId);
    const docSnap = await getDoc(roomRef);
    if (!docSnap.exists()) {
      const transformedRoomData = new DirectMessage(this.transformDmRoom(currentUserID, otherUserID, roomId));
      setDoc(roomRef, transformedRoomData.toJSON());
    }
  }


  /**
 * Retrieves the avatar of the user with the specified ID from the Firestore database.
 * @param {string} userId - The ID of the user whose avatar to retrieve.
 * @returns {Promise<string | null>} A promise that resolves with the URL of the user's avatar, or null if the user or avatar does not exist.
 */
  async getAvatar(userId: string) {
    const dockRef = doc(this.getColl("user"), userId);
    const dockSnap = await getDoc(dockRef);
    if (!dockSnap.exists()) {
      return null
    }
    const user = dockSnap.data() as User;
    if (!user.avatar) {
      return null
    }
    return user.avatar
  }


  /**
 * Transforms data for creating a direct message room in the Firestore database.
 * @param {string} currentUserID - The ID of the current user.
 * @param {string} otherUserID - The ID of the other user in the direct message conversation.
 * @param {string} roomId - The ID of the direct message room.
 * @returns {Object} The transformed data for creating a direct message room.
 */
  transformDmRoom(currentUserID: string | undefined, otherUserID: string, roomId: string) {
    return {
      member: [currentUserID, otherUserID],
      id: roomId,
      messages: []
    }
  }


  /**
   * Checks if a channel name already exists in the Firestore database.
   * This method queries the Firestore for documents in the 'channel' collection
   * that match the specified name, limiting the query to the first match. It returns
   * an observable that emits a boolean value indicating whether the channel name exists.
   * 
   * @param {string} name - The name of the channel to check for existence.
   * @returns {Observable<boolean>} An observable that emits a single boolean value,
   * true if the channel name exists, otherwise false, and then completes.
   */
  checkChannelNameExists(name: string): Observable<boolean> {
    const channelsRef = collection(this.firestore, 'channel');
    const qry = query(channelsRef, where('name', '==', name), limit(1));
    return new Observable<boolean>(subscriber => {
      const unsubscribe: Unsubscribe = onSnapshot(qry, (querySnapshot) => {
        subscriber.next(!querySnapshot.empty);
        subscriber.complete();
        unsubscribe();
      }, (error) => {
        subscriber.error(error);
      });
      return { unsubscribe };
    });
  }


  /**
   * Updates the avatar image of a user in the Firestore database.
   * 
   * @param {string} avatar - The new avatar URL or path to set for the user.
   * @param {string} userId - The unique identifier of the user whose avatar is being updated.
   * @returns {Promise<void>} A promise that resolves when the avatar update is successfully completed.
   */
  async updateAvatar(avatar: string, userId: string) {
    const userRef = doc(this.firestore, "user", userId);
    await updateDoc(userRef, {
      avatar: avatar
    });
  }


  async updateLastReaction(lastReaction1: string, lastReaction2: string, userId: string) {
    const userRef = doc(this.firestore, "user", userId);
    await updateDoc(userRef, {
      lastReaction1: lastReaction1,
      lastReaction2: lastReaction2
    });
  }
}