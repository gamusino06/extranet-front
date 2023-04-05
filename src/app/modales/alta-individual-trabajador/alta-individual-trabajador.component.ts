import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-alta-individual-trabajador',
  templateUrl: './alta-individual-trabajador.component.html',
  styleUrls: ['./alta-individual-trabajador.component.css']
})
export class AltaIndividualTrabajadorComponent implements OnInit {

  trabajador: any;
  confirmacion: boolean;

  constructor(public dialogRef: MatDialogRef<AltaIndividualTrabajadorComponent>,
              @Inject(MAT_DIALOG_DATA) public dialogData: any) { }

  ngOnInit(): void {
  }

  onAccept() {
    this.dialogRef.close();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
