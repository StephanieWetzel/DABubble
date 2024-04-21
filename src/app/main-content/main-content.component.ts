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
import { ChatService } from '../../assets/services/chat-service/chat.service';
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
  isDrawerOpen: boolean = true;
  isChannelOpen!: boolean;
  isChannelOpenSub!: Subscription;
  screenWidth: number;

  constructor(private mobileService: MobileService){
    this.screenWidth = window.innerWidth;
  }

  @HostListener('window:resize')
  onResize() {
    this.screenWidth = window.innerWidth;
  }

  ngOnInit() {
    this.isChannelOpenSub = this.mobileService.channelOpened$.subscribe(
      (isChannelOpen) => {
        this.isChannelOpen = isChannelOpen;
      }
    )
  }

  ngOnDestroy() {
    this.isChannelOpenSub.unsubscribe();
  }

  toggleDrawer(isOpen: boolean) {
    this.isDrawerOpen = isOpen;
  }

  toggleDrawerVar() {
    this.isDrawerOpen = !this.isDrawerOpen;
  }
}
