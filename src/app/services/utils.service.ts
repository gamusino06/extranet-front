import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {TranslateService} from '@ngx-translate/core';
import {Globals} from '../extranet/globals';

import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {HistoricoAccionesDocumentoComponent} from 'src/app/modales/historicoAccionesDocumento/historicoAccionesDocumento.component';

import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';

import {AuthTokenService} from './auth-token.service';
import {ServiceGenericErrorService} from './service-generic-error.service';

import {environment} from '../../environments/environment';
import Swal from 'sweetalert2';
import {NgxSpinnerService} from 'ngx-spinner';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

import {BreakpointObserver} from '@angular/cdk/layout';
import * as XLSX from 'xlsx';
import * as _moment from 'moment/moment';
import {ShareDocumentComponent} from '../modales/shareDocument/shareDocument.component'; // Para media querys en TS

const moment =  _moment;

@Injectable({
  providedIn: 'root'
})

export class UtilsService {
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

  /*getDatosJuridico*/
  getDatosJuridico(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: navigator.language,
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getDatosJuridico';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getDatosJuridico()')),
      catchError(this.serviceGenericError.handleError<any>('Error en getDatosJuridico()'))
    );
  }

  /*getAutonomias*/
  getAutonomias(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: navigator.language,
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getAutonomias';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getAutonomiasData()')),
      catchError(this.serviceGenericError.handleError<any>('Error en getAutonomiasData()'))
    );
  }

  /*getProvincias*/
  getProvincias(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: navigator.language,
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getProvincias';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getProvincias()')),
      catchError(this.serviceGenericError.handleError<any>('Error en getProvincias()'))
    );
  }

  /*getLocalidades*/
  getLocalidades(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: navigator.language,
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getLocalidades';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getLocalidades()')),
      catchError(this.serviceGenericError.handleError<any>('Error en getLocalidades()'))
    );
  }


  getDocumentosIcpt(data, modoDescarga): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: navigator.language,
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = `${ this.getApiBaseUrl() }/${modoDescarga}/getDocsIcpt`;

    return this.http.post<any>(url, data
      , httpOptions).pipe(
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

  /**
   * Obtener uuid de archivo xls
   * @param idFile
   */
  getFileUUID(idFile): Observable<any> {
    let headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: navigator.language,
        Authorization: 'Bearer ' + localStorage.getItem('token')
      });

    const url = this.getApiBaseUrl() + '/getDocumentUUIDById/' + idFile;
    return this.http.get(url, {headers, responseType: 'text'});
  }

  /*getAdjuntoMensaje*/
  getAdjuntoMensaje(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: navigator.language,
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getAdjuntoMensaje';
    return this.http.post<any>(url, data
      , httpOptions).pipe(
        tap(_ => this.serviceGenericError.log('ejecutado getAdjuntoMensaje()')),
        catchError(this.serviceGenericError.handleError<any>('Error en getAdjuntoMensaje()'))
      );
  }

  /*compartirData*/
  compartirDocumento(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: navigator.language,
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/compartirDocumento';
    return this.http.post<any>(url, data
      , httpOptions).pipe(
        tap(_ => this.serviceGenericError.log('ejecutado compartirDocumento()')),
        catchError(this.serviceGenericError.handleError<any>('Error en compartirDocumento()'))
      );
  }

  /*compartirData*/
  compartirDocumentoZip(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: navigator.language,
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/compartirDocumentoZip';
    return this.http.post<any>(url, data
      , httpOptions).pipe(
        tap(_ => this.serviceGenericError.log('ejecutado compartirDocumentoZip()')),
        catchError(this.serviceGenericError.handleError<any>('Error en compartirDocumentoZip()'))
      );
  }

  shareCombinedZip(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: navigator.language,
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/shareCombinedZip';
    return this.http.post<any>(url, data
      , httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado shareCombinedZip()')),
      catchError(this.serviceGenericError.handleError<any>('Error en shareCombinedZip()'))
    );
  }

  /*getZipFile*/
  getZipFile(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: navigator.language,
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getZipFile';
    return this.http.post<any>(url, data
      , httpOptions).pipe(
        tap(_ => this.serviceGenericError.log('ejecutado getZipFile()')),
        catchError(this.serviceGenericError.handleError<any>('Error en getZipFile()'))
      );
  }

  getCombinedZipFile(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: navigator.language,
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getCombinedZipFile';
    return this.http.post<any>(url, data
      , httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getZipFile()')),
      catchError(this.serviceGenericError.handleError<any>('Error en getZipFile()'))
    );
  }

  /*getFilesUnificado*/
  getFilesUnificado(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: navigator.language,
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getFilesUnificado';
    return this.http.post<any>(url, data
      , httpOptions).pipe(
        tap(_ => this.serviceGenericError.log('ejecutado getFilesUnificado()')),
        catchError(this.serviceGenericError.handleError<any>('Error en getFilesUnificado()'))
      );
  }

  /*getFileHistoricoFormacion*/
  getFileHistoricoFormacion(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: navigator.language,
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getFileHistoricoFormacion';
    return this.http.post<any>(url, data
      , httpOptions).pipe(
        tap(_ => this.serviceGenericError.log('ejecutado getFileHistoricoFormacion()')),
        catchError(this.serviceGenericError.handleError<any>('Error en getFileHistoricoFormacion()'))
      );
  }

  /*getCentrosMedicos*/
  getCentrosMedicos(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: navigator.language,
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getCentrosMedicos';
    return this.http.post<any>(url, data
      , httpOptions).pipe(
        tap(_ => this.serviceGenericError.log('ejecutado getCentrosMedicos()')),
        catchError(this.serviceGenericError.handleError<any>('Error en getCentrosMedicos()'))
      );
  }

  /* anulacionCita */
  anulacionCita(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: navigator.language,
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/anulacionCita';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado anulacionCita()'))
    );
  }

  /* getCitasByEmpresa */
  getCitasDisponibles(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: navigator.language,
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getCitasDisponibles';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getCitasByEmpresa()'))
    );
  }

  /* getMotivosCita */
  getMotivosCita(): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: navigator.language,
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getMotivosCita';
    return this.http.post<any>(url, null, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getMotivosCita()'))
    );
  }

  /* envioMailConsultaGeneral */ //'Content-Type': 'multipart/form-data',
  envioMailConsultaGeneral(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*',
        Language: navigator.language,
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/envioConsultaGeneral';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado envioMailConsultaGeneral()'))
    );
  }

  /* envioProteccionDatos */ //'Content-Type': 'multipart/form-data',
  envioProteccionDatos(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*',
        Language: navigator.language,
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/envioProteccionDatos';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado envioProteccionDatos()'))
    );
  }

  /* guardarCita */
  guardarCita(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: navigator.language,
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/guardarCita';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado guardarCita()'))
    );
  }

  /* getInfoDocumentos */
  getInfoDocumentos(data): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: navigator.language,
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getInfoDocumentos';
    return this.http.post<any>(url, data, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getInfoDocumentos()'))
    );
  }

  /* getSegmentosDocumento */
  getSegmentosDocumento(uuid): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: navigator.language,
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/getSegmentosDocumento/' + uuid;
    return this.http.get<any>(url, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getSegmentosDocumento()'))
    );
  }

  getPastAptitudeReportsByUser(workerNif, lastReportDate, companyId, centerId, jobPositionId): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: navigator.language,
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    if(lastReportDate === undefined || lastReportDate === null) {
      lastReportDate = new Date().toISOString();
    }
    const url = this.getApiBaseUrl() + '/getPastAptitudeReportsByUser?workerNif=' + workerNif + '&lastReportDate=' + lastReportDate
                + '&companyId=' + companyId + '&centerId=' + centerId + '&jobPositionId=' + jobPositionId;
    return this.http.get<any>(url, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('executed getPastAptitudeReportsByUser()'))
    );
  }


  /************************************************ MÉTODOS AUXILIARES ************************************************/

  //Método para actualizar la tabla para introducir las nuevas acciones de los documentos que hayan realizado
  //la acción de previsualizar/descarga/compartirDat
  //Después de cada acción para una acción de un documento, se consigue la información actualizada para guardarla de nuevo y actualizar la tabla
  recargarTablaDatosPorAccion(element, listaDataSource, spinner, esTratamiento, idiomas, esCertificadoMultiple, posicionDeLaEmpresaEnLaTabla, esGdpr) {
    //this.getFilteredBills();  //NOTA IMPORTANTE: Debido a la tardanza de la busqueda de todos los documentos para obtener las acciones actualizadas, se crea un nuevo servicio para obtener la info de ese documento en concreto (23/09/2021)
    let idDocumentoInfo:number = element.idDocumento;
    let jsonInfoDocumentoDto: any;
    jsonInfoDocumentoDto = {
      idDocumento: idDocumentoInfo
    }
    let jsonInfoDocumentosDto: any[] = [];
    jsonInfoDocumentosDto.push(jsonInfoDocumentoDto);
    //Se aprovecha el otro método para no duplicar código y se envía un array con un solo documento (con contenido idDocumento)
    return this.recargarTablaDatosMultiplePorAccion(jsonInfoDocumentosDto, listaDataSource, spinner, esTratamiento, idiomas, esCertificadoMultiple, posicionDeLaEmpresaEnLaTabla, esGdpr);
  }

  //Después de cada acción para una acción multiple de documento, se consigue la información actualizada
  //para guardarla de nuevo y actualizar la tabla
  //Los parámetros idiomas y esTratamiento se utilizarán para la pantalla de 'Tratamiento'
  recargarTablaDatosMultiplePorAccion(documentosConAcciones, listaDataSource, spinner, esTratamiento, idiomas, esCertificadoMultiple, posicionDeLaEmpresaEnLaTabla, esGdpr) {

    let jsonInfoDocumentosDto: any[] = [];
    documentosConAcciones.forEach(doc => {
      jsonInfoDocumentosDto.push(doc);
    });

    //Llamada al back
    this.getInfoDocumentos(jsonInfoDocumentosDto).subscribe(results => {
        //Retorna un mapa <Integer, Lista<HistoricoAccionesDocumento>
        if(results){
            let mapaHistoricoDocumento = new Map();
            documentosConAcciones.forEach(doc => {
              mapaHistoricoDocumento.set(doc.idDocumento, results[doc.idDocumento]);
            });
            if (!esTratamiento && !esCertificadoMultiple){
              listaDataSource.forEach(item => {
                  //Sólo se actualiza los documentos que realizaron la acción
                  let doc: any = documentosConAcciones.find(doc => doc.idDocumento === item.idDocumento);
                  if(doc != undefined){//Entonces es que ha encontrado el id en el objeto doc
                    if(item.listaHistoricoDocumentoDto == undefined || item.listaHistoricoDocumentoDto.length === 0){
                      //Ahora ya va a tener acciones accionesRealizadas, se pone a true dicho campo
                      item.accionesRealizadas = true;
                      if(esGdpr){
                        //Cualquiera de las dos acciones, la fecha es valida para el seteo del GDPR
                        item.fechaAceptacionGdpr = results[doc.idDocumento][0].fechaAccion;
                      }
                    }

                    //Teniendo historicos o no, se va a tener que eliminar todos los que ya tenía en tal caso,
                    //recorrerse el mapa y actualizar el atributo de listaHistoricoDocumentoDto
                    let listaHistoricoDocumentoDto:any=[];
                    //Obtengo del mapa, los historicos para el id del documento
                    listaHistoricoDocumentoDto = mapaHistoricoDocumento.get(item.idDocumento);
                    item.listaHistoricoDocumentoDto = listaHistoricoDocumentoDto;
                  }
              });
            }else if(!esTratamiento && esCertificadoMultiple){
                //Se recorre ahora las posiciones de las empresas, para sacar la info de los documentos actualizados
                posicionDeLaEmpresaEnLaTabla.forEach(posicion => {
                   let empresa:any = listaDataSource[posicion];
                   //Se recorre los documentos de dicha empresa
                   empresa.documentos.forEach(documento => {
                     let idDocumentoActualizado:any = documentosConAcciones.find(doc => doc.idDocumento === documento.idDocumento);
                     if(idDocumentoActualizado != undefined){//Entonces es que ha encontrado el id en el objeto doc
                        if(documento.listaHistoricoDocumentoDto == undefined || documento.listaHistoricoDocumentoDto.length === 0){
                           //Ahora ya va a tener acciones accionesRealizadas, se pone a true dicho campo
                           documento.accionesRealizadas = true;
                        }
                        //Teniendo historicos o no, se va a tener que eliminar todos los que ya tenía en tal caso,
                        //recorrerse el mapa y actualizar el atributo de listaHistoricoDocumentoDto
                        let listaHistoricoDocumentoDto:any=[];
                        //Obtengo del mapa, los historicos para el id del documento
                        listaHistoricoDocumentoDto = mapaHistoricoDocumento.get(documento.idDocumento);
                        documento.listaHistoricoDocumentoDto = listaHistoricoDocumentoDto;
                     }
                   });
                   listaDataSource[posicion] = empresa; //Se actualiza la empresa con la nueva información de sus documentos
               });
            }else{
              //Es llamado desde la pantalla de tratamiento
              listaDataSource.forEach(entidadOCodigoConducta => {
                  idiomas.forEach(idioma => {
                      let idDocumentoEntidadOCodigoConducta = entidadOCodigoConducta[idioma.columnName]?.idDocumento; //? ya que puede suceder que en un idioma no existe aún el documento
                      //Sólo se actualiza los documentos que realizaron la acción
                      let doc: any = documentosConAcciones.find(doc => doc.idDocumento === idDocumentoEntidadOCodigoConducta);
                      if(doc != undefined){//Entonces es que ha encontrado el id en el objeto doc
                        if(entidadOCodigoConducta[idioma.columnName].listaHistoricoDocumentoDto == undefined || entidadOCodigoConducta[idioma.columnName].listaHistoricoDocumentoDto.length === 0){
                          //Ahora ya va a tener acciones accionesRealizadas, se pone a true dicho campo
                          entidadOCodigoConducta[idioma.columnName].accionesRealizadas = true;
                        }

                        //Teniendo historicos o no, se va a tener que eliminar todos los que ya tenía en tal caso,
                        //recorrerse el mapa y actualizar el atributo de listaHistoricoDocumentoDto
                        let listaHistoricoDocumentoDto:any=[];
                        //Obtengo del mapa, los historicos para el id del documento
                        listaHistoricoDocumentoDto = mapaHistoricoDocumento.get(idDocumentoEntidadOCodigoConducta);
                        entidadOCodigoConducta[idioma.columnName].listaHistoricoDocumentoDto = listaHistoricoDocumentoDto;
                      }
                  });
              });
            }
        }
        spinner.hide();
        return listaDataSource;
    }), (error => {
      if (environment.debug) console.log("Error");
    })
  }

  //Método para mostrar el mensaje por pantalla
  mostrarMensajeSwalFire(icono, titulo, texto, colorBotonConfirmado, permitirClickExterior) {
    Swal.fire({
      icon: icono,
      title: titulo,
      text: texto,
      confirmButtonColor: colorBotonConfirmado,
      allowOutsideClick: permitirClickExterior
    })
  }

  fireMessageListPopup(icono, titulo, textList, colorBotonConfirmado, permitirClickExterior) {
    let htmlString = '<div class="scroll2" style="max-height: 15em; overflow-y: scroll; width: 100%; text-align:left">';
    for (let i = 0; i < textList.length; i++) {
      htmlString += '<p style="font-size: 14px;font-weight: 400;">'+textList[i]+'</p>';
    }
    htmlString += '</div>';

    Swal.fire({
      icon: icono,
      title: titulo,
      html: htmlString,
      confirmButtonColor: colorBotonConfirmado,
      allowOutsideClick: permitirClickExterior,
      showConfirmButton: false
    })
  }
   //Método para mostrar el mensaje por pantalla cuando la búsqueda por filtro no se ha obtenido ningún documento
  mostrarMensajeSwalFireDocumentosNoEncontrados() {
    let titulo = this.traducirTextos("No se han obtenido documentos con los filtros enviados", "DOCUMENTOS_NO_ENCONTRADOS");
    this.mostrarMensajeSwalFire('warning', titulo, '', 'var(--blue)', false);
  }

  // Método para mostrar el mensaje por pantalla cuando la búsqueda de descripción no devuelve ningún resultado
  mostrarMensajeSwalFireDescripcionNoEncontrada() {
    let titulo = this.traducirTextos('Esta oferta no contiene ninguna descripción', 'DESCRIPCION_NO_ENCONTRADA');
    this.mostrarMensajeSwalFire('warning', titulo, '','var(--blue)', false);
  }

  //Método para mostrar el mensaje por pantalla cuando la búsqueda por filtro no se ha obtenido ningún centro de trabajo
  mostrarMensajeSwalFireCentrosNoEncontrados() {
    let titulo = this.traducirTextos("No se han obtenido centros de trabajo con los filtros enviados", "CENTROS_DE_TRABAJO_NO_ENCONTRADOS");
    this.mostrarMensajeSwalFire('warning', titulo, '','var(--blue)', false);
  }

  //Método para mostrar el mensaje por pantalla cuando la búsqueda por filtro no se ha obtenido ninguna persona trabajadora
  mostrarMensajeSwalFireTrabajadoresNoEncontrados() {
    let titulo = this.traducirTextos("No se han obtenido personas trabajadoras con los filtros enviados", "TRABAJADORES_NO_ENCONTRADOS");
    this.mostrarMensajeSwalFire('warning', titulo, '','var(--blue)', false);
  }

  //Método para mostrar el mensaje por pantalla cuando la búsqueda por filtro no se ha obtenido ninguna cita médica
  mostrarMensajeSwalFireCitasNoEncontradas() {
    let titulo = this.traducirTextos("No se han obtenido citas médicas con los filtros enviados", "CITAS_PERSONAS_TRABAJADORAS_NO_ENCONTRADOS");
    this.mostrarMensajeSwalFire('warning', titulo, '','var(--blue)', false);
  }

  //Método para mostrar el mensaje por pantalla cuando la búsqueda por filtro no se ha obtenido ninguna persona de contacto
  mostrarMensajeSwalFirePersonasContactoNoEncontradas() {
    let titulo = this.traducirTextos("No se han obtenido personas de contacto con los filtros enviados", "PERSONAS_CONTACTO_NO_ENCONTRADOS");
    this.mostrarMensajeSwalFire('warning', titulo, '','var(--blue)', false);
  }

  //Método para mostrar el mensaje por pantalla cuando la búsqueda por filtro no se ha obtenido ningún mensaje
  mostrarMensajeSwalFireMensajesNoEncontradas() {
    let titulo = this.traducirTextos("No se han obtenido mensajes con los filtros enviados", "MENSAJES_NO_ENCONTRADOS");
    this.mostrarMensajeSwalFire('warning', titulo, '','var(--blue)', false);
  }

  //Método para mostrar el mensaje por pantalla cuando el usuario intenta realizar una descarga/compartir multiple de más de 25 documentos
  mostrarMensajeSwalFireSobrepasadoLimiteDescargaMultiple(numeroDocumentosSeleccionados) {
    let titulo = this.traducirTextos("Ha superado el número máximo de documentos permitidos para su descarga o envío por email (25 unidades)", "LIMITE_DOCUMENTOS_DESCARGA_COMPARTIR_MULTIPLE");
    let descripcion = this.traducirTextos("Documentos seleccionados:", "DOCUMENTOS_SELECCIONADOS");
    descripcion = descripcion + " " + numeroDocumentosSeleccionados;
    this.mostrarMensajeSwalFire('error', titulo, descripcion,'var(--blue)', false);
  }

  //Método para traducir los textos de la aplicación
  traducirTextos(textoATraducir, constanteATraducir) {
    let textoTraducido = textoATraducir;
    this.translate.get(constanteATraducir).subscribe((res: string) => {
      textoTraducido = res;
    });
    return textoTraducido;
  }

  //Método que ordena horas de tipo String "17:15", modificando ':' por '.' "17.15"
  ordenarListaCitas(listaAOrdenarHoras) {
    //Se reemplaza los elementos de la lista para poder ordenar con tipos number
    listaAOrdenarHoras.forEach(cita => {
      cita.horaCita = cita.horaCita.replace(":", ".");
    });

    //Se ordena la lista
    listaAOrdenarHoras.sort((a, b) =>
      a.horaCita > b.horaCita ? 1 :
        a.horaCita < b.horaCita ? -1 :
          0
    );

    //Se vuelve a reemplazar con la lista ya ordenada
    listaAOrdenarHoras.forEach(cita => {
      cita.horaCita = cita.horaCita.replace(".", ":");
    });

    return listaAOrdenarHoras;
  }

  toggleElement(element, status) {
    if (element.mostrar == false) {
      element.mostrar = true;
    } else if (element.mostrar == true) {
      element.mostrar = false;
    } else {
      element.mostrar = true;
    }
  }

  drop(event: CdkDragDrop<string[]>, tableHeaders) {

    moveItemInArray(tableHeaders, event.previousIndex, event.currentIndex);
    let objToSave: object = {};

    if (localStorage.getItem('tableColsOrder')) {
      objToSave = JSON.parse(localStorage.getItem('tableColsOrder'));
    }
    objToSave[this.constructor.name] = tableHeaders;
    localStorage.setItem('tableColsOrder', JSON.stringify(objToSave));

  }

  public citaValues = {
    idEmpresa: '',
    nombreEmpresa: '',
    idCentroMedico: '',
    nombreCentroMedico: '',
    fecha: '',
    horaCita: [],
    idTrabajador: '',
  };

  public bloqueadoUpsCita: boolean;

  public setFormValues(values: any) {
    this.citaValues = { ...this.citaValues, ...values };
  }


  public step1IsValid() {
    return this.citaValues.idEmpresa && this.citaValues.idCentroMedico && this.citaValues.nombreEmpresa && this.citaValues.nombreEmpresa;
  }

  public step2IsValid() {
    return this.citaValues.fecha;
  }

  public step3IsValid() {
  }

  //Método que comprueba si alguno de los fitlros de Empresa y Centro está en 'activo', 'inactivo' o 'VerTod@s'
  //y va añadiendo empresas/centros a sus respectivas listas resultantes.
  envioDatosConFiltroActivoInactivo (selectEmpresasRadioForm, selectCentrosRadioForm, empresaForm, centroForm, empresasList, idEmpresasList, idCentrosList){

    let idEmpresasActivosList: number[] = [];
    let idCentrosActivosList: number[] = [];
    let idEmpresasInactivosList: number[] = [];
    let idCentrosInactivosList: number[] = [];
    let mapaCentroEmpresa = new Map();

    //NOTA: NO se analiza empresaForm y centroForm como "", ya que cambia de valor cuando ha tenido
    //anteriormente algún dato, y cambio a tipo array vacio []

    //Se recorren todas las empresas y sus centros y se agregan a las listas correspondientes para ser
    //analizadas posteriormente en el metodo auxiliar
    empresasList.forEach( empresa => {
      if (empresa.centros !== undefined){
        empresa.centros.forEach( centro => {
          //Se guarda en un mapa<idCentro, Empresa> para posteriormente poder buscar la empresa asociada al centro
          mapaCentroEmpresa.set(centro.idCentro, empresa);
          //Si el 'centroForm' tiene datos y no se ha pasado ya por aquí 'idCentrosActivosList', entonces se recorre
          if (centroForm.length > 0 && idCentrosActivosList.length >= 0){
              //Se recorre los idCentro que ha seleccionado el usuario en el formulario 'centroForm'
              centroForm.forEach(idCentro => {
                  //Si se trata del mismo centro, indicado por el usuario, que uno de los centros que se recorren, nos interesa.
                  if ( idCentro === centro.idCentro){
                      //Se comprueba si es activo el centro o no para así guardarlo en la lista correspondiente
                      this.comprobacionEmpresaCentroActivoEnAreaPantalla(centro, centro.idCentro, null, idCentrosActivosList, idCentrosInactivosList, null, null);
                  }
              });
          }else if (centroForm.length === 0){ //Si no tiene datos el formulario
              //Se comprueba si es activo el centro o no para así guardarlo en la lista correspondiente
              this.comprobacionEmpresaCentroActivoEnAreaPantalla(centro, centro.idCentro, null, idCentrosActivosList, idCentrosInactivosList, null, null);
          }
        });
      }

      //Si el 'empresaForm' tiene datos y no se ha pasado ya por aquí 'idEmpresasActivosList', entonces se recorre
      if (empresaForm.length > 0 && idEmpresasActivosList.length >= 0){
          //Se recorre las idEmpresa que ha seleccionado el usuario en el formulario 'empresaForm'
          empresaForm.forEach(idEmpresa => {
              //Si se trata de la misma empresa, indicado por el usuario, que uno de las empresas que se recorren, nos interesa.
              if ( idEmpresa === empresa.idEmpresa){
                  //Se comprueba si es activo la empresa o no para así guardarla en la lista correspondiente
                  this.comprobacionEmpresaCentroActivoEnAreaPantalla(empresa, empresa.idEmpresa, null, idEmpresasActivosList, idEmpresasInactivosList, null, null);
              }
          });
      }else if (empresaForm.length === 0){ //Si no tiene datos el formulario
          //Se comprueba si es activo la empresa o no para así guardarla en la lista correspondiente
          //Insertamos las empresas esten activas o inactivas
          this.comprobacionEmpresaCentroActivoEnAreaPantalla(empresa, empresa.idEmpresa, null, idEmpresasActivosList, idEmpresasInactivosList, null, null);
      }

    });
    //Llamada al método auxiliar, el cual devolvera por referencia las listas 'idEmpresasList' y 'idCentrosList' rellenas o no.
    this.envioDatosConFiltroActivoInactivoAux(selectEmpresasRadioForm, selectCentrosRadioForm, idEmpresasActivosList, idEmpresasInactivosList, idEmpresasList, idCentrosActivosList, idCentrosInactivosList, idCentrosList, mapaCentroEmpresa);
  }

  //Método que comprueba si la empresa/centro(EN ADELANTE 'item') está activa o no en el area que se encuentra el usuario
  //y así poder indicar al Back que item es necesario obtener en el listado de documentos
  comprobacionEmpresaCentroActivoEnAreaPantalla(item, idItem, idCentro, idActivosList, idInactivosList, idCentrosList, radioEmpresa){

    let isPT = false;
    let isVS = false;

    //Se consigue el area que está seleccionada en la pantalla que llama a este método
    if (localStorage.getItem('areaSelected')!=="undefined") {
      let seleccionArea = JSON.parse(localStorage.getItem('areaSelected'));
      if (seleccionArea.idArea === this.globals.idAreaPT) {
        isPT = true;
      }
      if (seleccionArea.idArea === this.globals.idAreaVS) {
        isVS = true;
      }
    }

    // Se comprueba si nos encontramos en el caso de empresas o centros
    if (idActivosList !== null && idInactivosList !== null){
        if (!isPT && !isVS){
          if ((item.activoPT && item.tienePT) || (item.activoVS && item.tieneVS)){
            idActivosList.push(idItem);
          } else if ((!item.activoPT && item.tienePT) || (!item.activoVS && item.tieneVS)){
            idInactivosList.push(idItem);
          }
        }else if (isPT) {
          if (item.activoPT && item.tienePT){
            idActivosList.push(idItem);
          }
          if (!item.activoPT && item.tienePT){
            idInactivosList.push(idItem);
          }
        }else if (isVS) {
          if (item.activoVS && item.tieneVS){
            idActivosList.push(idItem);
          }
          if (!item.activoVS && item.tieneVS){
            idInactivosList.push(idItem);
          }
        }
     } else { //Caso centros
        if (idCentrosList !== null && radioEmpresa !== null && idCentro !== null){
            //Se comprueba los radios de empresa, para según si es 0, 1 y 2 y también si está activo en alguna de las areas
            //se introduce o no el centro
            if (radioEmpresa === "0"){
                if (item.tienePT || item.tieneVS){
                  idCentrosList.push(idCentro);
                }
            }
            if (radioEmpresa === "1"){
                if ((item.activoPT && item.tienePT) || (item.activoVS && item.tieneVS)){
                  idCentrosList.push(idCentro);
                }
            }
            if (radioEmpresa === "2"){
                if ((!item.activoPT && item.tienePT) || (!item.activoVS && item.tieneVS)){
                  idCentrosList.push(idCentro);
                }
            }
        }
     }
  }

  //Metodo auxiliar para poder conseguir las empresas y centros finales, añadiendolos a sus listas finales
  envioDatosConFiltroActivoInactivoAux(radioEmpresa, radioCentro, idEmpresasActivosList, idEmpresasInactivosList, idEmpresasList, idCentrosActivosList, idCentrosInactivosList, idCentrosList, mapaCentroEmpresa){

    //Se recorre todas las empresas o las activas y se añade a 'idEmpresasList'
    if (radioEmpresa === "0" || radioEmpresa === "1"){
      idEmpresasActivosList.forEach(idEmpresa => {
          idEmpresasList.push(idEmpresa);
      });
    }
    //Se recorre todas las empresas o las inactivas y se añade a 'idEmpresasList'
    if (radioEmpresa === "0" || radioEmpresa === "2"){
      idEmpresasInactivosList.forEach(idEmpresa => {
          idEmpresasList.push(idEmpresa);
      });
    }

    //Se recorre todos los centros o los centros activos
    if (radioCentro === "0" || radioCentro === "1"){
      //Se recorre la lista que en el metodo principal ha sido rellenada con los centros que cumplian los requisitos (activos)

      idCentrosActivosList.forEach(idCentro => {
          //Como en este método no se tiene la empresa, se hace uso del mapa para conseguir
          //la empresa a través de la clave idCentro
          let empresa = mapaCentroEmpresa.get(idCentro);
          //Si se ha seleccionado 'verTodos' se añadiran las que cumplan 'idEmpresa === empresa.idEmpresa'
          if (radioCentro === "0"){
              if ( idEmpresasList.find(idEmpresa => idEmpresa === empresa.idEmpresa) ){
                  idCentrosList.push(idCentro);
              }
          } else {
              //Para los casos activos o inactivos de Centros
              if ( idEmpresasList.find(idEmpresa => idEmpresa === empresa.idEmpresa) ){
                 this.comprobacionEmpresaCentroActivoEnAreaPantalla(empresa, empresa.idEmpresa, idCentro, null, null, idCentrosList, radioEmpresa);
              }
          }
      });
    }
    //Se recorre todos los centros o los centros inactivos
    if (radioCentro === "0" || radioCentro === "2"){
      //Se recorre la lista que en el metodo principal ha sido rellenada con los centros que cumplian los requisitos (inactivos)
      idCentrosInactivosList.forEach(idCentro => {
          //Como en este método no se tiene la empresa, se hace uso del mapa para conseguir
          //la empresa a través de la clave idCentro
          let empresa = mapaCentroEmpresa.get(idCentro);
          //Si se ha seleccionado 'verTodos' se añadiran las que cumplan 'idEmpresa === empresa.idEmpresa'
          if (radioCentro === "0"){
              if ( idEmpresasList.find(idEmpresa => idEmpresa === empresa.idEmpresa) ){
                  idCentrosList.push(idCentro);
              }
          } else {
              //Para los casos activos o inactivos de Centros
              if ( idEmpresasList.find(idEmpresa => idEmpresa === empresa.idEmpresa) ){
                  this.comprobacionEmpresaCentroActivoEnAreaPantalla(empresa, empresa.idEmpresa, idCentro, null, null, idCentrosList, radioEmpresa);
              }
          }
      });
    }

    //NOTA IMPORTANTE:
    //Si el filtro de centro está en inactivo, pero la empresa NO tiene ningun
    //centro inactivo, para que BACK no devuelva los documentos (activos/inactivos) para dicha
    //empresa, aún teniendo como centros en inactivo, se indica el idCentro '-1',
    //para provocar que NO devuelva ningún registro para dicha empresa
    if (idCentrosList.length === 0){
        idCentrosList.push(-1);
    }

    //Sucede lo mismo para empresas, si el usuario NO tiene ninguna empresa inactiva, y busca
    //en el filtro con inactivos, entonces no habrá empresas, y se enviará a Back '-1'
    //para evitar que se traiga todas las empresas al ser vacio la lista de empresas
    if (idEmpresasList.length === 0){
        idEmpresasList.push(-1);
    }
  }

  //Método que valora según los formularios si se envian los datos de las listas 'idEmpresasList' y 'idCentrosList'
  valoraListasFinalesAEnviarConFiltro(empresaForm, centroForm, empresasList, idEmpresasList, idCentrosList){

    let idCompaniesListResult: number[] = [];
    let idCentrosListResult: number[] = [];

    //Se comprueba si el usuario había seleccionado alguna empresa/centro en los campos 'empresaForm' y 'centroForm' para
    //alterar o no los atributos a enviar al BACK
    if ( (empresaForm.length === 0 && centroForm.length === 0)
          || (empresaForm.length > 0 && centroForm.length > 0) ){
        idCompaniesListResult = idEmpresasList;
        idCentrosListResult = idCentrosList;
    } else if (empresaForm.length > 0 && centroForm.length === 0){
        //Si el usuario si que ha seleccionado alguna empresa, entonces se recorre las empresas seleccionadas
        //por el usuario
        empresaForm.forEach(idEmpresa => {
            idCompaniesListResult.push(idEmpresa);
        });
        //Si no hay centros para la empresa seleccionada, vendrá con el valor -1 para
        //provocar que NO devuelva ningún registro para dicha empresa
        if (idCentrosList.length > 0 && idCentrosList[0] === -1){
            idCentrosListResult.push(idCentrosList[0]);
        }else{
            //Para los centros sucede lo mismo, pero mirando con la lista general de empresas, donde se va a comprobar
            //si el 'idEmpresa' de la lista 'idCompaniesListResult' está en 'empresasList', y si está
            //se busca sus centros y se realiza la misma operación que con la empresa.
            empresasList.forEach(empresa => {
                if ( idCompaniesListResult.find(idEmpresa => idEmpresa === empresa.idEmpresa) ){
                  if (empresa.centros !== undefined){
                    empresa.centros.forEach(centro => {
                        if ( idCentrosList.find(idCentro => idCentro === centro.idCentro) ){
                            idCentrosListResult.push(centro.idCentro);
                        }
                    });
                  }
                }
            });
        }
    }
    //El caso (empresaForm.length === 0 && centroForm.length > 0)
    //en principio no se va a dar nunca, ya que si no hay una empresa seleccionada no aparecerán los centros.
    /*else if (empresaForm.length === 0 && centroForm.length > 0){
        idCompaniesListResult = idEmpresasList;
        centroForm.forEach(idEmpresa => {
            idCompaniesListResult.push(idEmpresa);
        });
    }*/

    //Array para poder devolver los datos al método principal
    let idsListResult: any[] = [];
    idsListResult[0] = idCompaniesListResult;
    idsListResult[1] = idCentrosListResult;
    return idsListResult;
  }

  /*
    Método que visualiza el historico de documento si ya tiene dichos historicos,
    sino, realizará una llamada a la API para obtener los historicos y poder así visualizarlos
  */
  verHistoricoDocumentoComun(dialogConfig, documento): void{
    if (documento.accionesRealizadas && (documento.listaHistoricoDocumentoDto == undefined || documento.listaHistoricoDocumentoDto.length === 0)){
      let idDocumentoInfo:number = documento.idDocumento;
      let jsonInfoDocumentoDto: any;
      jsonInfoDocumentoDto = {
        idDocumento: idDocumentoInfo
      }
      let jsonInfoDocumentosDto: any[] = [];
      jsonInfoDocumentosDto.push(jsonInfoDocumentoDto);

      this.spinner.show();
      //Llamada al back
      this.getInfoDocumentos(jsonInfoDocumentosDto).subscribe(results => {
        this.spinner.hide();
        //Retorna un mapa <Integer, Lista<HistoricoAccionesDocumento>
        if(results !== undefined){
            //Certificado:
            ////  certificado_contratacion: string = '41'
            ////  certificado_corriente_de_pago: string = '42'
            //Tratamiento:
            ////RGPD = rgpd: string = '1';
            ////Codigo Conducta = codigo_conducta: string = '94';

            if (documento?.idTipoDocumento !== this.globals.rgpd &&
              documento?.idTipoDocumento !== this.globals.codigo_conducta &&
              documento?.idTipoDocumento !== this.globals.certificado_contratacion &&
              documento?.idTipoDocumento !== this.globals.certificado_corriente_de_pago){

              //Si el documento tiene gdpr, entonces no tiene fecha de aceptación de GDPR Y la creamos
              if(documento.gdpr !== undefined){
                //Cualquiera de las dos acciones, la fecha es valida para el seteo del GDPR
                documento.fechaAceptacionGdpr = results[documento.idDocumento][0].fechaAccion;
              }
            }

            //Se van a insertar en el documento la lista de historicos de acciones
            let listaHistoricoDocumentoDto:any=[];
            //Obtengo del mapa, los historicos para el id del documento
            listaHistoricoDocumentoDto = results[idDocumentoInfo];
            documento.listaHistoricoDocumentoDto = listaHistoricoDocumentoDto;

            this.mostrarModalHistoricoAccionesDocumento(dialogConfig, documento);
        }else{
          let titulo = "Ha ocurrido un error al obtener el histórico de acciones realizadas sobre el documento";
          this.translate.get('ERROR_HISTORICO_ACCIONES').subscribe((res: string) => {
            titulo = res;
          });
          this.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
        }
      });
    }else{
      this.mostrarModalHistoricoAccionesDocumento(dialogConfig, documento);
    }
  }

  /*
    Método que abrirá la modal del historico de documentos
  */
  mostrarModalHistoricoAccionesDocumento(dialogConfig, documento): void {
    dialogConfig.data = {
      element: documento
    };
    const isSmallScreen = this.breakpointObserver.isMatched('(max-width: 900px)');
    const isLandscapeScreen = this.breakpointObserver.isMatched(['(orientation: landscape)']);

    if (isSmallScreen){
      if(isLandscapeScreen)
        dialogConfig.width = "70%";
      else
        dialogConfig.width = "100%";
    }else {
      if(isLandscapeScreen)
        dialogConfig.width = "70%";
      else
        dialogConfig.width = "70%";
    }

    //dialogConfig.width = "70%";
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;
    const dialogRef = this.dialog.open(HistoricoAccionesDocumentoComponent, dialogConfig);
  }


  //Método que devuelve una copia del objeto del parametro, incluyendo cualquier objeto/Array
  //interno en algún subnivel de dicho objeto
  deepClone(objeto){
      //let clone = {};
      let objetoClonado = Array.isArray(objeto) ? [] : {};
      //Se va a recorrerlo recursivamente el objeto para que clone todos los posibles objetos internos.
      for (var clave in objeto){
        let valor = objeto[clave];
        //Si es de tipo no objeto, se copial tal cual
        if (typeof valor !== 'object' || valor === null){
          objetoClonado[clave] = valor;
        }else{  //Si es de tipo Object/Array, se recorre recursivamente los n niveles internos del objeto
          objetoClonado[clave] = this.deepClone(valor); //valor = objeto
        }
      }
      return objetoClonado;
  }

  //Método que devuelve el elemento (empresa/centro) actualizando sus atributos
  //dependiendo de sus productos PT (Prevención Técnica) o VS(Vigilancia de la Salud)
  actualizacionAtributosSegunAreaisPTisVS(element, isPT, isVS){
    element.activo = false;
    element.mostrar = false;
    if (!isPT && !isVS){
        if(element.activoPT || element.activoVS){
          element.activo = true;
        }
        if (element.tienePT || element.tieneVS){
          element.mostrar = true;
        }
    }else if (isPT) {
      if (element.activoPT){
        element.activo = true;
      }
      if (element.tienePT){
        element.mostrar = true;
      }
    }else if (isVS) {
      if (element.activoVS){
        element.activo = true;
      }
      if (element.tieneVS){
        element.mostrar = true;
      }
    }
  }

  /**
   * Gets a color depending on some date evaluations
   * @param element
   */
  getStatusColor(element): number {
    if (element.renouncedMedicalExamination) {
      return this.globals.APTITUDE_REPORT_STATUS_GREY;
    }
    if (element.lastRecognitionDate === null || element.lastRecognitionDate === undefined) {
      return this.globals.APTITUDE_REPORT_STATUS_ORANGE;
    }
    const actualDate = new Date();
    const nextMedicalExaminationDate = new Date(element.nextRecognitionDate);
    if (actualDate >= nextMedicalExaminationDate) {
      return this.globals.APTITUDE_REPORT_STATUS_RED;
    }
    const nextMedicalExaminationDateMinusOneMonth = new Date(nextMedicalExaminationDate.getTime());
    nextMedicalExaminationDateMinusOneMonth.setMonth(nextMedicalExaminationDateMinusOneMonth.getMonth() - 1);
    if (actualDate > nextMedicalExaminationDateMinusOneMonth) {
      return this.globals.APTITUDE_REPORT_STATUS_YELLOW;
    }
    if (actualDate <= nextMedicalExaminationDateMinusOneMonth) {
      return this.globals.APTITUDE_REPORT_STATUS_GREEN;
    }
  }

  /**
   * Gets a dto which contains three maps with the relations between communities, provinces, localities and centers
   */
  getAllCommunitiesProvincesLocalitiesAndMedicalCenters() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: navigator.language,
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + `/getAllCommunitiesProvincesLocalitiesAndMedicalCenters`;
    return this.http.get<any>(url, this.httpOptions);
  }

  /**
   * Given an object list and a property name, sorts that list alphabetically by the property name
   * @param listToBeSort
   * @param propertyName
   */
  sortObjectListByStringProperty(listToBeSort: any[], propertyName: string): any[] {
    return listToBeSort.sort((a, b) => {
      const x = a[propertyName];
      const y = b[propertyName];
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
  }

  /**
   * Given a list and a property name + its value, return the object list which matches the case
   * @param listToBeSearched
   * @param propertyName
   * @param propertyValue
   */
  getObjectFromListByProperty(listToBeSearched: any[], propertyName: string, propertyValue: any): any[] {
    const objectList = [];
    listToBeSearched.forEach(object => {
      if (object[propertyName] === propertyValue) {
        objectList.push(object);
      }
    });
    return objectList;
  };

  listHasSameContent(a1, a2) {
    var i = a1.length;
    if (i != a2.length) return false;

    while (i--) {
      if (a1[i] !== a2[i]) return false;
    }
    return true;
  }

  DisplayAppointmentHistory(element){
    return (!element.fechaBaja && element.lastRecognitionDateConfirmed !== undefined && element.lastRecognitionDateConfirmed !== null);
  }

  DisplayRequestAppointment(element){
    if (element.fechaBaja) return false;
    if(element.lastRecognitionDateConfirmed !== undefined && element.lastRecognitionDateConfirmed !== null){
      let today = new Date(Date.now());
      today.setHours(0, 0, 0, 0);
      return today > new Date(element.lastRecognitionDateConfirmed);
    }
    return true;
  }

  /**
   * Given an aptitude report, calculates its status color depending on its date values,
   * and returns that translated color value
   * @param element
   */
  getStatusColorTranslated(element) {
    const statusColorId = this.getStatusColor(element);
    let statusColorToBeTranslated = '';
    switch (statusColorId) {
      case 0: // grey
        statusColorToBeTranslated = 'VIGILANCIA_INFORMES_APTITUD.LEGEND.DISCLAIMER';
        break;
      case 1: // orange
        statusColorToBeTranslated = 'VIGILANCIA_INFORMES_APTITUD.LEGEND.NOT_PERFORMED';
        break;
      case 2: // red
        statusColorToBeTranslated = 'VIGILANCIA_INFORMES_APTITUD.LEGEND.EXPIRED';
        break;
      case 3: // yellow
        statusColorToBeTranslated = 'VIGILANCIA_INFORMES_APTITUD.LEGEND.EXPIRING_SOON';
        break;
      case 4: // green
        statusColorToBeTranslated = 'VIGILANCIA_INFORMES_APTITUD.LEGEND.IN_FORCE';
        break;
    }
    if (statusColorToBeTranslated) {
      this.translate.get(statusColorToBeTranslated).subscribe((res: string) => {
        statusColorToBeTranslated = res;
      });
    }
    return statusColorToBeTranslated;
  }

  getTipoReciclajeDescripcion(idTipoReciclajeParam, tipoReciclajeList){
    var nombreReciclaje = 'NO_PROCEDE';
    this.translate.get('NO_PROCEDE').subscribe((res: string) => {
      nombreReciclaje = res;
    });
    tipoReciclajeList.forEach(tipoReciclaje => {
      if(tipoReciclaje.idTipoReciclaje.toString() === idTipoReciclajeParam){
        nombreReciclaje = tipoReciclaje.nombre;
      }
    })
    return nombreReciclaje;
  }

  getColorSemaforo(element) {
    const now = moment()
    if(element.fechaReciclaje === undefined) {
      return "Vigente";
    }
    const fechaReciclaje = moment(element.fechaReciclaje)
    const diff = fechaReciclaje.diff(now, 'months')
    if(diff < 0) {
      return "Procede reciclar";
    } else if(diff <= 3) {
      return "Próximo a reciclar";
    } else {
      return "Vigente";
    }
  }

  translateText(key :string, default_value  = ''){
    let value = default_value
    this.translate.get(key).subscribe((res: string) => { value = res; });
    return value;
  }

  exportAsExcel(dataSource, tableHeaders, tipoReciclajeList = []){
    this.spinner.show();
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    let JSONWS: XLSX.WorkSheet;
    let dataJS = [];

    //Variables para traducción
    let nombreExcel = "Diplomas Certificados";
    this.translateText('DIPLOMAS_CERTIFICADOS',nombreExcel);

    let columnaEstado = "Estado";
    let columnaFechaFin = "Fecha Fin";
    let columnaFechaReciclaje = "Fecha Reciclaje";
    let columnaOrigen = "Origen";
    let columnaCategoria = "Categoría";
    let columnaNombreCurso = "Nombre Curso";
    let columnaSubcategoria = "Subcategoría";
    let columnaModalidad = "Modalidad";
    let columnaTipoReciclaje = "Tipo Reciclaje";
    let columnaHoras = "Horas";
    let columnaTrabajador = "Trabajador";
    let columnaTrabajadorNif = "NIF/NIE";
    let columnaPuestoTrabajo = "Puesto Trabajo";
    this.translateText('ESTADO', columnaEstado);
    this.translateText('FECHA_FIN', columnaFechaFin);
    this.translateText('FECHA_RECICLAJE', columnaFechaReciclaje);
    this.translateText('ORIGEN', columnaOrigen);
    this.translateText('CATEGORIA', columnaCategoria);
    this.translateText('NOMBRE_CURSO', columnaNombreCurso);
    this.translateText('SUBCATEGORIA', columnaSubcategoria);
    this.translateText('MODALIDAD', columnaModalidad);
    this.translateText('TIPO_RECICLAJE', columnaTipoReciclaje);
    this.translateText('HORAS', columnaHoras);
    this.translateText('TRABAJADOR', columnaTrabajador);
    this.translateText('NIF_NIE', columnaTrabajadorNif);
    this.translateText('PUESTO_TRABAJO', columnaPuestoTrabajo);

    let isElementosSelect: boolean = false;

    dataSource._orderData(dataSource.data).forEach(item => {
      if(item.checked){
        isElementosSelect = true;
        let new_item = {};
        tableHeaders.forEach(title => {
          switch (title){
            case 'semaforo': new_item[columnaEstado] = this.getColorSemaforo(item); break;
            case 'fechaFin': new_item[columnaFechaFin] = item.fechaFin; break;
            case 'fechaReciclaje': new_item[columnaFechaReciclaje] = item.fechaReciclaje; break;
            case 'origen':new_item[columnaOrigen] = this.translateText(item.origen, columnaOrigen); break;
            case 'modalidad': new_item[columnaModalidad] = item.modalidad; break;
            case 'horas': new_item[columnaHoras] = item.horas; break;
            case 'nombreCurso':
              new_item[columnaNombreCurso] = item.nombreCurso;
              break;
            case 'tipoDocumento':
              new_item[columnaCategoria] = this.translateText(item.tipoDocumento, columnaCategoria );
              new_item[columnaSubcategoria] = item.subcategoria === 'NO_PROCEDE' ?  '' : this.translateText(item.subcategoria, columnaSubcategoria);
              new_item[columnaModalidad] = this.translateText(item.modalidadCurso, columnaModalidad);
              new_item[columnaTipoReciclaje] = this.getTipoReciclajeDescripcion(item.tipoReciclaje, tipoReciclajeList)
              break;
            case 'trabajador':
              let trabajadorYNif = item.trabajador.split("<br>");
              new_item[columnaTrabajador] = trabajadorYNif[0];
              new_item[columnaTrabajadorNif] = trabajadorYNif[1];
            break;
            case 'puestoTrabajo':
              new_item[columnaPuestoTrabajo] = item.puestoTrabajo.map(puesto => {
                return puesto['nombre'];
              }).join(', ');
            break;
            default: break;
          }
        })

        dataJS.push(new_item);
      }
    });

    if (isElementosSelect == false) {
      let titulo = "Debe seleccionar al menos un elemento a exportar";
      this.translate.get('ERROR_SELECCIONA_EXPORTAR').subscribe((res: string) => {
        titulo = res;
      });
      this.mostrarMensajeSwalFire('error', titulo, '', 'var(--blue)', false);
    } else {
      let result = XLSX.utils.sheet_add_json(JSONWS, dataJS);

      XLSX.utils.book_append_sheet(wb, result, 'Sheet1');

      /* save to file */
      XLSX.writeFile(wb, nombreExcel + '.xlsx');
    }
    //this.dataSource.paginator._changePageSize(paginacion);

    this.spinner.hide();
  }

  /**
   * Función que dada un correo adjuntando una lista de documentos.
   * @param mode Modo en el que se descarga los archivos
   * @param listaDocumentos Lista de documentos que se desea enviar
   * @param menuText Objeto que almacena el texto del menu y submenu en menuName y subMenuName
   * @param isLoginSimulado Nos indica si estamos en un Login simulado
   * @return Boolean -> Nos indica si la acción se ha ejecutado correctamente
   */
  compartirMultiple(mode, listaDocumentos, menuText, nombreZip, isLoginSimulado){

    // Datos que se van a devolver que indica si se han enviado correctamente los datos
    let documentsSend:boolean = false;

    // Cargamos datos del cuadro de dialogo
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      element: listaDocumentos,
      menuName: menuText.menuName,
      subMenuName: menuText.subMenuName
    };
    dialogConfig.width = "50%";
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;

    // Se abre el cuadro para rellenar los datos
    const dialogRef = this.dialog.open(ShareDocumentComponent, dialogConfig);

    // Al cerrar el cuadro
    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined) {
        // Obtenemos los datos necesarios de los documentos seleccionados
        let listaIdsTiposDocumentos: number[] = [];
        let listaUuidsDocumentos: string[] = [];
        let listaIdsDocumentos: number[] = [];
        listaDocumentos.forEach(documento => {
          listaIdsTiposDocumentos.push(documento.idTipoDocumento);
          listaUuidsDocumentos.push(documento.ubicacion);
          listaIdsDocumentos.push(documento.idDocumento);
        });

        // Creamos estructura de los datos para el correo
        let data = {
          to: result.emailFormControl,
          cc: result.ccFormControl,
          cco: result.ccoFormControl,
          subject: result.subjectFormControl,
          body: result.bodyFormControl,

          documentoDownloadDto: {
            listaIdsDocumentos,
            listaIdsTiposDocumentos,
            listaUuidsDocumentos,
            loginSimuladoActivado: isLoginSimulado,
            accion: { idAccionDoc: mode },
            filename: nombreZip + ".zip"
          }
        }

        // Mensaje de "Se han enviado el correo"
        let titulo = this.translateText('ENVIO_DOC_INICIADA',"Se ha procedido al envío por correo electrónico de la documentación indicada");
        this.mostrarMensajeSwalFire('info', titulo, '','var(--blue)', false);

        // Se envía el correo con los documentos en formato de ZIP
        this.compartirDocumentoZip(data).subscribe(result => {
          // Error al compartir el archivo zip
          if (!result) {
            let titulo = this.translateText('ERROR_ENVIO_MENSAJE', "Error al enviar el mensaje");
            this.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
          }
          // Se han enviado los datos
          else{ documentsSend = true; }
        })
        ,((error) => {
          if (environment.debug) console.log("Error al Enviar EMAIL - Compartir Documento");
        });
      }
    });
    return documentsSend;
  }

  /**
   * Función que dada un correo adjuntando una lista de documentos combinados de cursos vitaly y propios.
   * @param mode Modo en el que se descarga los archivos
   * @param listaDocumentos Lista de documentos que se desea enviar
   * @param menuText Objeto que almacena el texto del menu y submenu en menuName y subMenuName
   * @param isLoginSimulado Nos indica si estamos en un Login simulado
   * @return Boolean -> Nos indica si la acción se ha ejecutado correctamente
   */
  shareMassiveCombinedZip(mode, listaDocumentos, filteredData, menuText, nombreZip, isLoginSimulado){

    // Datos que se van a devolver que indica si se han enviado correctamente los datos
    let documentsSend:boolean = false;

    // Cargamos datos del cuadro de dialogo
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      element: listaDocumentos,
      menuName: menuText.menuName,
      subMenuName: menuText.subMenuName
    };
    dialogConfig.width = "50%";
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;

    // Se abre el cuadro para rellenar los datos
    const dialogRef = this.dialog.open(ShareDocumentComponent, dialogConfig);

    // Al cerrar el cuadro
    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined) {
        // Obtenemos los datos necesarios de los documentos seleccionados
        let listaIdsTiposDocumentos: number[] = [];
        let listaUuidsDocumentos: string[] = [];
        let listaIdsDocumentos: number[] = [];
        let listaOrigins: string[] = [];
        listaDocumentos.forEach(documento => {
          listaIdsTiposDocumentos.push(documento.idTipoDocumento);
          listaUuidsDocumentos.push(documento.origen === 'EXTERNAL' ? documento.externalCourseMemberId : documento.ubicacion);
          listaIdsDocumentos.push(documento.origen === 'EXTERNAL' ? documento.externalCourseMemberId : documento.idDocumento);
          listaOrigins.push(documento.origen);
        });

        filteredData.forEach(item => {
          item.idDocumento = item.origen === 'EXTERNAL' ? item.externalCourseMemberId : item.idDocumento;
        });

        // Creamos estructura de los datos para el correo
        let data = {
          to: result.emailFormControl,
          cc: result.ccFormControl,
          cco: result.ccoFormControl,
          subject: result.subjectFormControl,
          body: result.bodyFormControl,

          documentoDownloadDto: {
            listaIdsDocumentos,
            listaIdsTiposDocumentos,
            listaUuidsDocumentos,
            listaOrigins,
            loginSimuladoActivado: isLoginSimulado,
            accion: { idAccionDoc: mode },
            filename: nombreZip + ".zip"
          }
        }

        // Mensaje de "Se han enviado el correo"
        let titulo = this.translateText('ENVIO_DOC_INICIADA',"Se ha procedido al envío por correo electrónico de la documentación indicada");
        this.mostrarMensajeSwalFire('info', titulo, '','var(--blue)', false);

        // Se envía el correo con los documentos en formato de ZIP
        this.shareCombinedZip(data).subscribe(result => {
          // Error al compartir el archivo zip
          if (!result) {
            let titulo = this.translateText('ERROR_ENVIO_MENSAJE', "Error al enviar el mensaje");
            this.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
          }
          // Se han enviado los datos
          else{
            documentsSend = true;
            // Si comparte correctamente los documentos
            // y no nos encontramos en un Login simulado actualizamos los datos
            if(!isLoginSimulado){
              //Recarga los datos de nuevo para quitar nuevo documento y mostrar las acciones de los documentos
              let jsonInfoDocumentosDto: any[] = [];
              listaDocumentos.forEach(idDocumentoInfo => {
                jsonInfoDocumentosDto.push({ idDocumento: idDocumentoInfo.idDocumento });
              });

              this.recargarTablaDatosMultiplePorAccion(jsonInfoDocumentosDto, filteredData, this.spinner, false, null, false, null, false);
            }
          }
        })
          ,((error) => {
          if (environment.debug) console.log("Error al Enviar EMAIL - Compartir Documento");
        });
      }
    });
    return documentsSend;
  }

  /**
   * Función que sirve para descargar una lista de ficheros en formato .zip
   * @param listaDocumentos Lista de documentos que se desea descargar
   * @param isLoginSimulado Nos indica si estamos en un Login simulado
   * @return Boolean -> Nos indica si la acción se ha ejecutado correctamente
   */
  descargarMultiple(listaDocumentos, nombreZip, isLoginSimulado){

    // Mostrar el spinner
    this.spinner.show();

    // Datos que se van a devolver que indica si se han descargado correctamente los datos
    let documentsDownload :boolean = false;

    //Cargamos los datos que vamos a necesitar
    let listaIdsDocumentos: number[] = [];
    let listaIdsTiposDocumentos: number[] = [];
    let listaUuidsDocumentos: string[] = [];
    listaDocumentos.forEach(doc => {
        listaIdsDocumentos.push(doc.idDocumento);
        listaIdsTiposDocumentos.push(doc.idTipoDocumento);
        listaUuidsDocumentos.push(doc.ubicacion);
      });

    // Datos para la petición
    let data = {
      listaIdsDocumentos,
      listaIdsTiposDocumentos,
      listaUuidsDocumentos,
      loginSimuladoActivado: isLoginSimulado,
      accion: { idAccionDoc: "2" },
      filename: nombreZip + '.zip'
    }

    // Solicitamos generar un archivo zip
    this.getZipFile(data).subscribe(zipBase64 => {
      // Error al generar el zip con los archivos
      if (!zipBase64) {
        let titulo = this.translateText('ERROR_ENVIO_MENSAJE', "Error al enviar el mensaje");
        this.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
      }
      // Se ha generado el zip
      else{

        // Creamos un enlace y lo clicamos para descargar el archivo
        let downloadLink = document.createElement('a');
        downloadLink.href = `data:application/zip;base64,${zipBase64.fichero}`;
        downloadLink.download = nombreZip + '.zip';
        downloadLink.click();

        documentsDownload = true;
      }
      // Quitamos el spinner
      this.spinner.hide();
    },(error => {
      console.error(error);
      this.spinner.hide();
    }))

    return documentsDownload;
  }

  /**
   * Función que sirve para descargar una lista de ficheros en formato .zip
   * @param listaDocumentos Lista de documentos que se desea descargar
   * @param isLoginSimulado Nos indica si estamos en un Login simulado
   * @return Boolean -> Nos indica si la acción se ha ejecutado correctamente
   */
  downloadMassiveCombinedZip(listaDocumentos, filteredData, nombreZip, isLoginSimulado){

    // Mostrar el spinner
    this.spinner.show();

    // Datos que se van a devolver que indica si se han descargado correctamente los datos
    let documentsDownload :boolean = false;

    //Cargamos los datos que vamos a necesitar
    let listaIdsDocumentos: number[] = [];
    let listaIdsTiposDocumentos: number[] = [];
    let listaUuidsDocumentos: string[] = [];
    let listaOrigins: string[] = [];
    listaDocumentos.forEach(doc => {
      listaIdsDocumentos.push(doc.origen === 'EXTERNAL' ? doc.externalCourseMemberId : doc.idDocumento);
      listaIdsTiposDocumentos.push(doc.idTipoDocumento);
      listaUuidsDocumentos.push(doc.origen === 'EXTERNAL' ? doc.externalCourseMemberId : doc.ubicacion);
      listaOrigins.push(doc.origen);
    });

    filteredData.forEach(item => {
      item.idDocumento = item.origen === 'EXTERNAL' ? item.externalCourseMemberId : item.idDocumento;
    });

    // Datos para la petición
    let data = {
      listaIdsDocumentos,
      listaIdsTiposDocumentos,
      listaUuidsDocumentos,
      listaOrigins,
      loginSimuladoActivado: isLoginSimulado,
      accion: { idAccionDoc: "2" },
      filename: nombreZip + '.zip'
    }

    // Solicitamos generar un archivo zip
    this.getCombinedZipFile(data).subscribe(zipBase64 => {
      // Error al generar el zip con los archivos
      if (!zipBase64) {
        let titulo = this.translateText('ERROR_ENVIO_MENSAJE', "Error al enviar el mensaje");
        this.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
      }
      // Se ha generado el zip
      else{

        // Creamos un enlace y lo clicamos para descargar el archivo
        let downloadLink = document.createElement('a');
        downloadLink.href = `data:application/zip;base64,${zipBase64.fichero}`;
        downloadLink.download = nombreZip + '.zip';
        downloadLink.click();

        documentsDownload = true;

        // Si descarga correctamente los documentos
        // y no nos encontramos en un Login simulado actualizamos los datos
        if(!isLoginSimulado){
          //Recarga los datos de nuevo para quitar nuevo documento y mostrar las acciones de los documentos
          let jsonInfoDocumentosDto: any[] = [];
          listaDocumentos.forEach(idDocumentoInfo => {
            jsonInfoDocumentosDto.push({ idDocumento: idDocumentoInfo.idDocumento });
          });

          this.recargarTablaDatosMultiplePorAccion(jsonInfoDocumentosDto, filteredData, this.spinner, false, null, false, null, false);
        }
      }
      // Quitamos el spinner
      this.spinner.hide();
    },(error => {
      console.error(error);
      this.spinner.hide();
    }))

    return documentsDownload;
  }

  /**
   * Función para descargar o compartir documentos dependiendo de la acción seleccionada
   * @param action Indica el tipo de acción que se quiere realizar. Opciones disponibles:
   *  <ul>
   *    <li>1 - COMPARTIR</li>
   *    <li>2 - DESCARGAR</li>
   *  </ul>
   * @param documents Lista de documentos seleccionados
   * @param isLoginSimulado parámetro que nos indica si estamos en un login simulado
   * @return Boolean -> Nos indica si la acción se ha ejecutado correctamente.
   */
  masiveActions(action, documents, nombreZip, isLoginSimulado){

    // Indica si se ha realizado correctamente la acción
    let successfulAction :boolean = false;

    // Definimos los errores que se pueden producir en función de la acción
    // que se quiera realizar.
    let key, default_value;
    switch (action){
      case 1:
        key = "ERROR_SELECCIONA_COMPARTIR"
        default_value = "Debe seleccionar al menos un elemento a compartir";
        break;
      case 2:
        key = "ERROR_SELECCIONA_DESCARGAR";
        default_value = "Debe seleccionar al menos un elemento a descargar";
        break;
      default:
        key = "ERROR";
        default_value = "Se ha producido un error";
        documents = [];
        break;
    }

    // Si se ha seleccionado una acción correcta y un número de documentos adecuados
    if ( documents.length > 0 && documents.length <= this.globals.extranet_maximo_documentos_multiple) {
        switch (action){
          case 1:
            let menuText = {
              'menuName'    : this.translateText('DOCUMENTACION_VIGILANCIA','Documentación Vigilancia'),
              'subMenuName' : this.translateText('REGISTROS_FORMACION', 'Registros de formación')
            }
            successfulAction = this.compartirMultiple(1, documents, menuText, nombreZip, isLoginSimulado);
            break;
          case 2:
            successfulAction = this.descargarMultiple(documents, nombreZip, isLoginSimulado);
            break;
        }
    }

    // Si nos pasamos de elementos seleccionados
    else if ( documents.length > this.globals.extranet_maximo_documentos_multiple) {
      this.mostrarMensajeSwalFireSobrepasadoLimiteDescargaMultiple( documents.length );
    }

    // Error si no se selecciona ninguna o se pone una acción no valida
    else {
      let titulo = this.translateText(key, default_value);
      this.mostrarMensajeSwalFire("error", titulo, "","var(--blue)", false);
    }

    return successfulAction;
  }


  /**
   * Función para descargar o compartir documentos dependiendo de la acción seleccionada
   * @param action Indica el tipo de acción que se quiere realizar. Opciones disponibles:
   *  <ul>
   *    <li>1 - COMPARTIR</li>
   *    <li>2 - DESCARGAR</li>
   *  </ul>
   * @param documents Lista de documentos seleccionados
   * @param isLoginSimulado parámetro que nos indica si estamos en un login simulado
   * @return Boolean -> Nos indica si la acción se ha ejecutado correctamente.
   */
  masiveActionsWithRefresh(action, filteredData, documents, nombreZip, isLoginSimulado, listaDocumentosChecked){

    // Indica si se ha realizado correctamente la acción
    let successfulAction :boolean = false;

    // Definimos los errores que se pueden producir en función de la acción
    // que se quiera realizar.
    let key, default_value;
    switch (action){
      case 1:
        key = "ERROR_SELECCIONA_COMPARTIR"
        default_value = "Debe seleccionar al menos un elemento a compartir";
        break;
      case 2:
        key = "ERROR_SELECCIONA_DESCARGAR";
        default_value = "Debe seleccionar al menos un elemento a descargar";
        break;
      case 3:
        key = "ERROR_SELECCIONA_DESCARGAR";
        default_value = "Debe seleccionar al menos un elemento a descargar";
        break;
      case 4:
        key = "ERROR_SELECCIONA_COMPARTIR"
        default_value = "Debe seleccionar al menos un elemento a compartir";
        break;
      default:
        key = "ERROR";
        default_value = "Se ha producido un error";
        documents = [];
        break;
    }

    // Si se ha seleccionado una acción correcta y un número de documentos adecuados
    if ( documents.length > 0 && documents.length <= this.globals.extranet_maximo_documentos_multiple) {
      switch (action){
        case 1:
          let menuText = {
            'menuName'    : this.translateText('DOCUMENTACION_VIGILANCIA','Documentación Vigilancia'),
            'subMenuName' : this.translateText('REGISTROS_FORMACION', 'Registros de formación')
          }
          successfulAction = this.compartirMultiple(1, documents, menuText, nombreZip, isLoginSimulado);
          break;
        case 2:
          successfulAction = this.descargarMultiple(documents, nombreZip, isLoginSimulado);
          break;
        case 3:
          successfulAction = this.downloadMassiveCombinedZip(documents, filteredData, nombreZip, isLoginSimulado);
          break;
        case 4:
          let menuTextShare = {
            'menuName'    : this.translateText('DOCUMENTACION_VIGILANCIA','Documentación Vigilancia'),
            'subMenuName' : this.translateText('REGISTROS_FORMACION', 'Registros de formación')
          }
          successfulAction = this.shareMassiveCombinedZip(1, documents, filteredData, menuTextShare, nombreZip, isLoginSimulado);
          break;
      }
    }

    // Si nos pasamos de elementos seleccionados
    else if ( documents.length > this.globals.extranet_maximo_documentos_multiple) {
      this.mostrarMensajeSwalFireSobrepasadoLimiteDescargaMultiple( documents.length );
    }

    // case when documents lenght > 0 but hvn't document
    else if ( !(documents.length > 0) && listaDocumentosChecked.length > 0) {
      let titulo = this.translateText("DIPLOMAS_TRABAJADOR_MULTIPLE", default_value);
      this.mostrarMensajeSwalFire("error", titulo, "","var(--blue)", false);
    }

    // Error si no se selecciona ninguna o se pone una acción no valida
    else {
      let titulo = this.translateText(key, default_value);
      this.mostrarMensajeSwalFire("error", titulo, "","var(--blue)", false);
    }

    return successfulAction;
  }

  /* downloadWorkerDocuments */
  downloadWorkerDocuments(data): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: navigator.language,
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/workersCard' + '/downloadWorkerDocuments';
    return this.http.post<any>(url, data
      , httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado downloadWorkerDocuments()')),
      catchError(this.serviceGenericError.handleError<any>('Error en downloadWorkerDocuments()'))
    );
  }

  formatCardSummaryDto(trabajador): object {
    const filterData = {
      listaIdsEmpresas: [ trabajador.empresa.idEmpresa ],
      listaIdsCentros: [ trabajador.centro.idCentro ],
      listaIdsTipoDocumento: [ "46" ],
      listaFiltroMetadatosDto: [
        {
          nombreMetadato: "trabajador",
          listaIdsValoresDato: [ trabajador.idTrabajador ]
        },
        {
          nombreMetadato: "trabajador_activo",
          listaIdsValoresDato: [ 1 ]
        },
        {
          nombreMetadato: "nif_trabajador",
          listaIdsValoresDato: [ trabajador.nif ]
        },
        {
          nombreMetadato: "section_name",
          listaIdsValoresDato: [ "prevencion-trabajadores" ]
        },
        {
          nombreMetadato: "job_position",
          listaIdsValoresDato: [ trabajador.puestosTrabajo[0].idPuestoTrabajo ]
        },
        {
          nombreMetadato: "worker_name",
          valorDato: trabajador.nombre + " " + trabajador.apellidos
        },
        {
          nombreMetadato: "client_name",
          valorDato: trabajador.empresa.nombre
        }
      ]
    };

    return filterData;
  }

  formatFormationTabDto(trabajador): object {
    const data = {
      listaIdsEmpresas: [trabajador?.empresa?.idEmpresa],
      listaIdsCentros: [trabajador?.centro?.idCentro],
      listaIdsTipoDocumento: [this.globals.diplomas],
      listaFiltroMetadatosDto: [{
        nombreMetadato: this.globals.metadato_trabajador,
        listaIdsValoresDato: [String(trabajador?.idTrabajador)]
      },
        {
          nombreMetadato: this.globals.metadato_trabajador_activo,
          listaIdsValoresDato: [1]
        },
        {
          nombreMetadato: this.globals.metadato_nif_trabajador,
          listaIdsValoresDato: [trabajador?.nif]
        },
        {
          nombreMetadato: this.globals.SECTION_NAME,
          listaIdsValoresDato: [this.globals.SECTION_WORKER_PAGE]
        }]
    };
    return data;
  }

  formatAptitudeTabDto(trabajador): object {
    const data = {
      listaIdsEmpresas: [trabajador?.empresa?.idEmpresa],
      listaIdsCentros: [trabajador?.centro?.idCentro],
      listaIdsTipoDocumento: [this.globals.informes_aptitud],
      listaFiltroMetadatosDto: [{
        nombreMetadato: this.globals.metadato_trabajador,
        listaIdsValoresDato: [String(trabajador?.idTrabajador)]
      },
        {
          nombreMetadato: this.globals.metadato_trabajador_activo,
          listaIdsValoresDato: [1]
        },
        {
          nombreMetadato: this.globals.metadato_nif_trabajador,
          listaIdsValoresDato: [trabajador?.nif]
        },
        {
          nombreMetadato: this.globals.SECTION_NAME,
          listaIdsValoresDato: [this.globals.SECTION_WORKER_PAGE]
        }]
    };
    return data;
  }

  formatDocumentTabDto(trabajador): object {
    const data = {
      employeeId: trabajador?.idTrabajador,
      centerId: trabajador?.centro?.idCentro,
      clientId: trabajador?.empresa?.idEmpresa,
      jobPositionIdList: trabajador?.puestosTrabajo?.map(p => p.idPuestoTrabajo)
    };

    return data;
  }
}
