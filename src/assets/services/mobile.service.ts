import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class MobileService {
    channelOpened = new BehaviorSubject<boolean>(false);
    channelOpened$ = this.channelOpened.asObservable();

    drawerOpened = new BehaviorSubject<boolean>(false);
    drawerOpened$ = this.drawerOpened.asObservable();


    /**
 * Notifies subscribers that a channel has been opened or closed.
 * @param {boolean} isOpen - A boolean indicating whether the channel is open.
 */
    openChannel(isOpen: boolean) {
        this.channelOpened.next(isOpen);
    }


    /**
 * Notifies subscribers that a drawer has been toggled.
 * @param {boolean} isOpen - A boolean indicating whether the drawer is open.
 */
    toggleDrawe(isOpen: boolean) {
        this.drawerOpened.next(isOpen);
    }

}