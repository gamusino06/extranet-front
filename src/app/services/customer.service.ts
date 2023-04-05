import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthTokenService} from './auth-token.service';
import {environment} from '../../environments/environment';
import {JsonArray, JsonObject} from '@angular/compiler-cli/ngcc/src/packages/entry_point';
import {Query} from '../Model/Query';
import {getFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system';


@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  baseUrl = '/sajp';

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    })
  };

  constructor(
    private authTokenService: AuthTokenService,
    private http: HttpClient,
  ) { }

  getApiBaseUrl() {
    return environment.api.url;
  }

  /**
   * Metodo para recoger informacion general de una empresa
   */
  getInformacion(id, language) {
    let userId = JSON.parse(localStorage.userDataFromUsuario).idUsuario;
    const url = this.getApiBaseUrl() + this.baseUrl + `/customers/${id}/data/${language}?userId=${userId}`;
    return this.http.get<any>(url, this.httpOptions);
  }

  /**
   * Metodo para recoger empresas de un usuario.
   */
  getEmpresas(id) {
    const url = this.getApiBaseUrl() + this.baseUrl + `/customers/companySelection`;
    return this.http.get<any>(`${url}/${id}`, this.httpOptions);
  }

  getFechaEmpresa(id) {
    const url = this.getApiBaseUrl() + this.baseUrl + '/customers';
    return this.http.get<any>(`${url}/${id}/date`, this.httpOptions);
  }

  /**
   * Obtención de todos los años registrados en actuaciones por clienteId
   */
  getActionReportYears(customerId: number) {
    let userId = JSON.parse(localStorage.userDataFromUsuario).idUsuario;
    const url = this.getApiBaseUrl() + this.baseUrl + `/customers/${customerId}/actions-report-years?userId=${userId}`;
    return this.http.get<any>(url, this.httpOptions);
  }

  /**
   * Obtención de todas las acciones realizadas por año para extranet
   */
  getActionsReportByFilter(customerId: number, year: string) {
    let userId = JSON.parse(localStorage.userDataFromUsuario).idUsuario;
    const url = this.getApiBaseUrl() + this.baseUrl + `/customers/${customerId}/actions-report/${year}?userId=${userId}`;
    return this.http.get<any>(url, this.httpOptions);
  }

  /**
   * Obtiene todas las actividades (cursos, jornadas o píldoras) asociadas al cliente
   */
  getCustomerActivities(customerId: number, filters: any) {
    let userId = JSON.parse(localStorage.userDataFromUsuario).idUsuario;
    const url = this.getApiBaseUrl() + this.baseUrl + `/customers/${customerId}/activities?userId=${userId}`;
    return this.http.post<any>(url, filters, this.httpOptions);
  }

  /**
   * Metodo que obtiene los documentos
   */
  getDocumentsByFilter(customerId: number, particular: number, language: string, filtros: string){
    let userId = JSON.parse(localStorage.userDataFromUsuario).idUsuario;
    const url = this.getApiBaseUrl() + this.baseUrl + `/extranet/${customerId}/documents/${particular}?userId=${userId}&language=${language}${filtros}`;
    return this.http.get<any>(url, this.httpOptions);
  }

  /**
   * Metodo que obtiene la información de un documento por su id
   */
  getDocumentById(documentId: number, typeId: number, language: string, customerId: number){
    let userId = JSON.parse(localStorage.userDataFromUsuario).idUsuario;
    const url = this.getApiBaseUrl() + this.baseUrl + `/${documentId}/${typeId}?language=${language}&customerId=${customerId}&userId=${userId}`;
    return this.http.get<any>(url, this.httpOptions);
  }

  /**
   * Metodo que trae todos los documentos adjuntos de un documento por su ID
   * @param documentId
   */
  findAllAttachments(documentId: number, customerId: number){
    let userId = JSON.parse(localStorage.userDataFromUsuario).idUsuario;
    const url = this.getApiBaseUrl() + this.baseUrl + `/documents/${documentId}/attachments?customerId=${customerId}&userId=${userId}`;
    return this.http.get<any>(url, this.httpOptions);
  }

  /**
   * Metodo que obtiene los tipos de querys
   */
  getAllQueryStatus(language: string){
    const url = this.getApiBaseUrl() + this.baseUrl + `/status?language=${language}`;
    return this.http.get<any>(url, this.httpOptions);
  }

  /**
   * Metodo que obtiene la query por id
   */
  findQueriesByQueryId(queryId: number, language: string, customerId: number){
    let userId = JSON.parse(localStorage.userDataFromUsuario).idUsuario;
    const url = this.getApiBaseUrl() + this.baseUrl + `/query/${queryId}?language=${language}&customerId=${customerId}&userId=${userId}`;
    return this.http.get<any>(url, this.httpOptions);
  }

  /**
   * Metodo que obtiene las querys por customerId y status
   */
  findAllByStatus(customerId: number, statusId: number, language: string){
    let userId = JSON.parse(localStorage.userDataFromUsuario).idUsuario;
    const url = this.getApiBaseUrl() + this.baseUrl + `/customer/${customerId}/${statusId}?language=${language}&userId=${userId}`;
    return this.http.get<any>(url, this.httpOptions);
  }

  /**
   * Habilita la visualización del vídeo o pill
   */
  watchPill(activityId: number, customerId: number, usuarioExtranet: number) {
    const url = this.getApiBaseUrl() + this.baseUrl + `/customers/${activityId}/watch-pill?customerId=${customerId}&usuarioExtranet=${usuarioExtranet}`;
    return this.http.post<any>(url, {}, this.httpOptions);
  }

  /**
   * Metodo que crea una nueva consulta
   */
  saveQuery(customerId: number, dataJson: Query, files: File[], formData: FormData, createdBy: number){
    let objeto = {
      dataJson,
      files
    };

    let headers = new HttpHeaders({
      Authorization: 'Bearer ' + localStorage.getItem('token')
    })

    const url = this.getApiBaseUrl() + this.baseUrl + `/${customerId}/send?createdBy=${createdBy}`;
    return this.http.post<any>(url, formData, {headers});
  }

  /**
   * Metodo que obtiene los documentos asociados a una query
   */
  getAttachmentsByQueryline(queryId: number, customerId: number){
    let usuarioExtranet = JSON.parse(localStorage.userDataFromUsuario).idUsuario;
    let headers = new HttpHeaders({
      Authorization: 'Bearer ' + localStorage.getItem('token')
    })

    const url = this.getApiBaseUrl() + this.baseUrl + `/${queryId}/download?usuarioExtranet=${usuarioExtranet}&customerId=${customerId}`;
    return this.http.get(url, {headers, responseType: 'blob'});
  }

  /**
   * Metodo que obtiene un documento
   */
  downloadDocument(attachmentId: number, customerId: number){
    let usuarioExtranet = JSON.parse(localStorage.userDataFromUsuario).idUsuario;
    let headers = new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    })

    const url = this.getApiBaseUrl() + this.baseUrl + `/documents/${attachmentId}/download?userId=${usuarioExtranet}&customerId=${customerId}`;
    return this.http.get(url, {headers, responseType: 'blob'});
  }
}
