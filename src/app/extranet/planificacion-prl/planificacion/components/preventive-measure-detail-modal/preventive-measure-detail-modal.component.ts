import { Component, OnInit, Inject, Input } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-preventive-measure-detail-modal",
  templateUrl: "./preventive-measure-detail-modal.component.html",
  styleUrls: ["./preventive-measure-detail-modal.component.scss"],
})
export class PreventiveMeasureDetailModalComponent implements OnInit {
  preventiveMeasure: any;
  constructor(
    public dialog: MatDialog,
    public translate: TranslateService,

    public dialogRef: MatDialogRef<PreventiveMeasureDetailModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.preventiveMeasure = this.data.preventiveMeasure;
  }

  close() {
    this.dialogRef.close();
  }
}
