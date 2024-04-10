import { Routes } from '@angular/router';
import { LoginComponent } from './registration/login/login.component';
import { RegisterComponent } from './registration/register/register.component';
import { ResetPasswordComponent } from './registration/reset-password/reset-password.component';
import { ChooseAvatarComponent } from './registration/register/choose-avatar/choose-avatar.component';
import { MainContentComponent } from './main-content/main-content.component';

export const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'main', component: MainContentComponent },
    { path: 'registration', component: RegisterComponent },
    { path: 'resetPassword', component: ResetPasswordComponent },
    { path: 'chooseAvatar/:id', component: ChooseAvatarComponent },
    // { path: 'imprint', component: ... },
    // { path: 'privacyPolicy', component: ... },
    { path: '**', redirectTo: '' }
];
