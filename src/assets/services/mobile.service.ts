import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class MobileService {
    channelOpened = new BehaviorSubject<boolean>(false);
    channelOpened$ = this.channelOpened.asObservable();


    openChannel(isOpen: boolean) {
        this.channelOpened.next(isOpen);
    }

}