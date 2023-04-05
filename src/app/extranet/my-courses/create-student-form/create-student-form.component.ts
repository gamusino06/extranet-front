import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialogRef} from '@angular/material/dialog';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {MY_FORMATS} from '../../../../config/config';
import * as _moment from 'moment';


@Component({
  selector: 'app-create-student-form',
  templateUrl: './create-student-form.component.html',
  styleUrls: ['./create-student-form.component.css'],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})

export class CreateStudentFormComponent implements OnInit {
  @Input() title: string;
  @Input() student?: any;
  @Input() description: string;
  studentForm: FormGroup;
  minDate: unknown;
  maxDate: Date;
  certificate;

  mostrarAcceptAndNew = true;

  constructor(private formBuilder: FormBuilder,
              public dialogRef: MatDialogRef<CreateStudentFormComponent>) {
  }

  ngOnInit() {
    this.mostrarAcceptAndNew = !this.student || this.student === undefined ||
                               !this.student.id || this.student.id === '' ||
                                this.student.id === undefined;
    this.initForm();
  }

  initForm() {
    this.maxDate = new Date();

    const firstName = this.student?.surnames === undefined ? '' : this.student?.surnames.split(' ')[0];
    const lastName = this.student?.surnames === undefined ? '' : this.student?.surnames.split(' ').slice(1).join(' ');
    const studentEvaluation = this.student?.evaluation  === undefined ? 1 : this.student?.evaluation;
    const birthDate = this.student?.birthDate === null || this.student?.birthDate === undefined ||
                      this.student?.birthDate === '' ? '' : this.student?.birthDate;
    this.studentForm = this.formBuilder.group({
      name: new FormControl(this.student?.name, [Validators.required]),
      firstName: new FormControl(firstName, [Validators.required]),
      lastName: new FormControl(lastName),
      nif: new FormControl(this.student?.nif, [Validators.required, Validators.pattern('([A-Z]|[0-9])[0-9]{7}([A-Z]|[0-9])')]),
      birthDatePicker: new FormControl(birthDate),
      evaluation: new FormControl(studentEvaluation),
      certificate: new FormControl(null),
      continue: new FormControl(false)
    });
    this.certificate = {};
  }

  cancel() {
    this.dialogRef.close();
  }

  accept() {
    this.studentForm.controls.continue.setValue(false);
    this.submitStudent();
  }

  submitStudent() {
    if (this.studentForm.valid) {
      try {
        this.dialogRef.close(this.studentForm);
      } catch (e) {
        console.log(e);
      }
    }
  }

  acceptAndNew() {
    this.studentForm.controls.continue.setValue(true);
    this.submitStudent();
  }

  handleFileInput(e) {
    if (!this.isEvaluationSuitable()) {
      return;
    }
    this.setCertificate(e);
    this.studentForm.controls.certificate.setValue(this.certificate);
  }

  deleteFile() {
    this.studentForm.controls.certificate.setValue(null);
  }

  hasFile() {
    const file = this.studentForm.get('certificate');
    return file.value === null;
  }

  setCertificate(event) {
    this.certificate.fileName = event.target.files[0].name.split('.').slice(0, -1).join('.');
    this.certificate.fileExtension = event.target.files[0].name.split('.').pop();
    this.getBase64(event.target.files[0]).then(
      data => {
        this.certificate.file = data;
      }
    );
  }

  getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',').pop());
      reader.onerror = error => reject(error);
    });
  }

  isEvaluationSuitable(): boolean {
    return this.studentForm.get('evaluation').value === 1;
  }

  evaluationHandler() {
    if (!this.isEvaluationSuitable() && !this.hasFile()) {
      this.studentForm.controls.certificate.setValue(null);
    }
  }

}
