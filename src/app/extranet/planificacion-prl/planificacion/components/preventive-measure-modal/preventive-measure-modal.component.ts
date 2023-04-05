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
import { ValidatorUtils } from "src/app/services/validator-utils.service";
import { PreventiveMeasureScheduleService } from "src/app/services/preventive-measure-schedule.service";
import { NgxSpinnerService } from "ngx-spinner";
@Component({
  selector: "app-preventive-measure-modal",
  templateUrl: "./preventive-measure-modal.component.html",
  styleUrls: ["./preventive-measure-modal.component.scss"],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class PreventiveMeasureModalComponent implements OnInit {
  @Input() title: string;
  @Input() priorities: any[];
  @Input() origins: any[];
  @Input() editMode: boolean = false;
  form: FormGroup;
  // origins: any[];
  // priorities: any[];
  executionMaxDate: Date;
  empresas: any[];

  constructor(
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    public translate: TranslateService,
    public validatorUtils: ValidatorUtils,
    private preventiveMeasureScheduleService: PreventiveMeasureScheduleService,
    public dialogRef: MatDialogRef<PreventiveMeasureModalComponent>,
    private spinner: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.empresas = this.data.empresas;
    this.initForm();
  }

  initForm() {
    this.form = this.formBuilder.group({
      id: new FormControl(this.data.preventiveMeasure?.id),
      preventiveMeasure: new FormControl(
        this.data.preventiveMeasure?.preventiveMeasure,
        [this.validatorUtils.requiredTextValidator()]
      ),
      empresaForm: this.editMode
        ? null
        : new FormControl(this.data.preventiveMeasure?.client?.idEmpresa, [
            Validators.required,
          ]),
      centroForm: this.editMode
        ? null
        : new FormControl(this.data.preventiveMeasure?.center?.idCentro, [
            Validators.required,
          ]),
      origin: new FormControl(this.data.preventiveMeasure?.origin, [
        Validators.required,
      ]),
      location: new FormControl(this.data.preventiveMeasure?.location),
      cause: new FormControl(this.data.preventiveMeasure?.cause),
      priority: new FormControl(this.data.preventiveMeasure?.priority, [
        Validators.required,
      ]),
      cost: new FormControl(this.data.preventiveMeasure?.cost),
      responsible: new FormControl(this.data.preventiveMeasure?.responsible),
      observations: new FormControl(this.data.preventiveMeasure?.observations),
      startDate: new FormControl(this.data.preventiveMeasure?.startDate),
      scheduledDate: new FormControl(
        this.data.preventiveMeasure?.scheduledDate
      ),
      executionDate: new FormControl(
        this.data.preventiveMeasure?.executionDate
      ),
    });
    this.executionMaxDate = new Date();
  }

  cancel() {
    this.dialogRef.close();
  }

  accept() {
    if (!this.form.valid) {
      this.form.get("empresaForm").markAsTouched();
      this.form.get("centroForm").markAsTouched();
    } else if (this.form.valid) {
      try {
        this.dialogRef.close(this.form);
      } catch (e) {
        console.error(e);
      }
    }
  }

  isClientPreventiveMeasure() {
    if (
      !this.data.preventiveMeasure?.id ||
      this.data.preventiveMeasure?.type?.id == 0
    ) {
      return true;
    } else {
      return false;
    }
  }

  getPriorityLabel(priority): string {
    return this.priorities.find((p) => p.id == priority).label;
  }

  compareObjects(object1: any, object2: any) {
    return object1 && object2 && object1.id == object2.id;
  }

  comparePriorityObjects(object1Select: any, object2: any) {
    return object1Select && object2 && object1Select == object2;
  }

  getDateErrorMessage() {
    if (this.form.controls.expectedDate.hasError("matDatepickerParse")) {
      return this.translate.instant("PLANIFICACION_PRL.ERRORES.FECHA_INVALIDA");
    }
    if (this.form.controls.executionDate.hasError("matDatepickerParse")) {
      return this.translate.instant("PLANIFICACION_PRL.ERRORES.FECHA_INVALIDA");
    }
    return this.translate.instant(
      "PLANIFICACION_PRL.ERRORES.REQUIERE_FECHA_PREVISTA"
    );
  }
}
