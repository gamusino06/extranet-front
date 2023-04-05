import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { AuthTokenService } from './auth-token.service';
import { ServiceGenericErrorService } from './service-generic-error.service';
import { environment } from '../../environments/environment';
import { Documentation } from '../Model/Documentacion/PrevingDocumentacion';




@Injectable({
  providedIn: 'root'
})
export class PrevingDocumentsService {

  /*baseUrl = '/services/documents/getDefaultDocuments';*/ //Ejemplo de path con ruta.
  baseUrl = '/getDefaultDocuments';
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json',
                               'Access-Control-Allow-Origin': '*'})
  };

  constructor(
    private authTokenService: AuthTokenService,
    private http: HttpClient,
    private serviceGenericError: ServiceGenericErrorService
  ) { }

  getApiBaseUrl() {
    return environment.api.url;
  }

  /*get the full user data information for areas and sections*/
  getPrevingDocument(): Observable<Documentation[]> {
    const url = this.getApiBaseUrl() + this.baseUrl;

    return this.http.post<Documentation[]>(url, { idRol: 4 }, this.httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('Cargar documentos')),
      catchError(this.serviceGenericError.handleError<Documentation[]>('PrevingDocumentacion'))
    );
  }
}
