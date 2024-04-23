import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthenticationService } from '../../assets/services/authentication.service';

@Component({
  selector: 'app-intro-animation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './intro-animation.component.html',
  styleUrl: './intro-animation.component.scss',
})

export class IntroAnimationComponent {
  containerWidth: number;
  containerHeight: number;


  constructor(public auth: AuthenticationService) {
    this.containerWidth = window.innerWidth;
    this.containerHeight = window.innerHeight;
  }


  /**
* Updates the container width on window resize.
* @param event - The event object for the resize event.
*/
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.containerWidth = event.target.innerWidth;
    this.containerHeight = event.target.innerHeight;
  }
}
