import {Component, OnInit, ViewChild} from '@angular/core';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatOption} from '@angular/material/core';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {MY_FORMATS} from '../../../config/config';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../../services/user.service';
import {UtilsService} from '../../services/utils.service';
import {MatDialog} from '@angular/material/dialog';
import {CreateCourseFormComponent} from './create-course-form/create-course-form.component';
import {TranslateService} from '@ngx-translate/core';
import {MyCoursesService} from '../../services/myCourses.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {CourseModality, CourseType, ExternalCourse, ExternalCourseCategory} from '../../Model/ExternalCourse';
import * as moment from 'moment';
import {ContactManagerComponent} from './contact-manager/contact-manager.component';
import Swal from 'sweetalert2';
import {DeleteCourseModalComponent} from './delete-course-modal/delete-course-modal.component';
import {EditCourseModalComponent} from './edit-course-modal/edit-course-modal.component';
import {MassiveCourseComponent} from './massive-course/massive-course.component';
import {Router} from '@angular/router';
import {ExternalCourseStudent} from '../../Model/ExternalCourseStudent';
import {CreateStudentFormComponent} from './create-student-form/create-student-form.component';
import * as XLSX from 'xlsx';
import {InternalCourse} from '../../Model/InternalCourse';
import {MassiveErrorComponent} from './massive-error/massive-error.component';
import {Globals} from '../globals';
import {MatSelect} from '@angular/material/select';

export interface Course {
  startDate: Date;
  endDate: Date;
  courseName: string;
  business: string;
  modality: string;
  origin: string;
  hours: string;
  management: string;
  externalCourses?: ExternalCourse[];
  internalCourses?: InternalCourse[];
}

export enum Modality_Type {
  PRESENCIAL = 1,
  SEMIPRESENCIAL = 2,
  A_DISTANCIA = 3,
  ONLINE = 4,

  PRESENCIAL_VIRTUAL = 5
}

export enum ORIGIN_TYPE {
  INTERNAL,
  EXTERNAL
}

@Component({
  selector: 'app-my-courses',
  templateUrl: './my-courses.component.html',
  styleUrls: ['./my-courses.component.css'],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'en-GB'},
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})

export class MyCoursesComponent implements OnInit {
  cleanImgUrl = '../../assets/img/borrar_filtros.svg';
  searchImgUrl = '../../assets/img/search.svg';
  excelImgUrl = '../../assets/img/excel.svg';
  mostrarTabla = false;
  dataSourceMyCourses = new MatTableDataSource<any>();
  displayedColumns: string[] = ['checklist',
    'state',
    'initDate',
    'endDate',
    'description',
    'origin',
    'courseType',
    'hours',
    'actions'];
  @ViewChild(MatSort) sort: MatSort;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('select') select: MatSelect;
  allSelected = false;

  courseCategory: ExternalCourseCategory[] = [];
  courseModality: CourseModality[] = [];
  courseType: CourseType[] = [];
  searchForm: FormGroup;
  showMembers = false;
  empresas: any[];
  maxDate: Date;
  minDate: Date;
  data: any;
  selectedCourse: Course;
  formationSubTypes: any;
  exercise: any[] = [];
  modalityChecked = false;
  periods = [
    {id: 0, description: 'MY_COURSE.FINANCIAL_YEAR'},
    {id: 1, description: 'MY_COURSE.TITLE.DATES'}
  ];

  constructor(private formBuilder: FormBuilder,
              private userService: UserService,
              public utils: UtilsService,
              public dialog: MatDialog,
              private router: Router,
              public translate: TranslateService,
              private myCoursesService: MyCoursesService,
              private spinner: NgxSpinnerService,
              private globals: Globals,
              private translateService: TranslateService) {
  }

  ngOnInit(): void {
    this.initForm();
    this.getUserData();
    this.getCourseModality();
    this.getFormationSubTypes();
    this.getCourseType();
    this.getExercise();
  }

  getUserData(): void {
    this.spinner.show();
    this.userService.getUser().subscribe(user => {
      this.empresas = user.empresas;
      this.updateEmpresasYCentros();
      this.spinner.hide();
    });
  }

  updateEmpresasYCentros() {
    if (this.empresas.length === 1) {
      this.searchForm.controls.empresaForm.setValue(this.empresas[0].idEmpresa);
    }
  }

  onSubmit(): void {
    if (!this.searchForm.valid) {
      this.searchForm.get('empresaForm').markAsTouched();
    } else {
      // filter on submit -> search with filters
      this.spinner.show();
      const result = [];
      this.dataSourceMyCourses = new MatTableDataSource();
      const predicate = this.createPredicate();
      let originId = [];
      originId = this.searchForm.get('origin').value;

      if (originId.length !== 0) {
        originId = originId.filter(item => item !== 2);
      }
      this.myCoursesService.getFilteredExternalCourses(predicate, this.searchForm.get('empresaForm').value, originId === null || originId.length === 2 ? '' : originId).subscribe(response => {
        if (response.externalCourses !== undefined) {
          response.externalCourses.sort((b, a) => new Date(a.initDate).getTime() - new Date(b.initDate).getTime());
          response.externalCourses.forEach(element => {
            element.origin = 1;
          });
          result.push(...response.externalCourses);
        }
        if (response.internalCourses !== undefined) {
          response.internalCourses.sort((b, a) => new Date(a.initDate).getTime() - new Date(b.initDate).getTime());
          response.internalCourses.forEach(element => {
            element.origin = 0;
          });
          result.push(...response.internalCourses);
        }
        this.dataSourceMyCourses = new MatTableDataSource(result);
        this.dataSourceMyCourses.paginator = this.paginator;
        this.dataSourceMyCourses.sort = this.sort;
        this.mostrarTabla = true;
      }).add(() => {
        // when the request ends
        this.spinner.hide();
      });
    }
  }

  get modalityType(): typeof Modality_Type {
    return Modality_Type;
  }


  courseState(course: ExternalCourse) {

    const today = new Date();
    const initCourseDate = new Date(course.initDate);
    const endCourseDate = new Date(course.endDate);
    if (today < initCourseDate) {
      return this.globals.my_courses_soon_course;
    } else if (initCourseDate <= today && today <= endCourseDate) {
      return this.globals.my_courses_active_course;
    } else {
      return this.globals.my_courses_closed_course;
    }
  }
  isVisibleManagerContactIcon(course) {
      return course.origin === this.globals.my_courses_internal_origin &&
             this.courseState(course) !== this.globals.my_courses_closed_course &&
             course.courseType && course.courseType.id === this.globals.my_courses_more_training_type;
  }


  initForm() {
    this.searchForm = this.formBuilder.group({
      empresaForm: new FormControl('', [Validators.required]),
      centroForm: new FormControl(''),
      courseName: new FormControl(''),
      tipoFormacion: new FormControl(''),
      subcategory: new FormControl(''),
      origin: new FormControl(''),
      management: new FormControl(''),
      financialYear: new FormControl([new Date().getFullYear()]),
      finDatePicker: new FormControl(moment()),
      startDatePicker: new FormControl(moment()),
      modality: new FormControl(''),
      period: new FormControl(1)
    });
    this.setDefaultForm();
  }

  resetForm(): void {
    setTimeout(() => {
      this.initForm();
      this.updateEmpresasYCentros();
    });
  }

  getSubTypeDisabled(): boolean {
    const type = this.searchForm.get('tipoFormacion').value;

    if (this.fieldHasValue('centroForm') &&
        this.searchForm.get('origin').value.includes(this.globals.my_courses_internal_origin)) {
        this.searchForm.get('tipoFormacion').setValue([this.globals.formacion_prl]);
        this.searchForm.controls.tipoFormacion.disable();
        this.searchForm.get('subcategory').setValue('');
        return true;
    } else if (!type.includes(this.globals.mas_formacion)) {
        this.searchForm.get('subcategory').setValue('');
        this.searchForm.controls.tipoFormacion.enable();
        return true;
    }
    return false;
  }

  getTooltip(element) {
    let courseNameLabel = 'MY_COURSE.COURSE_NAME';
    this.translate.get('MY_COURSE.COURSE_NAME').subscribe((res: string) => {
      courseNameLabel = res;
    });

    let centerLabel = 'CENTRO';
    this.translate.get('CENTRO').subscribe((res: string) => {
      centerLabel = res;
    });

    let modalityLabel = 'MY_COURSE.MODALITY';
    this.translate.get('MY_COURSE.MODALITY').subscribe((res: string) => {
      modalityLabel = res;
    });

    let managementLabel = 'MY_COURSE.MANAGEMENT';
    this.translate.get('MY_COURSE.MANAGEMENT').subscribe((res: string) => {
      managementLabel = res;
    });

    let finantialYearLabel = 'MY_COURSE.FINANCIAL_YEAR';
    this.translate.get('MY_COURSE.FINANCIAL_YEAR').subscribe((res: string) => {
      finantialYearLabel = res;
    });
    let modality;
    if (element.courseModality !== undefined) {
        modality = element.courseModality.nombre;
    }
    if (element.courseModality !== undefined) {
        modality = element.courseModality.nombre;
    }

    const management = element.management !== null && element.management !== undefined && element.management !== '' ? element.management : '';

    return courseNameLabel + ': ' + element.description + '\n' + centerLabel + ': ' + this.getCenterName(element?.centerId) + '\n' +
          modalityLabel + ': ' + modality + '\n' + managementLabel + ': ' + management + '\n' +
          finantialYearLabel + ': ' + this.getFinancialYear(element.financialYear);
    }

  getContactManagerSubject(element) {

    let managerLabel = 'MY_COURSE.CONTACT_MANAGER_MAIL.MANAGER';
    this.translate.get('MY_COURSE.CONTACT_MANAGER_MAIL.MANAGER').subscribe((res: string) => {
      managerLabel = res;
    });

    let enterpriseLabel = 'EMPRESA';
    this.translate.get('EMPRESA').subscribe((res: string) => {
      enterpriseLabel = res;
    });

    let centerLabel = 'CENTRO';
    this.translate.get('CENTRO').subscribe((res: string) => {
      centerLabel = res;
    });

    return managerLabel + ' - ' + this.getEnterpriseName(element?.enterpriseId) + ' - ' + element?.description + ' - ' + moment(new Date()).format('DD/MM/yyyy');
  }

  getCenterName(centerId) {
      let center;
      this.empresas.forEach(enterprises => {
          center = center === undefined ? enterprises.centros.find(obj => obj.idCentro === centerId) : center;
      });

      return centerId !== null && centerId !== undefined  ? center?.nombre : '';
  }

  getEnterpriseName(enterpriseId) {
    // tslint:disable-next-line:no-shadowed-variable
    const enterprise = this.empresas.find(enterprise => enterprise.idEmpresa === enterpriseId);
    return enterprise === undefined ? '' : enterprise.nombre;
  }

  getFinancialYear(financialYear) {
    return financialYear !== null && financialYear !== undefined  ? financialYear.toString() : '';
  }

  setDefaultForm(): void {
    const now = new Date();
    now.setHours(23, 59, 59);
    this.maxDate = now;
    const nYearsAgo = new Date();
    nYearsAgo.setDate(
      nYearsAgo.getDate() - 365
    );
    nYearsAgo.setHours(0, 0, 0);
    this.minDate = nYearsAgo;
    // this.searchForm.controls["selectEmpresasRadioForm"].setValue("1");
    this.searchForm.controls.startDatePicker.setValue(nYearsAgo);
    this.searchForm.controls.finDatePicker.setValue(now);
    this.searchForm.controls.empresaForm.setValue([]);
  }

  createPredicate() {
      let predicate = '';
      if (this.searchForm.get('period').value === 1 && this.searchForm.get('startDatePicker').value !== null) {
        const fromDate = moment(this.searchForm.get('startDatePicker').value).format('yyyy-MM-DDTHH:mm:ss');
        predicate = predicate + 'initDate>' + fromDate + ',';
    }

      if (this.searchForm.get('period').value === 1 && this.searchForm.get('finDatePicker').value !== null) {
        const toDate = moment(this.searchForm.get('finDatePicker').value).format('yyyy-MM-DDTHH:mm:ss');
        predicate = predicate + 'initDate<' + toDate + ',';
    }

      if (this.searchForm.get('period').value === 0 &&
        this.searchForm.get('financialYear').value !== null &&
        this.searchForm.get('financialYear').value !== 0) {
        let financialYear = this.searchForm.get('financialYear').value;
        financialYear = financialYear.filter(item => item !== 0);
        financialYear = financialYear.toString().replaceAll(',', ':');
        predicate = predicate + 'financialYear¬' + financialYear + ',';
    }
      if (this.searchForm.get('centroForm').value != null && this.searchForm.get('centroForm').value !== '') {
      let centerIds = this.searchForm.get('centroForm').value;
      centerIds = centerIds.toString().replaceAll(',', ':');
      predicate = predicate + 'centerId¬' + centerIds + ',';
    }

      if (this.searchForm.get('modality').value != null && this.searchForm.get('modality').value !== '') {
      let modalityIds = this.searchForm.get('modality').value;
      modalityIds = modalityIds.filter(item => item !== 0);
      modalityIds = modalityIds.toString().replaceAll(',', ':');
      predicate = predicate + 'courseModality.id¡' + modalityIds + ',';
    }

      if (this.searchForm.get('tipoFormacion').value != null && this.searchForm.get('tipoFormacion').value !== '') {
      let tipoFormacionIds = this.searchForm.get('tipoFormacion').value;
      tipoFormacionIds = tipoFormacionIds.filter(item => item !== 0);
      tipoFormacionIds = tipoFormacionIds.toString().replaceAll(',', ':');
      predicate = predicate + 'courseType.id¡' + tipoFormacionIds + ',';
    }

      if (this.searchForm.get('courseName').value != null && this.searchForm.get('courseName').value !== '') {
      const courseName = this.searchForm.get('courseName').value;
      predicate = predicate + 'description~' + courseName + ',';
    }

      if (this.searchForm.get('subcategory').value != null && this.searchForm.get('subcategory').value !== '') {
      let subcategoryIds = this.searchForm.get('subcategory').value;
      subcategoryIds = subcategoryIds.filter(item => item !== 0);
      subcategoryIds = subcategoryIds.toString().replaceAll(',', ':');
      predicate = predicate + 'subcategory¬' + subcategoryIds + ',';
      this.searchForm.controls.origin.setValue([0]);
    }
      return predicate;
  }

  async getCourseModality(): Promise<CourseModality[]> {
    this.myCoursesService.getCourseModality().subscribe(data => {
      this.courseModality = data;
    });
    return this.courseModality;
  }

  async getFormationSubTypes() {
    this.userService.getSubcategoriasFormacion().subscribe(data => {
      this.formationSubTypes = data;
    });
    return this.formationSubTypes;
  }

  async getCourseType(): Promise<CourseType[]> {
    this.myCoursesService.getCourseType().subscribe(data => {
      this.courseType = data;
    });
    return this.courseType;
  }

  getExercise() {
    const currentDate = new Date();
    for (let exerciseCounter = currentDate.getFullYear(); exerciseCounter > currentDate.getFullYear() - this.globals.max_exercises_number ;
                              exerciseCounter--) {
      this.exercise.push({id: exerciseCounter, description: exerciseCounter.toString()});
    }
    return this.exercise;
  }

  createCourseModal() {
    const dialogRef = this.dialog.open(CreateCourseFormComponent, {
      width: '50%',
      maxHeight: '700px',
      data: {
        companyId: this.searchForm.get('empresaForm').value,
        centerId: this.searchForm.get('centroForm').value !== '' ? this.searchForm.get('centroForm').value : null,
        courseTypeList: this.courseType,
        courseCategoryList: this.courseCategory,
        courseModalityList: this.courseModality
      }
    });
    const instance = dialogRef.componentInstance;
    this.translate.get('MY_COURSE.NEW_COURSE').subscribe((res: string) => {
      instance.title = res;
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.saveCourse(result.value);
        this.onSubmit();
      }
    });
  }
  massiveCourseModal() {
    const dialogRef = this.dialog.open(MassiveCourseComponent, {
      width: '45%',
      maxHeight: '800px',
    });

    dialogRef.afterClosed().subscribe(form => {
      if (form) {
        this.massiveUploadCourses(form?.value);
      }
    });
  }

  saveCourse(form) {
    let successMessage;
    this.translate.get('MY_COURSE.NEW_COURSE.SUCCESS_MESSAGE').subscribe((res: string) => {
      successMessage = res;
    });
    let errorMessage;
    this.translate.get('MY_COURSE.NEW_COURSE.ERROR_MESSAGE').subscribe((res: string) => {
      errorMessage = res;
    });
    const newCourse = this.createExternalCourseObject(form);
    this.spinner.show();
    this.myCoursesService.createCourse(newCourse).subscribe(data => {
      this.spinner.hide();
      this.showSuccessMessage(successMessage);
      if (form.participants === true) {
        this.createStudentModal(data.id);
      }
    }, error => {
      this.showErrorMessage(errorMessage);
    });
  }

  editCourse(form) {
    const x = this.dataSourceMyCourses.filteredData.find(x => x.id === form.id);
    if (x && x.enterpriseId !== form.empresaForm) {
      const data = {
        clientChange: true
      };
      const dialogRef = this.dialog.open(EditCourseModalComponent, {
        data,
        width: '30%',
        maxHeight: '400px',
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result === true) {
          this.editCourseAccept(form);
        }
      });
    } else {
      this.editCourseAccept(form);
    }
  }

  editCourseAccept(form) {

    let successMessage;
    this.translate.get('MY_COURSE.EDIT_COURSE.SUCCESS_MESSAGE').subscribe((res: string) => {
      successMessage = res;
    });
    let errorMessage;
    this.translate.get('MY_COURSE.EDIT_COURSE.ERROR_MESSAGE').subscribe((res: string) => {
      errorMessage = res;
    });
    const newCourse = this.createExternalCourseObject(form);
    this.spinner.show();
    this.myCoursesService.editCourse(newCourse).subscribe(data => {
      this.spinner.hide();
      this.showSuccessMessage(successMessage);
      if (form.participants === true) {
        this.createStudentModal(data.id);
      } else {
        this.onSubmit();
      }
    }, error => {
      this.showErrorMessage(errorMessage);
    });
  }

  deleteCourse(id) {
    let successMessage;
    this.translate.get('MY_COURSE.DELETE_COURSE.SUCCESS_MESSAGE').subscribe((res: string) => {
      successMessage = res;
    });
    let errorMessage;
    this.translate.get('MY_COURSE.DELETE_COURSE.ERROR_MESSAGE').subscribe((res: string) => {
      errorMessage = res;
    });
    this.spinner.show();
    try {
      this.myCoursesService.deleteCourse(id).subscribe((res) => {
      });
      this.spinner.hide();
      this.showSuccessMessage(successMessage);
    } catch (e) {
      this.showErrorMessage(errorMessage);
    }

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

  createExternalCourseObject(form): ExternalCourse {
    const newCourse = {} as ExternalCourse;
    newCourse.id = form.id !== null ? form.id : null;
    newCourse.description = form.description;
    newCourse.enterpriseId = form.empresaForm;
    newCourse.centerId = form.centroForm;
    newCourse.courseModality = form.modality;
    newCourse.hours = form.hours;
    newCourse.initDate = this.getUTCDate(form.startDatePicker);
    newCourse.endDate = this.getUTCDate(form.finDatePicker);
    newCourse.recycleDate = this.getUTCDate(form.recyclingDate);
    newCourse.address = form.address;
    newCourse.externalCourseCategory = form.category;
    newCourse.courseType = form.courseType;
    return newCourse;
  }

  editCourseModal(course: ExternalCourse) {
    this.spinner.show();
    const dialogRef = this.dialog.open(CreateCourseFormComponent, {
      width: '50%',
      maxHeight: '700px',
      data: {
        courseTypeList: this.courseType,
        courseCategoryList: this.courseCategory,
        courseModalityList: this.courseModality
      }
    });

    const instance = dialogRef.componentInstance;
    instance.course = course;
    this.translate.get('MY_COURSE.EDIT_COURSE').subscribe((res: string) => {
      instance.title = res;
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        result.value.id = course.id;
        this.editCourse(result.value);
      }
    });
  }

  async openContactManagerModal(element) {
    const dialogRef = this.dialog.open(ContactManagerComponent, {
      width: '943px',
      maxHeight: '410px'
    });

    dialogRef.afterClosed().subscribe(form => {
      if (form !== undefined) {
        this.contactManagerSendMail(form.value, this.getContactManagerSubject(element), element.managerEmail);
      }
    });
  }

  contactManagerSendMail(contactManagerForm, contactManagerSubject, managerEmail) {

    let successMessage;
    this.translate.get('MY_COURSE.CONTACT_MANAGER_MAIL.SUCCESS').subscribe((res: string) => {
      successMessage = res;
    });
    let errorMessage;
    this.translate.get('MY_COURSE.CONTACT_MANAGER_MAIL.ERROR_MESSAGE').subscribe((res: string) => {
      errorMessage = res;
    });
    const data = new FormData();
    data.append('attachment', contactManagerForm.attachment);
    data.append('contactManagerSubject', contactManagerSubject);
    data.append('contactManager', contactManagerForm.contactManager);
    data.append('managerEmail', managerEmail);
    this.spinner.show();
    this.myCoursesService.sendContactManagerMail(data).subscribe(() => {
      this.spinner.hide();
      this.showSuccessMessage(successMessage);
    }, error => {
      this.spinner.hide();
      this.showErrorMessage(errorMessage);
    });
  }

  deleteCourseModal(course) {
    const data = {
      clientChange: true
    };
    const dialogRef = this.dialog.open(DeleteCourseModalComponent, {
      data,
      width: '30%',
      maxHeight: '400px',

    });
    const instance = dialogRef.componentInstance;
    this.translate.get('MY_COURSE.DELETE_MODAL.TITLE').subscribe((res: string) => {
      instance.title = res;
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.deleteCourse(course.id);
        this.onSubmit();
      }
    });
  }
  goToMembers(element) {
    this.data = {};
    const client = this.empresas.find(x => x.idEmpresa === element.enterpriseId);
    let center;
    if (client) {
      this.data.client = client;
      if (element.centerId) {
        center = client.centros.find(x => x.idCentro === element.centerId);
        if (center !== undefined) {
          this.data.center = center;
        }
      }
    }
    this.data.course = element;
    this.showMembers = !this.showMembers;
  }
  createStudentModal(courseId) {
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
        });
      }
      this.spinner.hide();
      this.showSuccessMessage(successMessage);
      if (studentForm.continue === true) {
        this.createStudentModal(externalCourseStudent.externalCourse.id);
      } else {
        this.onSubmit();
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
    externalCourseStudent.certificate = studentForm.certificate;
  }

  checkAllRows(event) {
    if (this.dataSourceMyCourses !== undefined && this.dataSourceMyCourses !== null) {
      this.dataSourceMyCourses.data.forEach(val => { val.checked = event.checked;});
    }
  }

  toggleAllSelection() {
    if (this.allSelected) {
      this.select.options.forEach((item: MatOption) => item.select());
    } else {
      this.select.options.forEach((item: MatOption) => item.deselect());
    }
  }


  exportAsExcel() {
    this.spinner.show();
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    let JSONWS: XLSX.WorkSheet;
    const dataJS = [];

    let isElementosSelect = false;

    this.dataSourceMyCourses.data.forEach(item => {
      if (item.checked) {
        isElementosSelect = true;
        const newItem = {};
        this.displayedColumns.forEach(tableHeader => {
          switch (tableHeader) {
            case 'initDate':
              this.translate.get('MY_COURSE.START_DATE').subscribe((res: string) => {
                newItem[res] = item.initDate;
              });
              break;
            case 'endDate':
              this.translate.get('MY_COURSE.FIN_DATE').subscribe((res: string) => {
                newItem[res] = item.endDate;
              });
              break;
            case 'description':
              this.translate.get('MY_COURSE.COURSE_NAME').subscribe((res: string) => {
                newItem[res] = item.description;
              });
              break;
            case 'origin':
              this.translate.get('MY_COURSE.ORIGIN').subscribe((res: string) => {
                if (item.origin === 0) {
                  this.translate.get('INTERNAL').subscribe((res2: string) => {
                    newItem[res] = res2;
                  });
                } else if (item.origin === 1) {
                  this.translate.get('EXTERNAL').subscribe((res2: string) => {
                    newItem[res] = res2;
                  });
                }
              });
              break;
            case 'courseType':
              this.translate.get('MY_COURSE.TYPE_OF_TRAINING').subscribe((res: string) => {
                this.translate.get(item.courseType.description).subscribe((res2: string) => {
                  newItem[res] = res2;
                });
              });
              break;
            case 'hours':
              this.translate.get('MY_COURSE.HOURS').subscribe((res: string) => {
                newItem[res] = item[tableHeader];
              });
              break;
            default:
              break;
          }
        });
        dataJS.push(newItem);
      }

    });

    if (isElementosSelect === false) {
      let titulo = 'Debe seleccionar al menos un elemento a exportar';
      this.translate.get('ERROR_SELECCIONA_EXPORTAR').subscribe((res: string) => {
        titulo = res;
      });
      this.utils.mostrarMensajeSwalFire('error', titulo, '', 'var(--blue)', false);
    } else {
      const result = XLSX.utils.sheet_add_json(JSONWS, dataJS);
      XLSX.utils.book_append_sheet(wb, result, 'Sheet1');
      /* save to file */
      XLSX.writeFile(wb, 'ListadoMisCursos.xlsx');
    }
    this.spinner.hide();
  }

    getOriginType(origin) {
        return ORIGIN_TYPE[origin];
    }

  getUTCDate(paramDate) {
    return new Date(moment(paramDate).format('YYYY-MM-DDTHH:mm:ss[Z]'));
  }
  massiveUploadCourses(element) {

    const data = new FormData();
    data.append('document', element.file);
    data.append('clientId', element.empresaForm);
    data.append('centerId', element.centroForm);
    this.spinner.show();
    this.myCoursesService.massiveCourseUpload(data).subscribe(response => {

      let successMessage;
      this.translate.get('MY_COURSE.MASSIVE_ERROR.MASSIVE_SUCCESS_MESSAGE').subscribe((res: string) => {
        successMessage = res;
      });
      this.showSuccessMessage(successMessage);
      this.onSubmit();
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

  isExerciseHidden() {
    return this.searchForm.controls.period.value === 1;
  }
  selectAll(formName, formControlName, values, fieldName) {
    /*si viene 1 elemento en los controls es que estamos marcando el selectAll...
    si hay mas de uno deseleccionamos*/
    if (this[formName].controls[formControlName].value.length !== 1) {
      this[formName].controls[formControlName].setValue([]);
    } else {
      const result = [];
      values.forEach(item => {
        result.push(item[fieldName]);
      });
      result.push(0);
      this[formName].controls[formControlName].setValue(result);
    }
  }

  selectAllOrigin(formName, formControlName, values, fieldName) {
    if (this[formName].controls[formControlName].value.length !== 1) {
      this[formName].controls[formControlName].setValue([]);
    } else {
      const result = [];
      values.forEach(item => {
        result.push(item);
      });
      result.push(2);
      this[formName].controls[formControlName].setValue(result);
    }
  }

  fieldHasValue(fieldName) {
    return this.searchForm.get(fieldName).value !== null &&
           this.searchForm.get(fieldName).value !== undefined &&
           this.searchForm.get(fieldName).value.length > 0;
  }

}
