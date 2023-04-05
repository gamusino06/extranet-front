import { ElementRef, Inject, Input, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-acceptGdprDocument',
  templateUrl: './acceptGdprDocument.component.html',
  styleUrls: ['./acceptGdprDocument.component.scss']
})

export class AcceptGdprDocumentComponent implements OnInit {

  logoUrl = '../assets/logos/logo.png';
  isPanelOpened: boolean;

  cabeceraGdpr:string;
  contenidoGdpr:string;
  texto:string;

  @ViewChild('textoCompleto') textoCompleto: ElementRef;


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UserService,
    private modal: MatDialog,
    private router: Router,
  ) { }

  ngOnInit() {
    let mifechaRecuperada = this.data.fechaAceptacionGprs;
    let midato = this.data;
    this.texto=this.data.gdpr.texto;
    let aux=document.getElementById('textoCompleto')
    aux.innerHTML=this.texto;
  }

  disableAnimation = true;
  ngAfterViewInit(): void {
    setTimeout(() => this.disableAnimation = false);
  }


  accept() {
    localStorage.setItem('acceptModal', 'true');
    this.closeModal();
  }
  cancel() {
    localStorage.setItem('acceptModal', 'false');
    this.closeModal();
  }

  closeModal() {
    this.modal.closeAll();
  }

}
