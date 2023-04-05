import {Component, ElementRef, HostListener, Input, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  // Validators,
} from "@angular/forms";
// import * as _moment from 'moment';

@Component({
  selector: 'app-export-to-excel-modal',
  templateUrl: './export-to-excel-modal.component.html',
  styleUrls: ['./export-to-excel-modal.component.css'],
  providers: [],
})
  
// const moment =  _moment;
export class ExportToExcelModalComponent implements OnInit {
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<ExportToExcelModalComponent>,
    private elem: ElementRef,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.initForm()
  }

  
  initForm() {
    this.form = this.formBuilder.group({
      minDate: new FormControl(null, []),
      maxDate: new FormControl(null, [])
    });
  }

  cancel() {
    this.dialogRef.close(false);
  }

  accept() {
    let auxMaxDate = new Date(this.form.get('maxDate').value);
    // not selected Date
    if (auxMaxDate.getTime() != 0) { 
      auxMaxDate.setHours(23, 59, 59, 999);
    }
    const payload = {
      minDate: new Date(this.form.get('minDate').value).getTime(),
      maxDate: auxMaxDate.getTime()
    }
    this.dialogRef.close(payload);
  }
}
