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
  }


  async resetPassword() {
    const email = this.formData.value.email;

    try {
      await sendPasswordResetEmail(getAuth(), email);
      alert('Password reset email sent!');
    } catch (error: any) {
      const errorMessage = error.message;
      alert(errorMessage);
    }
  }


}
