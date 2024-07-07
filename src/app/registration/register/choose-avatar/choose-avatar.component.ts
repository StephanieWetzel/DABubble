import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, HostListener } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Firestore, collection, deleteDoc, doc, docData, getDoc, setDoc } from '@angular/fire/firestore';
import { trigger, transition, animate, style } from '@angular/animations';
import { AuthenticationService } from '../../../../assets/services/authentication.service';

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
  styleUrl: './choose-avatar.component.scss',

  animations: [
    trigger('slideInFromRight', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('500ms ease-out', style({ transform: 'translateX(0)' })),
      ])
    ])
  ]
})

export class ChooseAvatarComponent {
  @ViewChild('chosenAvatar') chosenAvatar: ElementRef | any;
  @ViewChild('file') file: ElementRef | any;

  isHovered: boolean = false;
  isClicked: boolean = false;
  showOverlay: boolean = false;

  allAvatars = ['avatar_clean0.png', 'avatar_clean1.png', 'avatar_clean2.png', 'avatar_clean3.png', 'avatar_clean4.png', 'avatar_clean5.png'];
  clickedIndex: number = -1;
  selectedAvatarURL: string | any = '';
  userId: string | any = '';
  name: string | any = '';

  containerWidth: number;
  containerHeight: number;


  constructor(
    public auth: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute,
    private firestore: Firestore,
  ) {
    this.route.params.subscribe((params) => {
      this.userId = params['id'];
      this.getNameFromFirebase();
    });

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
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("Die Datei darf maximal 1 MB groß sein!");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedAvatarURL = e.target.result;
        this.chosenAvatar.nativeElement.src = this.selectedAvatarURL;
      };
      reader.readAsDataURL(file);
    }
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
 * Retrieves the user name from Firebase based on the provided user ID.
 * @param {string} userId - The ID of the user whose name is to be retrieved from Firebase.
 * @returns {Promise<void>} - A promise that resolves when the user name is successfully retrieved.
 */
  async getNameFromFirebase() {
    try {
      const userDoc = await getDoc(doc(this.firestore, "user", this.userId));
      if (userDoc.exists()) {
        this.name = userDoc.data()['name'];
      }
    } catch (error) {
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
      this.showOverlay = true;
      setTimeout(() => {
        this.router.navigate(['/main']);
      }, 2000);
    } catch (error) {
    }
  }


  /**
 * Deletes the current user's data from Firestore and Firebase Authentication.
 * 
 * @async
 */
  async deleteUserFromFirebase() {
    await this.deleteUserFromDatabase();
    await this.auth.deleteUserFromAuth();
    // await this.deleteUserFromChannel();
  }


  /**
 * Deletes the current user's document from the 'user' collection in Firestore.
 * 
 * @async
 */
  async deleteUserFromDatabase() {
    try {
      const userRef = doc(this.firestore, 'user', this.userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        await deleteDoc(userRef);
      }
    } catch (error) {
    }
  }




  // async deleteUserFromChannel() {
  //   try {
  //     const channelDocRef = doc(this.firestore, 'channel', 'V4fl3CDNCrJMOp6Dro36');
  //     const userDocRef = doc(channelDocRef, 'member', this.userId);
  //     await deleteDoc(userDocRef);
  //   } catch (error) {
  //   }
  // }

}