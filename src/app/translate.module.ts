import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {TranslateModule, TranslateLoader, TranslateService} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http);
  }
@NgModule({
imports: [
    TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
            useFactory: createTranslateLoader,
            deps: [HttpClient]
        },
        isolate: false
      })
],
  exports: [
    CommonModule,
    TranslateModule,
  ]
})

export class Translate {

    constructor(translate: TranslateService) {
        translate.addLangs(['es-ES', 'en-GB', 'es-EU', 'es-CA'])
        translate.setDefaultLang('es-ES');
        translate.use('es-ES');
      }

 }
