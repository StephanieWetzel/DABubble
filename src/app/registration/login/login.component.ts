import { CommonModule, NgIf, NgClass, NgStyle } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { User } from '../../../assets/models/user.class';
import { AuthenticationService } from '../../../assets/services/authentication.service';
import { Firestore, arrayUnion, doc, setDoc, updateDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    NgIf,
    NgClass,
    NgStyle,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  user: User = new User;
  email: string = '';
  password: string = '';
  guestUser: User = new User;
  developerChannelId: string = 'V4fl3CDNCrJMOp6Dro36'

  formData: FormGroup = this.fbuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  isMailFocused: boolean = false;
  isPasswordFocused: boolean = false;

  containerWidth: number;
  containerHeight: number;

  loginError: boolean = false;


  constructor(
    private fbuilder: FormBuilder,
    private auth: AuthenticationService,
    private router: Router,
    private firestore: Firestore
  ) {
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
 * Attempts to log in a user.
 * @returns {Promise<void>} A Promise object that resolves when the login process is completed.
 * @throws {Error} An error that occurs if the login process fails.
 */
  async login() {
    if (this.formData.valid) {
      const email = this.formData.value.email;
      const password = this.formData.value.password;
      try {
        await this.auth.signIn(email, password).then(() => {
          this.router.navigate(['/main']);
        });
      } catch (error) {
        this.loginError = true;
      }
    }
  }


  /**
   * Handles guest login by fetching guest data and signing in.
   *
   * Fetches guest data from the authentication service, then attempts to sign in with the provided email and password.
   * If the sign-in is successful, navigates to the main page.
   */
  async guestLogin() {
    const guestData = await this.auth.fetchGuestData();
    if (guestData) {
      try {
        await this.auth.signIn(guestData.email, guestData.password);
        this.router.navigate(['/main']);
      } catch (error) {
      }
    }
  }


  /**
   * Handles user login via Google authentication.
   *
   * Signs in the user using Google authentication, transforms the sign-in data, updates the Firestore user and channel
   * documents, and navigates to the main page.
   */
  async googleLogin() {
    try {
      const result = await this.auth.signInWithGoogle();
      const transformedData = this.transformGoogleSignInData(result);
      const userRef = doc(this.firestore, "user", result.user.uid);
      const channelRef = doc(this.firestore, 'channel', this.developerChannelId);
      await updateDoc(channelRef, {
        member: arrayUnion({ id: transformedData.userId, name: transformedData.name })
      })
      await setDoc(userRef, transformedData);
      this.router.navigate(['/main']);
    } catch (error) {
    }
  }


  /**
* Transforms the data obtained from Google Sign-In into a format suitable for storing in the database.
* 
* @param {any} result - The result object obtained from Google Sign-In.
* @returns {object} An object containing the transformed user data.
*/
  transformGoogleSignInData(result: any) {
    return {
      email: result.user.email ? result.user.email : "Keine E-Mail",
      name: result.user.displayName ? result.user.displayName : "Unbekannt",
      userId: result.user.uid,
      avatar: result.user.photoURL ? result.user.photoURL : 'https://firebasestorage.googleapis.com/v0/b/mydabubble-c6be2.appspot.com/o/avatar_default.svg?alt=media&token=d301fcae-9a4e-47b9-8b31-d5f5cceaf8ea'
    };
  }
}