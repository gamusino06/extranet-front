import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InformacionGeneralComponent } from './informacionGeneral/informacionGeneral.component';
import { WelcomePackRoutesRoutesModule } from './welcomePackRouting.module';
import { HeaderWpComponent } from './headerWp/headerWp.component';
import { FooterWpComponent } from './footerWp/footerWp.component';
import { TusCentrosComponent } from './tusCentros/tusCentros.component';
import { WelcomePackComponent } from './welcomePack/welcomePack.component';
import { TusDocumentosComponent } from './tusDocumentos/tusDocumentos.component';
import { TusProfesionalesComponent } from './tusProfesionales/tusProfesionales.component';
import { TusPromocionesComponent } from './tusPromociones/tusPromociones.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxPageScrollModule } from 'ngx-page-scroll';
import { NgxPageScrollCoreModule } from 'ngx-page-scroll-core';
import { NgxScrollTopModule } from 'ngx-scrolltop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgmCoreModule } from '@agm/core';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ModalesModule } from '../modales/modales.module';
import { ExtranetModule } from '../extranet/extranet.module';

import { Translate } from '../translate.module';

@NgModule({
  imports: [
    CommonModule,
    WelcomePackRoutesRoutesModule,
    NgxSpinnerModule,
    NgxPageScrollModule,
    NgxPageScrollCoreModule,
    NgxScrollTopModule,
    MatFormFieldModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    MatCardModule,
    MatCheckboxModule,
    MatTabsModule,
    MatTooltipModule,
    FormsModule,
    ReactiveFormsModule,
    PdfViewerModule,
    CKEditorModule,
    ModalesModule,
    ExtranetModule,
    Translate,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAZTknc0ZIuzAEKheoPurMlx7uWuTt2uP0'
    })
  ],
  declarations: [
    WelcomePackComponent,
    InformacionGeneralComponent,
    HeaderWpComponent,
    FooterWpComponent,
    TusCentrosComponent,
    TusDocumentosComponent,
    TusProfesionalesComponent,
    TusPromocionesComponent,

  ]
})
export class WelcomePackModule { }
