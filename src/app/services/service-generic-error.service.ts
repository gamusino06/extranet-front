import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import Swal from 'sweetalert2';
import { Globals } from '../extranet/globals';
import { environment } from '../../environments/environment';
import jwt_decode from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class ServiceGenericErrorService {
  environment = environment;

  constructor(private router: Router,
    private globals: Globals,
    private translate: TranslateService) { }
  /** Log a TokenService message  */
  log(message: string) {
    if (environment.debug) console.log(message);
  }
  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      //se debe solucionar el tema del countnotread para poder usar correctamente el manejador de errores
      if (error.status != '403') {
         console.error(error.error?.message); // log to console instead
         if (error.error?.message != null) {
           let response_error = error.error.message;

           Swal.fire({
             icon: 'error',
             title: response_error,
             confirmButtonColor: 'var(--blue)',
             allowOutsideClick: false
           }).then((result) => {
             /*if (result.isConfirmed) {
               this.router.navigate([this.globals.login_url]);
             }*/
           })
        //this.router.navigate([this.globals.login_url]);
        } else {
            let errorGenerico = "Se ha producido un error, por favor vuelva a intentarlo más tarde";
            this.translate.get('ERROR_GENERICO').subscribe((res: string) => {
                errorGenerico = res;
            });
            let errorTokenCaducado = "Su sesión ha caducado, vuelva a iniciar sesión";
            this.translate.get('ERROR_TOKEN_CADUCADO').subscribe((res: string) => {
                errorTokenCaducado = res;
            });

            let token = localStorage.getItem('token');
            let tokenDecoded:any = jwt_decode(token);
            let timestampExpired:number = tokenDecoded.exp; //En segundos
            let timestampAhora:number = Math.floor(new Date().getTime() / 1000); //En segundos

            let errorMensaje = (timestampExpired < timestampAhora) ? errorTokenCaducado : errorGenerico;
            Swal.fire({
               icon: 'error',
               title: errorMensaje,
               confirmButtonColor: 'var(--blue)',
               allowOutsideClick: false
            }).then((result) => {
                if (result.isConfirmed) {
                   this.router.navigate([this.globals.login_url]);
                }
            })
        }
      }

      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  handleErrorTest<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error); // log to console instead
      Swal.fire({
        icon: 'error',
        title: error.error.message,
        confirmButtonColor: 'var(--blue)',
        allowOutsideClick: false
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate([this.globals.login_url]);
        }
      })
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

}
