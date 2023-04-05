import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AuthTokenService} from "./auth-token.service";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  baseUrl = '/appointmentManagements';

  constructor(
    private authTokenService: AuthTokenService,
    private http: HttpClient,
  ) { }

  getHeaders() {
    return {
      headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      Language: navigator.language,
      Authorization: 'Bearer ' + localStorage.getItem('token')
    })};
  }

  getApiBaseUrl() {
    return environment.api.url;
  }

  /**
   * Fetch appointments related to a map of companies and a list of related centers
   */
  getAppointmentsByCompanyAndCenter(centersId: any[], module) {
    const url = this.getApiBaseUrl() + this.baseUrl + '/findByModuleClientAndSelectedCenter?module=' + module;
    return this.http.post<any>(url, centersId, this.getHeaders());
  }

  /**
   * Changes appointment value from active to inactive or vice versa
   */
  acceptAppointment(appointmentId) {
    const url = this.getApiBaseUrl() + this.baseUrl + `/accept/${appointmentId}`;
    return this.http.get<any>(url, this.getHeaders());
  }

  /**
   * Save appointment management list
   */
  saveAppointmentManagement(appointmentManagementList: any[]) {
    const url = this.getApiBaseUrl() + this.baseUrl + '/update';
    return this.http.post<any>(url, appointmentManagementList, this.getHeaders());
  }

  checkIfUserHasActiveAppointmentManagements(centersId: any[], module) {
    const url = this.getApiBaseUrl() + this.baseUrl + '/checkIfUserHasAnyActiveAppointmentManagement?module=' + module;
    return this.http.post<any>(url, centersId, this.getHeaders());
  }

  getCompanyByActiveAppointmentManagements(centersId: any[], module) {
    const url = this.getApiBaseUrl() + this.baseUrl + '/getCompanyByActiveAppointmentManagements?module=' + module;
    return this.http.post<any>(url, centersId, this.getHeaders());
  }
}
