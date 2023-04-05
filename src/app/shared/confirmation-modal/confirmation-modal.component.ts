import { Component, OnInit, Inject, Input } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-confirmation-modal",
  templateUrl: "./confirmation-modal.component.html",
  styleUrls: ["./confirmation-modal.component.scss"],
})
export class ConfirmationMessageModalComponent {
  @Input() title: string;
  constructor(
    public dialogRef: MatDialogRef<ConfirmationMessageModalComponent>,
    public translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: { message: string }
  ) {}

  cancel() {
    this.dialogRef.close();
  }

  accept() {
    try {
      this.dialogRef.close(true);
    } catch (e) {
      console.error(e);
    }
  }
}
