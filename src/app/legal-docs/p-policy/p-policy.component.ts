import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-p-policy',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './p-policy.component.html',
  styleUrl: './p-policy.component.scss'
})
export class PPolicyComponent {

  containerWidth: number;
  containerHeight: number;
  isHovered: boolean = false;

  constructor(private location: Location) {
    this.containerWidth = window.innerWidth;
    this.containerHeight = window.innerHeight;
  }

  goBack(): void {
    this.location.back();
  }

}
