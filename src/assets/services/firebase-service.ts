import { Injectable, inject } from '@angular/core';
import {
  DocumentSnapshot,
  Firestore,
  Unsubscribe,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
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

  fetchCollection(colID: string, orderByField: string = '', orderDirection: 'asc' | 'desc' = 'asc'): Observable<any[]> {
    let collectionQuery = query(this.getColl(colID));

    // if orderByFIeld is !empty do: 
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


  getColl(colId: string) {
    let userRef = collection(this.firestore, colId);
    return userRef;
  }


  async saveChannel(channel: Channel) {
    await addDoc(this.getColl('channel'), channel.toJSON())
      .catch((err) => {
        console.error(err);
      })
      .then((dockRef) => {
        this.addIdToChannel(dockRef);
      });
  }


  async getCurrentUser(userID: string) {
    const dockRef = doc(this.getColl("user"), userID);
    const docSnap = await getDoc(dockRef);
    if (docSnap.exists()) {
      console.log("I got this user for ya: ", docSnap.data());
      return docSnap.data() as User;
    } else {
      console.log("No such document! lel");
      return null
    }
  }

  async getCurrentChannelData(channelId: string) {
    const dockRef = doc(this.getColl("channel"), channelId);
    const docSnap = await getDoc(dockRef);
    return docSnap.data() as Channel
  }


  addIdToChannel(dockRef: any) {
    console.log('Document written - ID: ', dockRef?.id);
    const channelRef = doc(this.getColl('channel'), `${dockRef?.id}`);
    updateDoc(channelRef, {
      channelId: dockRef?.id,
    });
  }

  async updateChannelInfo(channelId: string | undefined, edit: string | undefined | any , whatToUpdate: string) {
    const dockRef = doc(this.getColl('channel'), channelId)
    await updateDoc(dockRef, {
      [whatToUpdate]: edit
    })
  }

  async getCreator(creatorID: string) {
    const dockRef = doc(this.getColl("user"), creatorID);
    const dockSnap = await getDoc(dockRef);
    return dockSnap.data() as User;
  }

  createRoomRef(roomId: string) {
    return doc(this.getColl("directMessages"), roomId);
  }

  checkIfRoomExists(roomId: string, currentUserID:string, otherUserID: string) {
    const roomRef = doc(this.getColl("directMessages"), roomId)
    onSnapshot(roomRef,(docSnap) => {
      if (docSnap.exists()) {
        console.log('Room exists: ', docSnap.data())
        this.chatService.isChannel = false;
        this.chatService.currentChannel$.next(docSnap.data()['id']);
      }else {
        console.log('Room doesnt exist, will be created soon');
        const transformedRoomData = new DirectMessage(this.transformDmRoom(currentUserID, otherUserID, roomId));
        setDoc(roomRef, transformedRoomData.toJSON());
        console.log('Room created');
      }
      
    })
  }

  transformDmRoom(currentUserID: string, otherUserID: string, roomId: string) {
    return {
      member: [currentUserID, otherUserID],
      id: roomId,
      messages: []
    }
  }


}
