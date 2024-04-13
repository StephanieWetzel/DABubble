// import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  GoogleAuthProvider
} from 'firebase/auth';
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
import { inject, Injectable } from '@angular/core';
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


  async fetchGuestData() {
    const guestID = 'YYAJ716GPnfVu2fC2KS3Y8UFuDi1';
    const docRef = doc(this.firestore, 'user', guestID)
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as User;
    } else {
      return null;
    }
  }


  // async ensureDocumentExistsInFirebase(userId: string, user: User) {
  //   const userDocRef = doc(this.firestore, 'user', userId);
  //   const docSnap = await getDoc(userDocRef);
  //   if (!docSnap.exists()) {
  //     await setDoc(userDocRef, {
  //       name: user.name,
  //       email: user.email,
  //       avatar: user.avatar
  //     });
  //   }
  // }


}
