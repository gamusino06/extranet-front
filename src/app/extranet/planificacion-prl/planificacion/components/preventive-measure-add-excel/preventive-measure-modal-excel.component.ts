import { Component, OnInit, Inject, Input } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from "@angular/material/core";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { MY_FORMATS } from "src/config/config";
import { HttpClient } from "@angular/common/http";

import { PreventiveMeasureScheduleService } from "src/app/services/preventive-measure-schedule.service";
import { convertCompilerOptionsFromJson } from "typescript";
import { PreventiveMeasureExcelErrorModalComponent } from "../preventive-measure-excel-error-modal/preventive-measure-excel-error-modal.component";

@Component({
  selector: "app-preventive-measure-modal-excel",
  templateUrl: "./preventive-measure-modal-excel.component.html",
  styleUrls: ["./preventive-measure-modal-excel.component.scss"],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class PreventiveMeasureModalExcelComponent implements OnInit {
  @Input() title: string;
  form: FormGroup;
  files: File[] = [];
  file: File;
  isSubmitting: boolean = false;
  progress: number = 0;

  empresas: any[];
  constructor(
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    public translate: TranslateService,
    private http: HttpClient,
    private preventiveMeasureScheduleService: PreventiveMeasureScheduleService,
    public dialogRef: MatDialogRef<PreventiveMeasureModalExcelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.empresas = this.data.empresas;
    this.initForm();
  }

  initForm() {
    this.form = this.formBuilder.group({
      file: new FormControl(this.file, [Validators.required]),
      empresaForm: new FormControl("", [Validators.required]),
      centroForm: new FormControl("", [Validators.required]),
    });
  }

  cancel() {
    this.dialogRef.close();
  }

  accept() {
    this.file = this.files[0] || null;
    this.form.controls.file.setValue(this.file);

    if (this.form.valid && this.file != null) {
      this.progress = 0;
      this.isSubmitting = true;
      try {
        const extension = this.file.name.split(".").pop();
        const renamedFile = new File([this.file], this.file.name, {
          ...this.file,
          type: extension,
        });
        this.savePreventiveMeasureExcel(this.form.value);
        // this.dialogRef.close({
        //   file: renamedFile,
        //   centroForm: this.form.value.centroForm,
        // });
      } catch (e) {
        console.error(e);
        this.isSubmitting = false;
      }
    }else{
        this.form.get("empresaForm").markAsTouched();
        this.form.get("centroForm").markAsTouched();
    }
  }

  downloadTemplateExcelAddMPMasive() {
    const url = "assets/xlsx/plantilla-subida-masiva-medidas-preventivas.xlsx";
    this.http.get(url, { responseType: "blob" }).subscribe((blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "plantilla-subida-masiva-medidas-preventivas.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    });
  }

  onFileError(error: any) {
    this.data.showErrorMessage(
      this.translate.instant("PLANIFICACION_PRL.FILE_ADDED.ERROR")
    );
  }

  savePreventiveMeasureExcel(form) {
    const successMessage = this.translate.instant(
      "PLANIFICACION_PRL.MSG_EXITO.MEDIDA_PREVENTIVA_CREADA_EXCEL"
    );
    const errorMessage = this.translate.instant(
      "PLANIFICACION_PRL.ERRORES.VUELVA_A_INTENTAR"
    );
    const errorMessageExcelVacio = this.translate.instant(
      "PLANIFICACION_PRL.MEDIDA_PREVENTIVAS_ERROR_EXCEL_FORMATO"
    );

    this.progress = 100;
    const centerId = form.centroForm;

    this.preventiveMeasureScheduleService
      .savePreventiveMeasureScheduleExcel(form.file, centerId)
      .subscribe(
        (data) => {
          if (data != null && data.length == 1 && data[0].row == -1) {
            this.data.showErrorMessage(errorMessageExcelVacio);
          } else if (data != null && data.length > 0) {
            this.openPreventiveMeasureModalExcelError(data);
          } else {
            this.data.showSuccessMessage(successMessage);
          }

          this.isSubmitting = false;
          this.dialogRef.close();
        },
        (error) => {
          // Abrir modal de errores etc
          this.data.showErrorMessage(errorMessage);
          this.isSubmitting = false;
        }
      );
  }

  openPreventiveMeasureModalExcelError(data): void {
    const dialogRef = this.dialog.open(
      PreventiveMeasureExcelErrorModalComponent,
      {
        hasBackdrop: true,
        disableClose: true,
        width: "50%",
        maxHeight: "750px",
        data: data,
      }
    );
    const instance = dialogRef.componentInstance;
    const title =
      "PLANIFICACION_PRL.ERROR_IMPORTACION_EXCEL_MEDIDAS_PREVENTIVAS";
    this.translate.get(title).subscribe((res: string) => {
      instance.title = res;
    });
  }
}
