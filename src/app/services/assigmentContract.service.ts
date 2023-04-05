import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthTokenService} from './auth-token.service';
import {TranslateService} from '@ngx-translate/core';
import {Globals} from '../extranet/globals';
import {MatDialog} from '@angular/material/dialog';
import {NgxSpinnerService} from 'ngx-spinner';
import {BreakpointObserver} from '@angular/cdk/layout';
import {ServiceGenericErrorService} from './service-generic-error.service';
import {environment} from '../../environments/environment';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class AssigmentContractService {
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
    return this.environment.api.url;
  }

  getAssigmentContract(id): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: navigator.language,
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + `/assigment-contracts/${id}`;
    return this.http.get<any>(url, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado get assigment-contracts()')),
      catchError(this.serviceGenericError.handleError<any>('Error en getAssigmentContract()'))
    );
  }

  getAssigmentContractFormUri(clientId) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      Language: navigator.language,
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    const vistaCaptador = 0;
    const entidadId = 2;
    const url = this.getApiBaseUrl() + `/assignment-contract-endpoint/${clientId}/${entidadId}/${vistaCaptador}`;
    return this.http.get(url, {headers, responseType: 'text'}).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado get assigment-contracts()')),
      catchError(this.serviceGenericError.handleError<any>('Error en getAssigmentContract()')));

  }
}
