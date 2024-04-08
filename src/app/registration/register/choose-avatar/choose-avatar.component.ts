import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthenticationService } from '../../authentication.service';

@Component({
  selector: 'app-choose-avatar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './choose-avatar.component.html',
  styleUrl: './choose-avatar.component.scss'
})
export class ChooseAvatarComponent {
  @ViewChild('chosenAvatar') chosenAvatar: ElementRef | any;

  isHovered: boolean = false;
  isClicked: boolean = false;
  allAvatars = ['avatar_clean0.png', 'avatar_clean1.png', 'avatar_clean2.png', 'avatar_clean3.png', 'avatar_clean4.png', 'avatar_clean5.png'];
  clickedIndex: number = -1; // Index des zuletzt geklickten Elements


  changeBackgroundColor() {
    this.isClicked = true;
  }


  resetBackgroundColor() {
    this.isClicked = false;
  }


  toggleClicked(i: number) {
    this.clickedIndex = (this.clickedIndex === i) ? -1 : i;
    const chosenAvatar = this.allAvatars[this.clickedIndex];
    if (this.clickedIndex !== -1) {
      const chosenAvatarSrc = chosenAvatar;
      // this.chosenAvatar.nativeElement.src = `assets/img/${chosenAvatarSrc}`;
    }
  }


  constructor(
    public authService: AuthenticationService) {

  }


}
