import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
} from '@angular/forms';
import { getAuth, sendPasswordResetEmail } from '@angular/fire/auth';
import { trigger, transition, animate, style } from '@angular/animations';
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
  styleUrl: './reset-password.component.scss',
  animations: [
    trigger('slideInFromRight', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('500ms ease-out', style({ transform: 'translateX(0)' })),
      ])
    ])
  ]
})

export class ResetPasswordComponent {
  formData: FormGroup = this.fbuilder.group({
    email: ['', [Validators.required, Validators.email]]
  })

  isMailFocused: boolean = false;
  isHovered: boolean = false;
  showOverlay: boolean = false;

  containerWidth: number;
  containerHeight: number;


  constructor(
    private fbuilder: FormBuilder,
    private router: Router
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
 * Sends a password reset email to the provided email address.
 * 
 * @returns {Promise<void>} A promise that resolves when the password reset email is sent successfully.
 */
  async sendLinkAndNavigateToLogin() {
    const auth = getAuth();
    const email = this.formData.value.email;

    try {
      await sendPasswordResetEmail(auth, email);
      this.showOverlay = true;
      setTimeout(() => {
        this.router.navigate(['']);
      }, 2000);
    } catch (error) {
    }
  }


}
