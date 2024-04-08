// import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { Firestore } from "@angular/fire/firestore/firebase";
import { inject, Injectable } from "@angular/core";
import { Auth, signInAnonymously, signOut } from "@angular/fire/auth";
import { User } from "../../assets/models/user.class";

@Injectable({
    providedIn: 'root'
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


    fetchCurrentUser() {
        return this.currentUser;
    }


}

