import { ElementRef, Inject, Input, ViewChild } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { Globals } from '../../extranet/globals';

@Component({
  selector: 'app-acceptGdpr',
  templateUrl: './acceptGdpr.component.html',
  styleUrls: ['./acceptGdpr.component.scss']
})

export class AcceptGdprComponent implements OnInit {
  environment = environment;
  logoUrl = '../assets/logos/logo.png';
  isPanelOpened: boolean;

  cabeceraGdpr: string;
  contenidoGdpr: string;
  texto: string;
  isLoginSimulado: boolean = false;

  @ViewChild('textoCompleto') textoCompleto: ElementRef;


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UserService,
    private modal: MatDialog,
    private router: Router,
    public globals: Globals
  ) { }

  ngOnInit() {
    //En el caso de que se esté realizando un loginSimulado, no tendrá que guardarse la aceptación de terminos del usuario
    let loginSimulado = localStorage.getItem("loginSimulado");
    if (loginSimulado !== null && loginSimulado === "true")
      this.isLoginSimulado = true;

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
    this.data.fechaAceptacionGdpr = new Date();
    this.data.loginSimuladoActivado = this.isLoginSimulado;
    this.userService.setFechaAprobacionGdpr(this.data).subscribe(data => {
      if(data){
      	this.closeModal();
        localStorage.setItem('userData', this.data.user);
        this.router.navigate([this.globals.extranet]);
      }
    }), (error => {
      if (environment.debug) console.log("Error en la aceptacion de modales");
    });
  }

  cancel() {
    this.closeModal();
  }

  closeModal() {
    this.modal.closeAll();
  }

}
