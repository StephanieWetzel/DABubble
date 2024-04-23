import { CommonModule, NgIf, NgClass, NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MatInputModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatIconModule, MatButtonModule, NgIf, NgClass, NgStyle, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})

export class LoginComponent {
  formData: FormGroup = this.fbuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  isMailFocused: boolean = false;
  isPasswordFocused: boolean = false;


  constructor(private fbuilder: FormBuilder) {

  }
}
