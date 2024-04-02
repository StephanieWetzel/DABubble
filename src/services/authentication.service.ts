// import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { User } from "../assets/models/user.class";
import { Firestore } from "@angular/fire/firestore/firebase";
import { inject, Injectable } from "@angular/core";
import { Auth } from "@angular/fire/auth";

@Injectable({
    providedIn: 'root'
  })


export class AuthenticationService {

    constructor(public auth: Auth){}
    //auth: Auth = getAuth();


    login(email: string, password: string) {
        return signInWithEmailAndPassword(this.auth, email, password);
    }
}

