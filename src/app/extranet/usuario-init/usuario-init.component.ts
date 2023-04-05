import { Idioma } from './../../Model/Idioma';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { TranslateService } from '@ngx-translate/core';
import { ChangeDetectorRef } from '@angular/core';
import { Globals } from '../globals';

@Component({
  selector: 'app-usuario-init',
  templateUrl: './usuario-init.component.html',
  styleUrls: ['./usuario-init.component.css']

})
export class UsuarioInitComponent implements OnInit {
  hide1: boolean = true;
  hide2: boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private spinner: NgxSpinnerService,
    private globals: Globals,
    public translate: TranslateService,
    private cdRef:ChangeDetectorRef
  ) {  }

  //Evita que se produzca el ERROR Error: ExpressionChangedAfterItHasBeenCheckedError
  ngAfterViewChecked()
  {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    //Para poder desplazar el listado de las areas, se va a verificar si el usuario tiene el área jurídico o no
    let user = JSON.parse(localStorage.getItem("userDataFromUsuario"));
    let areasUsuario = user.areas;
    let tieneAreaJuridico: boolean = false;
    areasUsuario.forEach(area => {
      if (area.idArea === this.globals.idAreaJuridico)
        tieneAreaJuridico = true;
    });

    if(tieneAreaJuridico){
    $(document).ready(function(){
          $('.mat-tab-list').css('transform', 'translateX(-28px)');
    });

    let transform = JSON.parse(localStorage.getItem('transformNecesario'));
    if(transform == true){
        $(document).ready(function(){
          $('.mat-tab-list').css('transform', 'translateX(-28px)');
        });
    }
      //Se verifica si sólo estamos en una pantalla de PC pequeña, en pantallas grandes no es necesario el desplazamiento
      //Dependiendo del tamaño, cuanto más tamaño hará falta un menos desplazamiento
      $(document).ready(function(){
        if (screen.width < 1530){
          $('.mat-tab-list').css('transform', 'translateX(-500px)');
        }else if (screen.width >= 1530 && screen.width < 1570){
             $('.mat-tab-list').css('transform', 'translateX(-240px)');
        }else if (screen.width >= 1570 && screen.width < 1600){
             $('.mat-tab-list').css('transform', 'translateX(-220px)');
        }else if (screen.width >= 1600 && screen.width < 1650){
             $('.mat-tab-list').css('transform', 'translateX(-190px)');
        }
      });

    }else{
      $(document).ready(function(){
            $('.mat-tab-list').css('transform', 'translateX(-28px)');
      });

      let transform = JSON.parse(localStorage.getItem('transformNecesario'));
      if(transform == true){
          $(document).ready(function(){
            $('.mat-tab-list').css('transform', 'translateX(-28px)');
          });
      }

      if(screen.width < 1530){
        $(document).ready(function(){
          $('.mat-tab-list').css('transform', 'translateX(-460px)');
        });
      }
    }


  }

  onSubmit(): void {

  }
}
