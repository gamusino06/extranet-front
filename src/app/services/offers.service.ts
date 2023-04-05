import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ServiceGenericErrorService } from './service-generic-error.service';
import { UserService } from './user.service';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class OffersService {

  private val: BehaviorSubject<number> = null;

  private status: boolean = false;

  baseUrl = '/getUserData';
  apiToken = 'INVALIDTOKEN';
  environment = environment;

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      Language: this.userService.getLang(),
      Authorization: 'Bearer ' + localStorage.getItem('token')
    })
  };

  getApiBaseUrl() {
    return environment.api.url;
  }

  constructor(
    private userService: UserService,
    private http: HttpClient,
    private serviceGenericError: ServiceGenericErrorService)
    {
      this.apiToken = localStorage.getItem('token');
      this.val = new BehaviorSubject<number>(0);
    }

  getStatus(): boolean {
    return this.status;
  }

  getValue(): Observable<number> {
    return this.val.asObservable();
  }
  setValue(newValue): void {
    if (this.status = false) this.status = !this.status
    this.val.next(newValue);
  }

  getCountNotAcceptedOffers(): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.userService.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/pending-offers';
    return this.http.get<any>(url, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('pending offers requesting...')),
      catchError(this.serviceGenericError.handleError<any>('Error en getFilteredOffersNoAccepted()'))
    );
  }

  getMoreInfo(id): Observable<any> {
    const offerId = id.toString().trim()
    console.log("tokeeeeeen", localStorage.getItem('token'))
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.userService.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/pending-offers/info?offerId=' + offerId;
    console.log(url, "url")
    return this.http.post<any>(url, null, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('pending offers requesting...')),
      catchError(this.serviceGenericError.handleError<any>('Error en getFilteredOffersNoAccepted()'))
    );
  }

  getDescriptionByOffer(id, tipoId): Observable<any> {
    const offerId = id.toString().trim();
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Language: this.userService.getLang(),
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = this.getApiBaseUrl() + '/pending-offers/' + offerId + '/' + tipoId + '/description';
    return this.http.get<any>(url, httpOptions).pipe(
      tap(_ => this.serviceGenericError.log('ejecutado getServiceTypes()')),
      catchError(this.serviceGenericError.handleError<any>('Error en getServiceTypes()'))
    );
  }

}
