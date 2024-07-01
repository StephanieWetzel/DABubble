import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-intro-animation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './intro-animation.component.html',
  styleUrl: './intro-animation.component.scss'
})

export class IntroAnimationComponent implements OnInit {
  showAnimation = false;

  /**
  * Checks if the intro animation has been played in the current session.
  * If it has, it prevents the animation from playing again.
  */
  ngOnInit(): void {
    const animationPlayed = sessionStorage.getItem('introAnimation');

    if (animationPlayed) {
      this.showAnimation = false;
    } else {
      this.showAnimation = true;
      sessionStorage.setItem('introAnimation', 'true');
    }
  }
}