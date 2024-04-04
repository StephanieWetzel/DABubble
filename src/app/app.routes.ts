import { Routes } from '@angular/router';
import { LoginComponent } from './registration/login/login.component';
import { RegisterComponent } from './registration/register/register.component';
import { ResetPasswordComponent } from './registration/reset-password/reset-password.component';

export const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'registration', component: RegisterComponent },
    { path: 'resetPassword', component: ResetPasswordComponent },
    // { path: 'imprint', component: ... },
    // { path: 'privacyPolicy', component: ... },
    { path: '**', redirectTo: '' }
];
