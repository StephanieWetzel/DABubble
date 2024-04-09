import { Injectable, inject } from '@angular/core';
import {
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
import { Channel } from '../../../assets/models/channel.class';
import { User } from '../../../assets/models/user.class';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  firestore: Firestore = inject(Firestore);

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


  addIdToChannel(dockRef: any) {
    console.log('Document written - ID: ', dockRef?.id);
    const channelRef = doc(this.getColl('channel'), `${dockRef?.id}`);
    updateDoc(channelRef, {
      channelId: dockRef?.id,
    });
  }
}
