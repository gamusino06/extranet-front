import { Component, EventEmitter, Input, Output } from "@angular/core";

import { FileUploaderFileChange } from "../../interfaces/file-uploader-file-chage.interface";

@Component({
  selector: "added-file-list",
  templateUrl: "./added-file-list.component.html",
  styleUrls: ["./added-file-list.component.scss"],
})
export class AddedFileListComponent {
  @Input() files: File[] = [];
  @Input() disabled: boolean;
  @Input() renameItems: boolean;
  @Input() multiple: boolean;
  @Input() showTitles: boolean;
  @Input() preview: boolean;
  @Input() fileNameListForPreview: string[];

  @Output() onFileChange: EventEmitter<FileUploaderFileChange> =
    new EventEmitter<FileUploaderFileChange>();
  @Output() onDelete: EventEmitter<FileUploaderFileChange> =
    new EventEmitter<FileUploaderFileChange>();
}
