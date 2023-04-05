import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {WorkerDocument} from '../Model/WorkerCard/WorkerDocument';
import {Observable} from 'rxjs';
import {WorkerDocumentEmail} from '../Model/WorkerCard/WorkerDocumentEmail';
import {AutorizacionesDTO} from '../Model/Autorizacion/AutorizacionesDTO';
import { WorkerDataFilter, WorkerSummaryCardEmail } from '../Model/WorkerCard/WorkerSummaryCardEmail';

@Injectable({
  providedIn: 'root'
})
export class WorkersCardService {

  constructor(private http: HttpClient) { }

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      Language: navigator.language,
      Authorization: 'Bearer ' + localStorage.getItem('token')
    })
  };

  getApiBaseUrl() { return environment.api.url + '/workersCard'; }

  getAllDocumentsTypes() {
    const url = this.getApiBaseUrl() + `/getAllDocumentsTypes`;
    return this.http.get<any>(url, this.httpOptions);
  }

  getCenters(user) {
    const data = [user];
    const url = this.getApiBaseUrl() + `/getCenters`;
    return this.http.post<any>(url, data, this.httpOptions);
  }

  getJobPositions(user, center) {
    const data = [user, center];
    const url = this.getApiBaseUrl() + `/getJobPositions`;
    return this.http.post<any>(url, data, this.httpOptions);
  }


  /**
   * Gets a list of documents for given worker
   */
  getAllDocumentsForWorker(body: object) {
    const url = this.getApiBaseUrl() + `/getAllDocumentsForWorker`;
    return this.http.post<any>(url, body, this.httpOptions);
  }

  /**
   * Saves a list of worker document elements
   * @param workerDocument
   */
  saveDocuments(workerDocument: WorkerDocument) {
    const data = [workerDocument];
    const url = this.getApiBaseUrl() + `/saveDocuments`;
    return this.http.post<any>(url, data, this.httpOptions);
  }

  /**
   * Obtains a file related to a worker document
   */
  getFile(workerDocument: WorkerDocument) {
    const url = this.getApiBaseUrl() + `/getFile`;
    return this.http.post<any>(url, workerDocument, this.httpOptions);
  }

  shareDocument(workerDocument: WorkerDocument) {
    const url = this.getApiBaseUrl() + `/shareDocument`;
    return this.http.post<any>(url, workerDocument, this.httpOptions);
  }

  deleteDocument(documentId: number) {
    const url = this.getApiBaseUrl() + `/deleteDocument/` + documentId;
    return this.http.get<any>(url, this.httpOptions);
  }

  getZip(documents: any[]): Observable<any> {
    const url = this.getApiBaseUrl() + `/getZip`;
    return this.http.post(url, documents, this.httpOptions);
  }

  shareFile(email: WorkerDocumentEmail): Observable<any> {
    const url = this.getApiBaseUrl() + `/shareFile`;
    console.log('Call to ' + url);
    return this.http.post(url, email, this.httpOptions);
  }

  getAllAutorizacionesTrabajador(body: object) {
    const url = environment.api.url + `/autorizaciones/getAllAutorizacionesTrabajador`;
    return this.http.post<any>(url, body, this.httpOptions);
  }

  getAllTiposAutorizaciones() {
    const url = environment.api.url + `/autorizaciones/getAllTiposAutorizaciones`;
    return this.http.get<any>(url, this.httpOptions);
  }

  saveDocumentsAut(autorizacionesDTO: AutorizacionesDTO) {
    const data = [autorizacionesDTO];
    const url =  environment.api.url + `/autorizaciones/`;
    return this.http.post<any>(url, data, this.httpOptions);
  }
  deleteAuthorization(idautorizaciontrabajador: number) {
    const url =  environment.api.url + `/autorizaciones/` + idautorizaciontrabajador;
    return this.http.delete<any>(url, this.httpOptions);
  }
  getFileAut(autorizacionesDTO: AutorizacionesDTO) {
    const url = this.getApiBaseUrl() + `/autorizaciones/getFile`;
    return this.http.post<any>(url, autorizacionesDTO, this.httpOptions);
  }
  getZipAut(authorization: any[]): Observable<any> {
    const url = this.getApiBaseUrl() + `/autorizaciones/getZip`;
    return this.http.post(url, authorization, this.httpOptions);
  }

  getCardSummary(filterData: WorkerDataFilter): Observable<any> {
    const url = this.getApiBaseUrl() + `/getCardSummary`;
    return this.http.post(url, filterData, this.httpOptions);
  }

  shareCardSummary(email: WorkerSummaryCardEmail): Observable<any> {
    const url = this.getApiBaseUrl() + `/shareCardSummary`;
    return this.http.post(url, email, this.httpOptions);
  }
}
