import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
} from '@angular/forms';
import { getAuth, sendPasswordResetEmail } from '@angular/fire/auth';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  formData: FormGroup = this.fbuilder.group({
    email: ['', [Validators.required, Validators.email]]
  })

  isMailFocused: boolean = false;
  isHovered: boolean = false;

  email: string = this.formData.value.email;
  auth = getAuth();




  constructor(private fbuilder: FormBuilder,) {
    sendPasswordResetEmail(this.auth, this.email)
      .then(() => {
        // Password reset email sent!

        alert("email sent");
      })
      .catch((error) => {
        const errorCode = error.code;
      })



  }


  // const actionCodeSettings = {
  //   // URL you want to redirect back to. The domain (www.example.com) for
  //   // this URL must be whitelisted in the Firebase Console.
  //   url: 'https://www.example.com/checkout?cartId=1234',
  //   // This must be true for email link sign-in.
  //   handleCodeInApp: true,
  //   iOS: {
  //     bundleId: 'com.example.ios',
  //   },
  //   android: {
  //     packageName: 'com.example.android',
  //     installApp: true,
  //     minimumVersion: '12',
  //   },
  //   // FDL custom domain.
  //   dynamicLinkDomain: 'coolapp.page.link',
  // };
}
