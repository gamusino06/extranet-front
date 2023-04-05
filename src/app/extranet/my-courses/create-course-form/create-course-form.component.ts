import {Component, Inject, Input, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {TranslateService} from '@ngx-translate/core';
import {UserService} from '../../../services/user.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {MyCoursesService} from '../../../services/myCourses.service';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {MY_FORMATS} from '../../../../config/config';

@Component({
  selector: 'app-create-course-form',
  templateUrl: './create-course-form.component.html',
  styleUrls: ['./create-course-form.component.css'],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})


export class CreateCourseFormComponent implements OnInit {
  @Input() title: string;
  @Input() course?: any;
  @Input() id: number;

  form: FormGroup;
  empresas: any[];
  maxDate: Date;
  minDate: Date;
  continueReadingButton: boolean = false;
  // legalText = "Grupo Preving/Cualtis/Vítaly, y sus empresas, no se hacen responsables ni avalan ninguno de los documentos de cualquier índole, tipo de formato y archivo (ni de su veracidad, ni de su idoneidad ni suficiencia a ninguna normativa, etc.) que el cliente/usuario o cualquier otra persona haya podido subir a los servicios web (sistemas, plataformas, etc.) de Grupo Preving/Cualtis/Vítaly o de sus empresas, siendo el cliente/usuario o cualquier otra persona que los haya subido su único responsable y garante, declarando disponer de todos los derechos de propiedad intelectual de los contenidos publicados y/o alojados, y sin que el repositorio documental puesto a disposición tenga ningún valor probatorio ni suponga ningún tipo de garantía. Igualmente el cliente/usuario declara conocer las obligaciones y responsabilidades que le impone la normativa en Prevención de Riesgos Laborales y cualquier otra, y reconoce que no le exime de ellas el poder subir documentos a los servicios web de las mencionadas empresas. Asimismo el cliente/usuario manifiesta contar con el consentimiento de las personas cuyas imágenes, protegidas por la Ley 1/1982 de 5 de mayo, de Protección Civil del Derecho al Honor, a la Intimidad Personal y Familiar y a la Propia Imagen, se puedan publicar o alojar en los referidos servicios web";
  legalText = '';

  constructor(private formBuilder: FormBuilder,
              public dialogRef: MatDialogRef<CreateCourseFormComponent>,
              public dialog: MatDialog,
              public translate: TranslateService,
              private userService: UserService,
              private myCoursesService: MyCoursesService,
              private spinner: NgxSpinnerService,
              @Inject(MAT_DIALOG_DATA) public data: any) {

  }


  async ngOnInit(): Promise<void> {

    this.initForm();
    this.getUserData();
    this.getLegalTextTranslate();
  }


  getUserData(): void {
    this.spinner.show();
    this.userService.getUser().subscribe(user => {
      this.empresas = user.empresas;

      this.getCompany();
      this.getCenter();

      this.spinner.hide();
    });
  }

  getCompany() {
    if (this.data.companyId !== null) {
      this.form.controls.empresaForm.setValue(this.data.companyId);
    }
    if (this.course?.enterpriseId) {

      this.form.controls.empresaForm.setValue(this.course.enterpriseId);
    }
  }

  getCenter() {
    if (this.data.centerId !== null) {
      this.form.controls.centroForm.setValue(this.data.centerId);
    }
    if (this.course?.centerId) {
      this.form.controls.centroForm.setValue(this.course.centerId);
    }
  }

  initForm() {
    this.form = this.formBuilder.group({
      description: new FormControl(this.course?.description, [Validators.required]),
      empresaForm: new FormControl(this.course?.enterpriseId, [Validators.required]),
      centroForm: new FormControl(''),
      modality: new FormControl('', [Validators.required]),
      courseType: new FormControl(this.course?.courseType, [Validators.required]),
      hours: new FormControl(this.course?.hours, [Validators.min(1), Validators.max(999.9), Validators.pattern(/^\d+(\.\d{1,1})?$/), Validators.required]),
      finDatePicker: new FormControl(this.course?.endDate),
      startDatePicker: new FormControl(this.course?.initDate),
      recyclingDate: new FormControl(this.course?.recycleDate),
      address: new FormControl(this.course?.address),
      participants: new FormControl(false)
    });

    this.setDefaultForm();
  }

  setDefaultForm(): void {
    this.form.controls.modality.setValue(this.data.courseModalityList.find(obj => obj.id === this.course?.courseModality.id));
    this.form.controls.courseType.setValue(this.data.courseTypeList.find(obj => obj.id === this.course?.courseType.id));
  }

  cancel() {
    this.dialogRef.close();
  }

  accept() {
    if (this.form.valid) {
        try {
          this.dialogRef.close(this.form);
        } catch (e) {
          console.log(e);
        }
    }
  }

  isContinueReading() {
    return this.continueReadingButton;
  }

  continueReading() {
    this.continueReadingButton = !this.continueReadingButton;
  }
  getLegalTextTranslate() {
    this.legalText = 'MY_COURSE.LEGAL_TEXT';
    this.translate.get('MY_COURSE.LEGAL_TEXT').subscribe((res: string) => {
      this.legalText = res;
    });
  }
}
