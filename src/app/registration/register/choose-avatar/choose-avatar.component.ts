import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

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
  selectedAvatarURL: string | any = '';
  userId: string | any = '';

  firestore: Firestore = inject(Firestore)


  constructor(private router: Router, private route: ActivatedRoute) {
    this.route.params.subscribe((params) => {
      this.userId = params['id'];
    });
  }


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
      this.selectedAvatarURL = `assets/img/${chosenAvatar}`;
      this.chosenAvatar.nativeElement.src = this.selectedAvatarURL;
      console.log(this.selectedAvatarURL)
    }
  }


  async signUp(userId: string) {
    try {
      const userRef = doc(this.firestore, "user", userId);
      await setDoc(userRef, { avatar: this.selectedAvatarURL }, { merge: true });
      this.router.navigate(['/main']);
      console.log('Avatar saved to Firebase:', this.selectedAvatarURL);
    } catch (error) {
      console.error('Error saving avatar to Firebase:', error);
    }
  }



}