import {Component, Input, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-massive-document-error',
  templateUrl: './massive-document-error.component.html',
  styleUrls: ['./massive-document-error.component.css'],
  providers: [],
})
export class MassiveDocumentErrorComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<MassiveDocumentErrorComponent>) {
  }

  ngOnInit() {
  }

  cancel() {
    this.dialogRef.close(false);
  }

  accept() {
    this.dialogRef.close(true);
  }
}
