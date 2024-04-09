// import { initializeApp } from "firebase/app";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    GoogleAuthProvider
} from 'firebase/auth';
import { Firestore } from '@angular/fire/firestore/firebase';
import { inject, Injectable } from '@angular/core';
import { Auth, signInAnonymously, signInWithPopup, signOut } from '@angular/fire/auth';
import { User } from '../../assets/models/user.class';

@Injectable({
    providedIn: 'root',
})
export class AuthenticationService {
    currentUser: any;

    constructor(public auth: Auth) { }

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

<<<<<<< HEAD
  fetchLoggedUser() {
    const auth = getAuth();
    return new Promise((resolve, reject) => {
      onAuthStateChanged(auth, (user) => {
        if (user?.uid) {
          resolve(user.uid); // gives the user id back if user is logged in
        } else {
          reject(new Error('No user logged in'));
        }
      });
    });
  }

  fetchCUser(callback: (userID: string | null) => void): void {
    this.auth.onAuthStateChanged((cUser) => {
        if (cUser) {
            callback(cUser.uid)
        } else {
            console.log("kein Benutzer angemeldet");
            callback(null)
        }
        
    });
    
  }

=======

    fetchCurrentUser() {
        return this.currentUser;
    }

    fetchLoggedUser() {
        const auth = getAuth();
        return new Promise((resolve, reject) => {
            onAuthStateChanged(auth, (user) => {
                if (user?.uid) {
                    resolve(user.uid); // gives the user id back if user is logged in
                } else {
                    reject(new Error('No user logged in'));
                }
            });
        });
    }
>>>>>>> 58c9a4b4af6a9c407baf76005d8bab1e473b1d60
}
