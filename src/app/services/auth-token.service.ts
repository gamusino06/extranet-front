import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { TranslateService } from '@ngx-translate/core';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Login } from '../Model/Login';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { ErrorLoginComponent } from '../modales/error-login/error-login.component';


@Injectable({
  providedIn: 'root'
})
export class AuthTokenService {
  baseUrl = 'http://localhost:8080';
  apiToken = 'INVALIDTOKEN';
  environment = environment;

  private header = new HttpHeaders();
  private miLenguaje= 'es-Ru';
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json',
                               'Access-Control-Allow-Origin': '*' ,
                               Language: navigator.language,
                               Authorization: 'Bearer ' + localStorage.getItem('token')})
  };

  constructor(private http: HttpClient,
              private translate: TranslateService,
              public modalErrorLogin: MatDialog,
              ) {

  }

  getApiBaseUrl() {
    //return 'http://localhost:8080';
    this.baseUrl= environment.api.url;
    return environment.api.url;
  }


  getToken(data) {
    let httpOptions2 = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json',
                                 'Access-Control-Allow-Origin': '*' ,
                                 Language: navigator.language,
                                 Authorization: 'Bearer ' + localStorage.getItem('token')})
    };
    const url = this.getApiBaseUrl() + '/login';
    return this.http.post<any>(url,data,httpOptions2).pipe(
      tap(_ => this.log('adquiridoToken')),
      catchError(this.handleError<any>('error al procesar el token'))
    );
  }

  /** Log a TokenService message  */
  private log(message: string) {
    if (environment.debug) console.log(message);
  }
  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error); // log to console instead

      let errorGenerico = "Se ha producido un error, por favor vuelva a intentarlo más tarde";
      this.translate.get('ERROR_GENERICO').subscribe((res: string) => {
          errorGenerico = res;
      });

      if (error.error.message==null || error.error.message=='')
          error.error.message = errorGenerico;

      /*
      Swal.fire({
        icon: 'error',
        titleText: error.error.message,
        confirmButtonColor: 'var(--blue)',
        allowOutsideClick: false
      })*/

      this.modalErrorLogin.open(ErrorLoginComponent,{
          height: '300px',
          width: '500px',
          data: {
            error: error.error.message
          }
      })

      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

}
