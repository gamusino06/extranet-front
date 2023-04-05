import {Component, Input, OnInit, Output, ViewChild} from '@angular/core';
import { environment } from '../../../environments/environment';
import { UserService } from 'src/app/services/user.service';
import { UtilsService } from 'src/app/services/utils.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatPaginator } from '@angular/material/paginator';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { SafeHtml } from '@angular/platform-browser';
import { PdfView } from 'src/app/modales/pdfView/pdfView.component';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { Globals } from '../globals';
import { ChangeDetectorRef } from '@angular/core';

import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as _moment from 'moment';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MY_FORMATS } from '../../../config/config';
import { ShareDocumentComponent } from 'src/app/modales/shareDocument/shareDocument.component';
import { HistoricoAccionesDocumentoComponent } from 'src/app/modales/historicoAccionesDocumento/historicoAccionesDocumento.component';
import { AcceptGdprDocumentComponent } from '../../modales/acceptGdprDocument/acceptGdprDocument.component';
import { TranslateService } from '@ngx-translate/core';
import {BajaTrabajadorComponent} from "../../modales/baja-trabajador/baja-trabajador.component";
import {
  AltaIndividualTrabajadorComponent
} from "../../modales/alta-individual-trabajador/alta-individual-trabajador.component";
import {Idioma} from '../../Model/Idioma';
import {PuestoTrabajo} from '../../Model/PuestoTrabajo';
import {SelectCentroComponent} from '../components/select-centro/select-centro.component';
import {SelectCentroFilterComponent} from '../components/select-centro-filter/select-centro-filter.component';
import {SelectEmpresaComponent} from '../components/select-empresa/select-empresa.component';
import {SelectEmpresaFilterComponent} from '../components/select-empresa-filter/select-empresa-filter.component';
import {Router} from '@angular/router';
import { ConfirmationModal } from 'src/app/Model/ConfirmationModal';
import {AptitudeReportService} from '../../services/aptitude-report.service';
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from '@angular/material/snack-bar';
import { WorkersCardService } from 'src/app/services/workers-card.service';
import { WorkerDocumentEmail } from 'src/app/Model/WorkerCard/WorkerDocumentEmail';
import { WorkerDataFilter, WorkerSummaryCardEmail } from 'src/app/Model/WorkerCard/WorkerSummaryCardEmail';

const moment = _moment;
const red_color = "#F01F1F";
const yellow_color = "#FED74D";
const green_color = "#45925A";

/* Mock Data */
export interface trabajador {
  checked: boolean;
  idTrabajador: number;
  nombreApellidos: string;
  nombre: string;
  apellidos: string;
  nif: string;
  fechaAlta: Date;
  fechaBaja: Date;
  fechaNacimiento: Date;
  empresa: any;
  centro: any;
  telefono: string;
  email: string;
  genero: string;
  puestosTrabajo: any[];
  accionesRealizadas: boolean;
  idRelacion: number;
  initials: string;
  age?: number;
  tlfCorp: string;
  emailCorp: string;
}

export interface trabajadorRl {
  empresa: any;
  centro: any;
  idTrabajador: number;
  nombre: string;
  apellidos: string;
  tipoDoc: number;
  nif: string;
  fechaAlta: Date;
  fechaBaja: Date;
  fechaNacimiento: Date;
  puesto: number;
  genero: string;
  idioma: number;
  ett: string;
  temporal: string;
  distancia: string;
  porcTad: number;
  teletrabajo: string;
  horario_manana: boolean;
  horario_tarde: boolean;
  horario_noche: boolean;
  horario_fds: boolean;
  emailEmpresa: string;
  telefonoEmpresa: string;
}

export interface documentosTrabajador {
  checked: boolean;
  idDocumento: number;
  nombreDocumento: string;
  fechaDocumento: Date;
  fechaReciclaje: string;
  origen: string;
  tipoDocumento: string;
  idTipoDocumento: number;
  idCurso: string;
  empresaNombre: string;
  nifTrabajador: string,
  puestosTrabajo: any[];
  motivo: string;
  aptitudNombre: string;
  observaciones: string;
  protocolos?: string[];
  modalidad: string;
  tipo: string;
  horas: string;
  nombreCurso: string;
  modalidadCurso: string;
  subcategoria: string;
  tipoReciclaje: string;
  accionesRealizadas: boolean;
  ubicacion: string;
  gdprId: number;
  fechaAceptacionGdpr: Date;
  gdpr: any;
  listaHistoricoDocumentoDto: any[];
  renouncedMedicalExamination?: boolean;
  nextRecognitionDate?: Date;
  lastRecognitionDate?: Date;
  lastRecognitionDateConfirmed?: Date;
  isLastDocument?: boolean;
  periodicity?: string;
  centerId: string;
  datosSolicitudCita?: any;
}


export interface trabajadorMin {
  idTrabajador: number;
  nombre: string;
  apellidos: string;
  nif: string;
  puestoId: number;
  clienteId: number;
  cliente: string;
  centroId: number;
  centro: string;
  denominacion: string;
  fechaAlta: string;
  fechaBaja: string;
  // centroAlta: number;
  centroAlta: string;
}

export interface PuestoTrabajoNum {
  idPuestoTrabajo: number;
  nombre: string;
  numTrabajadoresCentro: number;
  tipoPuesto: string;
}

export interface DownloadAllDocumentsDto {
  cardSummaryDto: object;
  formationTabDto: object;
  aptitudeTabDto: object;
  documentsTabDto: object;
}

@Component({
  selector: 'app-prevencion-trabajadores',
  templateUrl: './prevencion-trabajadores.component.html',
  styleUrls: ['./prevencion-trabajadores.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class PrevencionTrabajadoresComponent implements OnInit {
  environment = environment;
  cleanImgUrl = '../../assets/img/borrar_filtros.svg';
  searchImgUrl = '../../assets/img/search.svg';
  excelImgUrl = '../../assets/img/excel.svg';
  mailImgUrl = '../../assets/img/mail.svg';
  downloadImgUrl = '../../assets/img/download.svg';
  eyeImgUrl = "../../assets/img/eye.svg";
  previewImgUrl = "../../assets/img/preview-doc.svg";
  addAppointmentImgUrl = "../../assets/img/new-appointment.svg";
  appointmentHistoricalImgUrl = "../../assets/img/appointment-historical.svg";
  imgPerfil = '../../assets/img/user.svg';
  imgPerfilMujer = '../../assets/img/user_female.svg';
  downloadForOfflineImgUrl = '../../assets/img/download_for_offline.svg';

  idTrabajador: number;
  puestoPrincipalSeleccionado: number;
  tipoPuestoSeleccionado: String;
  modificarPuesto: boolean = false;
  altaMasivaTrabajadores = false; //mostrar boton de alta masiva
  showTrabajadorDetails: boolean = false;
  trabajador: trabajador;
  aprobDocDataDto: any;
  resultTrabajadores: trabajador[] = []; //Para poder guardar la lista de trabajadores y reiniciar el paginatorT

  tieneVS: boolean = false;
  isLoginSimulado: boolean = false;
  maxDate: Date;
  minDate: Date;

  showAltaIndividual: boolean = false;
  showModAlta: boolean = false;
  verResultado: boolean = false;
  modAltaForm: FormGroup;
  idiomasList: Idioma[];
  empresaSeleccionada: String = '';
  centroSeleccionado: String = '';
  noPermisoTrabajador: boolean;
  noEncontrado: boolean;
  datosTrabajadorBuscado: any;
  puestosBuscados: any[] = [];
  trabajadorRl: trabajadorRl;
  showAppointmentModal: Boolean = false;
  AppointmentModalConfigurationObj: ConfirmationModal = {
    title: 'MODALS.CONFIRMATION_MODAL.APPOINTMENT_DISABLE',
    text: '',
    showCancelButton: false,
    icon: 'warning',
    modalSize: ''
  };

  dataSourceTrabajadores = new MatTableDataSource<trabajador>();
  tableHeadersTrabajadores: string[] = [
    'checklist',
    'empresaCentro',
    'nombreApellidos',
    'puestosTrabajo',
    'fechaAlta',
    'fechaBaja',
    'verDetalles'
  ];

  dataSourceDC = new MatTableDataSource<documentosTrabajador>();
  tableHeadersDC: string[] = [
    'checklist',
    'newList',
    'semaforo',
    'fechaDocumento',
    'fechaReciclaje',
    'origen',
    'nombreCurso',
    'modalidad',
    'horas',
    'specialAction'
  ];

  dataSourceTA = new MatTableDataSource<trabajadorMin>();
  tableHeadersTA: string[] = [
    // 'radiolist',
    'empresa',
    'trabajador',
    'puestoTrabajo',
    'fchBaja',
    'centroAlta'
  ];

  dataSourcePT = new MatTableDataSource<PuestoTrabajoNum>();
  tableHeadersPT: any[] = [
    'puestoId',
    'nombrePuesto',
    'numTrabajadores'
  ];

  private USER_OPTIONS = {
    DOWNLOAD: 0,
    RESUME: 1,
    SHARE: 2,
  }

  workerFileOptions: any[] = [
    { id: this.USER_OPTIONS.DOWNLOAD, name: 'Descargar documentación' },
    { id: this.USER_OPTIONS.RESUME, name: 'Ficha resumen'  },
    { id: this.USER_OPTIONS.SHARE, name: 'Compartir' }
  ];

  menuActions (selectedOption) {
    if (selectedOption === this.USER_OPTIONS.SHARE) {
      this.shareWorkerCardSummary();
    }
    if (selectedOption === this.USER_OPTIONS.DOWNLOAD) {
      console.log('DOWNLOAD', selectedOption);

      this.downloadWorkerDocuments();
    }
    if (selectedOption === this.USER_OPTIONS.RESUME) {
      this.downloadWorkerCardSummary();
    }
  }

  empresas: any[];
  searchForm: FormGroup;
  trabajadorSeleccionado: any;
  searchTrabajadoresForm: FormGroup;
  trabajadoresBuscados: any;
  busqueda: any;
  reactivar: boolean = false;
  altaTrabajadorBool: boolean = false;
  swithunitario: boolean = true;
  existenPuestosCentro: boolean = false;
  workerData: any;

  appointmentList: any[] = [];
  formationList: any[] = [];
  aptitudeReportList: any[] = [];
  documentList: any[] = [];


  public TABS_PREVENCION_TRABAJADORES = {
    FORMACION: 0,
    INFORMACION: 1,
    INFORMES_APTITUD: 2,
    EPI: 3,
    ACCIDENTES: 4,
    AUTORIZACIONES: 5,
    DOCUMENTACION: 6,
    CITACIONES: 7,
    TRABAJO_DISTANCIA: 8
  };
  public tabsList = [
    { id: this.TABS_PREVENCION_TRABAJADORES.FORMACION, name: 'Formación', link: '', isSelected: true },
    // { id: this.TABS_PREVENCION_TRABAJADORES.INFORMACION, name: "Información", link: "" },
    { id: this.TABS_PREVENCION_TRABAJADORES.INFORMES_APTITUD, name: this.utils.translateText('PERSONA_TRABAJADORA.CERTIFICATES_OF_APTITUDE', 'Certificados de Aptitud'), link: '' },
    // { id: this.TABS_PREVENCION_TRABAJADORES.EPI, name: "E.P.I.", link: "" },
    // { id: this.TABS_PREVENCION_TRABAJADORES.ACCIDENTES, name: "Accidentes", link: "" },
     { id: this.TABS_PREVENCION_TRABAJADORES.AUTORIZACIONES, name:  this.utils.translateText('PERSONA_TRABAJADORA.AUTHORIZATIONS', 'Autorizaciones'), link: '' },
    { id: this.TABS_PREVENCION_TRABAJADORES.DOCUMENTACION, name: this.utils.translateText('PERSONA_TRABAJADORA.DOCUMENTATION', 'Documentación'), link: '' },
    { id: this.TABS_PREVENCION_TRABAJADORES.CITACIONES, name: this.utils.translateText('HISTORICO_CITAS', 'Histórico citas'), link: '' },
    // { id: this.TABS_PREVENCION_TRABAJADORES.TRABAJO_DISTANCIA, name: "Trabajo a distancia", link: "" }
  ]

  public selectedTab = this.tabsList[0];

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('paginatorT') paginatorT: MatPaginator;
  @ViewChild('paginatorIA') paginatorIA: MatPaginator;
  @ViewChild('paginatorDC') paginatorDC: MatPaginator;
  @ViewChild('paginatorTA') paginatorTA: MatPaginator;
  @ViewChild('paginatorPT') paginatorPT: MatPaginator;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    public utils: UtilsService,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
    public globals: Globals,
    private modalRgpd: MatDialog,
    public translate: TranslateService,
    private cdRef:ChangeDetectorRef,
    private router: Router,
    private aptitudeReportService: AptitudeReportService,
    public workerUtils : WorkersCardService,
  ) { }

  //validators
  validNameSurname = this.globals.workerPattern;
  validNifNie = this.globals.nifNiePattern;


  //Evita que se produzca el ERROR Error: ExpressionChangedAfterItHasBeenCheckedError
  ngAfterViewChecked()
  {
    this.cdRef.detectChanges();
  }

  onSelectTabItem (event: any): void {
    console.log('TAB', event.tab);
    console.log('INDEX', event.index);
    this.tabsList.forEach(t => {
      t.isSelected = false;
    });
    this.selectedTab = this.tabsList[event.index];
    this.selectedTab.isSelected = true
  }

  ngOnInit(): void {
    this.updateTabNames();
    this.updateFileOptionsTranslations();
    //En el caso de que se esté realizando un loginSimulado, no tendrá que guardarse
    let loginSimulado = localStorage.getItem("loginSimulado");
    if (loginSimulado !== null && loginSimulado === "true")
      this.isLoginSimulado = true;

    this.initForm();
    this.userService.getUser().subscribe(user => {
      this.empresas = user.empresas;
      this.updateEmpresasYCentros();
      user.areas.forEach(area => {
        if (area.idArea==this.globals.idAreaVS)
          this.tieneVS = true;
      });
      this.getTrabajadores();
    });

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

    this.iniciarFormulario();

    this.workerData = JSON.parse(localStorage.getItem('workerData'));
    localStorage.removeItem('workerData');
    if(this.workerData !== null && this.workerData.worker !== undefined){
      this.showTrabajador(this.workerData.worker)
      this.searchForm.setValue(this.workerData.searchForm);
    }
  }

  initForm() {
    //'activoForm' seteado a 1 por petición del cliente
    this.searchForm = this.formBuilder.group({
      empresaForm: new FormControl(''),
      centroForm: new FormControl(''),
      nombreForm: new FormControl(''),
      apellidosForm: new FormControl(''),
      dniForm: new FormControl(''),
      activoForm: new FormControl(1),
      fechaDesdeForm: new FormControl(moment()),
      fechaHastaForm: new FormControl(moment()),
      selectEmpresasRadioForm: new FormControl('1'),
      selectCentrosRadioForm: new FormControl('1'),
      emailEmpresaForm: new FormControl(''),
      telefonoEmpresaForm: new FormControl(''),
      todosCentrosForm: true
    });
    this.setDefaultForm();
  }

  resetForm(): void {
    setTimeout(() => {
      this.setDefaultForm();
      this.updateEmpresasYCentros();
    });
  }

  setDefaultForm(): void {
    var now = new Date();
    now.setHours(23, 59, 59);
    this.maxDate = now;
    //NOTA IMPORTANTE: Por petición de PREVING, en Personas Trabajadoras (tb en citación) y Contratos, la fecha desde es de 2001
    var nYearsAgo = new Date(this.globals.extranet_fecha_mas_antigua); //("2001-01-01 00:00:00")Año,Mes,Día,Hora,Minutos,Segundos)
    /*nYearsAgo.setDate(nYearsAgo.getDate() - (365 * this.globals.extranet_intervalo_fechas_filtro));
    nYearsAgo.setHours(0, 0, 0);*/
    this.minDate = nYearsAgo;
    this.searchForm.controls['activoForm'].setValue(1); //'activoForm' seteado a 1 por petición del cliente
    this.searchForm.controls['fechaDesdeForm'].setValue(nYearsAgo);
    this.searchForm.controls['fechaHastaForm'].setValue(now);
    this.searchForm.controls['selectEmpresasRadioForm'].setValue('1');
    this.searchForm.controls['selectCentrosRadioForm'].setValue('1');
    this.searchForm.controls['empresaForm'].setValue('');
    this.searchForm.controls['centroForm'].setValue('');
    this.searchForm.controls['nombreForm'].setValue('');
    this.searchForm.controls['apellidosForm'].setValue('');
    this.searchForm.controls['dniForm'].setValue('');
  }

  onSubmit(): void {
    this.getTrabajadores();
  }

  updateEmpresasYCentros() {
    if (this.empresas.length == 1) {
      this.searchForm.controls.empresaForm.setValue([this.empresas[0].idEmpresa]);
      this.empresas.forEach(empresa => {
        if (empresa.centros.length == 1)
          this.searchForm.controls.centroForm.setValue([empresa.centros[0].idCentro]);
      })
    }
  }

  getTrabajadores() {
    this.onSelectTabItem({tab: this.tabsList[0], index: 0});
    this.appointmentList = [];
    this.formationList = [];
    this.aptitudeReportList = [];
    let idEmpresasList: number[] = [];
    let idCentrosList: number[] = [];
    //Método que comprueba si alguno de los fitlros de Empresa y Centro está en 'activo' o en 'inactivo' y va añadiendo empresas/centros a sus respectivas listas
    this.utils.envioDatosConFiltroActivoInactivo (this.searchForm.get('selectEmpresasRadioForm').value,
                                        this.searchForm.get('selectCentrosRadioForm').value,
                                        this.searchForm.get('empresaForm').value,
                                        this.searchForm.get('centroForm').value,
                                        this.empresas,
                                        idEmpresasList,
                                        idCentrosList);

    let idsListResult: any[] = [];
    //Se comprueba si el usuario había seleccionado alguna empresa/centro en los campos 'empresaForm' y 'centroForm' para
    //alterar o no los atributos a enviar al BACK
    idsListResult = this.utils.valoraListasFinalesAEnviarConFiltro(this.searchForm.get('empresaForm').value,
                                        this.searchForm.get('centroForm').value,
                                        this.empresas,
                                        idEmpresasList,
                                        idCentrosList);

    //NOTA:Se revisa si para las empresas, la lista tiene valor '-1', si es así, es porque
    //las empresas del usuario no tiene contratado el producto PT/VS
    if (idsListResult[0].length === 1 && idsListResult[0][0] === -1){
      let titulo ="";
      //Se saca en qué área estamos intentando obtener los trabajadores
      let area = JSON.parse(localStorage.getItem("areaSelected"));
      if(area.idArea === this.globals.idAreaPT){
        //Radio = '0' => Ver todos ; Radio = '1' => Ver activos ; Radio = '2' => Ver inactivos
        if (this.searchForm.get('selectEmpresasRadioForm').value == '1'){
          let tituloPT = "El usuario no tiene empresas activas que tengan contratada el producto Prevención Técnica";
          this.translate.get('USUARIO_CON_EMPRESAS_ACTIVAS_SIN_PRODUCTO_PT').subscribe((res: string) => {
            tituloPT = res;
          });
          titulo = tituloPT;
        }else if (this.searchForm.get('selectEmpresasRadioForm').value == '2'){
          let tituloPT = "El usuario no tiene empresas inactivas que tengan contratada el producto Prevención Técnica";
          this.translate.get('USUARIO_CON_EMPRESAS_INACTIVAS_SIN_PRODUCTO_PT').subscribe((res: string) => {
            tituloPT = res;
          });
          titulo = tituloPT;
        }else{
          let tituloPT = "El usuario no tiene empresas que tengan contratada el producto Prevención Técnica";
          this.translate.get('USUARIO_CON_EMPRESAS_SIN_PRODUCTO_PT').subscribe((res: string) => {
            tituloPT = res;
          });
          titulo = tituloPT;
        }
      }else{
        if (this.searchForm.get('selectEmpresasRadioForm').value == '1'){
          let tituloVS = "El usuario no tiene empresas activas que tengan contratada el producto Vigilancia de la Salud";
          this.translate.get('USUARIO_CON_EMPRESAS_ACTIVAS_SIN_PRODUCTO_VS').subscribe((res: string) => {
            tituloVS = res;
          });
          titulo = tituloVS;
        }else if (this.searchForm.get('selectEmpresasRadioForm').value == '2'){
          let tituloVS = "El usuario no tiene empresas inactivas que tengan contratada el producto Vigilancia de la Salud";
          this.translate.get('USUARIO_CON_EMPRESAS_INACTIVAS_SIN_PRODUCTO_VS').subscribe((res: string) => {
            tituloVS = res;
          });
          titulo = tituloVS;
        }else{
          let tituloVS = "El usuario no tiene empresas que tengan contratada el producto Vigilancia de la Salud";
          this.translate.get('USUARIO_CON_EMPRESAS_SIN_PRODUCTO_VS').subscribe((res: string) => {
            tituloVS = res;
          });
          titulo = tituloVS;
        }
      }

      this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
      return;
    }
    let data = {
      listaIdsEmpresas: idsListResult[0],
      listaIdsCentros: idsListResult[1],
      nombre: this.searchForm.get('nombreForm').value,
      apellidos: this.searchForm.get('apellidosForm').value,
      nif: this.searchForm.get('dniForm').value,
      fechaInicio: this.searchForm.get('fechaDesdeForm').value,
      fechaFin: this.searchForm.get('fechaHastaForm').value,
      activo: this.searchForm.get('activoForm').value
    };
    this.spinner.show();
    this.userService.getTrabajadores(data).subscribe(trabajadores => {
      if(trabajadores !== undefined && trabajadores.length > 0){
      	let result: trabajador[] = [];
        trabajadores.forEach((item) => {
          let age: number;
          try {
            let bornDate: Date = new Date(item?.fechaNacimiento);
            let today: Date = new Date();
            age = (new Date()).getFullYear() - bornDate.getFullYear();
            let month = today.getMonth() - bornDate.getMonth();
            if(month < 0 || (month === 0 && today.getDate() < bornDate.getDate())) {
              age--;
            }
          } catch { age = 0; }
          result.push({
            checked: false,
            idTrabajador: item.idTrabajador,
            nombreApellidos: item.nombre + ' ' + item.apellidos,
            nombre: item.nombre,
            apellidos: item.apellidos,
            nif: item.nif,
            fechaAlta: item.fechaAlta,
            fechaBaja: item.fechaBaja,
            fechaNacimiento: item.fechaNacimiento,
            empresa: item.empresa,
            centro: item.centro,
            genero: item.sexo,
            telefono: item.telefono,
            email: item.email,
            puestosTrabajo: item.puestoTrabajoDtoList,
            accionesRealizadas: item.accionesRealizadas,
            idRelacion: item.idRelacion,
            initials: item.initials || '',
            age: age,
            tlfCorp: item.tlfCorp,
            emailCorp: item.emailCorp
          });
        });
        this.resultTrabajadores = result; //Nos guardamos la lista de trabajadores
        this.dataSourceTrabajadores = new MatTableDataSource(result);
        this.dataSourceTrabajadores.paginator = this.paginatorT;
        this.dataSourceTrabajadores.sort = this.sort;

        //Fix sort problem: sort mayúsculas y minúsculas
        this.dataSourceTrabajadores.sortingDataAccessor = (item, property) => {
          if (property == 'fechaAlta')
            return new Date(item.fechaAlta);

          if (property == 'fechaBaja')
            return new Date(item.fechaBaja);

          if (property == 'empresaCentro')
            return item['empresa'].nombre;

          if (typeof item[property] === 'string')
            return item[property].toLocaleLowerCase();

          return item[property];
        };
      }else if(trabajadores !== undefined && trabajadores.length === 0){
        this.utils.mostrarMensajeSwalFireTrabajadoresNoEncontrados();
      }
      this.spinner.hide();
    });
  }

  showTrabajador(trabajador) {
    this.showTrabajadorDetails = true;
    this.trabajador = trabajador;
    trabajador.initials = this.trabajador.nombre.charAt(0) + this.trabajador.apellidos.charAt(0);
  }

  comprobarCentroActivo(trabajador){

    for(let empresa of this.empresas){
      for(let centro of empresa.centros){
        if(trabajador.centro.idCentro == centro.idCentro){
          if(centro.activo){
            return true;
          } else{
            return false;
          }
        }
      }
    }

    return false;
  }

  /**
   * Metodo para reactivar una relacion laboral
   * @param trabajador
   */
  reactivarTra(trabajador){
    if(this.comprobarCentroActivo(trabajador)){
      this.spinner.show();
      this.trabajador = trabajador;
      this.userService.reactivarRelacionLaboral(trabajador.idRelacion, trabajador.empresa.idEmpresa).subscribe(data => {
        if(data == "404"){
          this.utils.mostrarMensajeSwalFire('error', "Ha ocurrido un error al intentar reactivar esta Relación Laboral", '','var(--blue)', false);
        } else if(data == "405") {
          this.utils.mostrarMensajeSwalFire('warning', "Esta Relación Laboral no puede ser reactivada debido a que el puesto no está activo actualmente", '','var(--blue)', false);
        } else {
          this.utils.mostrarMensajeSwalFire('success', "Se ha reactivado esta Relación Laboral con éxito", '','var(--blue)', false);
        }
        this.spinner.hide();
      }, error => {
        this.utils.mostrarMensajeSwalFire('error', "Ha ocurrido un error al intentar reactivar esta Relación Laboral", '','var(--blue)', false);
        this.spinner.hide();
      });
    } else {
      this.utils.mostrarMensajeSwalFire('warning', "Esta Relación Laboral no puede ser reactivada debido a que el centro no está activo actualmente", '','var(--blue)', false);
    }

  }

  /**
   * Usamos este metodo para traer los datos del trabajador y además tramitar la pantalla de modificación
   * @param trabajador
   */
  modTrabajador(trabajador) {
    this.puestoPrincipalSeleccionado = null;

    this.spinner.show();
    this.trabajador = trabajador;
    this.getIdiomas();
    this.iniciarFormularioMod();
    this.userService.getRelacionLaboralById(trabajador.idRelacion, trabajador.idTrabajador).subscribe(data => {
      if(data != null){
        let rl: trabajadorRl = {
          empresa: trabajador.empresa.idEmpresa,
          centro: trabajador.centro.idCentro,
          idTrabajador: trabajador.idTrabajador,
          nombre: trabajador.nombre,
          apellidos: trabajador.apellidos,
          tipoDoc: data.trabajador.tipoDocumento,
          nif: trabajador.nif,
          puesto: data.relacion.puesto.id,
          fechaAlta: trabajador.fechaAlta,
          fechaBaja: trabajador.fechaBaja,
          fechaNacimiento: trabajador.fechaNacimiento,
          genero: trabajador.genero.substr(0,1),
          idioma: data.trabajador.idioma.id,
          ett: data.relacion.ett.toString(),
          temporal: data.relacion.temporal.toString(),
          distancia: data.relacion.tad.toString(),
          porcTad: data.relacion.tadPorc,
          teletrabajo: data.relacion.teletrabajo.toString(),
          horario_manana: data.relacion.horarioManana,
          horario_tarde: data.relacion.horarioTarde,
          horario_noche: data.relacion.horarioNoche,
          horario_fds: data.relacion.horarioFinSemana,
          emailEmpresa: data.relacion.emailEmpresa,
          telefonoEmpresa: data.relacion.telefonoEmpresa,
        }
        this.setFormModAlta(rl);
        this.puestoPrincipalSeleccionado = rl.puesto;
        this.filtrarPuestos(rl.empresa, rl.centro, '');
        this.tipoPuestoSeleccionado = data.relacion.tipoPuesto;
        this.trabajadorRl = rl;

        this.centroSeleccionado = trabajador.centro.idCentro;

        this.modAltaForm.controls["centroSecForm"].setValue(this.centroSeleccionadoById(trabajador.centro.idCentro));
        this.modAltaForm.controls["empresaForm"].disable();
        this.modAltaForm.controls["centroForm"].disable();
        this.modAltaForm.controls["centroSecForm"].disable();
        this.modAltaForm.controls["fechaAltaForm"].disable();
        this.modAltaForm.controls["fechaBajaForm"].disable();
        this.modAltaForm.controls["tipoDoc"].disable();
        this.modAltaForm.controls["dniForm"].disable();
      }
      this.showModAlta = true;

      if(data == null){
        this.utils.mostrarMensajeSwalFire('error', `La persona trabajadora con NIF/NIE ${trabajador.nif} no puede modificarse debido a un error`, '', 'var(--blue)', false)
        this.showModAlta = false;
      }

    },error => {
      this.utils.mostrarMensajeSwalFire('error', 'Error al obtener la información del trabajador', '', 'var(--blue)', false)
      this.spinner.hide();
    })
  }

  /**
   * Inicialización del formulario para la modificación
   */
  iniciarFormularioMod(){
    this.modAltaForm = this.formBuilder.group({
      empresaForm: new FormControl('', Validators.required),
      centroForm: new FormControl('', Validators.required),
      centroSecForm: new FormControl(''),
      tipoDoc: new FormControl('', Validators.required),
      dniForm: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(12)]),
      nombreForm: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      apellidosForm: new FormControl('', [Validators.required, Validators.maxLength(75)]),
      generoForm: new FormControl('', Validators.required),
      fechaNacForm: new FormControl('', Validators.required),
      idiomaForm: new FormControl('', Validators.required),
      porcTad: new FormControl('', [Validators.min(0), Validators.max(100)]),
      fechaAltaForm: new FormControl(''),
      fechaBajaForm: new FormControl(''),
      ettForm: new FormControl('', Validators.required),
      temporalForm: new FormControl('', Validators.required),
      distanciaForm: new FormControl('', Validators.required),
      teletrabajoForm: new FormControl(''),
      hMananaForm: new FormControl(''),
      hTardeForm: new FormControl(''),
      hNocheForm: new FormControl(''),
      emailEmpresaForm: new FormControl(''),
      telefonoEmpresaForm: new FormControl(''),
      hFdsForm: new FormControl('')
    });
  }

  /**
   * Metodo para validar el Documento a modificar
   */
  validarDoc(): boolean{
    let dni: string = "";
    if(this.datosTrabajadorBuscado == null)
      dni = this.trabajadorRl.nif;
    else
      dni = this.modAltaForm.value.dniForm;

    if(dni == undefined)
      dni = this.datosTrabajadorBuscado.nif.toUpperCase();

    let nif = new RegExp(this.validNifNie);
    if(this.modAltaForm.value.tipoDoc == 0){ //NIF-NIE
      if(nif.test(dni))
        return true;
      return false;
    }
    return true;
  }

  validarDocumento(dni: string): boolean{
    let nif = new RegExp(this.validNifNie);
    if(nif.test(dni))
      return true;
    return false;
  }

  /**
   * Metodo para enviar el formulario de modificación de trabajador y rl
   */
  enviarMod(){
    this.spinner.show();

    // Validamos el documento introducido segun la opción seleccionada en el Combo
    let valido = this.validarDoc();
    if(!valido){
      this.spinner.hide();
      this.utils.mostrarMensajeSwalFire('warning', 'El NIF-NIE introducido no es valido', '','var(--blue)', false);
    }

    if(this.datosTrabajadorBuscado != null && this.modAltaForm.value.tipoDoc == 0){
      this.spinner.hide();
      valido = false;
      this.utils.mostrarMensajeSwalFire('warning', 'Debe seleccionar el tipo de documento para poder dar un alta', '','var(--blue)', false);
    }

    if(this.modAltaForm.value.porcTad == 0 && this.modAltaForm.value.distanciaForm == "true") {
      this.spinner.hide();
      this.utils.mostrarMensajeSwalFire('warning', 'El porcentaje en TAD debe ser mayor que 0', '', 'var(--blue)', false);
      valido = false;
    }

    let emailReg = new RegExp(this.globals.emailPattern);
    if(this.modAltaForm.value.emailEmpresaForm != '' && this.modAltaForm.value.emailEmpresaForm != null && !emailReg.test(this.modAltaForm.value.emailEmpresaForm)){
      this.utils.mostrarMensajeSwalFire('warning', 'El email de empresa no tiene un formato correcto', '','var(--blue)', false);
      valido = false;
    }

    if(this.modAltaForm.value.telefonoEmpresaForm != '' && this.modAltaForm.value.telefonoEmpresaForm != null && (this.modAltaForm.value.telefonoEmpresaForm.length < 9  && this.modAltaForm.value.telefonoEmpresaForm.length > 13)){
      this.utils.mostrarMensajeSwalFire('warning', 'El telefono de empresa no tiene un formato correcto', '','var(--blue)', false);
      valido = false;
    }

      let fechaNac: Date;
    fechaNac = new Date(this.modAltaForm.value.fechaNacForm);

    let year = fechaNac.getFullYear();
    let month = (1 + fechaNac.getMonth()).toString().padStart(2, "0");
    let day = fechaNac.getDate().toString().padStart(2, "0");
    let finalNac = year + "-" + month + "-" + day;
    let datos;

    // Diferenciamos si el trabajador llega desde la pantalla principal o del buscador de trabajadores
    if(this.datosTrabajadorBuscado == null){
      datos = {
        'traId': this.trabajador.idTrabajador,
        'traNombre': this.modAltaForm.value.nombreForm,
        'traApellidos': this.modAltaForm.value.apellidosForm,
        'traTipoDoc': this.trabajadorRl.tipoDoc,
        'traDoc': this.trabajadorRl.nif,
        'traFechaNacimiento': finalNac,
        'traGenero': this.modAltaForm.value.generoForm,
        'traIdioma': this.modAltaForm.value.idiomaForm,
        'clienteId': 0,
        'centroId': 0,
        'rlPuestoId': this.puestoPrincipalSeleccionado,
        'rlPuestoTipo': this.tipoPuestoSeleccionado,
        'rlPuestoModificar': this.modificarPuesto,
        'rlEtt': this.modAltaForm.value.ettForm,
        'rlTemporal': this.modAltaForm.value.temporalForm,
        'rlDistancia': this.modAltaForm.value.distanciaForm,
        'rltadPorc': this.modAltaForm.value.porcTad,
        'rlTeletrabajo': this.modAltaForm.value.teletrabajoForm,
        'rlHorarioManana': this.modAltaForm.value.hMananaForm,
        'rlHorarioTarde': this.modAltaForm.value.hTardeForm,
        'rlHorarioNoche': this.modAltaForm.value.hNocheForm,
        'rlHorarioFds': this.modAltaForm.value.hFdsForm,
        'traEmailEmpresa': this.modAltaForm.value.emailEmpresaForm,
        'traTelefonoEmpresa': this.modAltaForm.value.telefonoEmpresaForm
      };

      if(valido){
        this.userService.modificarTrabajadorRelacionLaboral(this.trabajador.empresa.idEmpresa, this.trabajador.idTrabajador, this.trabajador.idRelacion, datos)
          .subscribe(data => {
            this.spinner.hide();
            if(data != '400') {
              Swal.fire({
                icon: 'success',
                title: 'Los datos de la persona trabajadora se han editado con éxito',
                confirmButtonColor: 'var(--blue)',
                allowOutsideClick: false
              }).then((result) => {
                if (result.isConfirmed)
                  this.volver();
              });
            } else
              this.utils.mostrarMensajeSwalFire('error', 'Error al editar los datos de la persona trabajadora', '', 'var(--blue)', false);
          }, error => {
            this.spinner.hide();
            this.utils.mostrarMensajeSwalFire('error', 'Error al editar los datos de la persona trabajadora', '', 'var(--blue)', false);
          });
      } else {
        this.spinner.hide();
      }
    } else {
      let fechaAlta = new Date();
      let year2 = fechaAlta.getFullYear();
      let month2 = (1 + fechaAlta.getMonth()).toString().padStart(2, "0");
      let day2 = fechaAlta.getDate().toString().padStart(2, "0");
      let finalAlta = year2 + "-" + month2 + "-" + day2;

      datos = {
        'traId': this.datosTrabajadorBuscado.idTrabajador,
        'traNombre': this.modAltaForm.value.nombreForm,
        'traApellidos': this.modAltaForm.value.apellidosForm,
        'traTipoDoc': this.modAltaForm.value.tipoDoc,
        'traDoc': this.datosTrabajadorBuscado.nif,
        'traFechaNacimiento': finalNac,
        'traFechaAlta': finalAlta,
        'traGenero': this.modAltaForm.value.generoForm,
        'traIdioma': this.modAltaForm.value.idiomaForm,
        'rlPuestoId': this.puestoPrincipalSeleccionado,
        'rlPuestoTipo': this.tipoPuestoSeleccionado,
        'rlPuestoModificar': true,
        'clienteId': Number(this.modAltaForm.value.empresaForm),
        'centroId': Number(this.modAltaForm.value.centroForm),
        'rlEtt': this.modAltaForm.value.ettForm,
        'rlTemporal': this.modAltaForm.value.temporalForm,
        'rlDistancia': this.modAltaForm.value.distanciaForm,
        'rltadPorc': this.modAltaForm.value.porcTad,
        'rlTeletrabajo': this.modAltaForm.value.teletrabajoForm,
        'rlHorarioManana': this.modAltaForm.value.hMananaForm,
        'rlHorarioTarde': this.modAltaForm.value.hTardeForm,
        'rlHorarioNoche': this.modAltaForm.value.hNocheForm,
        'rlHorarioFds': this.modAltaForm.value.hFdsForm,
        'traEmailEmpresa': this.modAltaForm.value.emailEmpresaForm,
        'traTelefonoEmpresa': this.modAltaForm.value.telefonoEmpresaForm
      };

      if(valido){
        this.userService.modificarTrabajadorRelacionLaboral(this.modAltaForm.value.empresaForm, this.datosTrabajadorBuscado.idTrabajador, 0, datos)
          .subscribe(data => {
            this.spinner.hide();
            if(data == '200') {
              Swal.fire({
                icon: 'success',
                title: 'Se ha dado de alta la Relación laboral',
                confirmButtonColor: 'var(--blue)',
                allowOutsideClick: false
              }).then((result) => {
                if (result.isConfirmed)
                  this.volver();
              });
            }
            else if(data == '501') {
              this.utils.mostrarMensajeSwalFire('error', 'Error al dar de alta esta Relación Laboral', 'El puesto no puede estar vacio', 'var(--blue)', false);
            }
            else if(data == '502') {
              this.utils.mostrarMensajeSwalFire('error', 'Error al dar de alta esta Relación Laboral', '', 'var(--blue)', false);
            }
            else if(data == '503') {
              this.utils.mostrarMensajeSwalFire('error', 'Error al dar de alta esta Relación Laboral', 'El trabajador ya tiene una Relación Laboral activa para el Cliente/Centro', 'var(--blue)', false);
            }
            else if(data == '504') {
              this.utils.mostrarMensajeSwalFire('error', 'Error al dar de alta esta Relación Laboral', 'El trabajador no puede darse de alta sin asignar el tipo de documento', 'var(--blue)', false);
            }
            else if(data == '505') {
              this.utils.mostrarMensajeSwalFire('error', 'Error al dar de alta esta Relación Laboral', 'Formulario mal cumplimentado', 'var(--blue)', false);
            }
            else {
              this.utils.mostrarMensajeSwalFire('error', 'Error al dar de alta esta Relación Laboral', '', 'var(--blue)', false);
            }
          }, error => {
            this.spinner.hide();
            this.utils.mostrarMensajeSwalFire('error', 'Error al dar de alta esta Relación Laboral', '', 'var(--blue)', false);
          });
      } else {
        this.spinner.hide();
      }
    }
  }

  /**
   * Metodo para settear los valores que llegan del objeto
   * @param trabajadorRl
   */
  setFormModAlta(trabajadorRl: trabajadorRl){
    this.modAltaForm.controls["empresaForm"].setValue(trabajadorRl.empresa);
    this.modAltaForm.controls["centroForm"].setValue(trabajadorRl.centro);
    this.modAltaForm.controls["tipoDoc"].setValue(trabajadorRl.tipoDoc);
    this.modAltaForm.controls["dniForm"].setValue(trabajadorRl.nif);
    this.modAltaForm.controls["nombreForm"].setValue(trabajadorRl.nombre);
    this.modAltaForm.controls["apellidosForm"].setValue(trabajadorRl.apellidos);
    this.modAltaForm.controls["generoForm"].setValue(trabajadorRl.genero);
    this.modAltaForm.controls["fechaNacForm"].setValue(trabajadorRl.fechaNacimiento);
    this.modAltaForm.controls["idiomaForm"].setValue(trabajadorRl.idioma);
    this.modAltaForm.controls["fechaAltaForm"].setValue(trabajadorRl.fechaAlta);
    this.modAltaForm.controls["fechaBajaForm"].setValue(trabajadorRl.fechaBaja);
    this.modAltaForm.controls["ettForm"].setValue(trabajadorRl.ett);
    this.modAltaForm.controls["temporalForm"].setValue(trabajadorRl.temporal);
    this.modAltaForm.controls["distanciaForm"].setValue(trabajadorRl.distancia);
    this.modAltaForm.controls["porcTad"].setValue(trabajadorRl.porcTad);
    this.modAltaForm.controls["teletrabajoForm"].setValue(trabajadorRl.teletrabajo);
    this.modAltaForm.controls["hMananaForm"].setValue(trabajadorRl.horario_manana);
    this.modAltaForm.controls["hTardeForm"].setValue(trabajadorRl.horario_tarde);
    this.modAltaForm.controls["hNocheForm"].setValue(trabajadorRl.horario_noche);
    this.modAltaForm.controls["hFdsForm"].setValue(trabajadorRl.horario_fds);
    this.modAltaForm.controls["emailEmpresaForm"].setValue(trabajadorRl.emailEmpresa);
    this.modAltaForm.controls["telefonoEmpresaForm"].setValue(trabajadorRl.telefonoEmpresa);
  }
  /**
   * Metodo para obtener el nombre del centro seleccionada por id
   */
  centroSeleccionadoById(Idcentro: any){
    let centroSeleccionado: String = '';
    if(this.empresas != undefined){
      for(let empresa of this.empresas){
        for(let centro of empresa.centros) {
          if (centro.idCentro == Number(Idcentro)) {
            centroSeleccionado = centro.nombre + ', ' + centro.calle;
          }
        }
      }
    }
    return centroSeleccionado;
  }


  //Método que recibe los idiomas disponible
  getIdiomas() {
    this.userService.getIdiomas().subscribe(data => {
      if(data){
        this.idiomasList = data;
      }else{
        this.spinner.hide();
      }
    }), (error => {
      if (environment.debug) console.log("Error");
    })
  }

  getEmpresa(){
    for(let empresa of this.empresas){
      if(empresa.idEmpresa == this.modAltaForm.controls["empresaForm"].value){
        this.empresaSeleccionada = empresa;
      }
    }
  }

  /**
   * Metodo para abrir el modal de la baja
   * @param trabajador
   */
  bajaTrabajador(trabajador) {
    this.trabajador = trabajador;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "40%";
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = false;
    dialogConfig.data = {
      'trabajador': trabajador,
      'confirmacion': false
    };

    const dialogRef = this.dialog.open(BajaTrabajadorComponent, dialogConfig);
    dialogRef.afterClosed()
      .subscribe(result => {
        if (!result || result > new Date() || result < new Date(trabajador.fechaAlta))
          return false;
        this.setBajaTrabajador(trabajador, result, dialogConfig);
      });
  }

  /**
   * Metodo para dar de baja un trabajador
   * @param trabajador
   * @param fechaBaja
   * @param dialogConfig
   */
  setBajaTrabajador(trabajador: any, fechaBaja: Date, dialogConfig: MatDialogConfig){
    this.spinner.show();
    const datos = {
      'userId': JSON.parse(localStorage.getItem("userDataFromUsuario")).idUsuario,
      'fechaBaja': fechaBaja
    };
    this.userService.setBajaTrabajador(trabajador.empresa.idEmpresa,  trabajador.centro.idCentro, trabajador.idRelacion, datos)
      .subscribe(data => {
        if (data > 1) {
          dialogConfig.data = {
            'trabajador': trabajador,
            'confirmacion': true
          };
          const dialogRef = this.dialog.open(BajaTrabajadorComponent, dialogConfig);
          dialogRef.afterClosed()
            .subscribe(result => { // Cambiar cuando se cambie a FRONT y no haya delay
              // location.reload();
              trabajador.fechaBaja = fechaBaja;
            });
        } else
          this.errorBajaTrabajador(trabajador);
        this.spinner.hide();
      }, error => {
        // console.error(error);
        this.spinner.hide();
        this.errorBajaTrabajador(trabajador);
      });
  }

  /**
   * Caso de error ante la baja de un trabajador
   * @param trabajador
   */
  errorBajaTrabajador(trabajador: any) {
    const titulo = this.utils.traducirTextos('Se ha producido un error', 'ERROR')
    const texto = this.utils.traducirTextos('Ha ocurrido un error al dar de baja al trabajador', 'ERROR_BAJA_TRABAJADOR')
    this.utils.mostrarMensajeSwalFire(
      'error',
      titulo,
      `${texto} ${trabajador.nombreApellidos}`,
      'var(--blue)',
      true
    );
  }

  /**
   * Metodo usado para volver a la pantalla principal del componente
   */
  volver(){
    this.spinner.show();
    this.existenPuestosCentro = false;
    this.showTrabajadorDetails = false;
    this.showAltaIndividual = false;
    this.showModAlta = false;
    this.reactivar = false;
    this.noPermisoTrabajador = false;
    this.noEncontrado = false;
    this.altaTrabajadorBool = false;
    this.trabajadoresBuscados = undefined;
    this.puestoPrincipalSeleccionado = null;
    this.searchTrabajadoresForm.controls['criterioForm'].setValue('');
    this.datosTrabajadorBuscado = null;
    this.resultTrabajadores = [];
    this.modificarPuesto = false;

    this.initPaginatorT();
    this.dataSourceDC.data = [];
    this.dataSourceTA.data = [];
    this.puestosBuscados = [];
    this.dataSourcePT.data = [];
    this.spinner.hide();
    this.getTrabajadores();
  }

  //Método para inicializar el paginator de trabajadores, debido a que como <mat-paginator> se encontraba dentro de un
  //*ngIf showTrabajadorDetails, por tanto no se procesaba al volver de la vista de los documentos del trabajador
  //y daba lugar a que paginatorT fuese indefinido, por tanto utilizando 'ChangeDetectorRef' se detecta este cambio
  //e inicializamos dicho "dataSourceTrabajadores" de nuevo.
  initPaginatorT(){
    this.dataSourceTrabajadores = new MatTableDataSource(this.resultTrabajadores);
    this.cdRef.detectChanges();
    this.dataSourceTrabajadores.paginator = this.paginatorT;
    this.dataSourceTrabajadores.sort = this.sort;

    //Fix sort problem: sort mayúsculas y minúsculas
    this.dataSourceTrabajadores.sortingDataAccessor = (item, property) => {
      if (property == 'fechaAlta')
        return new Date(item.fechaAlta);
      if (property == 'fechaBaja')
        return new Date(item.fechaBaja);

      if (typeof item[property] === 'string')
        return item[property].toLocaleLowerCase();

      return item[property];
    };
  }

  checkAllRows(event) {
    if (this.dataSourceTrabajadores.data)
      this.dataSourceTrabajadores.data.forEach(val => { val.checked = event.checked; });
  }

  dropT(event: CdkDragDrop<string[]>) {

    moveItemInArray(this.tableHeadersTrabajadores, event.previousIndex, event.currentIndex);
    let objToSave: object = {};

    if (localStorage.getItem('tableColsOrder')) {
      objToSave = JSON.parse(localStorage.getItem('tableColsOrder'));
    }
    objToSave[this.constructor.name + 'T'] = this.tableHeadersTrabajadores;
    localStorage.setItem('tableColsOrder', JSON.stringify(objToSave));

  }

  dropTA(event: CdkDragDrop<string[]>) {

    moveItemInArray(this.tableHeadersTA, event.previousIndex, event.currentIndex);
    let objToSave: object = {};

    if (localStorage.getItem('tableColsOrder')) {
      objToSave = JSON.parse(localStorage.getItem('tableColsOrder'));
    }
    objToSave[this.constructor.name + 'T'] = this.tableHeadersTA;
    localStorage.setItem('tableColsOrder', JSON.stringify(objToSave));

  }

  dropPT(event: CdkDragDrop<string[]>) {

    moveItemInArray(this.tableHeadersPT, event.previousIndex, event.currentIndex);
    let objToSave: object = {};

    if (localStorage.getItem('tableColsOrder')) {
      objToSave = JSON.parse(localStorage.getItem('tableColsOrder'));
    }
    objToSave[this.constructor.name + 'T'] = this.tableHeadersPT;
    localStorage.setItem('tableColsOrder', JSON.stringify(objToSave));

  }

  selectAll(formName, formControlName, values, fieldName) {
    /*si viene 1 elemento en los controls es que estamos marcando el selectAll...
    si hay mas de uno deseleccionamos*/
    if (this[formName].controls[formControlName].value.length != 1) {
      this[formName].controls[formControlName].setValue([]);
    } else {
      let result = [];
      values.forEach(item => {
        result.push(item[fieldName]);
      })
      this[formName].controls[formControlName].setValue(result);
    }
  }


  selectAllTwoDimension(formName, formControlName, values, values2, subArrayfieldName, toCompare, fieldName) {
    let result = [];
    values.forEach(item1 => {
      values2.forEach(item2 => {
        if (item1[toCompare] === item2) {
          item1[subArrayfieldName].forEach(subItems => {
            result.push(subItems[fieldName]);
          })

        }
      })
    });

    /*si viene 1 elemento en los controls es que estamos marcando el selectAll...
    si hay mas de uno deseleccionamos*/
    if (this[formName].controls[formControlName].value.length != 1) {
      this[formName].controls[formControlName].setValue([]);
    } else {
      this[formName].controls[formControlName].setValue(result);
    }
  }

  exportAsExcel() {
    this.spinner.show();
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    let JSONWS: XLSX.WorkSheet;
    let dataJS = [];

    //Variables para traducción
    var nombreExcel = "Personas Trabajadoras";
    this.translate.get('PERSONAS_TRABAJADORAS').subscribe((res: string) => {
      nombreExcel = res;
    });
    var columnaEmpresaCentro = "Empresa-Centro";
    this.translate.get('EMPRESA_CENTRO').subscribe((res: string) => {
      columnaEmpresaCentro = res;
    });
    var columnaPersonaTrabajadora = "Persona Trabajadora";
    this.translate.get('PERSONA_TRABAJADORA').subscribe((res: string) => {
      columnaPersonaTrabajadora = res;
    });
    var columnaTrabajadorNif = "NIF/NIE";
    this.translate.get('NIF_NIE').subscribe((res: string) => {
      columnaTrabajadorNif = res;
    });
    var columnaPuestoTrabajo = "Puesto de Trabajo";
    this.translate.get('PUESTO_TRABAJO').subscribe((res: string) => {
      columnaPuestoTrabajo = res;
    });
    var columnaFechaAlta = "Fecha de Alta";
    this.translate.get('FECHA_ALTA').subscribe((res: string) => {
      columnaFechaAlta = res;
    });
    var columnaFechaBaja = "Fecha de Baja";
    this.translate.get('FECHA_BAJA').subscribe((res: string) => {
      columnaFechaBaja = res;
    });

    let isElementosSelect: boolean = false;
    this.dataSourceTrabajadores._orderData(this.dataSourceTrabajadores.data).forEach(item => {
      if (item.checked) {
        isElementosSelect = true;
        let new_item = {};

        this.tableHeadersTrabajadores.forEach(tableHeader => {
          switch (tableHeader) {
            case 'empresaCentro':
              if (item.centro != undefined) {
                new_item[columnaEmpresaCentro] = item.empresa.nombre + " - " + item.centro.nombre;
              } else {
                new_item[columnaEmpresaCentro] = item.empresa.nombre;
              }
              break;
            case 'nombreApellidos':
              new_item[columnaPersonaTrabajadora] = item.nombreApellidos;
              new_item[columnaTrabajadorNif] = item.nif;
              break;
            case 'puestosTrabajo':
              new_item[columnaPuestoTrabajo] = item.puestosTrabajo[0].nombre;
              break;
            case 'fechaAlta':
              new_item[columnaFechaAlta] = item.fechaAlta;
              break;
            case 'fechaBaja':
              new_item[columnaFechaBaja] = item.fechaBaja ? (new Date(item.fechaBaja)).toLocaleDateString() : "";
              break;
          }
        })
        dataJS.push(new_item);
      }
    });

    if (isElementosSelect == false) {
      let titulo = "Debe seleccionar al menos un elemento a exportar";
      this.translate.get('ERROR_SELECCIONA_EXPORTAR').subscribe((res: string) => {
        titulo = res;
      });
      this.utils.mostrarMensajeSwalFire('error', titulo, '', 'var(--blue)', false);
    } else {
      let result = XLSX.utils.sheet_add_json(JSONWS, dataJS);

      XLSX.utils.book_append_sheet(wb, result, 'Sheet1');

      /* save to file */
      XLSX.writeFile(wb, nombreExcel + '.xlsx');
    }
    //this.dataSource.paginator._changePageSize(paginacion);

    this.spinner.hide();
  }

  /**
   * Metodo para iniciar la pestaña de alta individual
   */
  altaIndividual() {
    this.showAltaIndividual = true;
  }

  /**
   * Filtrar resultados de busqueda de trabajador por su DNI
   * @param datos
   */
  filtrarAltaIndividual(datos: FormGroup) {
    if(datos.valid && this.validarDocumento(datos.value.criterioForm)) {
      this.noPermisoTrabajador = false;
      this.noEncontrado = false;
      this.datosTrabajadorBuscado = null;
      this.trabajadoresBuscados = [];

      // Solucion al error de la paginación con control por ngIf
      this.trabajadoresBuscados.length = 1;
      this.verResultado = false;

      this.reactivar = false;
      this.altaTrabajadorBool = false;

      this.busqueda = datos.value.criterioForm;

      this.spinner.show();
      this.userService.buscarTrabajador(datos.value.filtroForm, datos.value.criterioForm).subscribe(data => {
        if(data != undefined){
          let result: trabajadorMin[] = [];
          data.rls.forEach((item) => {
            result.push({
              idTrabajador: data.id,
              nombre: data.nombreTra,
              apellidos: data.apellidosTra,
              nif: data.documento,
              fechaAlta: item.fechaAlta,
              fechaBaja: item.fechaBaja,
              puestoId: item.puestoId,
              clienteId: item.clienteId,
              cliente: item.cliente,
              centroId: item.centroId,
              centro: item.centro,
              denominacion: item.nombrePuesto,
              centroAlta: item.centroAltaPRL
            });
          });

          if(data.rls.length == 0 && data.numRlsNoAutorizadas > 0){
            this.noPermisoTrabajador = true;
          } else if(data.id == 0){
            this.noEncontrado = true;
          }

          this.datosTrabajadorBuscado = {
            idTrabajador: data.id,
            nombre: data.nombreTra,
            apellidos: data.apellidosTra,
            nif: data.documento,
            idioma: data.traIdioma,
            tipoDoc: data.tipoDocumento,
            genero: data.traGenero,
            fchNac: data.traFechaNacimiento,
          }

          this.trabajadoresBuscados = result;
          this.dataSourceTA = new MatTableDataSource(result);
          this.dataSourceTA.paginator = this.paginatorTA;
          this.dataSourceTA.sort = this.sort;
        }
        this.spinner.hide();
        if(data.id != 0)
          this.verResultado = true;
      }, error => {
        this.utils.mostrarMensajeSwalFire('error', 'Ha ocurrido un error al intentar rescatar la información solicitada', '', 'var(--blue)', false);
        this.spinner.hide()
      });

    } else {
      this.utils.mostrarMensajeSwalFire('warning', 'El NIF-NIE introducido no es valido', '', 'var(--blue)', false);
    }
  }

  /**
   * Metodo usado para diversificar tipos de relaciones: Dadas de baja, activas...
   * @param trabajador
   */
  diversificarCasos(trabajador){
    this.trabajadorSeleccionado = trabajador;
    if(trabajador.fechaBaja != null){
      this.reactivar = true
      this.altaTrabajadorBool = false;
    } else {
      this.altaTrabajadorBool = true;
      this.reactivar = false;
    }
  }

  iniciarFormulario() {
    this.searchTrabajadoresForm = this.formBuilder.group({
      filtroForm: new FormControl(1, Validators.required),
      criterioForm: new FormControl('', [Validators.required, Validators.minLength(9), Validators.maxLength(9)])
    });
  }

  /**
   * Metodo para activar el modal para dar de alta un trabajador
   */
  altaTrabajador() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "40%";
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = false;
    dialogConfig.data = {
      'confirmacion': false,
      'trabajador': this.trabajadorSeleccionado
    };

    const dialogRef = this.dialog.open(AltaIndividualTrabajadorComponent, dialogConfig);
    dialogRef.afterClosed()
      .subscribe(result => {
        if (!result)
          return false;
      });
  }

  /**
   * Metodo para inicializar los datos y preparativos para el formulario de alta de un trabajador y su rl
   * @param nif
   */
  altaPersonaTrabajadora(nif){
    this.showAltaIndividual = false;
    this.centroSeleccionado = '';

    this.spinner.show();
    this.getIdiomas();
    this.iniciarFormularioMod();

    let rl: trabajadorRl;

    if(this.datosTrabajadorBuscado.idTrabajador == 0){
      rl = {
        empresa: null,
        centro: null,
        idTrabajador: this.datosTrabajadorBuscado.idTrabajador,
        nombre: this.datosTrabajadorBuscado.nombre,
        apellidos: this.datosTrabajadorBuscado.apellidos,
        tipoDoc: this.datosTrabajadorBuscado.tipoDoc,
        nif: nif.toUpperCase(),
        fechaAlta: new Date(),
        fechaBaja: null,
        fechaNacimiento: this.datosTrabajadorBuscado.fchNac,
        genero: this.datosTrabajadorBuscado.genero,
        idioma: JSON.parse(localStorage.userDataFromUsuario).idioma.idIdioma,
        puesto: null,
        ett: 'false',
        temporal: 'false',
        distancia: 'false',
        porcTad: 0,
        teletrabajo: 'false',
        horario_manana: false,
        horario_tarde: false,
        horario_noche: false,
        horario_fds: false,
        telefonoEmpresa: null,
        emailEmpresa: null,
      }
      this.datosTrabajadorBuscado.nif = nif.toUpperCase();
    } else {
      rl = {
        empresa: null,
        centro: null,
        idTrabajador: this.datosTrabajadorBuscado.idTrabajador,
        nombre: this.datosTrabajadorBuscado.nombre,
        apellidos: this.datosTrabajadorBuscado.apellidos,
        tipoDoc: this.datosTrabajadorBuscado.tipoDoc,
        nif: this.datosTrabajadorBuscado.nif.toUpperCase(),
        puesto: null,
        fechaAlta: new Date(),
        fechaBaja: null,
        fechaNacimiento: this.datosTrabajadorBuscado.fchNac,
        genero: this.datosTrabajadorBuscado.genero,
        idioma: this.datosTrabajadorBuscado.idioma,
        ett: 'false',
        temporal: 'false',
        distancia: 'false',
        porcTad: 0,
        teletrabajo: 'false',
        horario_manana: false,
        horario_tarde: false,
        horario_noche: false,
        horario_fds: false,
        telefonoEmpresa: null,
        emailEmpresa: null,
      }
    }


    this.setFormModAlta(rl);


    this.modAltaForm.controls["dniForm"].disable();
    this.modAltaForm.controls["fechaBajaForm"].disable();
    this.modAltaForm.controls["fechaAltaForm"].disable();


    this.showModAlta = true;
    this.spinner.hide();
  }

  /**
   * Metodo usado para filtrar puestos por criterio
   * @param clienteId
   * @param centroId
   * @param criterio
   */
  filtrarPuestos(clienteId: number, centroId: number, criterio: string){
    // Caso para cuando el cliente y el centro sea undefined
    if (clienteId == undefined && centroId == undefined){
      centroId = this.trabajador.centro.idCentro;
      clienteId = this.trabajador.empresa.idEmpresa;
    }

    this.spinner.show();
    this.puestosBuscados = [];
    this.userService.getPuestos(clienteId, centroId, criterio).subscribe(data => {
      if(data != undefined){
        let result: PuestoTrabajoNum[] = [];

        data.puestos.forEach((item) => {
          result.push({
            idPuestoTrabajo: item.id,
            nombre: item.denominacion,
            numTrabajadoresCentro: item.trabCentroPuesto,
            tipoPuesto: item.tipo
          });
        });

        this.puestosBuscados = result;
        if(this.puestosBuscados.length > 0 && criterio == '')
          this.existenPuestosCentro = true;
        else if(this.puestosBuscados.length <= 0 && criterio == '')
          this.existenPuestosCentro = false;

        this.dataSourcePT = new MatTableDataSource(result);
        this.dataSourcePT.paginator = this.paginatorPT;
        this.dataSourcePT.sort = this.sort;
      }
      this.spinner.hide();
    }, error => {
      this.utils.mostrarMensajeSwalFire('error', 'Ha ocurrido un error al intentar rescatar la información solicitada', '', 'var(--blue)', false);
      this.spinner.hide();
    })
  }

  comprobarPuestos(){
    if(this.puestoPrincipalSeleccionado != undefined && this.puestoPrincipalSeleccionado != null && this.puestoPrincipalSeleccionado != 0) {
      for (let puesto of this.puestosBuscados) {
        if (puesto.idPuestoTrabajo == this.puestoPrincipalSeleccionado)
          return false;
      }
      return true;
    }
    return false;
  }

  /**
   * Comprueba un cambio en el select de empresa y centros (escuchador de eventos)
   * @param centro
   * @param empresa
   */
  comprobarCambio(centro: SelectCentroFilterComponent, empresa: SelectEmpresaFilterComponent){
    if(this.swithunitario) {
      empresa.selectEmpresas.optionSelectionChanges.subscribe(data => {
        centro.userForm.controls['centroForm'].setValue(null);
        this.puestosBuscados = [];
      });

      centro.selectCentros.optionSelectionChanges.subscribe(data => {
        setTimeout(dat => {
          if (centro.userForm.value.centroForm != null && centro.userForm.value.centroForm != undefined && centro.userForm.value.empresaForm != null && centro.userForm.value.empresaForm != undefined){
            this.filtrarPuestos(centro.userForm.value.empresaForm, centro.userForm.value.centroForm, "");
          }
        }, 100);
      });
    }
    this.swithunitario = false;
  }

  comprobarCentro(idCentro: Number){
    if(idCentro != undefined && idCentro != undefined) {
      let empresas = JSON.parse(localStorage.userDataFromUsuario).empresas;
      let centroSeleccionado = null;

      for (let empresa of empresas) {
        for (let centro of empresa.centros) {
          if (centro.idCentro == idCentro) {
            centroSeleccionado = centro;
          }
        }
      }

      // comprobamos pt o vs o ambas
      if (centroSeleccionado.tienePT) {
        return 1;
      } else if (centroSeleccionado.tieneVS) {
        return 2;
      }
    }
    return 0;
  }

  eventoEntrar(empresa, centro, filtroPuestos) {
    if(empresa != undefined && centro != undefined != filtroPuestos != undefined) {
      this.filtrarPuestos(empresa, centro, filtroPuestos);
    }
  }

  modificarPuestoBool(){
    if(this.modificarPuesto)
      this.modificarPuesto = false;
    else
      this.modificarPuesto = true;
  }

  updateTabNames() {
    this.tabsList.forEach(tab => {
      if(tab.id === this.TABS_PREVENCION_TRABAJADORES.FORMACION) {
        this.translate.get('PERSONA_TRABAJADORA.FORMATION')
          .subscribe((res: string) => { tab.name = res; });
      } else if(tab.id === this.TABS_PREVENCION_TRABAJADORES.INFORMACION) {
        this.translate.get('PERSONA_TRABAJADORA.INFORMATION')
          .subscribe((res: string) => { tab.name = res; });
      } else if(tab.id === this.TABS_PREVENCION_TRABAJADORES.INFORMES_APTITUD) {
        this.translate.get('PERSONA_TRABAJADORA.CERTIFICATES_OF_APTITUDE')
          .subscribe((res: string) => { tab.name = res; });
      } else if(tab.id === this.TABS_PREVENCION_TRABAJADORES.EPI) {
        this.translate.get('PERSONA_TRABAJADORA.EPI')
          .subscribe((res: string) => { tab.name = res; });
      } else if(tab.id === this.TABS_PREVENCION_TRABAJADORES.ACCIDENTES) {
        this.translate.get('PERSONA_TRABAJADORA.ACCIDENTS')
          .subscribe((res: string) => { tab.name = res; });
      } else if(tab.id === this.TABS_PREVENCION_TRABAJADORES.AUTORIZACIONES) {
        this.translate.get('PERSONA_TRABAJADORA.AUTHORIZATIONS')
          .subscribe((res: string) => { tab.name = res; });
      } else if(tab.id === this.TABS_PREVENCION_TRABAJADORES.DOCUMENTACION) {
        this.translate.get('PERSONA_TRABAJADORA.DOCUMENTATION')
          .subscribe((res: string) => { tab.name = res; });
      } else if(tab.id === this.TABS_PREVENCION_TRABAJADORES.CITACIONES) {
        this.translate.get('PERSONA_TRABAJADORA.APPOINTMENT_HISTORY')
          .subscribe((res: string) => { tab.name = res; });
      } else if(tab.id === this.TABS_PREVENCION_TRABAJADORES.TRABAJO_DISTANCIA) {
        this.translate.get('PERSONA_TRABAJADORA.REMOTE_WORK')
          .subscribe((res: string) => { tab.name = res; });
      }
    });
  }

  downloadWorkerCardSummary(): void {
    this.spinner.show();
    const filterData = this.utils.formatCardSummaryDto(this.trabajador);

    const errorText = this.utils.translateText('ERROR_EN_LA_DESCARGA','Ha ocurrido un error en la descarga');
    this.workerUtils.getCardSummary(filterData).subscribe(
      pdfBase64 => {
        this.spinner.hide();
        if(pdfBase64){
          const linkSource = `data:application/pdf;base64,${pdfBase64.file}`;
          const filename = pdfBase64.name + pdfBase64.extension;
          const downloadLink = document.createElement('a');
          downloadLink.href = linkSource;
          downloadLink.download = filename;
          downloadLink.click();
        } else {
          this.utils.mostrarMensajeSwalFire('error', '', errorText,'var(--blue)', false);
        }
      },
      error => {
        this.spinner.hide();
        console.log(error);
        this.utils.mostrarMensajeSwalFire('error', '', errorText,'var(--blue)', false);
      }
    );
  }

  updateFileOptionsTranslations (): void {
    this.workerFileOptions[0].name = this.utils.translateText('PLANIFICACION_PRL.DOCUMENTATION_DOWNLOAD','Descargar documentación');
    this.workerFileOptions[1].name = this.utils.translateText('PLANIFICACION_PRL.SUMMARY_CARD','Ficha resumen');
    this.workerFileOptions[2].name = this.utils.translateText('COMPARTIR','Compartir');
  }

  downloadWorkerDocuments(): void {
    const downloadAllDocumentsDto: DownloadAllDocumentsDto = {
      cardSummaryDto: {},
      formationTabDto: {},
      aptitudeTabDto: {},
      documentsTabDto: {}
    };
    downloadAllDocumentsDto.cardSummaryDto = this.utils.formatCardSummaryDto(this.trabajador);
    downloadAllDocumentsDto.formationTabDto = this.utils.formatFormationTabDto(this.trabajador);
    downloadAllDocumentsDto.aptitudeTabDto = this.utils.formatAptitudeTabDto(this.trabajador);
    downloadAllDocumentsDto.documentsTabDto = this.utils.formatDocumentTabDto(this.trabajador);

    this.spinner.show();
    this.utils.downloadWorkerDocuments(downloadAllDocumentsDto).subscribe(
      zipBase64 => {
        if (zipBase64.file) {
          const zipFile = document.createElement('a');
          zipFile.href = `data:application/zip;base64,${zipBase64.file}`;
          zipFile.download = this.utils.translateText('PERSONA_TRABAJADORA.DOCUMENTATION', 'Documentación');
          zipFile.click();
        }
      }, error => {
        console.log(error);
      }, () => {
        this.spinner.hide();
      });
  }

  shareWorkerCardSummary(): void {
    const dialogConfig = new MatDialogConfig();
    const menuNameComponent = this.utils.translateText('PERSONA_TRABAJADORA.FICHA', 'Persona Trabajadora');
    const subMenuNameComponent = this.utils.translateText('PERSONA_TRABAJADORA.DOCUMENTATION', 'Documentación');
    const sendingInfoTitle = this.utils.translateText('ENVIO_DOC_INICIADA', 'Se ha procedido al envío por correo electrónico de la documentación indicada');
    const sendingErrorTitle = this.utils.translateText('ERROR_ENVIO_MENSAJE', 'Error al enviar el mensaje');
    dialogConfig.data = {
      element: {name: 'ficha de resumen', extension: '.pdf'},
      menuName: menuNameComponent,
      subMenuName: subMenuNameComponent
    };
    dialogConfig.width = "50%";
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;

    const dialogRef = this.dialog.open(ShareDocumentComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
        if(result !== undefined){
          this.spinner.show();
          let email: WorkerSummaryCardEmail = {
            receiverEmail: result.emailFormControl,
            ccReceiverEmail: result.ccFormControl,
            ccoReceiverEmail: result.ccoFormControl,
            subject: result.subjectFormControl,
            body: result.bodyFormControl,
            workerData: this.utils.formatCardSummaryDto(this.trabajador)
          };
          this.workerUtils.shareCardSummary(email).subscribe(
            value => {
              if(value === true){
                this.utils.mostrarMensajeSwalFire('info', sendingInfoTitle, '','var(--blue)', false);
              }
              else{
                this.utils.mostrarMensajeSwalFire('error', sendingErrorTitle, '','var(--blue)', false);
              }
            },
            error => {
              console.log(error);
              this.utils.mostrarMensajeSwalFire('error', sendingErrorTitle, '','var(--blue)', false);
            }
          ).add(() => this.spinner.hide());
        }
      }
    );
  }

}
