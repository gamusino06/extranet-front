import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { TranslateService } from '@ngx-translate/core';
import { Globals } from '../extranet/globals';

import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import { HistoricoAccionesDocumentoComponent } from 'src/app/modales/historicoAccionesDocumento/historicoAccionesDocumento.component';

import { TABLE } from '../mocks/table-value-mock';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Formulario } from '../Model/Formulario/Formulario';

import { AuthTokenService } from './auth-token.service';
import { ServiceGenericErrorService } from './service-generic-error.service';

import { environment } from '../../environments/environment';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { BreakpointObserver } from '@angular/cdk/layout';
import * as XLSX from "xlsx";
import * as _moment from "moment/moment";
import {ShareDocumentComponent} from "../modales/shareDocument/shareDocument.component"; // Para media querys en TS

const moment =  _moment;

@Injectable({
  providedIn: 'root'
})

export class ReportsService {
  /*baseUrl = '/services/login/getUserData';*/ //Ejemplo de path con ruta.
  baseUrl = '/getUserData';
  apiToken = 'INVALIDTOKEN';
  environment = environment;

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      Language: navigator.language,
      Authorization: 'Bearer ' + localStorage.getItem('token')
    })
  };

  constructor(
    private authTokenService: AuthTokenService,
    private http: HttpClient,
    public translate: TranslateService,
    private globals: Globals,
    public dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private breakpointObserver: BreakpointObserver,
    private serviceGenericError: ServiceGenericErrorService) {
    this.apiToken = localStorage.getItem('token');
  }

  getApiBaseUrl() {
    return environment.api.url;
  }

  /*  getPathDocumentos() {
      return environment.api.pathDocumentos;
    }

     getPathExtranet() {
       return environment.api.pathExtranet;
     }
  */


  setNewReport(data): Observable<any> {
    // debugger;
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: navigator.language,
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/setNewReport';

    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getFile()')),
      catchError(this.serviceGenericError.handleError<any>('Error en getFile()'))
    );
  }

  updateReport(id, data): Observable<any> {
    // debugger;
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: navigator.language,
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + `/updateReport/${id}`;

    return this.http.put<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado updateReport()')),
      catchError(this.serviceGenericError.handleError<any>('Error en updateReport()'))
    );
  }

  deleteNewReport(data): Observable<any> {
    // debugger;
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: navigator.language,
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/deleteNewReport';

    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getFile()')),
      catchError(this.serviceGenericError.handleError<any>('Error en getFile()'))
    );
  }

  /*compartirData*/
  compartirDocumentoIcpt(data, modoDescarga): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: navigator.language,
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };

    const url = `${ this.getApiBaseUrl() }/icpt/${modoDescarga}/compartir`;

    return this.http.post<any>(url, data
      , httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado compartirDocumento()')),
      catchError(this.serviceGenericError.handleError<any>('Error en compartirDocumento()'))
    );
  }

  /*getfile*/
  getFile(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: navigator.language,
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getFile';
    return this.http.post<any>(url, data
      , httpOptions).pipe(
        tap(_ => this.serviceGenericError.log('ejecutado getFile()')),
        catchError(this.serviceGenericError.handleError<any>('Error en getFile()'))
      );
  }

}
