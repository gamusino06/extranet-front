import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-error-login',
  templateUrl: './error-login.component.html',
  styleUrls: ['./error-login.component.scss']
})
export class ErrorLoginComponent implements OnInit {

  textoError;


  constructor(private modal: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    let textoErrorFormatted = this.data.error.replace(".", ".\n");
    this.textoError = textoErrorFormatted;
  }

  cerrarModal() {
    this.modal.closeAll();
  }

}
