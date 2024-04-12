import { BehaviorSubject } from "rxjs";
import { User } from "../models/user.class";
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
import { getAuth, onAuthStateChanged, signOut, updateEmail } from "@angular/fire/auth";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";


@Injectable({
    providedIn: 'root',
})


export class ProfileAuthentication {
    private userSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
    public user$ = this.userSubject.asObservable();

    constructor(private firestore: Firestore, private router: Router) { }

    initializeUser() {
        this.fetchLoggedUser().then((userID) => {
            if (userID) {
                this.fetchUserFromFirestore(userID)
            }
        }).catch(error => {
            console.log('No such user lul', error);
        })
    }

    async fetchLoggedUser(): Promise<string> {
        const auth = getAuth();
        return new Promise((resolve, reject) => {
            onAuthStateChanged(auth, (user) => {
                if (user?.uid) {
                    resolve(user.uid)
                } else {
                    reject(new Error('There is currently no user logged in!'))
                }
            })
        })
    }

    async fetchUserFromFirestore(userID: string) {
        console.log('Now fetching user from database: ', userID);
        const docRef = doc(this.firestore, 'user', userID);
        this.refreshState(userID, 'true');
        onSnapshot(docRef, (userSnap) => {
            if (userSnap.exists()) {
                const user = userSnap.data() as User;
                this.userSubject.next(user);
            } else {
                this.userSubject.next(null);
            }
        })
    }

    async refreshState(userID: string | undefined, uState: string) {
        if (userID) {
            const docRef = doc(this.firestore, 'user', userID)
            await updateDoc(docRef, {
                state: uState
            })
        } else {
            console.log(new Error("User not found !"))
        }
    }

    async updateUserEdit(userID: string | undefined, editName: string | any, editMail: string | any) {
        const auth = getAuth();
        if (userID) {
            const docRef = doc(this.firestore, 'user', userID);
            await updateDoc(docRef, {
                name: editName,
                email: editMail
            });
        } else {
            console.log(new Error("User not found"));
        }
        if (auth.currentUser) {
            updateEmail(auth.currentUser, editMail).then(() => {
                console.log("Mail was updated");
            }).catch((error) => {
                console.log("Something happend: ", error)
            })
        }
    }

    async getColl() {
        const colRef = await doc(this.firestore, 'user');
        return colRef
    }

    async userLogout() {
        const auth = getAuth();
        this.refreshState(auth.currentUser?.uid, 'false');
        signOut(auth).then(() => {
            console.log("Logout successful !")
            this.router.navigate(['/']);
        })
    }

}