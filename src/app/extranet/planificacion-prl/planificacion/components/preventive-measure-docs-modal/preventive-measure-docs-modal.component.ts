import {
  ParametrizedUploaderConfig,
  ParametrizedUploaderFormControlConfig,
  UploaderWithParamsTableConfig,
} from "src/app/shared/file-uploader-module/interfaces/file-uploader-with-params.interface";

import { Component, OnInit, Inject, Input } from "@angular/core";

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

import { FileUtils } from "src/app/services/file-utils.service";

import { PdfView } from "src/app/modales/pdfView/pdfView.component";
import { PreventiveMeasureScheduleService } from "src/app/services/preventive-measure-schedule.service";
import {NgxSpinnerService} from "ngx-spinner";



export interface preventiveMeasureDoc {
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
  selector: "app-preventive-measure-docs-modal",
  templateUrl: "./preventive-measure-docs-modal.component.html",
  styleUrls: ["./preventive-measure-docs-modal.component.scss"],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class PreventiveMeasureDocsModalComponent implements OnInit {
  @Input() title: string;
  preventiveMeasureDocs: preventiveMeasureDoc[];
  toCreateDocs: File[];
  file: File;
  isSubmitting: boolean = false;
  progress: number = 0;


  _dataSource: preventiveMeasureDoc[] = [];
  _formConfig: ParametrizedUploaderFormControlConfig[];
  _tableConfig: UploaderWithParamsTableConfig;
  _uploaderConfig: ParametrizedUploaderConfig;
  _sendFunction: Function;

  constructor(
    public dialog: MatDialog,
    public translate: TranslateService,
    private preventiveMeasureService: PreventiveMeasureScheduleService,
    private spinner: NgxSpinnerService,
    private fileUtils: FileUtils,
    public dialogRef: MatDialogRef<PreventiveMeasureDocsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.preventiveMeasureDocs = this.data.preventiveMeasureDocs;
    this.getPreventiveMeasureDocs();
    this.toCreateDocs = [];
    this.initComponentConfig();
  }

  private getPreventiveMeasureDocs(): void {
    this.spinner.show();
    this.preventiveMeasureService
      .getDocsByPreventiveMeasureId(this.data.preventiveMeasure.id)
      .subscribe((res) => {
          this.preventiveMeasureDocs = res;
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
      }
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

  /*Previsualizar seleccion*/
  previewFile() {
    return (doc) =>
      new Promise((resolve, reject) => {
        const payload = doc.id;
        this.preventiveMeasureService.getFile(payload).subscribe((pdfBase64) => {
          if (pdfBase64) {
            let blob = this.fileUtils.getPDFBlobFromBase64(pdfBase64);
            const url = window.URL.createObjectURL(blob);

            resolve(url);
            const dialogConfig = new MatDialogConfig();
            dialogConfig.data = url;
            dialogConfig.width = "50%";
            dialogConfig.hasBackdrop = true;
            dialogConfig.disableClose = true;

            const dialogRef = this.dialog
              .open(PdfView, dialogConfig)
              .afterClosed()
              .subscribe();
          }
        },
          (error) => {
            reject(error);
          });
      });
  }

  /*descargar seleccion*/
  downloadFile() {
    return (doc) =>
      new Promise((resolve, reject) => {
        const payload = doc.id;
        this.preventiveMeasureService
          .getFile(payload)
          .pipe(first())
          .subscribe((documentDownloadDto) => {
            this.fileUtils.downloadFileFromBase64(documentDownloadDto);
            resolve(true);
          },
            (err) => {
              reject(err);
            }
          );
      });
  }

  // Eliminar documento
  deleteDoc() {
    return (toDeleteDoc) =>
      new Promise((resolve, reject) => {
      this.preventiveMeasureService
        .deleteDocument(toDeleteDoc.id)
        .subscribe(
          (res) => {
            this.preventiveMeasureDocs = this.preventiveMeasureDocs.filter(
              (doc) => doc.id !== toDeleteDoc.id
            );
            // Update data source
            this._dataSource = this.preventiveMeasureDocs;
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
    return (element, files) =>
      new Promise((resolve, reject) => {
        files = files || [];

        this.progress = 50;
        this.fileUtils.getUploadDocumentDTO(files).then((res) => {
          this.preventiveMeasureService
            .uploadDocuments(this.data.preventiveMeasure.id, res, element)
            .pipe(first())
            .subscribe(
              (res) => {
                // Clear toCreateDocs to not save them again
                this.toCreateDocs = [];
                this.getPreventiveMeasureDocs();
                this.progress = 100;
                // Update data source to show new docs
                this._dataSource = res;
                resolve(res);
              },
              (error) => {
                reject(error);
              }
            );
        });
      });
  }

  /**
   * Show or hide title and buttons
   * @param event
   */
  showingButtons(event) {
    this.isSubmitting = event;
  }

}
