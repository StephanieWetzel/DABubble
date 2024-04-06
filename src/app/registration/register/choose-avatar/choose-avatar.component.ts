import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthenticationService } from '../../../../services/authentication.service';

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
  isHovered: boolean = false;
  isClicked: boolean = false;

  allAvatars = ['avatar_clean0.png', 'avatar_clean1.png', 'avatar_clean2.png', 'avatar_clean3.png', 'avatar_clean4.png', 'avatar_clean5.png'];


  changeBackgroundColor() {
    this.isClicked = true;
  }


  resetBackgroundColor() {
    this.isClicked = false;
  }


  constructor(
    public authService: AuthenticationService) {

  }


}
