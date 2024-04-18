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

    startMonitoringActivity(userId: string | undefined) {
        this.resetTimer(userId);
    }

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

    setUserState(userID: string | undefined, userState: string) {
        if (userID) {
            const stateRef = ref(this.realTimeDB, `state/${userID}`);
            set(stateRef, { state: userState });
            if (userState === 'true') {
                onDisconnect(stateRef).set({ state: 'false' })
            }
        }
    }

    getDbRef(userId: string | undefined) {
        const stateRef = ref(this.realTimeDB, `state/${userId}`);
        return stateRef
    }

}