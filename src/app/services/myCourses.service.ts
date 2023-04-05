import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthTokenService} from './auth-token.service';
import {environment} from '../../environments/environment';
import {ExternalCourse} from '../Model/ExternalCourse';
import {ExternalCourseStudent} from '../Model/ExternalCourseStudent';
import {Globals} from '../extranet/globals';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MyCoursesService {
  baseUrl = '/my-courses';

  constructor(
    private authTokenService: AuthTokenService,

    private globals: Globals,
    private http: HttpClient,
  ) {
  }

  getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
  }

  getHttpOptionsMultipart(){
    return {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*',
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
  }

  getApiBaseUrl() {
    return environment.api.url;
  }

  getFilteredExternalCourses(predicate, companyId, origin) {
    const url =
      `${this.getApiBaseUrl()}${this.baseUrl}/filter?search=${predicate}&origin=${origin}&companyId=${companyId}`;
    return this.http.get<any>(url, this.getHttpOptions());
  }

  getCourseList() {
    const url = `${this.getApiBaseUrl()}${this.baseUrl}`;
    return this.http.get<any>(url, this.getHttpOptions());
  }

  getCourseById(id: number) {
    const url = `${this.getApiBaseUrl()}${this.baseUrl}/external-course/${id}`;
    return this.http.get(url, this.getHttpOptions());
  }

  createCourse(newCourse: ExternalCourse) {
    const url = `${this.getApiBaseUrl()}${this.baseUrl}/external-course`;
    return this.http.post<any>(url, newCourse, this.getHttpOptions());
  }

  editCourse(putCourse: ExternalCourse) {
    const url = `${this.getApiBaseUrl()}${this.baseUrl}/external-course`;
    return this.http.put<any>(url, putCourse, this.getHttpOptions());
  }

  createExternalCourseStudent(newStudent: ExternalCourseStudent) {
    const url = `${this.getApiBaseUrl()}${this.baseUrl}/external-course-member`;
    return this.http.post<any>(url, newStudent, this.getHttpOptions());
  }

  editExternalCourseStudent(putStudent: ExternalCourseStudent) {
    const url = `${this.getApiBaseUrl()}${this.baseUrl}/external-course-member`;
    return this.http.put<any>(url, putStudent, this.getHttpOptions());
  }

  deleteCourse(id: number) {
    const deleteOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        responseType: 'text',
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = `${this.getApiBaseUrl()}${this.baseUrl}/external-course/${id}`;
    return this.http.delete(url, {...deleteOptions, responseType: 'text'});
  }

  getExternalCourseStudent(id: number) {
    const url = `${this.getApiBaseUrl()}${this.baseUrl}/external-course-member/${id}`;
    return this.http.get<any>(url, this.getHttpOptions());
  }

  getCourseCategory() {
    const url = `${this.getApiBaseUrl()}${this.baseUrl}/categories`;
    return this.http.get<any>(url, this.getHttpOptions());
  }

  getCourseModality() {
    const url = `${this.getApiBaseUrl()}${this.baseUrl}/modalities`;
    return this.http.get<any>(url, this.getHttpOptions());
  }

  getCourseType() {
    const url = `${this.getApiBaseUrl()}${this.baseUrl}/types`;
    return this.http.get<any>(url, this.getHttpOptions());
  }

  getMembersByExternalCourseId(externalCourseId) {
    const url = `${this.getApiBaseUrl()}${this.baseUrl}/external-course-member?externalCourseId=${externalCourseId}`;
    return this.http.get<any>(url, this.getHttpOptions());
  }

  getTemplate() {
    const url = `${this.getApiBaseUrl()}${this.baseUrl}/external-course/template`;
    return this.http.get<any>(url, this.getHttpOptions());
  }

  deleteCourseMember(id: number) {
    const deleteOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        responseType: 'text',
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    const url = `${this.getApiBaseUrl()}${this.baseUrl}/external-course-member/${id}`;
    return this.http.delete(url, {...deleteOptions, responseType: 'text'});
  }

  getCourseMembers(course) {
    if(course.origin === 0){
      if(course.courseType.id === this.globals.formacion_prl){
        return this.getInternalCourseMembersPrlTraining(course.id, course.enterpriseId, course.centerId, course.endDate)
      }
      else {
        return this.getInternalCourseMembers(course.groupId, course.enterpriseId)
      }
    }
    else{
      return this.getMembersByExternalCourseId(course.id)
    }
  }

  getInternalCourseMembers(groupId, enterpriseId) {
    const url = `${this.getApiBaseUrl()}${this.baseUrl}/internal-course-member/${groupId}/${enterpriseId}`;
    return this.http.get<any>(url, this.getHttpOptions());
  }

  getInternalCourseMembersPrlTraining(courseId, enterpriseId, centerId, endDate) {
    const url = `${this.getApiBaseUrl()}${this.baseUrl}/internal-course-member/${courseId}/${enterpriseId}/${centerId}/${endDate}`;
    return this.http.get<any>(url, this.getHttpOptions());
  }

  massiveCourseUpload(data) {
    const url = `${this.getApiBaseUrl()}${this.baseUrl}/external-course/massive-upload`;
    return this.http.post<any>(url, data, this.getHttpOptionsMultipart());
  }

  getCourseMembersTemplate() {
    const url = `${this.getApiBaseUrl()}${this.baseUrl}/external-course-member/template`;
    return this.http.get<any>(url, this.getHttpOptions());
  }

  massiveCourseMembersUpload(data) {
    const url = `${this.getApiBaseUrl()}${this.baseUrl}/external-course-member/massive-upload`;
    return this.http.post<any>(url, data, this.getHttpOptionsMultipart());
  }

  sendContactManagerMail(data) {
    const url = `${this.getApiBaseUrl()}${this.baseUrl}/contact-manager-mail`;
    return this.http.post<any>(url, data, this.getHttpOptionsMultipart());
  }

  // download documents members and update
  downloadDocument (id) {
    const url = `${this.getApiBaseUrl()}${this.baseUrl}/external-course-member/${id}/download-document`;
    return this.http.get<any>(url, this.getHttpOptionsMultipart());
  }

  downloadDocumentWithHistory (data) {
    const url = `${this.getApiBaseUrl()}${this.baseUrl}/external-course-member/download-document-with-history`;
    return this.http.post<any>(url, data, this.getHttpOptions());
  }

  shareDocument(data): Observable<any> {
    const url = `${this.getApiBaseUrl()}${this.baseUrl}/external-course-member/share-document`;
    return this.http.post<any>(url, data, this.getHttpOptions());
  }

  uploadDocument(data, id) {
    const url = `${this.getApiBaseUrl()}${this.baseUrl}/external-course-member/${id}/upload-document`;
    return this.http.put<any>(url, data, this.getHttpOptionsMultipart());
  }

  massiveDownloadDocument (ids) {
    const url = `${this.getApiBaseUrl()}${this.baseUrl}/external-course-member/massive-download-document?ecmIds=${ids}`;
    return this.http.get<any>(url, this.getHttpOptions());
  }
  // pt formacion create course and member from pt
  createCourseOnWorkerTraining (workerId, laborRelationId, data) {
    const url = `${this.getApiBaseUrl()}${this.baseUrl}/external-course-fpt?workerId=${workerId}&laborRelationId=${laborRelationId}`;
    return this.http.post<any>(url, data, this.getHttpOptions());
  }

  updateCourseOnWorkerTraining (externalCourseId, workerId, laborRelationId, data) {
    const url = `${this.getApiBaseUrl()}${this.baseUrl}/external-course-fpt/${externalCourseId}?workerId=${workerId}&laborRelationId=${laborRelationId}`;
    return this.http.put<any>(url, data, this.getHttpOptions());
  }

  deleteCourseOnWorkerTraining (externalCourseId, workerId, laborRelationId) {
    const url = `${this.getApiBaseUrl()}${this.baseUrl}/external-course-fpt/${externalCourseId}?workerId=${workerId}&laborRelationId=${laborRelationId}`;
    return this.http.delete<any>(url, this.getHttpOptions());
  }

  getWorkerTraining (externalCourseId, workerId, laborRelationId) {
    const url = `${this.getApiBaseUrl()}${this.baseUrl}/external-course-fpt/${externalCourseId}?workerId=${workerId}&laborRelationId=${laborRelationId}`;
    return this.http.get<any>(url, this.getHttpOptions());
  }

}
