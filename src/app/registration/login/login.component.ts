import { CommonModule, NgIf, NgClass, NgStyle } from '@angular/common';
import { Component, inject, HostListener } from '@angular/core';
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
import { Firestore, arrayUnion, doc, setDoc, updateDoc } from '@angular/fire/firestore';
import { User } from '../../../assets/models/user.class';
import { AuthenticationService } from '../../../assets/services/authentication.service';
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
  firestore: Firestore = inject(Firestore)
  user: User = new User;
  email: string = '';
  password: string = '';
  guestUser: User = new User;
  developerChannelId: string = 'pSBwciqiaOgtUayZaIgj'

  formData: FormGroup = this.fbuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  isMailFocused: boolean = false;
  isPasswordFocused: boolean = false;

  containerWidth: number;


  constructor(
    private fbuilder: FormBuilder,
    private auth: AuthenticationService,
    private router: Router
  ) {
    this.containerWidth = window.innerWidth;
  }


  /**
 * Updates the container width on window resize.
 * @param event - The event object for the resize event.
 */
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.containerWidth = event.target.innerWidth;
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
        await this.auth.signIn(email, password).then((userCredential) => {
          const user = userCredential.user;
          this.router.navigate(['/main']);
        });
      } catch (error) {
      }
    }
  }


  /**
 * Attempts to log in a guest user using fetched guest data.
 * If guest data is available, it tries to sign in the user using the retrieved email and password.
 * If the sign-in is successful, it navigates the user to the main page.
 * @returns {Promise<void>} A promise that resolves when the login process is completed.
 * @throws {Error} An error that occurs if the login process fails.
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
 * Attempts to log in the user using Google authentication.
 * If the sign-in is successful, it retrieves user data, transforms it, and stores it in the Firestore database.
 * Finally, it navigates the user to the main page.
 * @returns {Promise<void>} A promise that resolves when the login process is completed.
 * @throws {Error} An error that occurs if the login process fails.
 */
  async googleLogin() {
    try {
      const result = await this.auth.signInWithGoogle();
      const transformedData = this.transformGoogleSignInData(result);
      const userRef = doc(this.firestore, "user", result.user.uid);
      const channelRef = doc(this.firestore, 'channel', this.developerChannelId);
      await updateDoc(channelRef, {
        member: arrayUnion({ id: transformedData.userId, name: transformedData.name})
      })
      await setDoc(userRef, transformedData);
      this.router.navigate(['/main']);
    } catch (error) {
    }
  }


  /**
 * Transforms the user data obtained after a successful Google sign-in.
 * @param {any} result - The result object containing user data.
 * @returns {Object} An object containing transformed user data, including email, name, user ID, and avatar URL.
 */
  transformGoogleSignInData(result: any) {
    return {
      email: result.user.email ? result.user.email : "Keine E-Mail",
      name: result.user.displayName ? result.user.displayName : "Unbekannt",
      userId: result.user.uid,
      avatar: result.user.photoURL ? result.user.photoURL : 'https://firebasestorage.googleapis.com/v0/b/dabubble-172c7.appspot.com/o/avatar_default.svg?alt=media&token=74962018-533b-4c83-9ceb-8cbca7eb603a'
    };
  }


}
