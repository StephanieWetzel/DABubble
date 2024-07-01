import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-imprint',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './imprint.component.html',
  styleUrl: './imprint.component.scss'
})
export class ImprintComponent {
  containerWidth: number;
  containerHeight: number;
  isHovered: boolean = false;

  constructor(private location: Location) {
    this.containerWidth = window.innerWidth;
    this.containerHeight = window.innerHeight;
  }


  /**
 * Navigates back to the previous location in the browser history.
 * @returns {void} Returns nothing.
 */
  goBack(): void {
    this.location.back();
  }
}