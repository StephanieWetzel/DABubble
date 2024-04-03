import { Component } from '@angular/core';
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
    password: ['', [Validators.required]],
    checkbox: [false, Validators.requiredTrue]
  })

  isNameFocused: boolean = false;
  isMailFocused: boolean = false;
  isPasswordFocused: boolean = false;
  isHovered: boolean = false;

  constructor(private fbuilder: FormBuilder,) {

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

}
