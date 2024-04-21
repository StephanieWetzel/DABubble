import { Component, HostListener } from '@angular/core';
import { trigger, transition, animate, style, state } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { AuthenticationService } from '../../assets/services/authentication.service';

@Component({
  selector: 'app-intro-animation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './intro-animation.component.html',
  styleUrl: './intro-animation.component.scss',

  // animations: [
  //   trigger('fadeInOut', [
  //     transition(':enter', [
  //       style({ opacity: 0 }),
  //       animate('500ms', style({ opacity: 1 })),
  //     ]),
  //     transition(':leave', [
  //       animate('500ms', style({ opacity: 0 }))
  //     ])
  //   ])
  // ]



  //   trigger('fadeBackground', [
  //     state('visible', style({
  //       opacity: 1
  //     })),
  //     state('hidden', style({
  //       opacity: 0
  //     })),
  //     transition('visible => hidden', [
  //       animate('1s ease-out')
  //     ])
  //   ]),

  //   trigger('slideAndFade', [
  //     transition(':enter', [
  //       style({ transform: 'translateY(-100vh)', opacity: 0 }), // Start von oben
  //       animate('5000ms ease-out', style({ transform: 'translateY(0)', opacity: 1 })), // Zum Mittelpunkt sliden
  //       animate('4000ms ease-out', style({ transform: 'translateX(-50vw)', opacity: 0 })) // Nach links sliden und ausblenden
  //     ])
  //   ])
  // ]
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

  // animationState: any;
  // showBackground = true;

  // backgroundState: string = 'visible';


  // animationDone() {
  //   this.showBackground = false;
  //   this.backgroundState = 'hidden';
  // }
}
