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

@Injectable({
  providedIn: 'root',
})

export class FirebaseService {
  firestore: Firestore = inject(Firestore);

  fetchUser(): Observable<any[]> {
    const userQuery = query(this.getUserColl(), limit(100));
    return new Observable((subscriber) => {
      const unsubscribe = onSnapshot(userQuery, (list) => {
        const userArray = list.docs.map(doc => doc.data());
        subscriber.next(userArray);
      }, error => subscriber.error(error));
      return () => unsubscribe();
    });
  }

  getUserColl() {
    let userRef = collection(this.firestore, 'user');
    return userRef;
  }
}
