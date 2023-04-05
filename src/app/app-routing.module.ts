import { NgModule } from '@angular/core';
import { Routes, RouterModule,ActivatedRoute} from '@angular/router';
import { LoginComponent } from 'src/app/login/login.component';
import { LoginSimuladoComponent } from 'src/app/login-simulado/login-simulado.component';
import { LoginAppComponent } from 'src/app/login-app/login-app.component';
import { MessageCenterComponent } from './extranet/message-center/message-center.component';
import { AppComponent } from './app.component';
import { ExtranetComponent } from './extranet/extranet.component';
import { NewPasswordComponent } from './new-password/new-password.component';
import { Primera_passwordComponent } from './primera_password/primera_password.component';
import {JuridicoComponent} from './extranet/juridico/juridico.component';



const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'login-simulado', component: LoginSimuladoComponent },
  { path: 'login-app', component: LoginAppComponent },
  { path: 'welcomepack', component: AppComponent },
  { path: 'message-center', component: MessageCenterComponent },
  { path: 'extranet', component: ExtranetComponent},
  { path: 'cambio-password', component: NewPasswordComponent},
  { path: 'primera-password', component: Primera_passwordComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})

export class AppRoutingModule {

}
