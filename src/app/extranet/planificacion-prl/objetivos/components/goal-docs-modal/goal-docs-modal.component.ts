import {
  ParametrizedUploaderConfig,
  ParametrizedUploaderFormControlConfig,
  UploaderWithParamsTableConfig,
} from "./../../../../../shared/file-uploader-module/interfaces/file-uploader-with-params.interface";
import { Component, OnInit, Inject, Input } from "@angular/core";
import { NgxSpinnerService } from "ngx-spinner";

import {
  MatDialog,
  MatDialogRef,
  MatDialogConfig,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from "@angular/material/core";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { first } from "rxjs/operators";

import { MY_FORMATS } from "src/config/config";

import { GoalsService } from "src/app/services/goals.service";
import { FileUtils } from "src/app/services/file-utils.service";

import { PdfView } from "src/app/modales/pdfView/pdfView.component";

export interface goalDoc {
  id: number;
  fileName: string;
  fileType: string;
  filePath: string;
  modified: Date;
}

export interface uploadDocumentDto {
  fileType: string;
  fileName: string;
  fileExtension: string;
  file?;
}

@Component({
  selector: "app-goal-docs-modal",
  templateUrl: "./goal-docs-modal.component.html",
  styleUrls: ["./goal-docs-modal.component.scss"],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class GoalDocsModalComponent implements OnInit {
  @Input() title: string;

  goalDocs: goalDoc[];
  toCreateDocs: File[];
  file: File;
  isSubmitting: boolean = false;
  progress: number = 0;

  _dataSource: goalDoc[] = [];
  _formConfig: ParametrizedUploaderFormControlConfig[];
  _tableConfig: UploaderWithParamsTableConfig;
  _uploaderConfig: ParametrizedUploaderConfig;
  _sendFunction: Function;

  constructor(
    public dialog: MatDialog,
    public translate: TranslateService,
    private goalsService: GoalsService,
    private spinner: NgxSpinnerService,
    private fileUtils: FileUtils,
    public dialogRef: MatDialogRef<GoalDocsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.goalDocs = this.data.goalDocs;
    this.getGoalDocs();
    this.toCreateDocs = [];
    this.initComponentConfig();
  }

  /**
   * Get all docs by goal id
   */
  private getGoalDocs(): void {
    this.spinner.show();
    this.goalsService.getDocsByGoalId(this.data.goal.id).subscribe(
      (res) => {
        this.goalDocs = res;
        this._dataSource = res;
        this.spinner.hide();
      },
      (error) => {
        console.error(error);
        this.spinner.hide();
      }
    );
  }

  /**
   * Inialize component file uploader with params
   */
  initComponentConfig() {
    this._formConfig = [
      {
        name: "description",
        label: "DESCRIPCION",
        type: "text",
      },
    ];

    this._tableConfig = {
      fields: [
        {
          name: "fileName",
          label: "DOCUMENTO",
        },
        {
          name: "modified",
          label: "PLANIFICACION_PRL.MODIFY_DATE",
          dateFormat: "dd/MM/yyyy",
        },
        {
          name: "description",
          label: "DESCRIPCION",
        },
      ],
      actions: {
        preview: this.previewFile(),
        download: this.downloadFile(),
        delete: this.deleteDoc(),
        edit: true,
      },
    };

    this._uploaderConfig = {
      validFileTypes: [".xls", ".xlsx", ".pdf", ".doc", ".docx"],
      maxFileSize: 5,
      renameItems: true,
    };

    this._sendFunction = this.saveDocs();
  }

  /**
   * Show or hide title and buttons
   * @param event
   */
  showingButtons(event) {
    this.isSubmitting = event;
  }

  /**
   * Preview file
   */
  previewFile() {
    const that = this;

    return (goalDoc) =>
      new Promise((resolve, reject) => {
        const payload = goalDoc.id;

        that.goalsService.getFile(payload).subscribe(
          (pdfBase64) => {
            if (pdfBase64) {
              let blob = that.fileUtils.getPDFBlobFromBase64(pdfBase64);
              const url = window.URL.createObjectURL(blob);

              resolve(url);
              const dialogConfig = new MatDialogConfig();
              dialogConfig.data = url;
              dialogConfig.width = "50%";
              dialogConfig.hasBackdrop = true;
              dialogConfig.disableClose = true;

              const dialogRef = that.dialog
                .open(PdfView, dialogConfig)
                .afterClosed()
                .subscribe();
            }
          },
          (error) => {
            reject(error);
          }
        );
      });
  }

  /**
   * Download file
   */
  downloadFile() {
    const that = this;

    return (goalDoc) =>
      new Promise((resolve, reject) => {
        const payload = goalDoc.id;

        that.goalsService
          .getFile(payload)
          .pipe(first())
          .subscribe(
            (documentDownloadDto) => {
              that.fileUtils.downloadFileFromBase64(documentDownloadDto);
              resolve(true);
            },
            (err) => {
              reject(err);
            }
          );
      });
  }

  /**
   * Delete file
   */
  deleteDoc() {
    const that = this;
    return (goalDoc) =>
      new Promise((resolve, reject) => {
        that.goalsService.deleteDocument(goalDoc.id).subscribe(
          (res) => {
            that.goalDocs = that.goalDocs.filter(
              (doc) => doc.id !== goalDoc.id
            );
            // Update data source
            that._dataSource = that.goalDocs;
            resolve(res);
          },
          (error) => {
            reject(error);
          }
        );
      });
  }

  cancel() {
    this.dialogRef.close();
  }

  saveDocs() {
    const that = this;
    return (element, files) =>
      new Promise((resolve, reject) => {
        files = files || [];

        that.progress = 50;
        const listDocumentDTO = that.fileUtils
          .getUploadDocumentDTO(files)
          .then((res) => {
            that.goalsService
              .uploadDocuments(that.data.goal.id, res, element)
              .pipe(first())
              .subscribe(
                (res) => {
                  // Clear toCreateDocs to not save them again
                  that.toCreateDocs = [];
                  that.getGoalDocs();
                  that.progress = 100;
                  // Update data source to show new docs
                  that._dataSource = res;
                  resolve(res);
                },
                (error) => {
                  reject(error);
                }
              );
          });
      });
  }
}
