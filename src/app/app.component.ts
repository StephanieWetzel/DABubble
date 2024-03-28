import { Component, ViewChild, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';


import { LoginComponent } from './login/login.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,
    RouterLink,
    LoginComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'DA-Bubble';
  
}