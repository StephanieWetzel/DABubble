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
  @ViewChild('file') file: ElementRef | any;

  isHovered: boolean = false;
  isClicked: boolean = false;
  allAvatars = ['avatar_clean0.png', 'avatar_clean1.png', 'avatar_clean2.png', 'avatar_clean3.png', 'avatar_clean4.png', 'avatar_clean5.png'];
  clickedIndex: number = -1;
  selectedAvatarURL: string | any = '';
  userId: string | any = '';

  firestore: Firestore = inject(Firestore)


  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.route.params.subscribe((params) => {
      this.userId = params['id'];
    });
  }


  /**
 * Changes the background color of the element to indicate a clicked state when the mouse button is pressed.
 */
  changeBackgroundColor() {
    this.isClicked = true;
  }


  /**
 * Resets the background color of the element to its default state when the mouse button is released.
 */
  resetBackgroundColor() {
    this.isClicked = false;
  }


  /**
    * Opens the file input dialog programmatically by triggering a click event on the native file input element.
   */
  openFileInput() {
    this.file.nativeElement.click();
  }


  /**
 * Event handler for when a file is selected.
 * Updates the selectedAvatarURL and displays the selected image in the chosenAvatar element.
 * 
 * @param event - The event containing information about the selected file.
 */
  onFileSelected(event: any) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.selectedAvatarURL = e.target.result;
      this.chosenAvatar.nativeElement.src = this.selectedAvatarURL;
    };
    reader.readAsDataURL(file);
  }


  /**
 * Toggles the clicked state of the avatar at the specified index.
 * If an avatar is clicked, updates the selectedAvatarURL and displays the selected image.
 * 
 * @param i - The index of the avatar being clicked.
 */
  toggleClicked(i: number) {
    this.clickedIndex = (this.clickedIndex === i) ? -1 : i;
    const chosenAvatar = this.allAvatars[this.clickedIndex];
    if (this.clickedIndex !== -1) {
      this.selectedAvatarURL = `assets/img/${chosenAvatar}`;
      this.chosenAvatar.nativeElement.src = this.selectedAvatarURL;
    }
  }


  /**
 * Signs up the user and saves the selected avatar URL to Firebase.
 * 
 * @param userId - The ID of the user.
 */
  async signUp(userId: string) {
    try {
      const userRef = doc(this.firestore, "user", userId);
      await setDoc(userRef, { avatar: this.selectedAvatarURL }, { merge: true });
      this.router.navigate(['/main']);
    } catch (error) {
    }
  }



}