import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { IntroAnimationComponent } from './intro-animation/intro-animation.component';
import { MainContentComponent } from "./main-content/main-content.component"



@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [
    RouterOutlet,
    RouterLink,
    IntroAnimationComponent,
    MainContentComponent
  ]
})
export class AppComponent {
  title = 'DABubble';
}