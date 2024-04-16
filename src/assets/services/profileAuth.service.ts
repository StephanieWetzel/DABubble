import { BehaviorSubject } from "rxjs";
import { User } from "../models/user.class";
import {
    Firestore,
    doc,
    getDoc,
    onSnapshot,
    updateDoc,
} from '@angular/fire/firestore';
import { getAuth, onAuthStateChanged, signOut, updateEmail } from "@angular/fire/auth";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Database, ref, set, onDisconnect } from '@angular/fire/database';

@Injectable({
    providedIn: 'root',
})


export class ProfileAuthentication {
    private userSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
    public user$ = this.userSubject.asObservable();
    constructor(private firestore: Firestore, private router: Router, public realTimeDB: Database) { }

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
        this.setUserState(userID, 'true');
        onSnapshot(docRef, (userSnap) => {
            if (userSnap.exists()) {
                const user = userSnap.data() as User;
                this.userSubject.next(user);
            } else {
                this.userSubject.next(null);
            }
        })
    }

    async fetchPartnerFromFirestore(userID: string): Promise<User | null> {
        const docRef = doc(this.firestore, 'user', userID);
        try {
          const userSnap = await getDoc(docRef);
          if (userSnap.exists()) {
            return userSnap.data() as User;
          } else {
            console.log('no user found');
            return null;
          }
        } catch (error) {
          console.error('error ', error);
          return null;
        }
    }

    setUserState(userID: string, userState: string) {
        if (userID) {
            const stateRef = ref(this.realTimeDB, `state/${userID}`);
            set(stateRef, { state: userState });
            if (userState === 'true') {
                onDisconnect(stateRef).set({ state: 'false' })
            }
        }
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
        await this.refreshState(auth.currentUser?.uid, 'false');
        const stateRef = ref(this.realTimeDB, `state/${auth.currentUser?.uid}`)
        set(stateRef, { state: 'false' })
        signOut(auth).then(() => {
            console.log("Logout successful !")
            this.router.navigate(['/']);
        })
    }


}