import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {MomentDateAdapter} from "@angular/material-moment-adapter";
import {MY_FORMATS} from "../../../config/config";


@Component({
  selector: 'app-baja-trabajador',
  templateUrl: './baja-trabajador.component.html',
  styleUrls: ['./baja-trabajador.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],

})
export class BajaTrabajadorComponent implements OnInit {

  dateForm: FormGroup;
  minDate: Date;
  fechaLimite: Date = new Date();
  trabajador: any;
  confirmacion: boolean;

  constructor(public dialogRef: MatDialogRef<BajaTrabajadorComponent>,
              @Inject(MAT_DIALOG_DATA) public dialogData: any,
              private formBuilder: FormBuilder) {  }

  ngOnInit(): void {
    this.initForm();
    this.trabajador = this.dialogData.trabajador;
    this.confirmacion = this.dialogData.confirmacion;
  }

  initForm() {
    this.dateForm = this.formBuilder.group({
      date: new FormControl(new Date(), Validators.required)
    });
  }

  onSubmit(){
    this.dialogRef.close(this.dateForm.controls.date.value);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
