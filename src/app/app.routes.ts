import { Routes } from '@angular/router';
import { LoginComponent } from './registration/login/login.component';
import { RegisterComponent } from './registration/register/register.component';
import { ResetPasswordComponent } from './registration/reset-password/reset-password.component';
import { ChooseAvatarComponent } from './registration/register/choose-avatar/choose-avatar.component';
import { MainContentComponent } from './main-content/main-content.component';
import { ImprintComponent } from './legal-docs/imprint/imprint.component';
import { PPolicyComponent } from './legal-docs/p-policy/p-policy.component';
import { NewPasswordComponent } from './registration/reset-password/new-password/new-password.component';

export const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'main', component: MainContentComponent },
    { path: 'registration', component: RegisterComponent },
    { path: 'resetPassword', component: ResetPasswordComponent },
    { path: 'newPassword', component: NewPasswordComponent },
    { path: 'chooseAvatar/:id', component: ChooseAvatarComponent },
    { path: 'imprint', component: ImprintComponent },
    { path: 'privacyPolicy', component: PPolicyComponent },
    { path: '**', redirectTo: '' }
];
