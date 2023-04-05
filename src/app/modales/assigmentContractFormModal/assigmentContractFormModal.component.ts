import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

@Component({
  selector: 'app-assigment-contract-form-modal',
  templateUrl: './assigmentContractFormModal.component.html',
  styleUrls: ['./assigmentContractFormModal.component.scss']
})

export class AssigmentContractFormModalComponent implements OnInit {
  urlSafe: SafeResourceUrl;

  constructor(
    public dialogRef: MatDialogRef<AssigmentContractFormModalComponent>,
    private sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit(): void {
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.data.url);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }


  cancel() {
    this.dialogRef.close();
  }


}
