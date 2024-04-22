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


    openChannel(isOpen: boolean) {
        this.channelOpened.next(isOpen);
    }

    toggleDrawe(isOpen: boolean) {
        this.drawerOpened.next(isOpen);
    }

}