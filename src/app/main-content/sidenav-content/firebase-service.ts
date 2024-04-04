import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  Unsubscribe,
  addDoc,
  collection,
  doc,
  getDocs,
  getFirestore,
  limit,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Channel } from '../../../assets/models/channel.class';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  firestore: Firestore = inject(Firestore);

  fetchCollection(colID: string): Observable<any[]> {
    const collectionQuery = query(this.getColl(colID));
    return new Observable((subscriber) => {
      const unsubscribe = onSnapshot(
        collectionQuery, (list) => {
          const collectionArray = list.docs.map((doc) => doc.data());
          subscriber.next(collectionArray)
        }, (error) => subscriber.error(error)
      );
      return () => unsubscribe();
    })
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
        this.addIdToChannel(dockRef)
      });
  }

  addIdToChannel(dockRef: any) {
    console.log('Document written - ID: ', dockRef?.id);
        const channelRef = doc(this.getColl('channel'), `${dockRef?.id}`);
        updateDoc(channelRef, {
          channelId: dockRef?.id,
        });
  }


}
