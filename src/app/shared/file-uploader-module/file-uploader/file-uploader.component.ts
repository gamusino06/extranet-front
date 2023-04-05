import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FileUploaderError } from "../interfaces/file-uploader-error.interface";

import { FileUploaderFileChange } from "../interfaces/file-uploader-file-chage.interface";
import { coerceBooleanProperty } from "../utils/coercion-boolean-property.util";

@Component({
  selector: "file-uploader",
  templateUrl: "./file-uploader.component.html",
  styleUrls: ["./file-uploader.component.scss"],
})
export class FileUploaderComponent {
  @Input()
  get compact(): boolean {
    return this._compact;
  }
  set compact(value: boolean) {
    this._compact = coerceBooleanProperty(value);
  }
  @Input()
  get multiple(): boolean {
    return this._multiple;
  }
  set multiple(value: boolean) {
    this._multiple = coerceBooleanProperty(value);
  }
  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
  }
  @Input()
  get renameItems(): boolean {
    return this._renameItems;
  }
  set renameItems(value: boolean) {
    this._renameItems = coerceBooleanProperty(value);
  }
  @Input()
  get hideTitles(): boolean {
    return this._hideTitles;
  }
  set showTitles(value: boolean) {
    this._hideTitles = coerceBooleanProperty(value);
  }
  @Input()
  get preview(): boolean {
    return this._preview;
  }
  set preview(value: boolean) {
    this._preview = coerceBooleanProperty(value);
  }
  @Input() fileList: File[] = [];
  @Input() fileNameListForPreview: string[] = [];
  @Input() maxFileSize: number = 2;
  @Input() validTypes: string[] = ["*"];
  @Input() uploadFileBoxLabel: string = "FILE_UPLOADER.UPLOAD_FILE_BOX.LABEL";
  @Input() uploadFileBoxLabelHover: string =
    "FILE_UPLOADER.UPLOAD_FILE_BOX.LABEL_HOVER";
  @Input() hint: string = "";
  @Input() _hideTitles: boolean = false;

  @Output() fileListChange: EventEmitter<File[]> = new EventEmitter<File[]>();
  @Output() onError: EventEmitter<FileUploaderError[]> = new EventEmitter<
    FileUploaderError[]
  >();

  private _compact: boolean = false;
  private _multiple: boolean = false;
  private _disabled: boolean = false;
  private _renameItems: boolean = false;
  private _preview: boolean = false;

  onFilesAdded(files: File[]): void {
    const filesToUpload: File[] = this.multiple
      ? [...this.fileList, ...Array.from(files)]
      : Array.from([files[0]]);
    this.fileListChange.emit(filesToUpload);
  }

  onFileChange(file: FileUploaderFileChange): void {
    this.fileListChange.emit(
      this.fileList.map((f, index) => (index === file.index ? file.file : f))
    );
  }

  onDelete(file: FileUploaderFileChange): void {
    this.fileListChange.emit(
      this.fileList.filter((_, index) => index !== file.index)
    );
  }

  mbToBytes(mb: number): number {
    return mb * 1024 * 1024;
  }
}
