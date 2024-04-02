import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { User } from "../assets/models/user.class";
import { Firestore } from "@angular/fire/firestore/firebase";
import { inject } from "@angular/core";

export class UserDetailComponent {
    firestore: Firestore = inject(Firestore);


    // config of our project
    firebaseConfig = {
        "projectId": "dabubble-172c7",
        "appId": "1:1098632374519:web:2f7a316a716c775b1f4bf2",
        "storageBucket": "dabubble-172c7.appspot.com",
        "apiKey": "AIzaSyBcMF4K_odDgT1p9mYESQ--a5Et3BJgLzk",
        "authDomain": "dabubble-172c7.firebaseapp.com",
        "messagingSenderId": "1098632374519"
    };

    // Initialize Firebase
    // const app = initializeApp(this.firebaseConfig);

    // // Initialize Firebase Authentication and get a reference to the service
    // const auth = getAuth(this.app);


    //     createUserWithEmailAndPassword: any(auth, email, password)
    //     .then((userCredential) => {
    //     // Signed up 
    //     const user = userCredential.user;
    //     // ...
    //     })
    //     .catch ((error) => {
    //     const errorCode = error.code;
    //     const errorMessage = error.message;
    //     // ..
    // });


    // // login
    // signInWithEmailAndPassword(auth, email, password)
    //     .then((userCredential) => {
    //         // Signed in 
    //         const user = userCredential.user;
    //         // ...
    //     })
    //     .catch((error) => {
    //         const errorCode = error.code;
    //         const errorMessage = error.message;
    //     });


    // onAuthStateChanged(auth, (user) => {
    //     if (user) {
    //         // User is signed in, see docs for a list of available properties
    //         // https://firebase.google.com/docs/reference/js/auth.user
    //         const uid = user.uid;
    //         // ...
    //     } else {
    //         // User is signed out
    //         // ...
    //     }
    // });

}