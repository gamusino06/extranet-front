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
import { GoalsService } from "src/app/services/goals.service";
import { Observable } from "rxjs";
import { first, switchMap, tap } from "rxjs/operators";
import { FileUtils } from "src/app/services/file-utils.service";

@Component({
  selector: "app-goal-modal",
  templateUrl: "./goal-modal.component.html",
  styleUrls: ["./goal-modal.component.scss"],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class GoalModalComponent implements OnInit {
  @Input() title: string;
  form: FormGroup;
  empresas: any[];
  executionMaxDate: Date;
  docsToUpload: File[] = [];
  progress: number = 0;
  isSubmitting: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    public translate: TranslateService,
    public validatorUtils: ValidatorUtils,
    public dialogRef: MatDialogRef<GoalModalComponent>,
    private goalsService: GoalsService,
    private fileUtils: FileUtils,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.empresas = this.data.empresas;

    this.executionMaxDate = new Date();
  }

  initForm() {
    this.form = this.formBuilder.group({
      id: new FormControl(this.data.goal?.id),
      empresaForm: new FormControl(this.data.goal?.client.idEmpresa, [
        Validators.required,
      ]),
      centroForm: new FormControl(this.data.goal?.center.idCentro, [
        Validators.required,
      ]),
      goalName: [
        this.data.goal?.name,
        this.validatorUtils.requiredTextValidator(),
      ],
      expectedDate: new FormControl(this.data.goal?.expectedDate, [
        Validators.required,
      ]),
      executionDate: new FormControl(this.data.goal?.executionDate),
      observations: new FormControl(this.data.goal?.observations),
    });

    this.executionMaxDate = new Date();
  }

  cancel() {
    this.dialogRef.close();
  }

  accept() {
    if (this.form.invalid) {
      this.form.get("empresaForm").markAsTouched();
      this.form.get("centroForm").markAsTouched();

      return;
    }

    this.progress = 0;
    this.isSubmitting = true;
    this.saveGoal(this.form.value, this.data.editMode);
  }

  getDateErrorMessage() {
    if (this.form.controls.expectedDate.hasError("matDatepickerParse")) {
      return this.translate.instant("PLANIFICACION_PRL.ERRORES.FECHA_INVALIDA");
    }
    return this.translate.instant(
      "PLANIFICACION_PRL.ERRORES.REQUIERE_FECHA_PREVISTA"
    );
  }

  async saveGoal(form, editMode: boolean) {
    const successMessage =
      editMode === false
        ? this.translate.instant("PLANIFICACION_PRL.MSG_EXITO.OBJETIVO_CREADO")
        : this.translate.instant(
            "PLANIFICACION_PRL.MSG_EXITO.OBJETIVO_EDITADO"
          );
    const errorMessage = this.translate.instant(
      "PLANIFICACION_PRL.ERRORES.VUELVA_A_INTENTAR"
    );

    const goalParsed = {
      id: form.id,
      name: form.goalName,
      expectedDate: this.data.getUTCDate(form.expectedDate),
      executionDate: this.data.getUTCDate(form.executionDate),
      observations: form.observations,
      client: this.data.getClientById(form.empresaForm),
      center: this.data.getCenterById(form.empresaForm, form.centroForm),
    };


    const saveGoal$: Observable<any> =this.goalsService.saveGoal(goalParsed).pipe(first());

    saveGoal$.subscribe(
      () => {
        this.data.showSuccessMessage(successMessage).then(() => {
          this.isSubmitting = false;
          this.dialogRef.close({ reloadItems: true });
        });
      },
      () => {
        this.isSubmitting = false;
        this.data.showErrorMessage(errorMessage);
      }
    );
  }

  onFileAddError(error): void {
    this.data.showErrorMessage(
      this.translate.instant("PLANIFICACION_PRL.FILE_ADDED.ERROR")
    );
  }
}
