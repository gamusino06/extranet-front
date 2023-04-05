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
  selector: 'app-generate-preventive-planning-modal',
  templateUrl: './generate-preventive-planning-modal.component.html',
  styleUrls: ['./generate-preventive-planning-modal.component.css'],
  providers: [],
})

// const moment =  _moment;
export class GeneratePreventivePlanningModalComponent implements OnInit {
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<GeneratePreventivePlanningModalComponent>,
    private elem: ElementRef,
  ) { }

  ngOnInit() {
  }

  generatePDF() {
    this.dialogRef.close(false);
  }

  generatePDFwithAttached() {
    this.dialogRef.close(true);
  }

  close() {
    this.dialogRef.close(undefined);
  }
}
