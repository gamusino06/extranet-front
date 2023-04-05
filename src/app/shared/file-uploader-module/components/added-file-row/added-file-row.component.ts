import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from "@angular/core";

@Component({
  selector: "added-file-row",
  templateUrl: "./added-file-row.component.html",
  styleUrls: ["./added-file-row.component.scss"],
})
export class AddedFileRowComponent implements OnInit, OnChanges {
  @Input() file: File;
  @Input() disabled: boolean;
  @Input() renameItems: boolean;
  @Input() preview: boolean;
  @Input() fileForPreview: string;

  @Output() onFileChange: EventEmitter<File> = new EventEmitter<File>();
  @Output() onDelete: EventEmitter<File> = new EventEmitter<File>();

  @ViewChild("fileInput") fileInput: ElementRef;

  private imagesPath: string = "../../../../../assets/img";

  isEditMode: boolean = false;
  fileName: string;
  fileExtension: string;

  get nameHasChanged(): boolean {
    return this.fileName.trim() !== this.file.name.trim().split(".")[0];
  }

  ngOnInit(): void {
    if (!this.preview) this.setFileNameAndExtension();
    else this.fileName = this.fileForPreview;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.file && changes.file.currentValue) {
      this.setFileNameAndExtension();
    }
  }

  getImagePath(imageName: string): string {
    return `${this.imagesPath}/${imageName}`;
  }

  activeEditMode(): void {
    if (this.disabled) return;
    if (!this.renameItems) return;

    this.isEditMode = true;

    // Add timeout to wait for the input to be rendered and then focus it
    setTimeout(() => this.fileInput.nativeElement.focus(), 50);
  }

  onDisabledEditMode(): void {
    if (this.disabled) return;
    if (["", undefined, null].includes(this.fileName)) return;
    if (!this.nameHasChanged) {
      this.isEditMode = false;
      return;
    }

    this.onFileChange.emit(
      new File([this.file], `${this.fileName.trim()}.${this.fileExtension}`, {
        type: this.file.type,
        lastModified: this.file.lastModified,
      })
    );

    this.isEditMode = false;
  }

  remove(): void {
    if (this.disabled) return;

    this.onDelete.emit(this.file);
  }

  onInputFileChange(event: any): void {
    if (event.target.value.trim() === "") {
      event.target.value = this.fileName;
      return;
    }

    this.fileName = event.target.value;
  }

  private setFileNameAndExtension(): void {
    const fileNameTrimmed: string = this.file.name.trim();
    this.fileName = fileNameTrimmed.split(".")[0];
    this.fileExtension = fileNameTrimmed.split(".").pop();
  }
}
