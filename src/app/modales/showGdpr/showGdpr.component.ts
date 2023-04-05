import { ElementRef, Inject, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-showGdpr',
  templateUrl: './showGdpr.component.html',
  styleUrls: ['./showGdpr.component.scss']
})


export class ShowGdprComponent implements OnInit {
  title  : string;
  showTitle = false;
  logoUrl = '../assets/logos/logo.png';
  isPanelOpened: boolean;
  shareDocumentGroup: FormGroup;

  @ViewChild('textoCompleto') textoCompleto: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<ShowGdprComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    if (this.data.element.version != undefined && this.data.element.origen === "0") {
      this.showTitle = true;
      this.title = 'Aceptación de Términos ' + '- Versión: ' + this.data.element.version;
    }
    let aux=document.getElementById('textoCompleto')
    aux.innerHTML=this.data.element.texto;
  }

  ngAfterViewInit(): void {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
