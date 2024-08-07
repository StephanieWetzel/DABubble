import { Component, HostListener } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  AbstractControl,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../../../assets/models/user.class';
import { Firestore, arrayUnion, doc, setDoc, updateDoc } from '@angular/fire/firestore';
import { AuthenticationService } from '../../../assets/services/authentication.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  formData: FormGroup = this.fbuilder.group({
    name: ['', [Validators.required, this.fullNameValidator()]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    checkbox: [false, Validators.requiredTrue]
  })

  isNameFocused: boolean = false;
  isMailFocused: boolean = false;
  isPasswordFocused: boolean = false;
  isHovered: boolean = false;
  developerChannelId: string = 'Gv0iivQSIwEPIJrroQyt';

  containerWidth: number;
  containerHeight: number;

  constructor(
    private fbuilder: FormBuilder,
    public auth: AuthenticationService,
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
   * Validator to check if a full name is provided.
   * 
   * Ensures the input is not empty and contains at least two words.
   *
   */
  fullNameValidator() {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value: string = control.value;
      if (!value) {
        return { 'required': true };
      }

      const fullName: string[] = value.trim().split(' ');
      if (fullName.length < 2) {
        return { 'fullName': true }
      }

      return null;
    };
  }


  /**
 * Pushes user data to Firebase if the form data is valid.
 */
  async pushUserDataToFirebase() {
    if (this.formData.valid) {
      try {
        await this.auth.signUp(this.formData.value.email, this.formData.value.password).then((userCredential) => {
          const userAuth = userCredential.user;
          const transformedData = this.transformSignUpData(this.formData, userAuth.uid)
          const user = new User(transformedData);
          const userRef = doc(this.firestore, "user", userAuth.uid);
          const channelRef = doc(this.firestore, 'channel', this.developerChannelId);
          updateDoc(channelRef, {
            member: arrayUnion({ id: user.userId, name: user.name })
          })
          setDoc(userRef, user.toJSON());
          this.router.navigate(['/chooseAvatar/' + userAuth.uid]);
        })
      } catch (error) {
      }
    }
  }


  /**
 * Transforms the sign-up form data and user ID into a format suitable for storing in the database.
 * 
 * @param formData - The sign-up form data.
 * @param userId - The ID of the user.
 */
  transformSignUpData(formData: any, userId: string) {
    return {
      name: this.formData.value.name,
      userId: userId,
      email: this.formData.value.email,
      state: 'true',
      avatar: '',
      password: this.formData.value.password
    }
  }
}