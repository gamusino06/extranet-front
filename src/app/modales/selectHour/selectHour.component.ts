import { Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {ErrorStateMatcher} from '@angular/material/core';
import {FormControl, FormGroup, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import { UserService } from 'src/app/services/user.service';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'selectHour',
  templateUrl: 'selectHour.component.html',
})
export class SelectHour {

  policyText: any;
  constructor(
    public dialogRef: MatDialogRef<SelectHour>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UserService) {}

    ngOnInit(): void { 
      
  }

  onNoClick(): void {
    this.dialogRef.close(); 
  }

  selectHour(item) {    
    this.dialogRef.close(item);
  }
   

  matcher = new MyErrorStateMatcher();

}