import { Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {ErrorStateMatcher} from '@angular/material/core';
import {FormControl, FormGroupDirective, NgForm, Validators} from '@angular/forms';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'modalModifyBillsMail',
  templateUrl: 'modalModifyBillsMail.component.html',
})
export class ModalModifyBillsMail {

  constructor(
    public dialogRef: MatDialogRef<ModalModifyBillsMail>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.emailFormControl.setValue(data.emailFactura);
    }

  onNoClick(): void {
    this.dialogRef.close();
  }

  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  matcher = new MyErrorStateMatcher();

}