import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
} from 'firebase/auth';
import {
  Firestore,
  arrayUnion,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { Auth, signInWithPopup, signInWithRedirect, signOut, getRedirectResult } from '@angular/fire/auth';
import { User } from '../../assets/models/user.class';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  currentUser: any;
  constructor(public auth: Auth, private firestore: Firestore, private router: Router,) { }

  /**
 * Signs in a user with the provided email and password.
 * @param {string} email - The email address of the user.
 * @param {string} password - The password of the user.
 * @returns {Promise<UserCredential>} A promise that resolves with the user credential upon successful sign-in.
 */
  signIn(email: string, password: string) {

    return signInWithEmailAndPassword(this.auth, email, password);
  }


  /**
 * Creates a new user account with the provided email and password.
 * @param {string} email - The email address for the new user account.
 * @param {string} password - The password for the new user account.
 * @returns {Promise<UserCredential>} A promise that resolves with the user credential upon successful account creation.
 */
  signUp(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }


  /**
 * Signs out the currently authenticated user.
 * @returns {Promise<void>} A promise that resolves when the sign-out process is complete.
 */
  signOut() {
    return signOut(this.auth);
  }


  /**
 * Signs in with Google authentication provider using a pop-up window.
 * @returns {Promise<UserCredential>} A promise that resolves with the user credential upon successful Google sign-in.
 */
  signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }


  // signInWithGoogle() {
  //   const provider = new GoogleAuthProvider();
  //   return signInWithRedirect(this.auth, provider);
  // }


  // async handleRedirect(standardChannelId: string) {

  //   try {
  //     const result = await getRedirectResult(this.auth);
  //     if (result && result.user) {

  //       const transformedData = this.transformGoogleSignInData(result);
  //       if (!result.user.uid) {
  //         console.error("UID ist undefined oder null");
  //         return;
  //       }
  //       const userRef = doc(this.firestore, "user", result.user.uid);
  //       const channelRef = doc(this.firestore, "channel", standardChannelId);
  //       await updateDoc(channelRef, {
  //         member: arrayUnion({ id: transformedData.userId, name: transformedData.name })
  //       });
  //       await setDoc(userRef, transformedData);
  //       this.router.navigate(['/main']);
  //     }
  //   } catch (error) {
  //   }
  // }


  /**
 * Fetches the currently authenticated user.
 * @returns {User | null} The currently authenticated user, or null if no user is authenticated.
 */
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
