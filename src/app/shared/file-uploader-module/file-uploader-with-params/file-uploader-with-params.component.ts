import { TranslateService } from "@ngx-translate/core";
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ChangeDetectionStrategy
} from "@angular/core";
import { FileUploaderError } from "../interfaces/file-uploader-error.interface";
import { NgxSpinnerService } from "ngx-spinner";
import Swal from "sweetalert2";
import {
  FileUploaderWithParamsObject,
  ParametrizedUploaderConfig,
  ParametrizedUploaderFormControlConfig,
  UploaderWithParamsTableConfig,
} from "../interfaces/file-uploader-with-params.interface";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { DeleteModalComponent } from "src/app/extranet/planificacion-prl/components/delete-modal/delete-modal.component";

@Component({
  selector: "app-file-uploader-with-params",
  templateUrl: "./file-uploader-with-params.component.html",
  styleUrls: ["./file-uploader-with-params.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploaderWithParamsComponent implements OnInit, OnChanges {
  @Input() formConfig: ParametrizedUploaderFormControlConfig[] = [];
  @Input() tableConfig: UploaderWithParamsTableConfig;
  @Input() uploaderConfig: ParametrizedUploaderConfig;

  @Input() dataSource: any[] = [];
  @Input() sendFunction: Function;

  @Output() showingButtons: EventEmitter<boolean> = new EventEmitter<boolean>();

  _uploaderMode: boolean = false;
  _loading: boolean = false;
  _isValid: boolean = false;

  _element: any = null;
  _dataSource: any[] = [];

  emptyImg = "../../../../../assets/img/file-uploader-without-documents.svg";
  title: string;

  private _uploadObject: FileUploaderWithParamsObject;
  private _deleteSuccessMsg: string;
  private _deleteErrorMsg: string;
  private _sendNewSuccessMsg: string;
  private _sendEditSuccessMsg: string;
  private _sendErrorMsg: string;
  private _errorMsg: string;

  constructor(
    private spinner: NgxSpinnerService,
    public translate: TranslateService,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.title = "FILE_UPLOADER.UPLOAD_FILE"
    this._dataSource = this.dataSource;
    this._deleteSuccessMsg = this.translate.instant(
      "FILE_UPLOADER.DELETE_SUCCESS_MSG"
    );
    this._deleteErrorMsg = this.translate.instant(
      "FILE_UPLOADER.DELETE_ERROR_MSG"
    );
    this._sendNewSuccessMsg = this.translate.instant(
      "FILE_UPLOADER.SEND_NEW_SUCCESS_MSG"
    );
    this._sendEditSuccessMsg = this.translate.instant(
      "FILE_UPLOADER.SEND_EDIT_SUCCESS_MSG"
    );
    this._sendErrorMsg = this.translate.instant("FILE_UPLOADER.SEND_ERROR_MSG");
    this._errorMsg = this.translate.instant("FILE_UPLOADER.GENERIC_ERROR_MSG");
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.dataSource && changes.dataSource.currentValue) {
      this._dataSource = changes.dataSource.currentValue;
    }
  }

  /**
   * When add button is clicked, the screen changes to the uploader
   * If the element is not null, it means that the user is editing an element and the form is filled with the element data
   * @param element
   */
  screenChange(element = null) {
    this.title = element?.id ? "FILE_UPLOADER.EDIT_FILE": "FILE_UPLOADER.UPLOAD_FILE";

    this._uploaderMode = true;
    this._element = element;
    this.showingButtons.emit(true);
  }

  // Table Events

  onEditClick(element: any) {
    this.screenChange(element);
  }

  onDeleteClick(element) {
    this._loading = true;
    this.spinner.show();
    this._dataSource = this.tableConfig.actions
      .delete(element)
      .then((res) => {
        this.emitSuccess(this._deleteSuccessMsg);
      })
      .catch((err) => {
        this.emitError(this._deleteErrorMsg);
      })
      .finally(() => {
        this._loading = false;
      });
  }

  openDeleteConfirmation(element) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "40%";
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;
    dialogConfig.data = {};

    const dialogRef = this.dialog.open(DeleteModalComponent, {
      hasBackdrop: true,
      disableClose: true,
      width: "40%",
      maxHeight: "700px",
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.onDeleteClick(element);
      }
    });
  }

  onDownloadClick(event: any) {
    this._loading = true;
    this.spinner.show();
    this.tableConfig.actions.download(event).then(
      (res) => {
        this._loading = false;
        this.spinner.hide();
      },
      (err) => {
        console.error(err);
        this.emitError(this._errorMsg);
      }
    );
  }

  onPreviewClick(event: any) {
    this._loading = true;
    this.spinner.show();
    this.tableConfig.actions.preview(event).then(
      (res) => {
        this._loading = false;
        this.spinner.hide();
      },
      (err) => {
        console.error(err);
        this.emitError(this._errorMsg);
      }
    );
  }

  // File Uploader Events
  onFileError(event: FileUploaderError[]) {
    console.error(event);
    const msg = this.translate.instant("FILE_UPLOADER.INVALID_DOC");
    this.emitError(msg);
  }

  onUploaderChanges(event: FileUploaderWithParamsObject) {
    this._uploadObject = event;
  }

  canSubmit(event) {
    this._isValid = event;
  }

  // Button Events
  cancel() {
    this._uploaderMode = false;
    this.showingButtons.emit(false);
  }

  send() {
    this._loading = true;
    const successMsg = this._uploadObject.elementId
      ? this._sendEditSuccessMsg
      : this._sendNewSuccessMsg;
    const data = this.parseElement(this._uploadObject);

    this.sendFunction(data, this._uploadObject.files)
      .then((res) => {
        // this._dataSource = res;
        this.emitSuccess(successMsg);
        this._uploaderMode = false;
        this.showingButtons.emit(false);
      })
      .catch((err) => {
        this.emitError(this._sendErrorMsg);
      })
      .finally(() => {
        this._loading = false;
      });
  }

  /**
   * Creates the object to be sent according to the form controls
   * @param object
   * @returns
   */
  parseElement(object: FileUploaderWithParamsObject) {
    let element = {
      id: object.elementId,
    };

    for (const key in object.form.value) {
      element[key] = object.form.value[key];
    }
    return element;
  }

  // Alerts

  emitSuccess(successMsg) {
    this.spinner.hide();
    this._loading = false;
    this.showSuccessMessage(successMsg);
  }

  emitError(errorMsg) {
    this.spinner.hide();
    this._loading = false;
    this.showErrorMessage(errorMsg);
  }

  showSuccessMessage(message) {
    return Swal.fire({
      icon: "success",
      title: message,
      allowOutsideClick: true,
      showConfirmButton: false,
      timer: 2000,
    });
  }

  showErrorMessage(message) {
    return Swal.fire({
      icon: "error",
      title: message,
      confirmButtonColor: "var(--blue)",
      allowOutsideClick: false,
    });
  }
}
