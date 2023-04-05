import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { InformacionGeneralComponent } from './informacionGeneral/informacionGeneral.component';
import { TusCentrosComponent } from './tusCentros/tusCentros.component';
import { WelcomePackComponent } from './welcomePack/welcomePack.component';
import { TusDocumentosComponent } from './tusDocumentos/tusDocumentos.component';
import { TusProfesionalesComponent } from './tusProfesionales/tusProfesionales.component';
import { TusPromocionesComponent } from './tusPromociones/tusPromociones.component';

const welcome_routes: Routes = [
  {
    path:'welcomepack', component: WelcomePackComponent, 
    children: [
      {
        path: 'informaciongeneral', component: InformacionGeneralComponent
      },
      {
        path: 'centros', component: TusCentrosComponent
      },
      {
        path:'documentos', component: TusDocumentosComponent
      },
      {
        path: 'profesionales', component: TusProfesionalesComponent
      },
      {
        path: 'promociones', component: TusPromocionesComponent
      }

    ]
    },
];

@NgModule({
  imports: [RouterModule.forChild(welcome_routes)],
  exports: [RouterModule]
})

export class WelcomePackRoutesRoutesModule { }
