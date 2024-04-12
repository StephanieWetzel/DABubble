import { CommonModule, NgIf, NgClass, NgStyle } from '@angular/common';
import { Component, inject } from '@angular/core';
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
import { Firestore, addDoc, collection, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { User } from '../../../assets/models/user.class';
import { getAuth } from '@angular/fire/auth';
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
    RouterLink,
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

  formData: FormGroup = this.fbuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  isMailFocused: boolean = false;
  isPasswordFocused: boolean = false;


  constructor(
    private fbuilder: FormBuilder,
    private auth: AuthenticationService,
    private router: Router
  ) { }


  async login() {
    if (this.formData.valid) {
      const email = this.formData.value.email;
      const password = this.formData.value.password;
      try {
        await this.auth.signIn(email, password).then((userCredential) => {
          console.log('Sign up success');
          const user = userCredential.user;
          console.log(user.uid);
          this.router.navigate(['/main']);
        });
      } catch (error) {
        console.error(error);
      }
    }
  }


  async guestLogin() {
    try {
      const userCredential = await this.auth.signInAnonymously();
      const credUser = userCredential.user;
      this.user.name = credUser.displayName ? credUser.displayName : "Gast";
      this.user.userId = credUser.uid
      this.user.email = credUser.email ? credUser.email : "Keine E-Mail";
      this.user.avatar = 'https://firebasestorage.googleapis.com/v0/b/dabubble-172c7.appspot.com/o/avatar_default.svg?alt=media&token=eeb62c9a-4de5-4061-a61c-09d125cc27c4';
      this.auth.currentUser = this.user;
      this.saveUserToLocal(this.auth.currentUser);
      await this.auth.ensureDocumentExistsInFirebase(credUser.uid, this.user);
      this.router.navigate(['/main']);
      console.log(this.auth.currentUser);
    } catch (error) {
      console.error(error);
    }
  }


  // async ensureGuestDocumentExists(userId: string, user: User) {
  //   const userDocRef = doc(this.firestore, 'user', userId);
  //   const docSnap = await getDoc(userDocRef);
  //   if (!docSnap.exists()) {
  //     await setDoc(userDocRef, {
  //       name: user.name,
  //       email: user.email,
  //       avatar: user.avatar
  //     });
  //   }
  // }


  async googleLogin() {
    if (!this.auth.currentUser) { // if user isn´t logged in yet, login
      try {
        // await this.auth.ensureDocumentExistsInFirebase(this.auth.currentUser.uid, this.user);
        await this.auth.signInWithGoogle().then((result) => {
          this.auth.currentUser = result.user;
          this.user.email = result.user.email ? result.user.email : "Keine E-Mail";
          this.user.name = result.user.displayName ? result.user.displayName : "Unbekannt";
          this.user.userId = result.user.uid;
          this.user.avatar = result.user.photoURL ? result.user.photoURL : 'https://firebasestorage.googleapis.com/v0/b/dabubble-7d65b.appspot.com/o/profilImg.svg?alt=media&token=ac23c639-088b-4347-aa3e-83e0967d382c';
          this.saveUserToLocal(this.auth.currentUser);
          this.router.navigate(['/main']);
        }).catch((error) => {
          console.log(error)
        });
      } catch (error) {
        console.error(error);
      }
    } else {
      console.log('Benutzer ist bereits angemeldet.');
    }
  }


  saveUserToLocal(user: any) {
    const userAsString = JSON.stringify(user);
    localStorage.setItem('dabubble/user', userAsString);
  }



}
