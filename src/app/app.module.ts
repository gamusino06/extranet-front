import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { LoginSimuladoComponent } from './login-simulado/login-simulado.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { LoginAppComponent } from './login-app/login-app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatGridListModule } from '@angular/material/grid-list';

/*librerias importadas*/
import {DragDropModule} from '@angular/cdk/drag-drop';

import { MessageCenterComponent } from './extranet/message-center/message-center.component';
import { WelcomePackModule } from './welcomePack/welcomePack.module';
import { ExtranetModule } from './extranet/extranet.module';
import { ModalesModule } from './modales/modales.module';
import { MatMenuModule } from '@angular/material/menu';
import { NewPasswordComponent } from './new-password/new-password.component';
import { MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';

import { NgxSpinnerModule } from 'ngx-spinner';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Primera_passwordComponent } from './primera_password/primera_password.component';
import { AgmCoreModule } from '@agm/core';
import { MatCardModule } from '@angular/material/card';
import { NgxPageScrollModule } from 'ngx-page-scroll';
import { NgxPageScrollCoreModule } from 'ngx-page-scroll-core';
import { NgxScrollTopModule } from 'ngx-scrolltop';
import { Translate } from './translate.module';
import { OffersService } from './services/offers.service';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { ModalDocumentacionComponent } from './modales/modal-documentacion/modal-documentacion.component';
import {MatButtonModule} from "@angular/material/button";
import {MAT_MOMENT_DATE_ADAPTER_OPTIONS, MatMomentDateModule} from "@angular/material-moment-adapter";
import {MatTooltipModule} from '@angular/material/tooltip';
import { SharedModule } from "./shared/shared.module";


@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        LoginSimuladoComponent,
        HeaderComponent,
        FooterComponent,
        LoginAppComponent,
        MessageCenterComponent,
        NewPasswordComponent,
        Primera_passwordComponent,
        ModalDocumentacionComponent
    ],
    providers: [
        OffersService,
        { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
        { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: false } },
        { provide: MAT_DATE_LOCALE, useValue: 'es-Es' },
    ],
    bootstrap: [AppComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        WelcomePackModule,
        ExtranetModule,
        ModalesModule,
        MatSortModule,
        MatTableModule,
        MatPaginatorModule,
        MatCheckboxModule,
        MatExpansionModule,
        MatSelectModule,
        MatDatepickerModule,
        MatMomentDateModule,
        MatNativeDateModule,
        MatInputModule,
        MatProgressBarModule,
        MatListModule,
        MatIconModule,
        MatMenuModule,
        MatDialogModule,
        MatCardModule,
        MatTabsModule,
        MatGridListModule,
        DragDropModule,
        NgxSpinnerModule,
        NgxPageScrollModule,
        NgxPageScrollCoreModule,
        NgxScrollTopModule,
        FontAwesomeModule,
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyAZTknc0ZIuzAEKheoPurMlx7uWuTt2uP0'
        }),
        Translate,
        MatButtonModule,
        MatTooltipModule,
        SharedModule
    ]
})
export class AppModule { }
