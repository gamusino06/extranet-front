import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from "@angular/core";

import { FileUploaderError } from "../../interfaces/file-uploader-error.interface";
import { FileUploaderValidator } from "../../utils/file-uploader-validator.util";

@Component({
  selector: "upload-file-box",
  templateUrl: "./upload-file-box.component.html",
  styleUrls: ["./upload-file-box.component.scss"],
})
export class UploadFileBoxComponent {
  @Input() maxFileSize: number;
  @Input() compact: boolean;
  @Input() multiple: boolean;
  @Input() disabled: boolean;
  @Input() validTypes: string[];
  @Input() uploadFileBoxLabel: string;
  @Input() uploadFileBoxLabelHover: string;

  @ViewChild("fileInput") fileInput!: ElementRef;

  @Output() onFilesChange: EventEmitter<File[]> = new EventEmitter<File[]>();
  @Output() onFilesError: EventEmitter<FileUploaderError[]> = new EventEmitter<
    FileUploaderError[]
  >();

  private imagesPath: string = "../../../../../assets/img";

  isDragActive: boolean = false;

  onFileChanges({ target: { files } }: any): void {
    if (this.disabled) return;

    if (!this.validTypes.includes("*")) this.findErrors(Array.from(files));

    const validFiles: File[] = this.getValidFiles(Array.from(files));

    if (validFiles.length > 0) this.onFilesChange.emit(validFiles);
    this.fileInput.nativeElement.value = "";
    this.isDragActive = false;
  }

  getImagePath(imagesName: string): string {
    return `${this.imagesPath}/${imagesName}`;
  }

  openFileInput(): void {
    if (this.disabled) return;

    this.fileInput.nativeElement.click();
  }

  bytesToMb(bytes: number): number {
    const mb = bytes / 1024 / 1024;
    return Math.round((mb + Number.EPSILON) * 100) / 100;
  }

  private getValidFiles(files: File[]): File[] {
    return files.filter((file) =>
      FileUploaderValidator.validateFile(
        file,
        this.validTypes,
        this.maxFileSize
      )
    );
  }

  private findErrors(files: File[]): void {
    const errors: FileUploaderError[] = FileUploaderValidator.errors(
      files,
      this.validTypes,
      this.maxFileSize
    );

    if (errors.length > 0) this.onFilesError.emit(errors);
  }
}
