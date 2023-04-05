import { formatDate } from "@angular/common";
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { UtilsService } from "src/app/services/utils.service";
import {
  UploaderWithParamsTableConfig,
  UploaderWithParamsTableField,
} from "../../../interfaces/file-uploader-with-params.interface";

@Component({
  selector: "app-parametrized-files-table",
  templateUrl: "./parametrized-files-table.component.html",
  styleUrls: ["./parametrized-files-table.component.scss"],
})
export class ParametrizedFilesTableComponent implements OnInit, OnChanges {
  @Input() tableConfig: UploaderWithParamsTableConfig;
  @Input() dataSource: any[] = [];

  @Output() onEditClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() onDeleteClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() onDownloadClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() onPreviewClick: EventEmitter<any> = new EventEmitter<any>();

  _dataSource: MatTableDataSource<any>;
  _displayedColumns: string[] = [];
  _fields: UploaderWithParamsTableField[] = [];
  _selectedRows: any[] = [];

  _noDataImgUrl =
    "../../../../../assets/img/file-uploader-without-documents.svg";

  constructor(public utils: UtilsService) {}

  ngOnInit() {
    this._dataSource = new MatTableDataSource(this.dataSource);

    this._fields = this.tableConfig.fields;

    // Add the fields label to the displayed columns
    this._fields.forEach((field) => {
      this._displayedColumns.push(field.label);
    });

    // If there are actions, add them to the displayed columns
    if (
      this.tableConfig.actions &&
      Object.values(this.tableConfig.actions).some((value) => value)
    ) {
      this._displayedColumns.push("actions");
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.dataSource) {
      this._dataSource = new MatTableDataSource(
        changes.dataSource.currentValue
      );
    }
  }

  canPreviewFile(element) {
    return element?.fileExtension === "pdf";
  }

  getElement(element, field) {
    let e = field.property
      ? element[field.name][field.property]
      : element[field.name];
    return e;
  }
}
