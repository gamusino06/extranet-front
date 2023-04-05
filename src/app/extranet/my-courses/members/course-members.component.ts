import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {MY_FORMATS} from '../../../../config/config';
import {MatTableDataSource} from '@angular/material/table';
import {UtilsService} from '../../../services/utils.service';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {TranslateService} from '@ngx-translate/core';
import {MyCoursesService} from '../../../services/myCourses.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {ExternalCourse} from '../../../Model/ExternalCourse';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {ExternalCourseStudent} from '../../../Model/ExternalCourseStudent';
import {CreateStudentFormComponent} from '../create-student-form/create-student-form.component';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import {DeleteCourseMemberModalComponent} from '../delete-course-member-modal/delete-course-member-modal.component';
import * as moment from 'moment/moment';
import {MassiveStudentComponent} from '../massive-student/massive-student.component';
import {MassiveErrorComponent} from '../massive-error/massive-error.component';
import {any} from 'codelyzer/util/function';
import {PdfView} from '../../../modales/pdfView/pdfView.component';
import {ShareDocumentComponent} from '../../../modales/shareDocument/shareDocument.component';
import {Globals} from '../../globals';

export interface Member {
  id: number;
  name: string;
  surnames: string;
  nif: string;
  birthDate: Date;
  certificateId: string;
  center: any;
  externalCourse: ExternalCourse;
  checked: boolean;
  evaluation: any;
  documentType: number;
  uuid: string;
  documentId: number;
  hasDocument: any;
}

@Component({
  selector: 'app-course-members',
  templateUrl: './course-members.component.html',
  styleUrls: ['./course-members.component.css'],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})

export class CourseMembersComponent implements OnInit {
  excelImgUrl = '../../assets/img/excel.svg';
  @Output() eventEmit = new EventEmitter<any>();
  @Input() data: any;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  showTable = false;
  members: any[];
  membersDataSource = new MatTableDataSource<Member>();
  displayedColumns: string[] = ['checklist',
    'name',
    'surnames',
    'nif',
    'center',
    'evaluation',
    'actions'];
  maxDate: Date;
  minDate: Date;

  constructor(public utils: UtilsService,
              public dialog: MatDialog,
              public translate: TranslateService,
              private myCoursesService: MyCoursesService,
              private globals: Globals,
              private spinner: NgxSpinnerService) {
  }

  courseCertificateDto: any;

  downloadImgUrl = '../../assets/img/download.svg';
  mailImgUrl = '../../assets/img/mail.svg';

  ngOnInit(): void {
    this.getMembers();

  }

  goToMyCourses(): void {
    this.eventEmit.emit(false);
  }

  getMembers(): void {
    this.spinner.show();
    this.myCoursesService.getCourseMembers(this.data.course).subscribe(response => {
      this.members = response;
      this.members.forEach(element => {
        element.client = this.data.client || null;
        element.center = this.data.center || null;
      });
      this.membersDataSource = new MatTableDataSource(this.members);
      this.membersDataSource.paginator = this.paginator;
      this.membersDataSource.sort = this.sort;
      this.showTable = true;
    }).add(() => {
      // when the request ends
      this.spinner.hide();
    });
  }

  isExternal(){
    return this.data.course.origin === 1;
  }

  hasDocuments () {
    if (this.isExternal() && this.members !== null && this.members !== undefined)
      return this.members.findIndex(x => x.hasDocument !== null && x.hasDocument !== undefined) !== -1
    return false
  }

  isInternalSuitablePresentialPrl(element){
    return !this.isExternal() && element.evaluation === this.globals.my_courses_evaluation_ok
                              && this.data.course.courseModality.id === 1 && this.isVoid(element.uuid)
  }

  isVoid(field){
    return field === null || field === undefined || field <= 0
  }

  isInternalNoSuitable(element){
    return !this.isExternal() && element.evaluation === this.globals.my_courses_evaluation_ko
  }

  isInternalNotStarted(element){
    return !this.isExternal() && element.evaluation === this.globals.my_courses_evaluation_not_started
  }

  isDeactivateDownload(element){
    return this.isInternalNotStarted(element) ||  this.isInternalNoSuitable(element) || this.isInternalSuitablePresentialPrl(element)
  }

  getDeactivateDownloadToolTip(element){
    const deactivateLiteral = this.isInternalSuitablePresentialPrl(element) ? 'MY_COURSES.COURSE_MEMBERS.WITHOUT_POSITION' :
                                                                              'MY_COURSES.COURSE_MEMBERS.NO_CERTIFICATE'
    let deactivateDownloadTooltipText;
    this.translate.get(deactivateLiteral).subscribe((res: string) => {
      deactivateDownloadTooltipText = res;
    });
    return deactivateDownloadTooltipText
  }

  isSuitableInternal(element){
    return !this.isExternal() && element.evaluation === this.globals.my_courses_evaluation_ok
  }

  isShowDownload(element){
    return this.isSuitableInternal(element) && !this.isDeactivateDownload(element)
  }


  newMember() {
    this.createStudentModal(this.data.course.id);
  }


  editStudent(externalCourseStudent, studentForm) {
    let successMessage;
    this.translate.get('MY_COURSE.NEW_STUDENT.SUCCESS_MESSAGE').subscribe((res: string) => {
      successMessage = res;
    });
    let errorMessage;
    this.translate.get('MY_COURSE.NEW_STUDENT.ERROR_MESSAGE').subscribe((res: string) => {
      errorMessage = res;
    });
    this.updateStudentObject(externalCourseStudent, studentForm);
    this.spinner.show();
    this.myCoursesService.editExternalCourseStudent(externalCourseStudent).subscribe((response) => {
      if (studentForm.certificate) {
        this.myCoursesService.uploadDocument(studentForm.certificate, response.id).subscribe((response2) => {
          this.spinner.hide();
          this.getMembers();
          this.showSuccessMessage(successMessage);
        });
      } else {
        this.spinner.hide();
        this.getMembers();
        this.showSuccessMessage(successMessage);
      }
    }, error => {
      this.showErrorMessage(errorMessage);
    });
  }

  public editStudentModal(externalCourseStudent: ExternalCourseStudent) {
    const dialogRef = this.dialog.open(CreateStudentFormComponent, {
      width: '45%',
      maxHeight: '705px',
    });

    const instance = dialogRef.componentInstance;
    instance.student = externalCourseStudent;
    this.translate.get('MY_COURSE.EDIT_STUDENT_MODAL.TITLE').subscribe((res: string) => {
      instance.title = res;
    });

    this.translate.get('MY_COURSE.EDIT_STUDENT_MODAL.DESCRIPTION').subscribe((res: string) => {
      instance.description = res;
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.editStudent(externalCourseStudent, result.value);
      }
    });
  }

  public createStudentModal(courseId) {
    const dialogRef = this.dialog.open(CreateStudentFormComponent, {
      width: '45%',
      maxHeight: '705px',
    });
    const instance = dialogRef.componentInstance;
    const externalCourse = {} as ExternalCourse;
    externalCourse.id = courseId;
    const externalCourseStudent = {} as ExternalCourseStudent;
    externalCourseStudent.externalCourse = externalCourse;
    instance.student = externalCourseStudent;
    this.translate.get('MY_COURSE.NEW_STUDENT_MODAL.TITLE').subscribe((res: string) => {
      instance.title = res;
    });
    this.translate.get('MY_COURSE.NEW_STUDENT_MODAL.DESCRIPTION').subscribe((res: string) => {
      instance.description = res;
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.saveStudent(externalCourseStudent, result.value);
      }
    });
  }

  saveStudent(externalCourseStudent, studentForm) {
    let successMessage;
    this.translate.get('MY_COURSE.NEW_STUDENT.SUCCESS_MESSAGE').subscribe((res: string) => {
      successMessage = res;
    });
    let errorMessage;
    this.translate.get('MY_COURSE.NEW_STUDENT.ERROR_MESSAGE').subscribe((res: string) => {
      errorMessage = res;
    });

    this.createStudentObject(externalCourseStudent, studentForm);
    this.spinner.show();
    this.myCoursesService.createExternalCourseStudent(externalCourseStudent).subscribe((response) => {
      if (studentForm.certificate) {
        this.myCoursesService.uploadDocument(studentForm.certificate, response.id).subscribe((response2) => {
          this.spinner.hide();
          this.showSuccessMessage(successMessage);
          this.getMembers();
          if (studentForm.continue === true) {
            this.createStudentModal(externalCourseStudent.externalCourse.id);
          }
        });
      } else {
        this.spinner.hide();
        this.showSuccessMessage(successMessage);
        this.getMembers();
        if(studentForm.continue === true){
          this.createStudentModal(externalCourseStudent.externalCourse.id);
        }
      }
    }, error => {
      this.showErrorMessage(errorMessage);
    });
  }

  createStudentObject(externalCourseStudent, studentForm) {
    externalCourseStudent.name = studentForm.name;
    externalCourseStudent.surnames = studentForm.firstName + ' ' + studentForm.lastName;
    externalCourseStudent.nif = studentForm.nif;
    externalCourseStudent.birthDate = this.getUTCDate(studentForm.birthDatePicker);
    externalCourseStudent.evaluation = studentForm.evaluation;
  }

  updateStudentObject(externalCourseStudent, studentForm) {
    externalCourseStudent.name = studentForm.name;
    externalCourseStudent.surnames = studentForm.firstName + ' ' + studentForm.lastName;
    externalCourseStudent.nif = studentForm.nif;
    externalCourseStudent.birthDate = this.getUTCDate(studentForm.birthDatePicker);
    externalCourseStudent.evaluation = studentForm.evaluation;
  }

  getUTCDate(paramDate) {
    return new Date(moment(paramDate).format('YYYY-MM-DDTHH:mm:ss[Z]'));
  }

  showSuccessMessage(message) {
    return Swal.fire({
      icon: 'success',
      title: message,
      confirmButtonColor: 'var(--blue)',
      allowOutsideClick: true
    });
  }

  showErrorMessage(message) {
    return Swal.fire({
      icon: 'error',
      title: message,
      confirmButtonColor: 'var(--blue)',
      allowOutsideClick: false
    });
  }

  getEvaluationLiteral(evaluationId): string {
    return evaluationId === this.globals.my_courses_evaluation_ok ? 'MY_COURSE.NEW_STUDENT_MODAL.ASSESSMENT.SUITABLE' :
          (evaluationId === this.globals.my_courses_evaluation_ko ?  'MY_COURSE.NEW_STUDENT_MODAL.ASSESSMENT.UNFIT' : '-----');
  }

  checkAllRows(event) {
    if (this.membersDataSource !== undefined && this.membersDataSource !== null) {
       this.membersDataSource.data.forEach(val => { val.checked = event.checked; });
    }
  }

  exportAsExcel() {
    this.spinner.show();
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    let JSONWS: XLSX.WorkSheet;
    let dataJS = [];

    let isElementosSelect: boolean = false;

    this.membersDataSource.data.forEach(item => {
      if (item.checked) {
        isElementosSelect = true;
        let new_item = {};
        this.displayedColumns.forEach(tableHeader => {
          switch (tableHeader) {
            case 'name':
              this.translate.get('MY_COURSES.MEMBER.NAME').subscribe((res: string) => {
                new_item[res] = item.name;
              });
              break;
            case 'surnames':
              this.translate.get('MY_COURSES.MEMBER.SURNAME').subscribe((res: string) => {
                new_item[res] = item.surnames;
              });
              break;
            case 'nif':
              this.translate.get('MY_COURSES.MEMBER.NIF').subscribe((res: string) => {
                new_item[res] = item.nif;
              });
              break;
            case 'evaluation':
              this.translate.get('MY_COURSES.MEMBER.EVALUATION').subscribe((res: string) => {
                this.translate.get(this.getEvaluationLiteral(item.evaluation)).subscribe((res2: string) => {
                  new_item[res] = res2;
                });
              });
              break;
            case 'center':
              this.translate.get('MY_COURSES.MEMBER.CENTER').subscribe((res: string) => {
                new_item[res] = item.center.nombre;
              });
              break;
            default:
              break;
          }
        });
        dataJS.push(new_item);
      }

    });

    if (isElementosSelect == false) {
      let titulo = "Debe seleccionar al menos un elemento a exportar";
      this.translate.get('ERROR_SELECCIONA_EXPORTAR').subscribe((res: string) => {
        titulo = res;
      });
      this.utils.mostrarMensajeSwalFire('error', titulo, '', 'var(--blue)', false);
    } else {
      let result = XLSX.utils.sheet_add_json(JSONWS, dataJS);
      XLSX.utils.book_append_sheet(wb, result, 'Sheet1');
      /* save to file */
      XLSX.writeFile(wb, 'ListadoMisCursos.xlsx');
    }
    this.spinner.hide();

  }

  deleteStudentModal(student) {

    const dialogRef = this.dialog.open(DeleteCourseMemberModalComponent, {
      width: '30%',
      maxHeight: '360px',

    });
    const instance = dialogRef.componentInstance;
    this.translate.get('MY_COURSE.DELETE_MEMBER_MODAL.TITLE').subscribe((res: string) => {
      instance.title = res;
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.deleteCourseMember(student.id);
      }
    });
  }

  deleteCourseMember(id) {
    let successMessage;
    this.translate.get('MY_COURSE.DELETE_COURSE_MEMBER.SUCCESS_MESSAGE').subscribe((res: string) => {
      successMessage = res;
    });
    let errorMessage;
    this.translate.get('MY_COURSE.DELETE_COURSE_MEMBER.ERROR_MESSAGE').subscribe((res: string) => {
      errorMessage = res;
    });
    this.spinner.show();
    this.myCoursesService.deleteCourseMember(id).subscribe((res) => {
        this.spinner.hide();
        this.showSuccessMessage(successMessage);
        this.getMembers();
      }, error => {
        this.showErrorMessage(errorMessage);
      });

  }

  massiveStudentModal() {
    const dialogRef = this.dialog.open(MassiveStudentComponent, {
      width: '45%',
      maxHeight: '800px',
    });
    dialogRef.afterClosed().subscribe(form => {
      this.massiveUploadStudents(this.data.course.id, form.value);
    });
  }

  massiveUploadStudents(externalCourseId, element) {
    const data = new FormData();
    data.append('document', element.file);
    data.append('externalCourseId', externalCourseId);
    this.spinner.show();
    this.myCoursesService.massiveCourseMembersUpload(data).subscribe(response => {
      // TODO: error controls
      this.getMembers();
    }, error => {
      if (error.status === 403) {
        let errorMessage;
        this.translate.get('MY_COURSE.MASSIVE_ERROR.ERROR_MESSAGE').subscribe((res: string) => {
          errorMessage = res;
        });
        this.showErrorMessage(errorMessage);
      } else {
        const dialogRef = this.dialog.open(MassiveErrorComponent, {
          data: error.error,
          width: '50%',
          maxHeight: '850px',
        });
      }
    }).add(() => {
      // when the request ends
      this.spinner.hide();
    });
  }

  preVisualize(element) {
    this.spinner.show();
    this.courseCertificateDto = any;
    this.courseCertificateDto = {
      listaIdsDocumentos: [element.documentId],
      listaIdsTiposDocumentos: [element.documentType],
      listaUuidsDocumentos: [element.uuid],
      loginSimuladoActivado: false,
      accion: { idAccionDoc: "2" }
    }
    this.utils.getFile(this.courseCertificateDto).subscribe(pdfBase64 => {
      if(pdfBase64){
        const byteArray = new Uint8Array(atob(pdfBase64.fichero).split('').map(char => char.charCodeAt(0)));
        let blob = new Blob([byteArray], { type: 'application/pdf' });
        // Here is your URL you can use
        const url = window.URL.createObjectURL(blob);
        // i.e. display the PDF content via iframe
        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = url;
        dialogConfig.width = "50%";
        dialogConfig.hasBackdrop = true;
        dialogConfig.disableClose = true;

        const dialogRef = this.dialog.open(PdfView, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
        });
      }
      this.spinner.hide();

    })
  }

  download(element) {
    this.spinner.show();
    this.courseCertificateDto = any;
    this.courseCertificateDto = {
        listaIdsDocumentos: [element.documentId],
        listaIdsTiposDocumentos: [element.documentType],
        listaUuidsDocumentos: [element.uuid],
        loginSimuladoActivado: false,
        accion: { idAccionDoc: "2" }
    }
    this.utils.getFile(this.courseCertificateDto).subscribe(pdfBase64 => {
      if(pdfBase64){
        const linkSource = `data:application/pdf;base64,${pdfBase64.fichero}`;
        const filename = pdfBase64.nombreFichero + '.pdf';
        const downloadLink = document.createElement('a');
        downloadLink.href = linkSource;
        downloadLink.download = filename;
        downloadLink.click();
      }
      this.spinner.hide();
    })
  }

  downloadExternalCertificate (element) {
    this.spinner.show();
    this.myCoursesService.downloadDocument(element.id).subscribe(response => {
      if(response.file){
        const linkSource = `data:${response.contentType};base64,${response.file}`;
        const filename = response.fileName;
        const downloadLink = document.createElement('a');
        downloadLink.href = linkSource;
        downloadLink.download = filename;
        downloadLink.click();
      }
      this.spinner.hide();
    })
  }

  shareExternalCertificate(element) {

    let menuNameComponent = 'DIPLOMAS_CERTIFICADOS';
    this.translate.get('DIPLOMAS_CERTIFICADOS').subscribe((res: string) => {
      menuNameComponent = res;
    });
    let subMenuNameComponent = 'SEC_CURSOS_PEDIDOS';
    this.translate.get('SEC_CURSOS_PEDIDOS').subscribe((res: string) => {
      subMenuNameComponent = res;
    });

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      element: element,
      menuName: menuNameComponent,
      subMenuName: subMenuNameComponent
    };
    dialogConfig.width = "50%";
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;

    const dialogRef = this.dialog.open(ShareDocumentComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined) {
        let data = {
          to: result.emailFormControl,
          cc: result.ccFormControl,
          cco: result.ccoFormControl,
          subject: result.subjectFormControl,
          body: result.bodyFormControl,
          memberIds: [element.id],
          attachmentFileName: "DiplomaCertificadoExterno"
        }
        let titulo = "Se ha procedido al envío por correo electrónico de la documentación indicada";
        this.translate.get('ENVIO_DOC_INICIADA').subscribe((res: string) => {
          titulo = res;
        });
        this.utils.mostrarMensajeSwalFire('info', titulo, '','var(--blue)', false);
        this.myCoursesService.shareDocument(data).subscribe(result => {
          if (!result) {
            let titulo = "Error al enviar el mensaje";
            this.translate.get('ERROR_ENVIO_MENSAJE').subscribe((res: string) => {
              titulo = res;
            });
            this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
          }
        }), (error => {
          console.log("Error al Enviar EMAIL - Compartir Documento");
        });
      }
    });
  }

  massiveShareExternalCertificate() {
    var memberCheckedList = []
    var memberIds = [];
    this.membersDataSource.data.forEach(element => {
      if (element.checked)
        memberCheckedList.push(element.id);
      if (element.checked == true && element.hasDocument)
        memberIds.push(element.id);
    });
    if (memberCheckedList.length == 0) {
      let errorMessage;
      this.translate.get('ERROR_SELECCIONA_COMPARTIR').subscribe((res: string) => {
        errorMessage = res;
      });
      this.showErrorMessage(errorMessage);
      return;
    }
    if (memberIds.length == 0) {
      let errorMessage;
      this.translate.get('DIPLOMAS_PARTICIPANTE_MULTIPLE').subscribe((res: string) => {
        errorMessage = res;
      });
      this.showErrorMessage(errorMessage);
      return;
    }

    let menuNameComponent = 'DIPLOMAS_CERTIFICADOS';
    this.translate.get('DIPLOMAS_CERTIFICADOS').subscribe((res: string) => {
      menuNameComponent = res;
    });
    let subMenuNameComponent = 'SEC_CURSOS_PEDIDOS';
    this.translate.get('SEC_CURSOS_PEDIDOS').subscribe((res: string) => {
      subMenuNameComponent = res;
    });

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      element: memberIds,
      menuName: menuNameComponent,
      subMenuName: subMenuNameComponent
    };
    dialogConfig.width = "50%";
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;

    const dialogRef = this.dialog.open(ShareDocumentComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined) {
        let data = {
          to: result.emailFormControl,
          cc: result.ccFormControl,
          cco: result.ccoFormControl,
          subject: result.subjectFormControl,
          body: result.bodyFormControl,
          memberIds: memberIds,
          attachmentFileName: "DiplomaCertificadoExterno"
        }
        let titulo = "Se ha procedido al envío por correo electrónico de la documentación indicada";
        this.translate.get('ENVIO_DOC_INICIADA').subscribe((res: string) => {
          titulo = res;
        });
        this.utils.mostrarMensajeSwalFire('info', titulo, '','var(--blue)', false);
        this.myCoursesService.shareDocument(data).subscribe(result => {
          if (!result) {
            let titulo = "Error al enviar el mensaje";
            this.translate.get('ERROR_ENVIO_MENSAJE').subscribe((res: string) => {
              titulo = res;
            });
            this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
          }
        }), (error => {
          console.log("Error al Enviar EMAIL - Compartir Documentos");
        });
      }
    });
  }

  massiveDownloadExternal () {
    var memberCheckedList = []
    var memberIds = [];
    this.membersDataSource.data.forEach(element => {
      if (element.checked)
        memberCheckedList.push(element.id);
      if (element.checked == true && element.hasDocument)
        memberIds.push(element.id);
    });
    if (memberCheckedList.length == 0) {
      let errorMessage;
      this.translate.get('ERROR_SELECCIONA_DESCARGAR').subscribe((res: string) => {
        errorMessage = res;
      });
      this.showErrorMessage(errorMessage);
      return;
    }
    if (memberIds.length == 0) {
      let errorMessage;
      this.translate.get('DIPLOMAS_PARTICIPANTE_MULTIPLE').subscribe((res: string) => {
        errorMessage = res;
      });
      this.showErrorMessage(errorMessage);
      return;
    }
    this.spinner.show();
    this.myCoursesService.massiveDownloadDocument(memberIds).subscribe(response => {
        this.spinner.hide();
        if (response.file) {
          const linkSource = `data:${response.contentType};base64,${response.file}`;
          const filename = response.fileName;
          const downloadLink = document.createElement('a');
          downloadLink.href = linkSource;
          downloadLink.download = filename + '.zip';
          downloadLink.click();
        }
    });
  }

  multipleDownload() {
    this.spinner.show();
    let listaIdsDocumentos: number[] = [];
    let listaIdsTiposDocumentos: number[] = [];
    let listaUuidsDocumentos: string[] = [];
    if (this.membersDataSource.data) {
      if (this.data.course.origin === this.globals.my_courses_internal_origin &&
          this.data.course.courseType.id === this.globals.my_courses_more_training_type &&
          this.membersDataSource.data.every(val => val.checked == true && val.evaluation === this.globals.my_courses_evaluation_ok)){
         listaIdsDocumentos.push(0);
         listaIdsTiposDocumentos.push(this.globals.my_courses_more_training_course_certificate);
         listaUuidsDocumentos.push(this.members[0].courseCertificate);
      }
      else {
        this.membersDataSource.data.forEach(documento => {
          if (documento.checked && documento.evaluation === this.globals.my_courses_evaluation_ok) {
            listaIdsDocumentos.push(documento.documentId);
            listaIdsTiposDocumentos.push(documento.documentType);
            listaUuidsDocumentos.push(documento.uuid);
          }
        });
        if (this.membersDataSource.data.every(val => val.checked == true && val.evaluation === this.globals.my_courses_evaluation_ok) &&
          this.data.course.origin === this.globals.my_courses_internal_origin &&
          this.data.course.courseType.id === this.globals.my_courses_prl_type &&
          this.data.course.courseModality.id === this.globals.my_courses_modality_face_to_face){
          listaIdsDocumentos.push(0);
          listaIdsTiposDocumentos.push(this.globals.my_courses_prl_course_certificate);
          listaUuidsDocumentos.push(this.members[0].courseCertificate);
        }
      }

      if (listaIdsDocumentos.length > 0 && listaIdsDocumentos.length <= this.globals.extranet_maximo_documentos_multiple) {
        this.utils.getZipFile({
          listaIdsDocumentos,
          listaIdsTiposDocumentos,
          listaUuidsDocumentos,
          loginSimuladoActivado: false,
          accion: { idAccionDoc: "2" }
        }).subscribe(zipBase64 => {
          if(zipBase64){
            //Variables para traducción
            var nombreZip = "Diplomas Certificados";
            this.translate.get('DIPLOMAS_CERTIFICADOS').subscribe((res: string) => {
              nombreZip = res;
            });
            let downloadLink = document.createElement('a');
            downloadLink.href = `data:application/zip;base64,${zipBase64.fichero}`;
            downloadLink.download = nombreZip + '.zip';
            downloadLink.click();

            //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
          }
          this.spinner.hide();

        })
      }else if (listaIdsDocumentos.length > this.globals.extranet_maximo_documentos_multiple){
        this.spinner.hide();
        this.utils.mostrarMensajeSwalFireSobrepasadoLimiteDescargaMultiple(listaIdsDocumentos.length);
      }else{
        this.spinner.hide();
        let titulo = "Debe seleccionar al menos un elemento a descargar";
        this.translate.get('MY_COURSES.COURSE_MEMBERS.NO_SELECT').subscribe((res: string) => {
          titulo = res;
        });
        this.utils.mostrarMensajeSwalFire('error', titulo, '', 'var(--blue)', false);
      }
    }
  }

  share(element) {
    this.shareData(element, 1);
  }
  shareData(element, mode) {

    let menuNameComponent = 'DIPLOMAS_CERTIFICADOS';
    this.translate.get('DIPLOMAS_CERTIFICADOS').subscribe((res: string) => {
      menuNameComponent = res;
    });
    let subMenuNameComponent = 'SEC_CURSOS_PEDIDOS';
    this.translate.get('SEC_CURSOS_PEDIDOS').subscribe((res: string) => {
      subMenuNameComponent = res;
    });

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      element: element,
      menuName: menuNameComponent,
      subMenuName: subMenuNameComponent
    };
    dialogConfig.width = "50%";
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;

    const dialogRef = this.dialog.open(ShareDocumentComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined) {
        let data = {
          to: result.emailFormControl,
          cc: result.ccFormControl,
          cco: result.ccoFormControl,
          subject: result.subjectFormControl,
          body: result.bodyFormControl,

          documentoDownloadDto: {
            listaIdsDocumentos: [element.documentId],
            listaIdsTiposDocumentos: [element.documentType],
            listaUuidsDocumentos: [element.uuid],
            loginSimuladoActivado: false,
            accion: {
              idAccionDoc: mode
            },
            filename: "DiplomaCertificado.pdf"
          }
        }

        let titulo = "Se ha procedido al envío por correo electrónico de la documentación indicada";
        this.translate.get('ENVIO_DOC_INICIADA').subscribe((res: string) => {
          titulo = res;
        });
        this.utils.mostrarMensajeSwalFire('info', titulo, '','var(--blue)', false);
        this.utils.compartirDocumento(data).subscribe(result => {
          if (!result) {
            let titulo = "Error al enviar el mensaje";
            this.translate.get('ERROR_ENVIO_MENSAJE').subscribe((res: string) => {
              titulo = res;
            });
            this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
          }
        }), (error => {
          console.log("Error al Enviar EMAIL - Compartir Documento");
        });
      }
    });
  }

  multipleShare() {
    let listaIdsDocumentos: number[] = [];
    let listaDocumentos: any[] = [];
    if (this.membersDataSource.data) {
      this.membersDataSource.data.forEach(documento => {
        if (documento.checked && documento.evaluation === this.globals.my_courses_evaluation_ok) {
          listaDocumentos.push(documento);
          listaIdsDocumentos.push(documento.documentId);
        }
      });
    }
    if (listaIdsDocumentos.length > 0 && listaIdsDocumentos.length <= this.globals.extranet_maximo_documentos_multiple){
      this.multipleShareData(listaIdsDocumentos, 1, listaDocumentos);
    }else if (listaIdsDocumentos.length > this.globals.extranet_maximo_documentos_multiple){
      this.utils.mostrarMensajeSwalFireSobrepasadoLimiteDescargaMultiple(listaIdsDocumentos.length);
    }else{
      let titulo = "Debe seleccionar al menos un elemento a compartir";
      this.translate.get('MY_COURSES.COURSE_MEMBERS.NO_SELECT').subscribe((res: string) => {
        titulo = res;
      });
      this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
    }
  }

  /*compartir múltiple*/
  multipleShareData(listaIdsDocumentos, mode, listaDocumentos) {

    let listaIdsTiposDocumentos: number[] = [];
    let listaUuidsDocumentos: string[] = [];
    listaDocumentos.forEach(documento => {
      listaIdsTiposDocumentos.push(documento.documentType);
      listaUuidsDocumentos.push(documento.uuid);
    });

    let menuNameComponent = 'DIPLOMAS_CERTIFICADOS';
    this.translate.get('DIPLOMAS_CERTIFICADOS').subscribe((res: string) => {
      menuNameComponent = res;
    });
    let subMenuNameComponent = 'SEC_CURSOS_PEDIDOS';
    this.translate.get('SEC_CURSOS_PEDIDOS').subscribe((res: string) => {
      subMenuNameComponent = res;
    });
    let filenameComponent = subMenuNameComponent;

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      element: listaDocumentos,
      menuName: menuNameComponent,
      subMenuName: subMenuNameComponent
    };
    dialogConfig.width = "50%";
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;

    const dialogRef = this.dialog.open(ShareDocumentComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined) {
        let data = {
          to: result.emailFormControl,
          cc: result.ccFormControl,
          cco: result.ccoFormControl,
          subject: result.subjectFormControl,
          body: result.bodyFormControl,

          documentoDownloadDto: {
            listaIdsDocumentos,
            listaIdsTiposDocumentos,
            listaUuidsDocumentos,
            loginSimuladoActivado: false,
            accion: {
              idAccionDoc: mode
            },
            filename: filenameComponent + ".zip"
          }
        }

        let titulo = "Se ha procedido al envío por correo electrónico de la documentación indicada";
        this.translate.get('ENVIO_DOC_INICIADA').subscribe((res: string) => {
          titulo = res;
        });
        this.utils.mostrarMensajeSwalFire('info', titulo, '','var(--blue)', false);
        this.utils.compartirDocumentoZip(data).subscribe(result => {
          if (!result) {
            let titulo = "Error al enviar el mensaje";
            this.translate.get('ERROR_ENVIO_MENSAJE').subscribe((res: string) => {
              titulo = res;
            });
            this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
          }
        }), (error => {
          console.log("Error al Enviar EMAIL - Compartir Documento");
        });
      }
    });

  }

}
