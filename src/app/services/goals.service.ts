import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { ServiceGenericErrorService } from "./service-generic-error.service";
import { UserService } from "./user.service";
import { catchError, tap } from "rxjs/operators";
import { EmailDTO } from "../extranet/planificacion-prl/models/EmailDTO";

@Injectable({
  providedIn: "root",
})
export class GoalsService {
  private val: BehaviorSubject<number> = null;

  private status: boolean = false;

  baseUrl = "/goals";
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

  getApiBaseUrl() {
    return environment.api.url + this.baseUrl;
  }

  constructor(
    private userService: UserService,
    private http: HttpClient,
    private serviceGenericError: ServiceGenericErrorService
  ) {
    this.apiToken = localStorage.getItem("token");
    this.val = new BehaviorSubject<number>(0);
  }

  // Get Objetivos
  getObjetivos(data): Observable<any> {
    const url = this.getApiBaseUrl() + "/goals";
    return this.http.post<any>(url, data, this.httpOptions).pipe(
      tap((_) => this.serviceGenericError.log("pending goals requesting...")),
      catchError(
        this.serviceGenericError.handleError<any>("Error en getGoals()")
      )
    );
  }

  getFilteredGoals(searchFilter, companyId, statusIds) {
    const url = `${this.getApiBaseUrl()}/filter?search=${searchFilter}&companyId=${companyId}&statusIds=${statusIds}`;
    return this.http.get<any>(url, this.httpOptions);
  }

  saveGoal(goal) {
    const url = `${this.getApiBaseUrl()}/save`;
    return this.http.post<any>(url, goal, this.httpOptions);
  }

  deleteGoal(goalId) {
    const url = `${this.getApiBaseUrl()}/delete/${goalId}`;
    return this.http.delete<any>(url, this.httpOptions);
  }
  getDocsByGoalId(goalId) {
    const url = `${this.getApiBaseUrl()}/docs?goalId=${goalId}`;
    return this.http.get<any>(url, this.httpOptions);
  }

  saveDocsByGoal(goalId, docList) {
    const url = `${this.getApiBaseUrl()}/docs/save?goalId=${goalId}`;
    return this.http.post<any>(url, docList, this.httpOptions);
  }

  uploadDocuments(goalId, toCreateDocs, goalDoc = null) {
    const dto = {
      goalDoc: goalDoc,
      uploadDocumentDtoList: toCreateDocs,
    };
    const url = `${this.getApiBaseUrl()}/docs/uploadDocuments?goalId=${goalId}`;
    return this.http.post<any>(url, dto, this.httpOptionsMultipart);
  }

  /*getfile*/
  getFile(goalDocId): Observable<any> {
    const url = `${this.getApiBaseUrl()}/docs/${goalDocId}/getFile`;
    return this.http.get(url, this.httpOptionsMultipart);
  }

  deleteDocument(goalDocId) {
    const url = `${this.getApiBaseUrl()}/docs/${goalDocId}/delete`;
    return this.http.delete<any>(url, this.httpOptions);
  }

  exportToPdf(goalsToExport, clientId, centerId): Observable<any> {
    const url = `${this.getApiBaseUrl()}/exportToPdf?goalsToExport=${goalsToExport}&clientId=${clientId}&centerId=${centerId}`;
    return this.http.get(url, {
      ...this.httpOptionsBlobFile,
      responseType: "blob",
    });
  }

  exportToExcel(goalsToExport) {
    const url = `${this.getApiBaseUrl()}/exportToExcel?goalsToExport=${goalsToExport}`;
    return this.http.get(url, {
      ...this.httpOptionsBlobFile,
      responseType: "blob",
    });
  }

  emailGoals(emailDto: EmailDTO, client: any, center: any) {
    const url = `${this.getApiBaseUrl()}/emailGoals`;
    return this.http.post<any>(
      url,
      {
        ...emailDto,
        center,
        client,
      },
      this.httpOptions
    );
  }
}
