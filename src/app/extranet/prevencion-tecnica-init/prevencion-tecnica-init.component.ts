import { Idioma } from './../../Model/Idioma';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { TranslateService } from '@ngx-translate/core';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-prevencion-tecnica-init',
  templateUrl: './prevencion-tecnica-init.component.html',
  styleUrls: ['./prevencion-tecnica-init.component.css']

})
export class PrevencionTecnicaInitComponent implements OnInit {
  hide1: boolean = true;
  hide2: boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private spinner: NgxSpinnerService,
    public translate: TranslateService,
    private cdRef:ChangeDetectorRef
  ) { }

  //Evita que se produzca el ERROR Error: ExpressionChangedAfterItHasBeenCheckedError
  ngAfterViewChecked()
  {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
      //transformNecesario es el item que nos dices si ha llegado a través
      //de la barra de favoritos, si es true entonces hacemos el translateX
      let transform = JSON.parse(localStorage.getItem('transformNecesario'));
      if(transform == true){
          $(document).ready(function(){
            $('.mat-tab-list').css('transform', 'translateX(0px)');
          });
      }

      //en caso de que sea una pantalla pequeña
      if(screen.width < 1530){
        $(document).ready(function(){
          $('.mat-tab-list').css('transform', 'translateX(0px)');
        });
      }
  }

  onSubmit(): void {

  }
}
