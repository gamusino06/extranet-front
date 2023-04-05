import { Component, OnInit, Inject, Input } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from "@angular/material/core";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { MY_FORMATS } from "src/config/config";
import { HttpClient } from "@angular/common/http";
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
} from "@angular/material/tree";
import { FlatTreeControl } from "@angular/cdk/tree";
import { NgxSpinnerService } from "ngx-spinner";
import { PreventiveMeasureScheduleService } from "src/app/services/preventive-measure-schedule.service";

@Component({
  selector: "app-preventive-measure-excel-error-modal",
  templateUrl: "./preventive-measure-excel-error-modal.component.html",
  styleUrls: ["./preventive-measure-excel-error-modal.component.scss"],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class PreventiveMeasureExcelErrorModalComponent implements OnInit {
  displayedColumns: string[] = ["button", "row", "campo", "errorDescription"];

  private transformer = (node: ErrorNode, level: number) => {
    return {
      expandable: !!node.errors && node.errors.length > 0,
      level: level,
      row: node.row,
      column: node.column,
      campo: node.campo,
      errorDescription: node.errorDescription,
      numErrors: node.errors ? node.errors.length : 0,
    };
  };
  treeControl = new FlatTreeControl<ExampleFlatNode>(
    (node) => node.level,
    (node) => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this.transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.errors
  );
  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  numErrors = 0;
  @Input() title: string;

  constructor(
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    public translate: TranslateService,
    private http: HttpClient,
    private spinner: NgxSpinnerService,
    private preventiveMeasureScheduleService: PreventiveMeasureScheduleService,

    public dialogRef: MatDialogRef<PreventiveMeasureExcelErrorModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ErrorNode[]
  ) {
    this.dataSource.data = data;
  }

  ngOnInit(): void {
    this.numErrors = this.getTotalErrors();
  }

  cancel() {
    this.dialogRef.close();
  }

  accept() {
    this.dialogRef.close();
  }

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

  getTotalErrors() {
    let total = 0;
    this.data.forEach((error) => {
      if (error.errors && error.errors.length > 0) {
        total += error.errors.length;
      } else {
        total++;
      }
    });
    console.log(total);
    return total;
  }

  downloadLog() {
    this.spinner.show();

    this.preventiveMeasureScheduleService.downloadLog(this.data).subscribe(
      (excelBlob) => {
        const link = document.createElement("a");

        link.href = window.URL.createObjectURL(excelBlob);
        link.download = "errorLog.xlsx";
        document.body.appendChild(link);
        link.click();

        setTimeout(function () {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(window.URL.createObjectURL(excelBlob));
        }, 1000);

        this.spinner.hide();
      },
      (error) => {
        console.log(error);
        this.spinner.hide();
      }
    );
  }
}

export interface ErrorNode {
  row: number;
  column?: number;
  campo?: string;
  errorDescription?: string;
  errors?: ErrorNode[];
  numErrors?: number;
}

interface ExampleFlatNode {
  expandable: boolean;
  row: number;
  column: number;
  campo?: string;
  errorDescription?: string;
  level: number;
}
