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

@Component({
  selector: "app-goal-detail-modal",
  templateUrl: "./goal-detail-modal.component.html",
  styleUrls: ["./goal-detail-modal.component.scss"],
})
export class GoalDetailModalComponent implements OnInit {
  goal: any;
  constructor(
    public dialog: MatDialog,
    public translate: TranslateService,

    public dialogRef: MatDialogRef<GoalDetailModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.goal = this.data.goal;
  }

  close() {
    this.dialogRef.close();
  }
}
