import { Component, OnInit, ViewChild } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Globals } from '../globals';
import { ChangeDetectorRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as _moment from 'moment';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MY_FORMATS } from '../../../config/config';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { TrabajadoresComponent } from 'src/app/modales/trabajadores/trabajadores.component';
import Swal from 'sweetalert2';
import {UserService} from '../../services/user.service';

@Component({
  selector: 'app-citacion-web-hora',
  templateUrl: './citacion-web-hora.component.html',
  styleUrls: ['./citacion-web-hora.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class CitacionWebHoraComponent implements OnInit {
  cleanImgUrl = '../../assets/img/borrar_filtros.svg';
  searchImgUrl = '../../assets/img/search.svg';
  excelImgUrl = '../../assets/img/excel.svg';
  mailImgUrl = '../../assets/img/mail.svg';
  downloadImgUrl = '../../assets/img/download.svg';

  motivosList: any[];
  horasList: any[];
  searchForm: FormGroup;
  citaForms = [];
  citaDto: any;
  dateSelectedName: any;
  workerData: any;
  bloqueadoUps:boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    public utils: UtilsService,
    public dialog: MatDialog,
    private userService: UserService,
    private globals: Globals,
    public translate: TranslateService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private cdRef:ChangeDetectorRef
  ) { }

  //Evita que se produzca el ERROR Error: ExpressionChangedAfterItHasBeenCheckedError
  ngAfterViewChecked()
  {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.bloqueadoUps = true;

    if (!this.utils.step2IsValid()) {
      this.router.navigate([this.globals.extranet_url + this.globals.extranet_citacion_web_calendario_url]);
    }
    // this.comprobarUpseling(this.utils.citaValues.idEmpresa);
    this.bloqueadoUps = this.utils.bloqueadoUpsCita;

    this.getHoras();
    //Traducimos el nombre del día para que se muestre en el HTML.
    let auxDate = new Date(this.utils.citaValues.fecha);
    this.dateSelectedName = auxDate.toLocaleString('es-ES', { weekday: 'long' });

    this.workerData = JSON.parse(localStorage.getItem('workerData'));
    localStorage.removeItem('workerData');
  }

  previous() {
    if(this.workerData !== null) { localStorage.setItem('workerData', JSON.stringify(this.workerData)); }
    this.router.navigate([this.globals.extranet_url + this.globals.extranet_citacion_web_calendario_url]);
  }

  getHoras() {
    /*mapeo de objeto JSON a enviar*/
    let data = {
      empresaDto: {
        idEmpresa: this.utils.citaValues.idEmpresa
      },
      centroMedico: {
        idCentroMedico: this.utils.citaValues.idCentroMedico
      },
      fecha: this.utils.citaValues.fecha
    }
    this.spinner.show();
    this.utils.getCitasDisponibles(data).subscribe(data => {
      this.horasList = data;

      //Se setea con la hora del S.O del cliente (UTC que indique el navegador/S.O)
      /*this.horasList.forEach(item => {
        debugger;
        let fecha = new Date(item.fecha);
        let minutos = fecha.getMinutes() == 0 ? "00" : fecha.getMinutes();
        let horaCita = fecha.getHours() + ":" + minutos;
        item.horaCita = horaCita;
      });*/
      this.spinner.hide();

    }, error => {
      this.spinner.hide();
      Swal.fire({
        icon: 'error',
        title: error.error.message,
        allowOutsideClick: false
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate([this.globals.extranet_url + this.globals.extranet_citacion_web_calendario_url]);
        }
      })
    })
  }

  next() {
    let select = false;
    let selectedHours = [];
    this.horasList.forEach(item => {
      if (item.active) {
        select = true;
        selectedHours.push(item);
      }
    });
    if (select) {
      let aux = {
        horaCita: selectedHours
      }
      this.utils.setFormValues(aux);
      if(this.workerData !== null) { localStorage.setItem('workerData', JSON.stringify(this.workerData)); }
      this.router.navigate([this.globals.extranet_url + this.globals.extranet_citacion_web_trabajador_url]);
    } else {
      let response_error = "Debe seleccionar al menos una hora para la cita";

      this.translate.get('ERROR_SELECCIONA_HORA').subscribe((res: string) => {
        response_error = res;
      });
      this.utils.mostrarMensajeSwalFire('error', response_error, '', 'var(--blue)', false);
    }
  }

  selectHora(element) {
    if(element.active){
      element.active = false;
    } else {
      element.active = true;
    }
  }

  ordenarListaCitas(listaAOrdenarHoras) {

  }

  removeAccents(value: string) {
    return value.toLocaleLowerCase()
      .replace(/á/g, 'a')
      .replace(/é/g, 'e')
      .replace(/í/g, 'i')
      .replace(/ó/g, 'o')
      .replace(/ú/g, 'u')
      .toLocaleUpperCase();
  }

  comprobarUpseling(empresa){
    this.userService.comprobarAbsentismo(empresa)
      .subscribe(data => {
        this.bloqueadoUps = data;
      }, error => {
        this.utils.mostrarMensajeSwalFire('error', 'Ha ocurrido un error al comprobar la petición', '', 'var(--blue)', false);
        this.bloqueadoUps = false;
      });
  }
}
