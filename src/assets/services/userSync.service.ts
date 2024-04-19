import { Injectable } from "@angular/core";
import { Database, get, onDisconnect, ref, set } from "@angular/fire/database";
import { Firestore } from "@angular/fire/firestore";

@Injectable({
    providedIn: 'root',
})

export class UserSync {

    private timeOutID: any;
    private inactivityTime: number = 0.5 * 10 * 1000; // 0,5 min inactivity

    constructor(private firestore: Firestore, public realTimeDB: Database ){}
    /**
     * Begins monitoring user activity for the specified user.
     * If the user becomes inactive for a predefined duration, their state will be set to 'away'.
     * 
     * @param {string | undefined} userId - The ID of the user whose activity is to be monitored.
     *                                      If undefined, no action is taken.
     * 
     */
    startMonitoringActivity(userId: string | undefined) {
        this.resetTimer(userId);
    }

    /**
     * Resets the activity monitoring timer for a specific user. Clears any previous timer,
     * sets the user's state to 'true' (indicating active), and sets a new timer
     * that will change the user's state to 'away' after a period of inactivity.
     * 
     * @param {string | undefined} userId - The ID of the user whose timer is to be reset.
     *                                      If undefined, no action is taken.
     */
    resetTimer(userId: string | undefined) {
        clearTimeout(this.timeOutID);
        this.setUserState(userId, 'true')
        this.timeOutID = setTimeout(() => this.setUserState(userId, 'away'), this.inactivityTime)
    }

    // syncState(userId: string | undefined) {
    //     const stateRef = ref(this.realTimeDB, `state/${userId}`)
    //     get(stateRef).then((snapshot) => {
    //         const currentState = snapshot.val();
    //         if (currentState === 'away') {
    //             set(stateRef, { state: 'true'});
    //         }
    //     })
    // }

    /**
     * Sets the user's state in the real-time database. If the user's state is set to 'true' (indicating active),
     * a listener is also set to change the user's state to 'false' when the user disconnects.
     * 
     * @param {string | undefined} userId - The ID of the user whose state is to be set.
     *                                      If undefined, no action is taken.
     * @param {string} userState - The new state of the user, e.g., 'true' for active or 'false' for inactive.
     * 
     */
    setUserState(userID: string | undefined, userState: string) {
        if (userID) {
            const stateRef = ref(this.realTimeDB, `state/${userID}`);
            set(stateRef, { state: userState });
            if (userState === 'true') {
                onDisconnect(stateRef).set({ state: 'false' })
            }
        }
    }

    /**
     * Retrieves a reference to the user's state in the real-time database. This can be used
     * to read or write the user's state.
     * 
     * @param {string | undefined} userId - The ID of the user for whom to retrieve the database reference.
     *                                      If undefined, this function will return `undefined`.
     * @returns {DatabaseReference | undefined} A reference to the user's state in the database, or `undefined` if no userId is provided.
     */
    getDbRef(userId: string | undefined) {
        const stateRef = ref(this.realTimeDB, `state/${userId}`);
        return stateRef
    }

}