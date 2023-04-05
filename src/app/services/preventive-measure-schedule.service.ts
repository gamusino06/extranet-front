import { EmailDTO } from "../extranet/planificacion-prl/models/EmailDTO";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { ServiceGenericErrorService } from "./service-generic-error.service";
import { UserService } from "./user.service";

@Injectable({
  providedIn: "root",
})
export class PreventiveMeasureScheduleService {
  private val: BehaviorSubject<number> = null;

  private status: boolean = false;

  baseUrl = "/preventiveMeasureSchedule";
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

  getById(id) {
    const url = `${this.getApiBaseUrl()}/${id}`;
    return this.http.get<any>(url, this.httpOptions);
  }
  savePreventiveMeasureSchedule(preventiveMeasure, centerId) {
    const url = centerId
      ? `${this.getApiBaseUrl()}/save?centerId=${centerId}`
      : `${this.getApiBaseUrl()}/save`;
    return this.http.post<any>(url, preventiveMeasure, this.httpOptions);
  }

  savePreventiveMeasureScheduleExcel(file, centerId) {
    let formData: FormData = new FormData();
    formData.append("file", file);

    const url = `${this.getApiBaseUrl()}/save/excel?centerId=${centerId}`;
    return this.http.post<any>(url, formData, this.httpOptionsMultipart);
  }

  savePreventiveMeasureMassive(preventiveMeasureMassiveDto) {
    const url = `${this.getApiBaseUrl()}/save/massive`;
    return this.http.post<any>(url, preventiveMeasureMassiveDto, this.httpOptionsMultipart);
  }


  getFilteredMeasures(filterDto, companyId, centerId) {
    const url = `${this.getApiBaseUrl()}/filter?companyId=${companyId}&centerId=${centerId}`;
    return this.http.post<any>(url, filterDto, this.httpOptions);
  }

  deleteMeasure(id) {
    const url = `${this.getApiBaseUrl()}/delete/${id}`;
    return this.http.delete<any>(url, this.httpOptions);
  }

  assignPreventiveMeasure(
    preventiveMeasure: EmailDTO,
    client: any,
    center: any
  ) {
    const url = `${this.getApiBaseUrl()}/assign`;
    return this.http.post<any>(
      url,
      {
        ...preventiveMeasure,
        client,
        center,
        locale: navigator.language || "es-ES",
      },
      this.httpOptions
    );
  }

  getOriginList() {
    const url = `${this.getApiBaseUrl()}/getOriginList`;
    return this.http.get<any>(url, this.httpOptions);
  }

  downloadLog(data) {
    const dataJson = { errors: data };
    const url = `${this.getApiBaseUrl()}/downloadLog`;
    return this.http.post(url, dataJson, {
      ...this.httpOptionsBlobFile,
      responseType: "blob",
    });
  }

  generatePreventiveMeasureSchedule(companyId, centerId) {
    const url = `${this.getApiBaseUrl()}/generatePreventiveMeasureSchedulePdf?companyId=${companyId}&centerId=${centerId}`;
    return this.http.get(url, {
      ...this.httpOptionsBlobFile,
      responseType: "blob",
    });
  }

  sharePreventiveMeasure(emailDto: EmailDTO, client: any, center: any) {
    const url = `${this.getApiBaseUrl()}/share`;
    return this.http.post<any>(
      url,
      {
        ...emailDto,
        client: { idEmpresa: client },
        center: { idCentro: center },
        locale: navigator.language || "es-ES",
      },
      this.httpOptions
    );
  }

  getDocsByPreventiveMeasureId(preventiveMeasureId) {
    const url = `${this.getApiBaseUrl()}/docs?preventiveMeasureId=${preventiveMeasureId}`;
    return this.http.get<any>(url, this.httpOptions);
  }
  /*getfile*/
  getFile(preventiveMeasureDocId): Observable<any> {
    const url = `${this.getApiBaseUrl()}/docs/${preventiveMeasureDocId}/getFile`;
    return this.http.get(url, this.httpOptionsMultipart);
  }
  deleteDocument(preventiveMeasureDocId) {
    const url = `${this.getApiBaseUrl()}/docs/${preventiveMeasureDocId}/delete`;
    return this.http.delete<any>(url, this.httpOptions);
  }

  uploadDocuments(preventiveMeasureId, toCreateDocs, doc = null) {
    const dto = {
      doc: doc,
      uploadDocumentDtoList: toCreateDocs,
    };
    const url = `${this.getApiBaseUrl()}/docs/uploadDocuments?preventiveMeasureId=${preventiveMeasureId}`;
    return this.http.post<any>(url, dto, this.httpOptionsMultipart);
  }
  getPreventiveMeasureSchedulePDF(schedulingId, centerId) {
    let url = `${this.getApiBaseUrl()}/generatePreventiveMeasureSchedulePdf?centerId=${centerId}`;
    if (schedulingId) {
      url += `&schedulingId=${schedulingId}`;
    }
    return this.http.get(url, {
      ...this.httpOptionsBlobFile,
      responseType: "blob",
    });
  }

  getPreventiveMeasureSchedulePdfAndAttachmentsZip(schedulingId, centerId) {
    let url = `${this.getApiBaseUrl()}/getPreventiveMeasureSchedulePdfAndAttachmentsZip?centerId=${centerId}`;
    if (schedulingId) {
      url += `&schedulingId=${schedulingId}`;
    }
    return this.http.get(url, {
      ...this.httpOptionsBlobFile,
      responseType: "blob",
    });
  }

  exportToExcel(preventiveMeasuresToExport) {
    const url = `${this.getApiBaseUrl()}/exportToExcel?preventiveMeasuresToExport=${preventiveMeasuresToExport}`;
    return this.http.get(url, {
      ...this.httpOptionsBlobFile,
      responseType: "blob",
    });
  }
}
