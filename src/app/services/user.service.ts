import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { User } from '../Model/User';
import { Table } from '../Model/Table/Table';
import { Centro } from '../Model/Centro';
import { Empresa } from '../Model/Empresa';


import { TABLE } from '../mocks/table-value-mock';


import { Observable, of } from 'rxjs';
import { catchError, delay, finalize, map, tap } from 'rxjs/operators';
import { Formulario } from '../Model/Formulario/Formulario';

import { AuthTokenService } from './auth-token.service';
import { ServiceGenericErrorService } from './service-generic-error.service';

import { environment } from '../../environments/environment';
import { Globals } from '../extranet/globals'
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import {JsonObject} from '@angular/compiler-cli/ngcc/src/packages/entry_point';
import {zhCN} from 'date-fns/locale';
@Injectable({
  providedIn: 'root'
})

export class UserService {
  /*baseUrl = '/services/login/getUserData';*/ //Ejemplo de path con ruta.
  baseUrl = '/getUserData';
  apiToken = 'INVALIDTOKEN';
  environment = environment;

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      Language: this.getLang(),
      Authorization: 'Bearer ' + localStorage.getItem('token')
    })
  };

  constructor(
    private globals: Globals,
    private router: Router,
    private authTokenService: AuthTokenService,
    private http: HttpClient,
    private serviceGenericError: ServiceGenericErrorService,
    private translate: TranslateService) {
    this.apiToken = localStorage.getItem('token');
  }

  getApiBaseUrl() {
    return environment.api.url;
  }

  /*getPathContactos() {
      return environment.api.pathContactos;
  }

  getPathDocumentos() {
      return environment.api.pathDocumentos;
  }

  getPathExtranet() {
    return environment.api.pathExtranet;
  }

  getPathGdpr() {
    return environment.api.pathGdpr;
  }

  getPathLogin() {
    return environment.api.pathLogin;
  }

  getPathMessages() {
    return environment.api.pathMessages;
  }

  getPathUser() {
    return environment.api.pathUser;
  }*/

  public getLang() {
      let lang = localStorage.getItem("lang");
      if (lang == undefined) {
        lang = this.translate.getDefaultLang();
        localStorage.setItem("lang",lang);
      }
      this.translate.use(lang);
      this.translate.setDefaultLang(lang);

      return lang;
  }

  /*get the full user data information for areas and sections*/
  /*getUserData*/
  getUser(): Observable<any>{
    if (localStorage.getItem("userDataFromUsuario") == null
        || localStorage.getItem("userDataFromUsuario") == undefined
        || localStorage.getItem("userDataFromUsuario") == 'undefined')
    {
      //Si no tenemos el usuario en memoria realizamos la llamada a back y lo guardamos.
      let httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          Language: this.getLang(),
          Authorization: 'Bearer ' + localStorage.getItem('token')
        })
      };
      const url = this.getApiBaseUrl() + '/getUserData';
      let result = this.http.post<any>(url, { user: localStorage.getItem('userData') }, httpOptions).pipe(
        tap(_ => this.serviceGenericError.log('ejecutado getUserData()')),
        finalize(() => {
          //si el usuario no tiene data redirecciona al login
          const user = localStorage.getItem('userData');
          if(user === null){
              this.router.navigate([this.globals.login_url]);
          }
        }),
        catchError(this.serviceGenericError.handleError<User>('Error en getUserData()')),
      );
      return result;
    }else{
      //Si ya tenemos el usuario no hacemos la llamada a back
      //y devolvemos el objeto Observable igual que si llamaramos a back
      //pero obteniendo el usuario que tenemos en el localStorage.
      let user = JSON.parse(localStorage.getItem("userDataFromUsuario"));
      let result:Observable<Response> = of(user).pipe(
          // tap(_ => this.serviceGenericError.log('obteniendo datos del usuario de memoria')),
          finalize(() => {
            //si el usuario no tiene data redirecciona al login
            const user = localStorage.getItem('userData');
            if(user === null){
                this.router.navigate([this.globals.login_url]);
            }
          }),
          catchError(this.serviceGenericError.handleError<User>('Error en getUserData()')),
        );
      return result;
    }
  }

  /*setFechaAprobacionGdpr*/
  setFechaAprobacionGdpr(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/setFechaAprobacionGdpr';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado setFechaAprobacionGdpr()')),
      catchError(this.serviceGenericError.handleError<any>('Error en setFechaAprobacionGdpr()'))
    );
  }

  setFechaAprobacionDocumentoGdpr(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/setFechaAprobacionDocumentoGdpr';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado setFechaAprobacionDocumentoGdpr()')),
      catchError(this.serviceGenericError.handleError<any>('Error en setFechaAprobacionDocumentoGdpr()'))
    );
  }

  /*resteo de contraseña*/
  /*requestChangePassword*/
  resetPassword(email): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl()  + '/requestChangePassword';
    return this.http.post<any>(url, { user: email }, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('reset Password()')),
      catchError(this.serviceGenericError.handleError<any>('reset Error ()'))
    );
  }

  /*resteo de contraseña*/
  /*sendMailWelcomePack*/
  sendMailWP(email): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl()  + '/sendMailWelcomePack';
    return this.http.post<any>(url, { user: email }, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('sendMailWP()')),
      catchError(this.serviceGenericError.handleError<any>('reset Error ()'))
    );
  }

  /*newPassword de contraseña*/
  /*newPassword*/
  newPassword(token): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl()  + '/newPassword';
    return this.http.post<any>(url, { emailToken: token }, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('reset Password()')),
      catchError(this.serviceGenericError.handleError<any>('reset Error ()'))
    );
  }

  /*changePassword de contraseña*/
  /*changePassword*/
  changePassword(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl()  + '/changePassword';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('change Password()')),
      catchError(this.serviceGenericError.handleError<any>('reset Error ()'))
    );
  }

  /*get a table from a form*/
  getTable(): Table {
    return TABLE;
  }

  /*get Empresas Usuario*/
  /*getEmpresasUser*/
  getEmpresasUser(): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getEmpresasUser';
    return this.http.post<any>(url, null, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getEmpresasUser()')),
      catchError(this.serviceGenericError.handleError<User>('Error en getEmpresasUser()'))
    );
  }

  /*get Empresas Usuario*/
  /*getCertificadosEmpresasUser*/
  getCertificadosEmpresasUser(): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getCertificadosEmpresasUser';
    return this.http.post<any>(url, null, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getCertificadosEmpresasUser()')),
      catchError(this.serviceGenericError.handleError<User>('Error en getCertificadosEmpresasUser()'))
    );
  }

  /*getUsers*/
  getUsers(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getUsers';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getUsers()')),
      catchError(this.serviceGenericError.handleError<User>('Error en getUsers()'))
    );
  }

  /*getUserDataWP*/
  getUserDataWP(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + data
      })
    };
    const url = this.getApiBaseUrl()  + '/getUserDataWP';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getUserDataWP()')),
      catchError(this.serviceGenericError.handleErrorTest<User>('Error en getUserDataWP()'))
    );
  }

  /*get Idiomas*/
  getIdiomas(): Observable<any> {
    /*if (localStorage.getItem("idiomas") == null) {*/
      let httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          Language: this.getLang(),
          Authorization: 'Bearer ' + localStorage.getItem('token')
        })
      };
      const url = this.getApiBaseUrl() + '/getIdiomas';
      return this.http.post<any>(url, null, httpOptions).pipe(
        tap(_ => this.serviceGenericError.log('ejecutado getIdiomas()')),
        catchError(this.serviceGenericError.handleError<User>('Error en getIdiomas()'))
      );
    /*}else{
      let idiomas = JSON.parse(localStorage.getItem("idiomas"));
      let result:Observable<Response> = of(idiomas).pipe(
          tap(_ => this.serviceGenericError.log('obteniendo idiomas de memoria')),
          finalize(() => {
          }),
          catchError(this.serviceGenericError.handleError<User>('Error en getIdiomas()')),
        );
      return result;
    }*/
  }

  /*get Idiomas en la pantalla del login - sin token*/
  getIdiomasLogin(): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang()
      })
    };
    const url = this.getApiBaseUrl() + '/getIdiomasLogin';
    return this.http.get<any>(url, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getIdiomasLogin()')),
      catchError(this.serviceGenericError.handleError<User>('Error en getIdiomas()'))
    );
  }

  /*get roles*/
  getRoles(): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getRoles';
    return this.http.post<any>(url, null, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getRoles()')),
      catchError(this.serviceGenericError.handleError<User>('Error en getRoles()'))
    );
  }

  /*update user actualiza/modifica el usuario */
  updateUser(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/updateUser';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado updateUser()')),
      catchError(this.serviceGenericError.handleError<User>('Error en updateUser()'))
    );
  }

  /*insert user actualiza/modifica el usuario */
  insertUser(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/insertUser';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado insertUser()')),
      catchError(this.serviceGenericError.handleError<User>('Error en insertUser()'))
    );
  }


  /*update user actualiza/modifica el usuario */
  deleteUser(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/deleteUser';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado deleteUser()')),
      catchError(this.serviceGenericError.handleError<User>('Error en deleteUser()'))
    );
  }

  /*modifyUser*/
  modifyUser(data): any {
    let lang = JSON.parse(localStorage.getItem("idiomas"))[data.idIdioma-1].lang;
    localStorage.setItem("lang",lang);
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/modifyUser';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado deleteUser()')),
      catchError(this.serviceGenericError.handleError<User>('Error en deleteUser()'))
    );
  }

  /*get TipoMensajes*/
  getTiposMensaje(): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getTiposMensaje';
    return this.http.post<any>(url, null, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getTiposMensaje()')),
      catchError(this.serviceGenericError.handleError<User>('Error en getTiposMensaje()'))
    );
  }

  /*get CategoríaMensajes*/
  getCategoriasMensaje(): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getCategoriasMensaje';
    return this.http.post<any>(url, null, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getCategoriasMensaje()')),
      catchError(this.serviceGenericError.handleError<User>('Error en getCategoriasMensaje()'))
    );
  }

  /*get CategoríaMensajes*/
  getSubcategoriasMensaje(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getSubcategoriasMensaje';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getSubcategoriasMensaje()')),
      catchError(this.serviceGenericError.handleError<User>('Error en getSubcategoriasMensaje()'))
    );
  }

  /*getMensajes*/
  getMensajes(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getMensajes';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getMensajes()')),
      catchError(this.serviceGenericError.handleError<User>('Error en getMensajes()'))
    );
  }

 /*getDetalleMensaje*/
  getDetalleMensaje(idMensaje, origen): Observable<any> {
    let httpOptionsGet = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getDetalleMensaje/' + idMensaje + '/' + origen;
    return this.http.get<any>(url, httpOptionsGet).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getDetalleMensaje()')),
      catchError(this.serviceGenericError.handleError<User>('Error en getDetalleMensaje()'))
    );
  }

  /**
   * Rafa
  */
  /*checkMessageAsRead*/
 checkMessageAsRead(idMensaje): Observable<any> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      Language: this.getLang(),
      Authorization: 'Bearer ' + localStorage.getItem('token')
    })
  };
  const url = this.getApiBaseUrl() + '/checkMessageAsRead';
  return this.http.post<any>(url, idMensaje, httpOptions).pipe(
    tap(_ => this.serviceGenericError.log('ejecutado checkMessageAsRead()')),
    catchError(this.serviceGenericError.handleError<User>('Error en checkMessageAsRead()'))
  );
}

  /*changeState*/
  changeState(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/changeState';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado changeState()')),
      catchError(this.serviceGenericError.handleError<User>('Error en changeState()'))
    );
  }

  /*get Mensajes sin leer*/
  countNotRead(): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/countNotRead';
    return this.http.post<any>(url, null, httpOptions).pipe(
      catchError(this.serviceGenericError.handleError<User>('Error en countNotRead()'))
    );
  }
  /*getPatternPassword*/
  getPatternPassword(): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl()  + '/getPatternPassword';
    return this.http.post<any>(url, null, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getPatternPassword()')),
      catchError(this.serviceGenericError.handleError<User>('Error en getPatternPassword()'))
    );
  }


  /* getContactos */
  getContactos(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getContactos';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getContactos()')),
      catchError(this.serviceGenericError.handleError<User>('Error en getContactos()'))
    );
  }

  /* getTiposContacto */
  getTiposContacto(): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getTiposContacto';
    return this.http.post<any>(url, null, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getTiposContacto()')),
      catchError(this.serviceGenericError.handleError<User>('Error en getTiposContacto()'))
    );
  }
  /* getTiposContacto */
  getTiposDelegaciones(): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getTiposDelegaciones';
    return this.http.post<any>(url, null, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getTiposDelegaciones()')),
      catchError(this.serviceGenericError.handleError<User>('Error en getTiposDelegaciones()'))
    );
  }

  /* getTiposContacto */
  getDelegaciones(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getDelegaciones';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getDelegaciones()')),
      catchError(this.serviceGenericError.handleError<any>('Error en getDelegaciones()'))
    );
  }

  /* getTiposContacto */
  getAllAutonomias(): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getAllAutonomias';
    return this.http.post<any>(url, null, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getAllAutonomias()')),
      catchError(this.serviceGenericError.handleError<any>('Error en getAllAutonomias()'))
    );
  }


  /* getEntitiesUser() */
  getEntitiesUser(): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getEntidadesUser';
    return this.http.post<any>(url, null, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getEntidadesUser()')),
      catchError(this.serviceGenericError.handleError<any>('Error en getEntidadesUser()'))
    );
  }

  /* getAllEntitiesUser */ //Sólo para FACTURAS
  getAllEntitiesUser(): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getAllEntitiesUser';
    return this.http.post<any>(url, null, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getAllEntitiesUser()')),
      catchError(this.serviceGenericError.handleError<any>('Error en getAllEntitiesUser()'))
    );
  }


  /* getDocumentosBills */
  getDocumentosBills(): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getDocumentos';
    return this.http.post<any>(url, {"listaIdsTipoDocumento":[this.globals.facturas]}, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getDocumentos() facturas')),
      catchError(this.serviceGenericError.handleError<any>('Error en getDocumentos()'))
    );
  }

  /* getDocumentosContracts */
  getDocumentosContracts(): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getDocumentos';
    return this.http.post<any>(url, {"listaIdsTipoDocumento":[this.globals.contratos]}, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getDocumentos() Contratos')),
      catchError(this.serviceGenericError.handleError<any>('Error en getDocumentos()'))
    );
  }

  /*modifyEmailFacturacionEmpresa */
  modifyEmailFacturacionEmpresa(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/modifyEmailFacturacionEmpresa';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado modifyEmailFacturacionEmpresa()')),
      catchError(this.serviceGenericError.handleError<User>('Error en modifyEmailFacturacionEmpresa()'))
    );
  }


  /* getFilteredBills */
  getFilteredBills(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getDocumentos';
    return this.http.post<any>(url,data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getFilteredBills() facturas')),
      catchError(this.serviceGenericError.handleError<any>('Error en getFilteredBills()'))
    );
  }

  /* getMedicalDocuments */
  getMedicalDocuments(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getDocumentos';
    return this.http.post<any>(url,data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getDocumentos() Medical Documents')),
      catchError(this.serviceGenericError.handleError<any>('Error en getDocumentos()'))
    );
  }

  /* getSubtiposDocumento */
  getSubtiposDocumento(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getSubtiposDocumento';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getSubtiposDocumento()')),
      catchError(this.serviceGenericError.handleError<any>('Error en getSubtiposDocumento()'))
    );
  }

  /* getSubtiposDocumento */
  getSubtiposDocumentoRegistrosFormacion(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getSubtiposDocumentoRegistrosFormacion';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getSubtiposDocumentoRegistrosFormacion()')),
      catchError(this.serviceGenericError.handleError<any>('Error en getSubtiposDocumentoRegistrosFormacion()'))
    );
  }

  /* getSubtiposDocumentoWithPadre */
  getSubtiposDocumentoWithPadre(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getSubtiposDocumentoWithPadre';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getSubtiposDocumentoWithPadre()')),
      catchError(this.serviceGenericError.handleError<any>('Error en getSubtiposDocumentoWithPadre()'))
    );
  }

  /* getSubtiposDocumentoFiltro */
  getSubtiposDocumentoFiltro(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getSubtiposDocumentoFiltro';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getSubtiposDocumentoFiltro()')),
      catchError(this.serviceGenericError.handleError<any>('Error en getSubtiposDocumentoFiltro()'))
    );
  }

  /*getEFacturaPolicy */
  getEFacturaPolicy(): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getEFacturaPolicy';
    return this.http.post<any>(url, null, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getEFacturaPolicy()')),
      catchError(this.serviceGenericError.handleError<User>('Error en getEFacturaPolicy()'))
    );
  }

  /*getDocumentosRGPD */
  getDocumentosRGPD(): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getDocumentosRGPD';
    return this.http.post<any>(url, null, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getDocumentosRGPD()')),
      catchError(this.serviceGenericError.handleError<User>('Error en getDocumentosRGPD()'))
    );
  }

  /* getCentroEmpresa */
  getCentroEmpresa(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getCentroEmpresa';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getCentroEmpresa()')),
      catchError(this.serviceGenericError.handleError<User>('Error en getCentroEmpresa()'))
    );
  }

  /*getAptitudes */
  getAptitudes(): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getAptitudes';
    return this.http.post<any>(url, null, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getAptitudes()')),
      catchError(this.serviceGenericError.handleError<User>('Error en getAptitudes()'))
    );
  }

  /* getDocumentos - global */
  getDocumentos(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getDocumentos';
    return this.http.post<any>(url,data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getDocumentos()')),
      catchError(this.serviceGenericError.handleError<any>('Error en getDocumentos()'))
    );
  }

  /* getInformesAptitud - VS */
  getInformesAptitud(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/documents/vs/getInformesAptitud';
    return this.http.post<any>(url,data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getInformesAptitud()')),
      catchError(this.serviceGenericError.handleError<any>('Error en getInformesAptitud()'))
    );
  }

  /* checkAppointmentManagement - VS */
  checkAppointmentManagement(data): Observable<any>{
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/checkAppointmentManagement' +
                                        /* '?module=' + this.globals.COMPANY_APPOINTMENT_MANAGEMENT + */
                                        '?empresa=' + data.empresaId +
                                        '&centro=' + data.centroId +
                                        '&trabajador=' + data.trabajadorId;
    return this.http.post<any>(url, data, httpOptions);
  }

  /* getInformesAptitud - VS */
  getHistoryProficiencyReports(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/documents/vs/getHistoryProficiencyReports';
    return this.http.post<any>(url,data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('getHistoryProficiencyReports()')),
      catchError(this.serviceGenericError.handleError<any>('Error en getHistoryProficiencyReports()'))
    );
  }

  /* getReconocimientosMedicos - VS */
  getReconocimientosMedicos(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/documents/vs/getReconocimientosMedicos';
    return this.http.post<any>(url,data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getReconocimientosMedicos()')),
      catchError(this.serviceGenericError.handleError<any>('Error en getReconocimientosMedicos()'))
    );
  }

  /* getDocumentosVs - VS */
  getDocumentosVs(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/documents/vs/getDocumentosVs';
    return this.http.post<any>(url,data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getDocumentosVs()')),
      catchError(this.serviceGenericError.handleError<any>('Error en getDocumentosVs()'))
    );
  }

  /* getActividades */
  getActividades(): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getActividades';
    return this.http.post<any>(url, null, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getActividades()')),
      catchError(this.serviceGenericError.handleError<any>('Error en getActividades()'))
    );
  }


  /* getActividades */
  getProductosPRL(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getProductosPRL';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getProductosPRL()')),
      catchError(this.serviceGenericError.handleError<any>('Error en getProductosPRL()'))
    );
  }

  /* getTrabajadores */
  getTrabajadores(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getTrabajadores';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getTrabajadores()')),
      catchError(this.serviceGenericError.handleError<any>('Error en getTrabajadores()'))
    );
  }

  /* getTrabajadoresCitacion para la citación web*/
  getTrabajadoresCitacionWeb(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getTrabajadoresCitacionWeb';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getTrabajadoresCitacionWeb()')),
      catchError(this.serviceGenericError.handleError<any>('Error en getTrabajadoresCitacionWeb()'))
    );
  }

  /* getCitas */
  getCitas(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getCitas';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getCitas()')),
      catchError(this.serviceGenericError.handleError<any>('Error en getCitas()'))
    );
  }

  /* getSubcarpetas */
  getSubcarpetas(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getSubcarpetas';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getSubcarpetas()')),
      catchError(this.serviceGenericError.handleError<any>('Error en getSubcarpetas()'))
    );
  }

  /* getCategoriasAyuda */
  getCategoriasAyuda(): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getCategoriasAyuda';
    return this.http.post<any>(url, null, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getCategoriasAyuda()')),
      catchError(this.serviceGenericError.handleError<any>('Error en getCategoriasAyuda()'))
    );
  }

  /* getCategoriasAyuda */
  getCategoriaAyuda(idCategoria): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getCategoriaAyuda/' + idCategoria;
    return this.http.get<any>(url, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getCategoriaAyuda()')),
      catchError(this.serviceGenericError.handleError<any>('Error en getCategoriaAyuda()'))
    );
  }

  /* getVideoayudas */
  getVideoayudas(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getVideoayudas';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getVideoayudas()')),
      catchError(this.serviceGenericError.handleError<any>('Error en getVideoayudas()'))
    );
  }

  /* insertVideoayuda */
  insertVideoayuda(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/insertVideoayuda';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado insertVideoayuda()')),
      catchError(this.serviceGenericError.handleError<any>('Error en insertVideoayuda()'))
    );
  }

  /* updateVideoayuda */
  updateVideoayuda(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };

    const url = this.getApiBaseUrl() + '/updateVideoayuda';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado updateVideoayuda()')),
      catchError(this.serviceGenericError.handleError<any>('Error en updateVideoayuda()'))
    );
  }

  /* deleteVideoayuda */
  deleteVideoayuda(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/deleteVideoayuda';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado deleteVideoayuda()')),
      catchError(this.serviceGenericError.handleError<any>('Error en deleteVideoayuda()'))
    );
  }

  /* getFaqs */
  getFaqs(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getFaqs';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getFaqs()')),
      catchError(this.serviceGenericError.handleError<any>('Error en getFaqs()'))
    );
  }

  /* insertFaq */
  insertFaq(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/insertFaq';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado insertFaq()')),
      catchError(this.serviceGenericError.handleError<any>('Error en insertFaq()'))
    );
  }

  /* updateFaq */
  updateFaq(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/updateFaq';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado updateFaq()')),
      catchError(this.serviceGenericError.handleError<any>('Error en updateFaq()'))
    );
  }

  /* deleteFaq */
  deleteFaq(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/deleteFaq';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado deleteFaq()')),
      catchError(this.serviceGenericError.handleError<any>('Error en deleteFaq()'))
    );
  }

  /* getFavoritos */
  getFavoritos(): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getFavoritos';
    return this.http.post<any>(url, null, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getFavoritos()')),
      catchError(this.serviceGenericError.handleError<any>('Error en getFavoritos()'))
    );
  }

  /* insertFavorito */
  insertFavorito(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/insertFavorito';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado insertFavorito()')),
      catchError(this.serviceGenericError.handleError<any>('Error en insertFavorito()'))
    );
  }

  /* updateFavorito */
  updateFavorito(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/updateFavorito';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado updateFavorito()')),
      catchError(this.serviceGenericError.handleError<any>('Error en updateFavorito()'))
    );
  }

  /* deleteFavorito */
  deleteFavorito(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/deleteFavorito';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado deleteFavorito()')),
      catchError(this.serviceGenericError.handleError<any>('Error en deleteFavorito()'))
    );
  }

  /**
   * Checks if current user has any related company which has hired VS
   * @param user
   */
  hasAnyVSHiredCompany(user) {
    let hiredCompanies = false;
    for (let i = 0; i < user.empresas.length; i++) {
      if (user.empresas[i].activoVS) {
        hiredCompanies = true;
        break;
      }
    }
    return hiredCompanies;
  }
   /* getServiceTypes */
   getServiceTypes(): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getServiceTypes';
    return this.http.get<any>(url, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getServiceTypes()')),
      catchError(this.serviceGenericError.handleError<any>('Error en getServiceTypes()'))
    );
  }

  /* getFilteredOffersNoAccepted */
  getFilteredOffersNoAccepted(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getDocumentos';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getFilteredOffersNoAccepted()')),
      catchError(this.serviceGenericError.handleError<any>('Error en getFilteredOffersNoAccepted()'))
    );
  }

  setBajaTrabajador(clienteId: number, centroId: number, rlId: number, datos: Object): Observable<any> {
   let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      Language: this.getLang(),
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    const url = this.getApiBaseUrl() + `/trabajadores/cliente/${clienteId}/centro/${centroId}/rl/${rlId}/baja`;
    return this.http.post(url, datos, {headers, responseType: 'text'})
  }

  modificarTrabajadorRelacionLaboral(clienteId: number, trabajadorId: number, rlId: number, form: JsonObject){
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      Language: this.getLang(),
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    const url = this.getApiBaseUrl() + `/trabajadores/cliente/${clienteId}/trabajador/${trabajadorId}/rl/${rlId}`;
    return this.http.put(url, form, {headers, responseType: 'text'});
  }

  getRelacionLaboralById(rlid: number, traid: number): Observable<any>{
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      Language: this.getLang(),
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    const url = this.getApiBaseUrl() + `/trabajadores/rl/${rlid}/trabajador/${traid}`;
    return this.http.get(url, {headers})
  }

  reactivarRelacionLaboral(rlId: number, clienteId: number): Observable<any>{
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      Language: this.getLang(),
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    const url = this.getApiBaseUrl() + `/trabajadores/cliente/${clienteId}/rl/${rlId}/reactivar`;
    return this.http.post(url, null, {headers, responseType: 'text'})
  }

  buscarTrabajador(filtro: Number, valor: String): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      Language: this.getLang(),
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });

    const url = this.getApiBaseUrl() + `/trabajadores/alta/getTrabajador/${filtro}/documento/${valor}`;
    return this.http.get(url, {headers})
  }

  getPuestos(idCliente: number, idCentro: number, criterio: string): Observable<any>{
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      Language: this.getLang(),
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });

    const url = this.getApiBaseUrl() + `/trabajadores/centro/${idCentro}/cliente/${idCliente}/puestos?criterio=${criterio}`;
    return this.http.get(url, {headers});
  }

  /* getSubcategoriasFormacion */
  getSubcategoriasFormacion(): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getSubcategoriasFormacion';
    return this.http.get<any>(url, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getSubcategoriaFormacion()')),
      catchError(this.serviceGenericError.handleError<any>('Error en getSubcategoriaFormacion()'))
    );
  }

  /* getTiposReciclaje */
  getTiposReciclaje(): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getTiposReciclaje';
    return this.http.get<any>(url, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getTiposReciclaje()')),
      catchError(this.serviceGenericError.handleError<any>('Error en getTiposReciclaje()'))
    );
  }
    /* getFilteredAssignmentContracts */
    getFilteredAssignmentContracts(data): Observable<any> {
      let httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          Language: this.getLang(),
          Authorization: 'Bearer ' + localStorage.getItem('token')
        })
      };
      const url = this.getApiBaseUrl() + '/getDocumentos';
      return this.http.post<any>(url,data, httpOptions).pipe(
        tap(_ => this.serviceGenericError.log('ejecutado getFilteredAssignmentContracts()')),
        catchError(this.serviceGenericError.handleError<any>('Error en getFilteredAssignmentContracts()'))
      );
    }



  /**
   * Given a list of document ids, fetches protocol list for each one
   * @param idList
   */
  getProtocols(idList: any[]): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getProtocols';
    return this.http.post<any>(url, idList, httpOptions);
  }


  getNotificacionAceptada(): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };

    const url = this.getApiBaseUrl() + '/novedades/comprobarNovedadConfirmada';
    return this.http.get(url, httpOptions);
  }

  setNotificacionAceptada(): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };

    const url = this.getApiBaseUrl() + '/novedades/aceptarNovedad';
    return this.http.post(url, null, httpOptions);
  }

  comprobarAbsentismo(empresa:number): Observable<any>{
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };

    const url = this.getApiBaseUrl() + '/cliente/' + empresa + '/getAbsentismoRRMM';
    return this.http.get(url, httpOptions);
  }

}
