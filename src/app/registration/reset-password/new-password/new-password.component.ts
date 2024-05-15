import { Component, HostListener, inject } from '@angular/core';
import { trigger, transition, animate, style } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
} from '@angular/forms';
import { Auth, confirmPasswordReset } from '@angular/fire/auth';

@Component({
  selector: 'app-new-password',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule],
  templateUrl: './new-password.component.html',
  styleUrl: './new-password.component.scss',

  animations: [
    trigger('slideInFromRight', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('500ms ease-out', style({ transform: 'translateX(0)' })),
      ])
    ])
  ]
})

export class NewPasswordComponent {
  formData: FormGroup = this.fbuilder.group({
    password: ['', [Validators.required]],
    confirmPassword: ['', [Validators.required]]
  }, { validator: this.passwordsMatchValidator });

  showOverlay: boolean = false;
  isHovered: boolean = false;
  isPasswordFocused: boolean = false;

  containerWidth: number;
  containerHeight: number;

  private auth = inject(Auth);
  private oobCode: string;
  private route = inject(ActivatedRoute);


  constructor(
    private fbuilder: FormBuilder,
    private router: Router
  ) {
    this.containerWidth = window.innerWidth;
    this.containerHeight = window.innerHeight;

    this.oobCode = this.route.snapshot.queryParams['oobCode'];
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
 * Validator function to check if the password and confirm password fields match.
 * 
 * @param formGroup - The form group containing the password and confirm password fields.
 * @returns Returns null if the password and confirm password fields match, otherwise returns an object with a `passwordMismatch` property.
 */
  passwordsMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }


  /**
 * Resets the password using the provided one-time code (oobCode) and navigates to the login page upon success.
 * 
 * @param auth - The authentication service instance.
 * @param oobCode - The one-time code received in the password reset email.
 * @param newPassword - The new password to set.
 * @returns {Promise<void>} A promise that resolves when the password is successfully reset.
 */
  async changePasswordAndNavigateToLogin() {
    try {
      await confirmPasswordReset(this.auth, this.oobCode, this.formData.value.confirmPassword);
      this.showOverlay = true;
      setTimeout(() => {
        this.router.navigate(['']);
      }, 2000);
    } catch (error) {
    }
  }


}
