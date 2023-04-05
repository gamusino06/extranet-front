import {
  ParametrizedUploaderConfig,
  ParametrizedUploaderFormControlConfig,
  UploaderWithParamsTableConfig,
} from "src/app/shared/file-uploader-module/interfaces/file-uploader-with-params.interface";
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

import { JobProcedureService } from "src/app/services/job-procedure.service";
import { FileUtils } from "src/app/services/file-utils.service";

import { PdfView } from "src/app/modales/pdfView/pdfView.component";

export interface doc {
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

const OPERATIVE_INSTRUCTION_TYPE = {
  id: 0,
}

const OTHERS_TYPE = {
  id: 1,
}

@Component({
  selector: "app-docs-modal",
  templateUrl: "./docs-modal.component.html",
  styleUrls: ["./docs-modal.component.scss"],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class DocsModalComponent implements OnInit {
  @Input() title: string;

  docs: doc[];
  toCreateDocs: File[];
  file: File;
  isSubmitting: boolean = false;
  progress: number = 0;
  hasChanges: Boolean = false;

  _dataSource: doc[] = [];
  _formConfig: ParametrizedUploaderFormControlConfig[];
  _tableConfig: UploaderWithParamsTableConfig;
  _uploaderConfig: ParametrizedUploaderConfig;
  _sendFunction: Function;

  constructor(
    public dialog: MatDialog,
    public translate: TranslateService,
    private jobProcedureService: JobProcedureService,
    private spinner: NgxSpinnerService,
    private fileUtils: FileUtils,
    public dialogRef: MatDialogRef<DocsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.docs = this.data.docs;
    this.getDocs();
    this.toCreateDocs = [];
    this.initComponentConfig();
  }

  /**
   * Get all docs by jobProcedure id
   */
  private getDocs(): void {
    this.spinner.show();
    this.jobProcedureService.getDocumentsByEntityId(this.data.jobProcedure.id).subscribe(
      (res) => {
        const docsMapped = res.map(item => {
          return {
            ...item,
            typeLabel: item.type?.label
          }
        });
        this.docs = docsMapped;
        this._dataSource = docsMapped;
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
        name: "type",
        label: "TIPO",
        required: true,
        type: "select",
        options: [
          { value: OPERATIVE_INSTRUCTION_TYPE, label: this.translate.instant("PROCEDIMIENTOS_TRABAJO")},
          { value: OTHERS_TYPE, label: this.translate.instant("OTROS")}
        ],
        compareObjects: this.compareObjects()
      },
      {
        name: "observations",
        label: "OBSERVACIONES",
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
          name: "typeLabel",
          label: "TIPO",
        },
        {
          name: "modified",
          label: "PLANIFICACION_PRL.MODIFY_DATE",
          dateFormat: "dd/MM/yyyy",
        }
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

    return (doc) =>
      new Promise((resolve, reject) => {
        const payload = doc.id;

        that.jobProcedureService.getFile(payload).subscribe(
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

    return (doc) =>
      new Promise((resolve, reject) => {
        const payload = doc.id;

        that.jobProcedureService
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
    return (toDeleteDoc) =>
      new Promise((resolve, reject) => {
        that.jobProcedureService.deleteDocument(toDeleteDoc.id).subscribe(
          (res) => {
            that.docs = that.docs.filter((doc) => doc.id !== toDeleteDoc.id);
            // Update data source
            that._dataSource = that.docs;            
            that.hasChanges = true;
            resolve(res);
          },
          (error) => {
            reject(error);
          }
        );
      });
  }

  cancel() {
    this.dialogRef.close(this.hasChanges);
  }

  saveDocs() {
    const that = this;
    return (element, files) =>
      new Promise((resolve, reject) => {
        files = files || [];

        that.progress = 50;
        that.fileUtils.getUploadDocumentDTO(files).then((res) => {
          that.jobProcedureService
            .uploadDocuments(that.data.jobProcedure.id, res, element)
            .pipe(first())
            .subscribe(
              (res) => {
                // Clear toCreateDocs to not save them again
                that.toCreateDocs = [];
                that.getDocs();
                that.progress = 100;
                // Update data source to show new docs
                that._dataSource = res;
                that.hasChanges = true;
                resolve(res);
              },
              (error) => {
                reject(error);
              }
            );
        });
      });
  }

  compareObjects() {
    return (option: any, object: any) => option && object && option.id == object.id;
  }
}
