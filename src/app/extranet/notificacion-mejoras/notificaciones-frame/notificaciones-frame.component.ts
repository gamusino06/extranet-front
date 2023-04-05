import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {NgxSpinnerService} from 'ngx-spinner';

@Component({
  selector: 'app-notificaciones-frame',
  templateUrl: './notificaciones-frame.component.html',
  styleUrls: ['./notificaciones-frame.component.scss']
})
export class NotificacionesFrameComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<NotificacionesFrameComponent>,
    private spinner: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {

  }

  cerrar(){
    this.dialogRef.close();
  }

  desbloquear(){
    this.spinner.hide();
  }

}
