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
  selector: "app-preventive-measure-massive-modal",
  templateUrl: "./preventive-measure-massive-modal.component.html",
  styleUrls: ["./preventive-measure-massive-modal.component.scss"],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class PreventiveMeasureMassiveModalComponent implements OnInit {
  @Input() title: string;
  @Input() priorities: any[];
  @Input() origins: any[];
  @Input() editMode: boolean = false;
  form: FormGroup;
  executionMaxDate: Date;

  constructor(
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    public translate: TranslateService,
    public validatorUtils: ValidatorUtils,
    public dialogRef: MatDialogRef<PreventiveMeasureMassiveModalComponent>,
    private spinner: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.form = this.formBuilder.group({
      startDate: new FormControl(null),
      scheduledDate: new FormControl(null),
      executionDate: new FormControl(null),
      cost: new FormControl(null),
      responsible: new FormControl(null),
      observations: new FormControl(null),
    });
    this.executionMaxDate = new Date();
  }

  cancel() {
    this.dialogRef.close();
  }

  accept() {
    if (this.form.valid) {
      try {
        this.dialogRef.close(this.form);
      } catch (e) {
        console.error(e);
      }
    }
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
