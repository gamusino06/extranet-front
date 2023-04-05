import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { FormControl, FormGroup, FormBuilder } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { NgxSpinnerService } from "ngx-spinner";
import { first } from "rxjs/operators";

import { FormDatesValidator } from "./form-dates-validator";

import { GoalsService } from "src/app/services/goals.service";
import { UtilsService } from "src/app/services/utils.service";

@Component({
  selector: "app-goal-pdf-export-modal",
  templateUrl: "./goal-pdf-export-modal.component.html",
  styleUrls: ["./goal-pdf-export-modal.component.scss"],
})
export class GoalPdfExportModalComponent implements OnInit {
  dateForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<GoalPdfExportModalComponent>,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private utils: UtilsService,
    private fb: FormBuilder,
    private datesValidator: FormDatesValidator,
    private goalsService: GoalsService,
    @Inject(MAT_DIALOG_DATA) public data: { clientId: any; centerId: any }
  ) {}

  ngOnInit(): void {
    this.dateForm = this.getForm();
  }

  close(): void {
    this.dialogRef.close();
  }

  export(): void {
    if (this.dateForm.invalid) return;

    this.spinner.show();

    const { start, end } = this.dateForm.value;

    let startLong = null;
    let endLong = null;

    if (start && end) {
      let auxEndLong = new Date(end);
      auxEndLong.setHours(23, 59, 59, 999);

      startLong = new Date(start).getTime();
      endLong = new Date(auxEndLong).getTime();
    }

    // this.goalsService
    //   .exportToPdfByStartAndEndDate(
    //     this.data.clientId,
    //     this.data.centerId,
    //     startLong,
    //     endLong
    //   )
    //   .pipe(first())
    //   .subscribe(
    //     (pdfBlob) => {
    //       this.spinner.hide();
    //       const link = document.createElement("a");

    //       link.href = window.URL.createObjectURL(pdfBlob);
    //       link.download = `${this.data.clientId}_${this.data.centerId}_goals.pdf`;
    //       document.body.appendChild(link);
    //       link.click();

    //       setTimeout(function () {
    //         document.body.removeChild(link);
    //         window.URL.revokeObjectURL(window.URL.createObjectURL(pdfBlob));
    //       }, 1000);
    //     },
    //     (error) => {
    //       this.spinner.hide();
    //       if (error.status === 403) {
    //         this.showNoResultsModal();
    //         return;
    //       }

    //       console.error(error);
    //     }
    //   );
  }

  private getForm(): FormGroup {
    return this.fb.group(
      {
        start: new FormControl(""),
        end: new FormControl(""),
      },
      {
        validators: [this.datesValidator.haveStartAndEndDateIfOneIsWithValue],
      }
    );
  }

  private showNoResultsModal() {
    let titulo = "No existen datos para exportar";
    this.translate
      .get("PLANIFICACION_PRL.GOAL_PDF_EXPORT_MODAL.ERROR_NO_RESULTS")
      .pipe(first())
      .subscribe((res: string) => {
        titulo = res;
      });
    this.utils.mostrarMensajeSwalFire(
      "error",
      titulo,
      "",
      "var(--blue)",
      false
    );
  }
}
