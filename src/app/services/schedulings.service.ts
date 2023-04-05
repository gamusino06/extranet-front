import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { ServiceGenericErrorService } from "./service-generic-error.service";
import { UserService } from "./user.service";
import { catchError, tap } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class SchedulingsService {
  private val: BehaviorSubject<number> = null;

  private status: boolean = false;

  baseUrl = "/scheduling";
  apiToken = "INVALIDTOKEN";
  environment = environment;

  httpOptions = {
    headers: new HttpHeaders({
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      Language: this.userService.getLang(),
      Authorization: "Bearer " + localStorage.getItem("token"),
    })
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

  // Get Schedulings
  getSchedulings(centerId): Observable<any> {
    return this.http
      .get<any>(this.getApiBaseUrl() + `/listWithClosure?&centerId=${centerId}`, this.httpOptions)
      .pipe(catchError(this.serviceGenericError.handleError));
  }

}
