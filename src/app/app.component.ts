import { Component, ViewChild, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MainContentComponent } from "./main-content/main-content.component";

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [
    RouterOutlet,
    RouterLink,
    MainContentComponent
  ]
})
export class AppComponent {
  title = 'DA-Bubble';

}