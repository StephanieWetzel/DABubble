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

  fetchUser(): Observable<any[]> {
    const userQuery = query(this.getColl('user'), limit(100));
    return new Observable((subscriber) => {
      const unsubscribe = onSnapshot(userQuery, (list) => {
        const userArray = list.docs.map(doc => doc.data());
        subscriber.next(userArray);
      }, error => subscriber.error(error));
      return () => unsubscribe();
    });
  }

  getColl(colId: string) {
    let userRef = collection(this.firestore, colId);
    return userRef;
  }

  async saveChannel(channel: Channel) {
    try{
    const channelToJSON = channel.toJSON();
    await addDoc(this.getColl('channel'), channelToJSON)
    console.log('channeld added')
  } catch (error) {
    console.error('saving failed', error)
  }
  }
}
