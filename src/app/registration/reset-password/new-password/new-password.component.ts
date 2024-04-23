import { Component, HostListener } from '@angular/core';
import { trigger, transition, animate, style } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
} from '@angular/forms';
import { AuthenticationService } from '../../../../assets/services/authentication.service';


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

  newPassword: string = this.formData.value.confirmPassword;


  constructor(
    private fbuilder: FormBuilder,
    private router: Router,
    public auth: AuthenticationService
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


  passwordsMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }


  showOverlayAndNavigateToLogin() {
    this.showOverlay = true;
    setTimeout(() => {
      this.router.navigate(['']);
    }, 2000);
  }


  // async changePasswordAndNavigateToLogin() {
  //   try {
  //     const user = this.auth.currentUser;
  //     console.log(user)
  //     if (user) {
  //       await user.updatePassword(this.newPassword);
  //       console.log('Passwort erfolgreich geändert.');
  //       this.showOverlay = true;
  //       setTimeout(() => {
  //         this.router.navigate(['']);
  //       }, 2000);
  //     } else {
  //       console.error('Kein angemeldeter Benutzer gefunden.');
  //     }
  //   } catch (error) {
  //     console.error('Fehler beim Ändern des Passworts:', error);
  //   }
  // }




}
