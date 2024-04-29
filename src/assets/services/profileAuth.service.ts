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
import { UserSync } from "./userSync.service";

@Injectable({
    providedIn: 'root',
})


export class ProfileAuthentication {
    private userSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
    public user$ = this.userSubject.asObservable();
    constructor(private firestore: Firestore, private router: Router, public realTimeDB: UserSync) { }


    /**
     * Initializes the user by checking if a user is logged in and then fetching that user's details from firestore.
     */
    initializeUser() {
        this.fetchLoggedUser().then((userID) => {
            if (userID) {
                this.fetchUserFromFirestore(userID)
            }
        }).catch(error => {
            //console.log('No such user lul', error);
        })
    }


    /**
     * Checks for the current authenticated user and returns their user ID.
     * @returns {Promise<string>} - A promise that resolves with the user ID of the currently logged-in user.
     */
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


    /**
     * Fetches user data from Firestore and updates user state to 'true' for being active.
     * @param {string} userID - The user ID to fetch.
     * 
     */
    async fetchUserFromFirestore(userID: string) {
        const docRef = doc(this.firestore, 'user', userID);
        this.refreshState(userID, 'true');
        this.realTimeDB.setUserState(userID, 'true');
        onSnapshot(docRef, (userSnap) => {
            if (userSnap.exists()) {
                const user = userSnap.data() as User;
                this.userSubject.next(user);
            } else {
                this.userSubject.next(null);
            }
        })
    }


    /**
     * Fetches partner data from Firestore.
     * @param {string} userID - The user ID of the partner to fetch.
     * @returns {Promise<User | null>} - A promise that resolves with the user data or null if not found.
     */
    async fetchPartnerFromFirestore(userID: string): Promise<User | null> {
        const docRef = doc(this.firestore, 'user', userID);
        try {
            const userSnap = await getDoc(docRef);
            if (userSnap.exists()) {
                return userSnap.data() as User;
            } else {
                return null;
            }
        } catch (error) {
            console.error('error ', error);
            return null;
        }
    }


    // setUserState(userID: string, userState: string) {
    //     if (userID) {
    //         const stateRef = ref(this.realTimeDB, `state/${userID}`);
    //         set(stateRef, { state: userState });
    //         if (userState === 'true') {
    //             onDisconnect(stateRef).set({ state: 'false' })
    //         }
    //     }
    // }


    /**
     * Updates the user's state in Firestore to the specified state.
     * @param {string | undefined} userID - The user ID for whom the state is updated.
     * @param {string} uState - The new state to set.
     * 
     */
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


    /**
     * Updates user's name and email in Firestore and authentication service.
     * @param {string | undefined} userID - The user ID to update.
     * @param {any} editName - The new name for the user.
     * @param {any} editMail - The new email for the user.
     * 
     */
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


    /**
     * Logs out the current user, updates their state to 'false', and navigates to the login screen.
     */
    async userLogout() {
        const auth = getAuth();
        await this.refreshState(auth.currentUser?.uid, 'false');
        const stateRef = this.realTimeDB.getDbRef(auth.currentUser?.uid)
        set(stateRef, { state: 'false' })
        signOut(auth).then(() => {
            //console.log("Logout successful !")
            this.router.navigate(['/']);
        })
    }


}