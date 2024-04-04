import { CommonModule, NgIf, NgClass, NgStyle } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
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
import { RouterLink } from '@angular/router';
//import { getAuth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, addDoc, collection, doc, setDoc } from '@angular/fire/firestore';
import { AuthenticationService } from '../../../services/authentication.service';
import { User } from '../../../assets/models/user.class';
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

  formData: FormGroup = this.fbuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  isMailFocused: boolean = false;
  isPasswordFocused: boolean = false;

  // introPlayed: boolean = false;


  constructor(
    private fbuilder: FormBuilder,
    public authService: AuthenticationService
  ) {

    // this.introPlayed = true;
  }


  async login() {
    if (this.formData.valid) {
      const email = this.formData.value.email;
      const password = this.formData.value.password;
      try {
        await this.authService.login(email, password).then((userCredential) => {
          console.log('Sign up success');
          const user = userCredential.user;
          console.log(user.uid)
        });
      } catch (error) {
        console.error(error);
      }
    }
  }


  // @HostListener('window:beforeunload', ['$event'])
  // beforeUnloadHandler(event: any) {

  //   setTimeout(() => {
  //     this.introPlayed = false;
  //   }, 4000);
  // }


}
