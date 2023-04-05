import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { UserService } from 'src/app/services/user.service';
import { TranslateService } from '@ngx-translate/core';
import { Globals } from '../../extranet/globals';

@Component({
  selector: 'app-tusProfesionales',
  templateUrl: './tusProfesionales.component.html',
  styleUrls: ['./tusProfesionales.component.scss']
})
export class TusProfesionalesComponent implements OnInit {

  @Input() user: any;
  tokenRecibido: string;
  empresasList: any;
  misProfesionales: any;
  incluirTecnico:boolean = false;
  incluirComercial:boolean = false;
  incluirResponsableGC:boolean = false;
  incluirGestor:boolean = false;
  incluirMedico:boolean = false;

  imgIcono=  '../../assets/img/account_circle-white-48dp.svg';
  /*imgMujer1= '../../assets/img/imgEjemWP/mujer1.jpg';
  imgMujer2= '../../assets/img/imgEjemWP/mujer2.jpg';
  imgHombre1= '../../assets/img/imgEjemWP/hombre1.jpg';
  imgHombre2= '../../assets/img/imgEjemWP/hombre2.jpg';*/

  constructor(
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private spinner: NgxSpinnerService,
    public globals: Globals,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.getUserInfo();
    this.user = JSON.parse(localStorage.getItem('userWP'));
    this.misProfesionales = this.user.areas[3].secciones;
    let flag: boolean = false;

    //Recorremos las secciones para ver que Contactos tenemos que mostrar.
    //Añadimos a la lista de contactos solo aquellos contactos que pertenecen a las secciones que puede ver.
    this.misProfesionales.forEach(seccion => {
        switch (seccion.idSeccion)
        {
           case this.globals.idSeccionProfTecnico: //SECCION TECNICO
              this.incluirTecnico = true;
              break;
           case this.globals.idSeccionProfComercial: //SECCION COMERCIAL
              this.incluirComercial = true;
              break;
           case this.globals.idSeccionProfResponsableGC: //SECCION RESPONSABLE GC
              this.incluirResponsableGC = true;
              break;
           case this.globals.idSeccionProfGestor: //SECCION GESTOR
              this.incluirGestor = true;
              break;
           case this.globals.idSeccionProfMedico: //SECCION MEDICO (Vigilancia de la Salud)
              this.incluirMedico = true;
              break;
        }
    });

    this.empresasList = this.user.empresas;
  }

  getUserInfo() {
    this.spinner.show();
    this.activatedRoute.params.subscribe(params => {
      this.spinner.hide();
      if (location.search.indexOf('=') != -1) {
        this.tokenRecibido = location.search.substring(location.search.indexOf('=') + 1);
      } else {
        this.user = JSON.parse(localStorage.getItem('userWP'));
      }
    });
  }

}
