import { Component, HostListener } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { RouterLink, RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidenavContentComponent } from './sidenav-content/sidenav-content.component';
import { ChatComponent } from './chat/chat.component';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { MobileService } from '../../assets/services/mobile.service';

@Component({
  selector: 'app-main-content',
  standalone: true,
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.scss',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatAccordion,
    MatExpansionModule,
    HeaderComponent,
    RouterOutlet,
    RouterLink,
    ChatComponent,
    SidenavContentComponent,
  ],
})
export class MainContentComponent {
  isChannelOpen!: boolean;
  isChannelOpenSub!: Subscription;
  screenWidth: number;
  isDrawerOpen: boolean = true;
  drawerSub!: Subscription;

  constructor(private mobileService: MobileService) {
    this.screenWidth = window.innerWidth;
    this.drawerSub = this.mobileService.drawerOpened$.subscribe(isOpen => {
      this.isDrawerOpen = isOpen;
    })
    this.mobileService.toggleDrawe(true);
  }


  /**
 * Listens to the window resize event and updates the screenWidth property.
 * This method is triggered whenever the browser window is resized.
 * 
 * @returns {void} Returns nothing.
 */
  @HostListener('window:resize')
  onResize() {
    this.screenWidth = window.innerWidth;
  }


  /**
 * Initializes the component and subscribes to changes in the mobile service.
 * Updates the component's state based on the channelOpened$ observable.
 * 
 * @returns {void} Returns nothing.
 */
  ngOnInit() {
    this.isChannelOpenSub = this.mobileService.channelOpened$.subscribe(
      (isChannelOpen) => {
        this.isChannelOpen = isChannelOpen;
      }
    )
  }


  /**
 * Cleans up subscriptions and resources when the component is destroyed.
 * Unsubscribes from the `channelOpened$` and `drawerOpened$` subscriptions.
 * 
 * @returns {void} Returns nothing.
 */
  ngOnDestroy() {
    this.isChannelOpenSub.unsubscribe();
    this.drawerSub.unsubscribe();
  }


  /**
 * Toggles the state of the drawer between open and closed.
 *
 * @param {boolean} isOpen - Boolean indicating whether the drawer should be open (`true`) or closed (`false`).
 * @returns {void} Returns nothing.
 */
  toggleDrawer(isOpen: boolean) {
    this.isDrawerOpen = isOpen;
  }


  /**
 * Toggles the state of the drawer and updates the state in the `mobileService`.
 *
 * This method toggles the `isDrawerOpen` property between `true` and `false` and
 * also calls the `toggleDrawer` method from `mobileService` to update its state.
 *
 * @returns {void} Returns nothing.
 */
  toggleDrawerVar() {
    this.isDrawerOpen = !this.isDrawerOpen;
    this.mobileService.toggleDrawe(this.isDrawerOpen);
  }
}