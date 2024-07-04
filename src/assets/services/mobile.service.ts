import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MobileService {
  channelOpened = new BehaviorSubject<boolean>(false);
  channelOpened$ = this.channelOpened.asObservable();

  drawerOpened = new BehaviorSubject<boolean>(false);
  drawerOpened$ = this.drawerOpened.asObservable();

  activeChannel = new BehaviorSubject<string | null>('V4fl3CDNCrJMOp6Dro36');
  activeChannel$ = this.activeChannel.asObservable();


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


  /**
   * Retrieves the currently active channel ID from local storage.
   * @returns {string} The ID of the currently active channel.
   */
  getActiveChannel() {
    let channelID = localStorage.getItem('selectedChannelId');
    this.activeChannel.next(channelID)
  }


  /**
   * Sets the active channel ID in local storage.
   * @param {string} channelId - The ID of the channel to set as active.
   */
  setActiveChannel(channelId: string): void {
    localStorage.setItem('selectedChannelId', channelId);
  }
}