import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { catchError } from "rxjs/operators";

import { environment } from "src/environments/environment";

import { ServiceGenericErrorService } from "./service-generic-error.service";
import { UserService } from "./user.service";

@Injectable({
  providedIn: "root",
})
export class JobProcedureService {
  private val: BehaviorSubject<number> = null;
  private status: boolean = false;

  baseUrl = "/jobProcedure";
  apiToken = "INVALIDTOKEN";
  environment = environment;

  httpOptions = {
    headers: new HttpHeaders({
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      Language: this.userService.getLang(),
      Authorization: "Bearer " + localStorage.getItem("token"),
    }),
  };

  httpOptionsMultipart = {
    headers: new HttpHeaders({
      "Access-Control-Allow-Origin": "*",
      Language: navigator.language,
      Authorization: "Bearer " + localStorage.getItem("token"),
    }),
  };

  httpOptionsBlobFile = {
    headers: new HttpHeaders({
      "Access-Control-Allow-Origin": "*",
      Language: navigator.language,
      Authorization: "Bearer " + localStorage.getItem("token"),
      responseType: "blob" as "json",
    }),
  };

  constructor(
    private userService: UserService,
    private http: HttpClient,
    private serviceGenericError: ServiceGenericErrorService
  ) {
    this.apiToken = localStorage.getItem("token");
    this.val = new BehaviorSubject<number>(0);
  }

  getApiBaseUrl(): string {
    return environment.api.url + this.baseUrl;
  }

  getFilteredList(filterDto, companyId, centerId): Observable<any> {
    return this.http
      .post<any>(
        `${this.getApiBaseUrl()}/filter?companyId=${companyId}&centerId=${centerId}`,
        filterDto,
        this.httpOptions
      )
      .pipe(
        catchError(
          this.serviceGenericError.handleError<any>("Error on getFilteredList")
        )
      );
  }

  getDevelopmentOrientationPdf(): Observable<Blob> {
    const lang = navigator.language || "es-ES";

    return this.http.get(
      `${this.getApiBaseUrl()}/getDevelopmentOrientationPDF?lang=${lang}`,
      { ...this.httpOptionsBlobFile, responseType: "blob" }
    );
  }

  saveJobProcedure(jobProcedureParsed, centerId) {
    return this.http
      .post<any>(
        `${this.getApiBaseUrl()}/save?centerId=${centerId}`,
        jobProcedureParsed,
        this.httpOptions
      )
      .pipe(
        catchError(
          this.serviceGenericError.handleError<any>("Error on saveJobProcedure")
        )
      );
  }

  // Documents
  uploadDocuments(entityId, toCreateDocs, doc = null) {
    const dto = {
      doc: doc,
      uploadDocumentDtoList: toCreateDocs,
    };
    const url = `${this.getApiBaseUrl()}/docs/uploadDocuments?entityId=${entityId}`;
    return this.http.post<any>(url, dto, this.httpOptionsMultipart);
  }

  getFile(docId): Observable<any> {
    const url = `${this.getApiBaseUrl()}/docs/${docId}/getFile`;
    return this.http.get(url, this.httpOptionsMultipart);
  }

  deleteDocument(docId) {
    const url = `${this.getApiBaseUrl()}/docs/${docId}/delete`;
    return this.http.delete<any>(url, this.httpOptions);
  }

  getDocumentsByEntityId(entityId) {
    const url = `${this.getApiBaseUrl()}/${entityId}/docs`;
    return this.http.get<any>(url, this.httpOptions);
  }
  
  exportResultsToPdf(jobProcedures: Number[]): Observable<Blob> {
    const lang = navigator.language || "es-ES";

    return this.http.post(
      `${this.getApiBaseUrl()}/pdf/export?lang=${lang}`,
      jobProcedures,
      { ...this.httpOptionsBlobFile, responseType: "blob" }
    );
  }

  exportResultsToXls(jobProcedures: Number[]): Observable<Blob> {
    const lang = navigator.language || "es-ES";

    return this.http.post(
      `${this.getApiBaseUrl()}/xls/export?lang=${lang}`,
      jobProcedures,
      { ...this.httpOptionsBlobFile, responseType: "blob" }
    );
  }

  changeActiveJobProcedure(jobProcedureId) {
    return this.http
      .post<any>(
        `${this.getApiBaseUrl()}/changeActiveJobProcedure`,
        jobProcedureId,
        this.httpOptions
      )
      .pipe(
        catchError(
          this.serviceGenericError.handleError<any>(
            "Error on changeActiveJobProcedure"
          )
        )
      );
  }
}
