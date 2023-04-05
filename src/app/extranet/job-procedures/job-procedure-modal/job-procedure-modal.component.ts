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
import { JobProcedureService } from "src/app/services/job-procedure.service";
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: "app-job-procedure-modal",
  templateUrl: "./job-procedure-modal.component.html",
  styleUrls: ["./job-procedure-modal.component.scss"],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class JobProcedureModalComponent implements OnInit {
  @Input() title: string;
  @Input() priorities: any[];
  @Input() origins: any[];
  @Input() editMode: boolean = false;
  form: FormGroup;
  executionMaxDate: Date;
  empresas: any[];

  constructor(
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    public translate: TranslateService,
    public validatorUtils: ValidatorUtils,
    private jobProcedureService: JobProcedureService,
    public dialogRef: MatDialogRef<JobProcedureModalComponent>,
    private spinner: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.form = this.formBuilder.group({
      id: new FormControl(this.data.jobProcedure?.id),
      title: new FormControl(this.data.jobProcedure?.title, [
        this.validatorUtils.requiredTextValidator(),
      ]),
      entryDate: new FormControl(this.data.jobProcedure?.entryDate),
      observations: new FormControl(this.data.jobProcedure?.observations),
      active: new FormControl(this.data.jobProcedure?.active)
    });
    this.executionMaxDate = new Date();
  }

  cancel() {
    this.dialogRef.close();
  }

  accept() {
    if (!this.form.valid) {
      this.form.get("entryDate").markAsTouched();
      this.form.get("title").markAsTouched();
    } else if (this.form.valid) {
      try {
        this.dialogRef.close(this.form);
      } catch (e) {
        console.error(e);
      }
    }
  }
}
