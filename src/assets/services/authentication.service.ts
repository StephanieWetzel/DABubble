// import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider
} from 'firebase/auth';
import {
  Firestore,
  doc,
  getDoc
} from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { Auth, signInAnonymously, signInWithPopup, signOut } from '@angular/fire/auth';
import { User } from '../../assets/models/user.class';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  currentUser: any;

  constructor(public auth: Auth, private firestore: Firestore) { }

  signIn(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }


  signUp(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }


  signOut() {
    return signOut(this.auth);
  }


  signInAnonymously() {
    const auth = getAuth();
    return signInAnonymously(auth);
  }


  signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }


  fetchCurrentUser() {
    return this.currentUser;
  }

  /**
   * Fetches data for a guest user from Firestore based on a predefined guest user ID.
   * @returns {Promise<User | null>} A promise that resolves with the user data if the document exists,
   * or null if there is no such document.
   * 
   */
  async fetchGuestData() {
    const guestID = 'ck4vudalTaUgOYeatRsBQhoCqr12';
    const docRef = doc(this.firestore, 'user', guestID)
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as User;
    } else {
      return null;
    }
  }


}
