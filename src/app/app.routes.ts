import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

export const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'registration', component: RegisterComponent },
    { path: 'resetPassword', component: ResetPasswordComponent },
    { path: '**', redirectTo: '' }
];
