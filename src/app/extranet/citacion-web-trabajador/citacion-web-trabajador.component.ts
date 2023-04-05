import { Component, OnInit, ViewChild } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Globals } from '../globals';
import { NgxSpinnerService } from 'ngx-spinner';

import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as _moment from 'moment';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MY_FORMATS } from '../../../config/config';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { TrabajadoresComponent } from 'src/app/modales/trabajadores/trabajadores.component';
import Swal from 'sweetalert2';
import { ChangeDetectorRef } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import {UserService} from '../../services/user.service'; // Para media querys en TS

@Component({
  selector: 'app-citacion-web-trabajador',
  templateUrl: './citacion-web-trabajador.component.html',
  styleUrls: ['./citacion-web-trabajador.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class CitacionWebTrabajadorComponent implements OnInit {
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
    private breakpointObserver: BreakpointObserver,
    private cdRef:ChangeDetectorRef
  ) { }

  //Evita que se produzca el ERROR Error: ExpressionChangedAfterItHasBeenCheckedError
  ngAfterViewChecked()
  {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    if (!this.utils.step2IsValid()) {
      this.router.navigate([this.globals.extranet_url + this.globals.extranet_citacion_web_calendario_url]);
    }

    // this.comprobarUpseling(this.utils.citaValues.idEmpresa);
    this.bloqueadoUps = this.utils.bloqueadoUpsCita;

    this.getMotivos();
    this.getHoras();
    //Traducimos el nombre del día para que se muestre en el HTML.
    let auxDate = new Date(this.utils.citaValues.fecha);
    this.dateSelectedName = auxDate.toLocaleString('es-ES', { weekday: 'long' });
    this.workerData = JSON.parse(localStorage.getItem('workerData'));
    localStorage.removeItem('workerData');
    if(this.workerData !== null){
      this.citaForms.map(x => {
        x.fields.controls["idTrabajador"].setValue(this.workerData.idTrabajador);
        x.fields.controls["trabajador"].setValue(this.workerData.nombreTrabajador);
        x.fields.controls["idEmpresa"].setValue(this.workerData.idEmpresa);
      });
    }
  }

  save() {
    const data = [];
    let citasDtos = [];
    let titulo = "Se ha producido una incidencia";
    this.translate.get('INCIDENCIA_GUARDAR_CITA').subscribe((res: string) => {
      titulo = res;
    });
    let bGuardar = true;
    if (this.citaForms == null || this.citaForms.length == 0) {
      titulo = "Debe añadir citas";
      this.translate.get('ERROR_SIN_CITAS').subscribe((res: string) => {
        titulo = res;
      });
      bGuardar = false;
      this.utils.mostrarMensajeSwalFire('error', titulo, '', 'var(--blue)', false);
    }
    this.citaForms.forEach(element => {
      const rawValue = element.fields.getRawValue();
      if (rawValue.trabajador !== '' && rawValue.fechaForm !== '' && rawValue.motivoForm != '') {
        this.citaDto = {
          trabajador: { idTrabajador: rawValue.idTrabajador, nombre: rawValue.trabajador},
          fecha: rawValue.fechaForm,
          horaCita: rawValue.horaDisplay,
          motivoCita: { idMotivoCita: rawValue.motivoForm },
          centroMedico: { idCentroMedico: this.utils.citaValues.idCentroMedico },
          empresaDto: { idEmpresa: this.utils.citaValues.idEmpresa }
        }
        citasDtos.push(this.citaDto);
      } else {
        if (rawValue.fechaForm === '') {
          titulo = "Debe seleccionar una hora";
          this.translate.get('DEBE_SELECCIONAR_UNA_HORA').subscribe((res: string) => {
            titulo = res;
          });
        }
        else if (rawValue.motivoForm === '') {
          titulo = "Debe seleccionar un motivo de cita";
          this.translate.get('DEBE_SELECCIONAR_UN_MOTIVO').subscribe((res: string) => {
            titulo = res;
          });
        }
        else if (rawValue.trabajador === '') {
          titulo = "Debe seleccionar un trabajador";
          this.translate.get('DEBE_SELECCIONAR_UN_TRABAJADOR').subscribe((res: string) => {
            titulo = res;
          });
        }
        bGuardar = false;
        this.utils.mostrarMensajeSwalFire('error', titulo+ " '"+rawValue.horaDisplay+"'", '', 'var(--blue)', false);
      }
    });

    if (bGuardar){
      this.spinner.show();
      this.utils.guardarCita(citasDtos).subscribe(citasConErrores => {
        this.spinner.hide();
        if (citasConErrores.length == 0) {
          let titulo;
          if (citasDtos.length > 1) {
            titulo = "Citas agendadas correctamente";
            this.translate.get('CITAS_AGENDADAS_CORRECTAMENTE').subscribe((res: string) => {
              titulo = res;
            });
          } else {
            titulo = "Cita agendada correctamente";
            this.translate.get('CITA_AGENDADA_CORRECTAMENTE').subscribe((res: string) => {
              titulo = res;
            });
          }

          this.utils.mostrarMensajeSwalFire('success', titulo, '', 'var(--blue)', false);
          this.router.navigate([this.globals.extranet_url + this.globals.extranet_citacion_web_provincia_url]);
        } else {
          //Se envia de vuelta a la elección de la hora para que vuelva a elegir la cita y otro trabajador
          this.previous();

          //Recorremos las citas que han dado error para comprobar que tipo de error fue y tratarla adecuadamente
          let listaPosicionesABorrar = [];
          citasConErrores.forEach(citaErronea => {
            this.comprobacionErrorYLiberacionDeCita(citaErronea);

            //Ahora se comprueba las citas que han ido correctamente para borrarlas de 'this.citaForms' aprovechando el array 'citasDtos'
            //Las que han dado error, se eliminan del array 'citasDtos'
            for (var i = 0; i < this.citaForms.length; i++) {
              if (this.citaForms[i].fields.value.horaDisplay === citaErronea.horaCita) {
                //Borramos la cita erronea
                listaPosicionesABorrar.push(i);
                this.citaForms.splice(i, 1);
                i--;
              }
            }
          });

          //Las citas que queden en 'this.citaForms' son las que se han guardado correctamente y se tienen que borrar
          for (var i = 0; i < this.citaForms.length; i++) {
            //Se comprueba que si en la lista de posiciones, está contenida la posición a borrar
            if (listaPosicionesABorrar.includes(i)) {
              this.citaForms.splice(i, 1);
            }
          }

          let htmlHorario = "Horario";
          this.translate.get('HORARIO').subscribe((res: string) => {
            htmlHorario = res;
          });
          let htmlMotivo = "Motivo";
          this.translate.get('MOTIVO').subscribe((res: string) => {
            htmlMotivo = res;
          });
          let htmlTrabajador = "Persona Trabajadora"
          this.translate.get('TRABAJADOR').subscribe((res: string) => {
            htmlTrabajador = res;
          });
          let htmlResultado = "Resultado"
          this.translate.get('RESULTADO').subscribe((res: string) => {
            htmlResultado = res;
          });
          let resultadoCitaReservada = "Cita reservada"
          this.translate.get('CITA_RESERVADA').subscribe((res: string) => {
            resultadoCitaReservada = res;
          });

          //Se empieza a crear la tabla de cita con errores
          let tablaCitasError =   '<div class="row" style="text-align:center;">' +
                                      '<div class="detail-content col">' +
                                          '<table style="width:100%;"> '+
                                          '<tr"> '+
                                            '<th class="mat-header-cell" style="text-align: center;">'+ htmlHorario + '</th> '+
                                            '<th class="mat-header-cell" style="text-align: center;">' + htmlMotivo + '</th> '+
                                            '<th class="mat-header-cell" style="text-align: center;">' + htmlTrabajador + '</th> '+
                                            '<th class="mat-header-cell" style="text-align: center;">' + htmlResultado + '</th> '+
                                          '</tr> ';


          //Se va a recorrer las citas mandadas a Back junto con dicha respuesta y analizar para imprimir los errores correspondientes
          citasDtos.forEach(cita => {
            //Para el caso de que la cita de ese trabajador no haya dado error
            let resultadoCita = resultadoCitaReservada;
            //Se consigue el nombre del motivo cita
            let nombreMotivoCita = this.motivosList.find(motivo => motivo.idMotivoCita == cita.motivoCita.idMotivoCita)?.nombre;

            //Se comprueba si la cita ha dado error comparandolo con el array devuelto desde Back 'citasConErrores'
            if (citasConErrores.length > 0){
                let errorId = undefined;
                //Si encuentra al trabajador en las citas con errores, consigue el id del error sino devuelve undefined
                errorId = citasConErrores.find(citaError => citaError.trabajador.idTrabajador == cita.trabajador.idTrabajador)?.codigoErrorCita;
                if (errorId !== undefined){
                  let motivoErrorCita = this.comprobacionErrorCitacion(errorId);
                  if(motivoErrorCita != undefined){
                    //Se ha encontrado el error. Si no se hubiese encontrado, se mostrará, 'Cita reservada', declarada al inicio del método
                    resultadoCita = motivoErrorCita
                  }
                }else{ //errorId = undefined  es que no se ha encontrado dicha cita como erronea
                  //Se borra la cita que no ha dado error y no se libera la cita
                  this.deleteCita(cita, false);
                }
            }

            tablaCitasError +=  '<tr class="mat-row"> ' +
                                    '<td class="mat-cell">' + cita.horaCita + '</td>' +
                                    '<td class="mat-cell">' + nombreMotivoCita + '</td> '+
                                    '<td class="mat-cell">' + cita.trabajador.nombre + '</td> '+
                                    '<td class="mat-cell">' + resultadoCita + '</td> '+
                                '</tr> ';
          });
          tablaCitasError += '</table> </div> </div>'; //Finalizamos la tabla en HTML y ambos div

          //Mostramos el Swal con la tabla con las citas con errores y las que han ido correctamente
          Swal.fire({
            width: 1000,
            icon: 'warning',
            title: titulo,
            html: tablaCitasError,
            confirmButtonColor: 'var(--blue)',
            allowOutsideClick: false
          })
        }
      });
    }
  }

  onSubmit(): void {

  }

  selectTrabajador(form) {
    //NOTA IMPORTANTE: Fix CdkDrop Para permitir mover(CDKDrop) las columnas en la modal de trabajadores,
    //debe estar el scroll de la pantalla principal en la posición más TOP de la pantalla...
    const doc = document.documentElement;
    const left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
    const top = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);

    if (top != 0 || left != 0) {
      window.scrollTo({ top : 0, left: 0 });
    }
    //FIN FIX cdkDrop

    const isSmallScreen = this.breakpointObserver.isMatched('(max-width: 550px)');
    var selectedTrabajadores = [];
    for (var i = 0; i < this.citaForms.length; i++) {
      selectedTrabajadores.push(this.citaForms[i].fields.controls["idTrabajador"].value);
    }
    let seleccionado = false;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = selectedTrabajadores;
    if (isSmallScreen){
      dialogConfig.width = "80%";
    }else {
      dialogConfig.width = "50%";
    }
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;
    const dialogRef = this.dialog.open(TrabajadoresComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(trabajadorElement => {

      //NOTA IMPORTANTE: Fix CdkDrop
      if (top != 0 || left != 0)
          window.scroll({ top : top, left : left, behavior: "smooth" });
      //FIN Fix CdkDrop

      if (trabajadorElement){
        seleccionado = this.isSeleccionado(trabajadorElement.idTrabajador);
        if (seleccionado === false) {
          form.fields.controls["idTrabajador"].setValue(trabajadorElement.idTrabajador);
          form.fields.controls["idEmpresa"].setValue(trabajadorElement.empresa.idEmpresa);
          form.fields.controls["trabajador"].setValue(trabajadorElement.nombreApellidos);
        } else {
          let response_error = "El trabajador ya fue seleccionado";
          this.translate.get('TRABAJADOR_SELECCIONADO').subscribe((res: string) => {
            response_error = res;
          });
          this.utils.mostrarMensajeSwalFire('error', response_error, '', 'var(--blue)', false);
        }
      }
    });
  }

  isSeleccionado(idTrabajadorSeleccionado) {
    let seleccionado = false;
    this.citaForms.forEach(element => {
      if (element.fields.controls["idTrabajador"].value === idTrabajadorSeleccionado) {
        seleccionado = true;
      }
    });
    return seleccionado;
  }

  previous() {
    if(this.workerData !== null) { localStorage.setItem('workerData', JSON.stringify(this.workerData)); }
    this.router.navigate([this.globals.extranet_url + this.globals.extranet_citacion_web_hora_url]);
  }

  getMotivos() {
    /*mapeo de objeto JSON a enviar*/
    this.utils.getMotivosCita().subscribe(data => {
        this.motivosList = data;
    })
  }

  getHoras() {
    this.horasList = [];
    this.horasList = this.utils.citaValues.horaCita;
    this.horasList.forEach(item =>{
      this.addNew(item);
    });
  }

  addNew(item) {
      this.citaForms.push({
        fields: new FormGroup({
          motivoForm: new FormControl(''),
          fechaForm: new FormControl(item.fecha),
          //horaDisplay: new FormControl((new Date(item.fecha)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
          horaDisplay: new FormControl(item.horaCita),
          trabajador: new FormControl(''),
          idEmpresa: new FormControl(''),
          idTrabajador: new FormControl(''),
        })
      });
  }

  deleteForm(index) {
    let data = {
      idCita: 0,
      fecha: this.citaForms[index].fields.value.fechaForm,
      horaCita: this.citaForms[index].fields.value.horaDisplay,
      asistido: false,
      anulada: false,
      puedeAnular: false
    }
    this.horasList.push(data);
    this.citaForms.splice(index, 1);
    if(this.workerData !== null) { localStorage.setItem('workerData', JSON.stringify(this.workerData)); }
    this.horasList = this.utils.ordenarListaCitas(this.horasList); //Ordenamos la lista de citas (horasList)
    if (this.citaForms.length==0) this.previous();
  }

  deleteCita(cita, esCitaLiberada) {
    if (esCitaLiberada) {
      let data = {
        idCita: 0,
        fecha: cita.fecha,
        horaCita: cita.horaCita,
        asistido: false,
        anulada: false,
        puedeAnular: false
      }
      this.horasList.push(data);
    }
    //Tanto se libere o no dicha cita, eliminamos de this.citaForms
    for (var i = 0; i < this.citaForms.length; i++) {
      if (this.citaForms[i].fields.value.horaDisplay === cita.horaCita) {
        this.citaForms.splice(i, 1);
        i--;
      }
    }
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

  //Se comprueba el error para proceder a borrar o no la cita de la pantalla
  comprobacionErrorYLiberacionDeCita(citaErronea){

    /*if (this.globals.extranet_citacion_web_trabajador_error_1 === citaErronea.codigoErrorCita) {
      //Como la cita ya fue ocupada por otro trabajador distinto, se elimina de la pantalla y NO se libera.
      this.deleteCita(citaErronea, false);
    } else if (this.globals.extranet_citacion_web_trabajador_error_2 === citaErronea.codigoErrorCita) {
      //Como la cita no puede ser ocupada por un trabajador que ya tiene una cita, se libera dicha cita.
      this.deleteCita(citaErronea, true);
    }*/
    switch (citaErronea.codigoErrorCita){
        case this.globals.extranet_citacion_web_trabajador_errorConCodigo8101:
           //Como la cita ya fue ocupada por otro trabajador distinto, se elimina de la pantalla y NO se libera.
        case this.globals.extranet_citacion_web_trabajador_errorConCodigo8104:
           //La cita no existe, se elimina de la pantalla y NO se libera.
           this.deleteCita(citaErronea, false);
           break;


        case this.globals.extranet_citacion_web_trabajador_errorConCodigo8100:
           //Trabajador sin relación laboral, se LIBERA dicha cita.
        case this.globals.extranet_citacion_web_trabajador_errorConCodigo8108:
           //El trabajador ya tiene una cita futura existente, se LIBERA dicha cita.
        case this.globals.extranet_citacion_web_trabajador_errorConCodigo8109:
           //El trabajador ha llegado al límite de de citas por periodo contrato, se LIBERA dicha cita.
           this.deleteCita(citaErronea, true);
           break;
    }
  }

  //Método que comprueba el error y devuelve su traducción
  comprobacionErrorCitacion(errorId){
    let motivoErrorCita = undefined;
    switch (errorId){
       case this.globals.extranet_citacion_web_trabajador_errorConCodigo8100:
           motivoErrorCita = "Trabajador sin relación laboral.";
           this.translate.get('ERROR_PETICION_GUARDAR_CODIGOERROR_8100').subscribe((res: string) => {
             motivoErrorCita = res;
           });
           break;
       case this.globals.extranet_citacion_web_trabajador_errorConCodigo8101:
           motivoErrorCita = "El hueco ya no está disponible.";
           this.translate.get('ERROR_PETICION_GUARDAR_CODIGOERROR_8101').subscribe((res: string) => {
             motivoErrorCita = res;
           });
           break;
       case this.globals.extranet_citacion_web_trabajador_errorConCodigo8102:
           motivoErrorCita = "No se encuentra la ruta del proveedor para crear la cita.";
           this.translate.get('ERROR_PETICION_GUARDAR_CODIGOERROR_8102').subscribe((res: string) => {
             motivoErrorCita = res;
           });
           break;
       case this.globals.extranet_citacion_web_trabajador_errorConCodigo8103:
           motivoErrorCita = "El cliente tiene la cita web desactivada.";
           this.translate.get('ERROR_PETICION_GUARDAR_CODIGOERROR_8103').subscribe((res: string) => {
             motivoErrorCita = res;
           });
           break;
       case this.globals.extranet_citacion_web_trabajador_errorConCodigo8104:
           motivoErrorCita = "La cita no existe.";
           this.translate.get('ERROR_PETICION_GUARDAR_CODIGOERROR_8104').subscribe((res: string) => {
             motivoErrorCita = res;
           });
           break;
       case this.globals.extranet_citacion_web_trabajador_errorConCodigo8105:
           motivoErrorCita = "Error al anular la cita.";
           this.translate.get('ERROR_PETICION_GUARDAR_CODIGOERROR_8105').subscribe((res: string) => {
             motivoErrorCita = res;
           });
           break;
       case this.globals.extranet_citacion_web_trabajador_errorConCodigo8106:
           motivoErrorCita = "El proveedor seleccionado no tiene calendario de cita web.";
           this.translate.get('ERROR_PETICION_GUARDAR_CODIGOERROR_8106').subscribe((res: string) => {
             motivoErrorCita = res;
           });
           break;
       case this.globals.extranet_citacion_web_trabajador_errorConCodigo8107:
           motivoErrorCita = "El cliente/grupo seleccionado no tiene calendario de cita web.";
           this.translate.get('ERROR_PETICION_GUARDAR_CODIGOERROR_8107').subscribe((res: string) => {
             motivoErrorCita = res;
           });
           break;
       case this.globals.extranet_citacion_web_trabajador_errorConCodigo8108:
           motivoErrorCita = "El trabajador ya tiene una cita futura existente.";
           this.translate.get('ERROR_PETICION_GUARDAR_CODIGOERROR_8108').subscribe((res: string) => {
             motivoErrorCita = res;
           });
           break;
       case this.globals.extranet_citacion_web_trabajador_errorConCodigo8109:
           motivoErrorCita = "El trabajador ya ha llegado al límite de citas por periodo de contrato.";
           this.translate.get('ERROR_PETICION_GUARDAR_CODIGOERROR_8109').subscribe((res: string) => {
             motivoErrorCita = res;
           });
           break;
       case this.globals.extranet_citacion_web_trabajador_errorConCodigo8110:
           motivoErrorCita = "La cita no se puede anular. El tiempo restante hasta la cita es menor al límite posible de anulación.";
           this.translate.get('ERROR_PETICION_GUARDAR_CODIGOERROR_8110').subscribe((res: string) => {
             motivoErrorCita = res;
           });
           break;
       case this.globals.extranet_citacion_web_trabajador_errorConCodigo8111:
           motivoErrorCita = "Solo se pueden reservar citas a partir de mañana en adelante.";
           this.translate.get('ERROR_PETICION_GUARDAR_CODIGOERROR_8111').subscribe((res: string) => {
             motivoErrorCita = res;
           });
           break;
       case this.globals.extranet_citacion_web_trabajador_errorConCodigo8112:
           motivoErrorCita = "No existe periodo para el cliente en la fecha de la cita deseada.";
           this.translate.get('ERROR_PETICION_GUARDAR_CODIGOERROR_8112').subscribe((res: string) => {
             motivoErrorCita = res;
           });
           break;
       default:
           motivoErrorCita = "Se ha producido un error NO controlado por la Intranet-Preving, avise al departamento técnico.";
           this.translate.get('ERROR_PETICION_GUARDAR_CODIGOERROR_GENERICO').subscribe((res: string) => {
             motivoErrorCita = res;
           });
    }

    return motivoErrorCita;
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
