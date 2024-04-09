import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
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
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { AuthenticationService } from '../authentication.service';

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
  firestore: Firestore = inject(Firestore)

  formData: FormGroup = this.fbuilder.group({
    name: ['', [Validators.required, this.fullNameValidator()]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    checkbox: [false, Validators.requiredTrue]
  })

  isNameFocused: boolean = false;
  isMailFocused: boolean = false;
  isPasswordFocused: boolean = false;
  isHovered: boolean = false;

  constructor(
    private fbuilder: FormBuilder,
    private authService: AuthenticationService) {

  }


  fullNameValidator() {
    return (control: AbstractControl): { [key: string]: any } | null => { // parameter is either an error-object or null (null = full name is given = no error)
      const value: string = control.value;
      if (!value) {
        return { 'required': true }; // required error is shown
      }

      const fullName: string[] = value.trim().split(' '); // array that contains first and last name
      if (fullName.length < 2) {
        return { 'fullName': true }; // fullName error is shown (field contains only one value, but needs two)
      }

      return null; // no error (fullName is given)
    };
  }


  async signUp() {
    if (this.formData.valid) {
      try {
        await this.authService.signUp(this.formData.value.email, this.formData.value.password).then((userCredential) => {
          const userAuth = userCredential.user;
          const vari = this.transformSignUpData(this.formData, userAuth.uid)
          const user = new User(vari);
          const userRef = doc(this.firestore, "user", userAuth.uid);
          console.log(user)
          setDoc(userRef, user.toJSON());
          console.log('user signed up :D')
        })
      } catch (error) {
        console.error(error);
      }
    }
  }

  transformSignUpData(formData:any, userId: string) {
    return {
      name: formData.value.name,
      userId: userId,
      email: formData.value.email,
      state: "true",
      avatar: "",
      password: this.formData.value.password
    }
  }
}
