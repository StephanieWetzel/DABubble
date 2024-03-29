import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { RouterLink, RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidenavContentComponent } from './sidenav-content/sidenav-content.component';
import { ChatComponent } from './chat/chat.component';


@Component({
    selector: 'app-main-content',
    standalone: true,
    templateUrl: './main-content.component.html',
    styleUrl: './main-content.component.scss',
    imports: [MatIconModule, 
        MatButtonModule, 
        MatToolbarModule, 
        MatSidenavModule, 
        MatAccordion, 
        MatExpansionModule, 
        HeaderComponent, 
        RouterOutlet,
        RouterLink,
        ChatComponent,
        SidenavContentComponent
      ]
})
export class MainContentComponent {

}
