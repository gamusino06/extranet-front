import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../environments/environment';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PdfView } from 'src/app/modales/pdfView/pdfView.component';
import { Empresa } from 'src/app/Model/Empresa';
import { Centro } from 'src/app/Model/Centro';
import Swal from 'sweetalert2';
import { UserService } from 'src/app/services/user.service';
import { UtilsService } from 'src/app/services/utils.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Globals } from '../globals';
import * as XLSX from 'xlsx';
import { ShareDocumentComponent } from 'src/app/modales/shareDocument/shareDocument.component';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import * as _moment from 'moment';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {MY_FORMATS} from '../../../config/config';
import { HistoricoAccionesDocumentoComponent } from 'src/app/modales/historicoAccionesDocumento/historicoAccionesDocumento.component';
import { TranslateService } from '@ngx-translate/core';
import { ChangeDetectorRef } from '@angular/core';
import {any} from "codelyzer/util/function";
import {AssigmentContract} from '../../Model/AssigmentContract';
import {EstadoReciclaje} from '../../Model/Estado';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

const moment =  _moment;
const red_color = "#F01F1F";
const yellow_color = "#FED74D";
const green_color = "#45925A";


export interface FormacionCertificadosInterface {
  idDocumento: number;
  fechaFin: string;
  fechaReciclaje: string;
  empresa: string;
  centro: string;
  tipoDocumento: string;
  idTipoDocumento: number;
  idCurso: string;
  nombreCurso: string;
  modalidadCurso: string;
  trabajador: string;
  nifTrabajador: string,
  puestoTrabajo: string[];
  horas: string;
  subcategoria: string;
  tipoReciclaje: string;
  accionesRealizadas: boolean;
  ubicacion: string;
  listaHistoricoDocumentoDto: any[];
  documentosHijos: any[];
}

@Component({
  selector: 'app-formacion-certificados',
  templateUrl: './formacion-certificados.component.html',
  styleUrls: ['./formacion-certificados.component.css'],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})
export class FormacionCertificadosComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    public utils: UtilsService,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
    public globals: Globals,
    public translate: TranslateService,
    private cdRef:ChangeDetectorRef
  ) { }
  environment = environment;
  documentationForm: FormGroup;
  empresasList: Empresa[];
  centroList: Centro[];
  subTipoDocumentoList: any;
  subCategoriaFormacionList: any;
  tipoReciclajeList: any;
  estadoList: EstadoReciclaje[];
  tipoFechaList: any;
  mostrarTabla: boolean;
  isLoginSimulado: boolean = false;

  protected _onDestroy = new Subject<void>();

  //validators
  validator = this.globals.workerPattern;
  validPuesto = this.globals.puestoPattern;

  closeImgUrl = '../../assets/img/close.svg';
  searchImgUrl = '../../assets/img/search.svg';
  cleanImgUrl = '../../assets/img/borrar_filtros.svg';
  excelImgUrl = '../../assets/img/excel.svg';
  mailImgUrl = '../../assets/img/mail.svg';
  downloadImgUrl = '../../assets/img/download.svg';
  downloadForOfflineImgUrl = '../../assets/img/download_for_offline.svg';
  maxDate: Date;
  minDate: Date;

  tableHeaders: string[] = [
    'checklist',
    'newList',
    'semaforo',
    'fechaFin',
    'fechaReciclaje',
    'nombreCurso',
    'horas',
    'trabajador',
    'puestoTrabajo',
    'specialAction'];

  idCompaniesSelectedList = [];
  idCentrosSelectedList = [];
  tipoDocumentoId: any;
  medDocDataDto: any;
  dataSource: any;
  dataSourceAux = new MatTableDataSource<FormacionCertificadosInterface>();

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('TABLEFORMACIONCERTIFICADOS') table: ElementRef;
  @ViewChild('TABLEFORMACIONCERTIFICADOS') exportTableDirective: ElementRef;

  //Evita que se produzca el ERROR Error: ExpressionChangedAfterItHasBeenCheckedError
  ngAfterViewChecked()
  {
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    //En el caso de que se esté realizando un loginSimulado, no tendrá que guardarse
    let loginSimulado = localStorage.getItem("loginSimulado");
    if (loginSimulado !== null && loginSimulado === "true")
      this.isLoginSimulado = true;

    this.mostrarTabla = false;
    /*inicializacion de formulario*/
    this.initForm();
    this.getUserData();
    this.getSubTipoDocumento();
    this.getSubCategoriaFormacion();
    this.getTipoReciclaje();
    this.getEstadoList();
    this.getTipoFecha();
    this.initColsOrder();
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

    this.documentationForm.controls.centroForm.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        if (this.documentationForm.controls.centroForm.value.length <= 0) {
          this.documentationForm.controls.subTipoDocForm.setValue([]);
        }
      });

  }


  initColsOrder() {
    if (localStorage.getItem('tableColsOrder')) {
      let localStorageObj: object;
      localStorageObj = JSON.parse(localStorage.getItem('tableColsOrder'));
      if (localStorageObj[this.constructor.name] &&
        Array.isArray(localStorageObj[this.constructor.name]) &&
        localStorageObj[this.constructor.name].length == this.tableHeaders.length)
        this.tableHeaders = localStorageObj[this.constructor.name];
    }
  }

  initForm() {
    //'activoForm' seteado a 1 por petición del cliente
    this.documentationForm = this.formBuilder.group({
      empresaForm: new FormControl(''),
      selectEmpresasRadioForm: new FormControl('1'),
      centroForm: new FormControl(''),
      selectCentrosRadioForm: new FormControl('1'),
      puestoTrabajoForm: new FormControl(''),
      trabajadorODniForm: new FormControl(''),
      activoForm: new FormControl(1),
      subTipoDocForm: new FormControl(''),
      subCategoriaForm: new FormControl(''),
      subCategoriaDocForm: new FormControl(''),
      tipoReciclajeForm: new FormControl(''),
      nombreCursoForm: new FormControl(''),
      tipoFechaForm: new FormControl(1),
      fechaDesdeForm: new FormControl(moment()),
      fechaHastaForm: new FormControl(moment()),
      estadoForm: new FormControl(''),
      selectAllCheckBox: new FormControl(''),
      todosCentrosForm: true
    }
    );
    this.setInitDates();
  }

  setInitDates() {
    var now = new Date();
    now.setHours(23, 59, 59);
    this.maxDate = now;
    var nYearsAgo = new Date();
    nYearsAgo.setDate(nYearsAgo.getDate() - (365 * this.globals.extranet_intervalo_fechas_filtro));
    nYearsAgo.setHours(0, 0, 0);
    this.minDate = nYearsAgo;
    this.documentationForm.controls['fechaDesdeForm'].setValue(nYearsAgo);
    this.documentationForm.controls['fechaHastaForm'].setValue(now);
  }

  getUserData(): void {
    this.userService.getUser().subscribe(user => {
      this.empresasList = user.empresas;
      this.updateEmpresasYCentros();
      //this.getFilteredDocuments();//NOTA IMPORTANTE: Por petición de PREVING (13/01/2022) a partir de ahora las pantallas con descarga de documentos, se omite la 1º llamada.
    });
  }

  updateEmpresasYCentros() {
    if (this.empresasList.length == 1) {
      this.documentationForm.controls.empresaForm.setValue([this.empresasList[0].idEmpresa]);
    }
  }

  getSubTipoDocumento() {
    this.userService.getSubtiposDocumentoRegistrosFormacion([this.globals.diplomas]).subscribe(result => {
      if(result){
      	this.subTipoDocumentoList = result;
      }else{
      	this.spinner.hide();
      }
    }, (error => {
      if (environment.debug) console.log("Error al cargar los tipos de documento: " + error);
    }));
  }

  getSubCategoriaFormacion() {
    this.userService.getSubcategoriasFormacion().subscribe(result => {
      if(result){
      	this.subCategoriaFormacionList = result;
      }else{
      	this.spinner.hide();
      }
    }, (error => {
      if (environment.debug) console.log("Error al cargar las subcategorias de documentos: " + error);
    }));
  }

  getTipoReciclaje() {
    this.userService.getTiposReciclaje().subscribe(result => {
      if(result){
        // Add the N/A option
        result.push({ idTipoReciclaje: 0, nombre: 'NO_PROCEDE'})
      	this.tipoReciclajeList = result;
      }else{
      	this.spinner.hide();
      }
    }, (error => {
      if (environment.debug) console.log("Error al cargar los tipos de reciclaje: " + error);
    }));
  }

  getEstadoList() {
    var estadoReciclajeVigente = new EstadoReciclaje();
    estadoReciclajeVigente.id = 'VG';
    estadoReciclajeVigente.descripcion = 'VIGENTE';

    var estadoReciclajeProximoReciclar = new EstadoReciclaje();
    estadoReciclajeProximoReciclar.id = 'PR';
    estadoReciclajeProximoReciclar.descripcion = 'PROXIMO_RECICLAR';

    var estadoReciclajeProcedeReciclar = new EstadoReciclaje();
    estadoReciclajeProcedeReciclar.id = 'DR';
    estadoReciclajeProcedeReciclar.descripcion = 'PROCEDE_RECICLAR';

    this.estadoList = [estadoReciclajeVigente, estadoReciclajeProximoReciclar, estadoReciclajeProcedeReciclar];
  }




  getTipoFecha() {
    this.tipoFechaList = [
      { idTipoFecha: 1, nombre: 'FECHA_CURSO' },
      { idTipoFecha: 2, nombre: 'FECHA_RECICLAJE' }
    ]
  }

  isMasFormacionSelected() {
    var subTipoDocFormValue = this.documentationForm.get('subTipoDocForm').value;
    if(Array.isArray(subTipoDocFormValue)) {
      var masFormacionSelected = subTipoDocFormValue.includes(parseInt(this.globals.otra_formacion));
      if(!masFormacionSelected){
        this.documentationForm.get('subCategoriaForm').setValue([]);
      }
      return masFormacionSelected;
    } else {
      return false;
    }
  }

  isAnyCenterSelected() {
    if(this.documentationForm.get('centroForm').value !== undefined && this.documentationForm.get('centroForm').value.length > 0){
      this.documentationForm.get('subTipoDocForm').setValue([this.subTipoDocumentoList[0].idTipoDocumento]);
      this.documentationForm.get('subCategoriaForm').setValue([]);
      return true;
    }
    else{
      return false;
    }

  }

  onSubmit() {
    this.getFilteredDocuments();
  }

  resetForm(): void {
    setTimeout(() => { //setTimeout needed on form reset
        this.documentationForm.get('empresaForm').setValue([]);
        this.documentationForm.get('selectEmpresasRadioForm').setValue("1");
        this.documentationForm.get('centroForm').setValue([]);
        this.documentationForm.get('selectCentrosRadioForm').setValue("1");
        this.documentationForm.get('puestoTrabajoForm').setValue("");
        this.documentationForm.get('trabajadorODniForm').setValue([]);
        this.documentationForm.get('activoForm').setValue(1); //'activoForm' seteado a 1 por petición del cliente
        this.documentationForm.get('subTipoDocForm').setValue([]);
        this.documentationForm.get('subCategoriaForm').setValue([]);
        this.documentationForm.get('tipoReciclajeForm').setValue([]);
        this.documentationForm.get('nombreCursoForm').setValue("");
        this.documentationForm.get('tipoFechaForm').setValue(1);
        this.documentationForm.get('estadoForm').setValue([]);
        this.setInitDates();
        //this.getUserData();
        //this.getSubTipoDocumento();  //NOTA IMPORTANTE: No se vuelve a obtener los documentos cuando se limpie el filtro por petición de Preving (23/09/2021)
        this.updateEmpresasYCentros();
        this.initColsOrder();
    });
  }

  getFilteredDocuments() {
    let idCompaniesListResult: number[] = [];
    let idCentrosListResult: number[] = [];

    if ((this.documentationForm.get('empresaForm').value === "") || (this.documentationForm.get('empresaForm').value && this.documentationForm.get('empresaForm').value.length == 0)) {
      this.idCompaniesSelectedList = [];
      idCompaniesListResult = this.idCompaniesSelectedList;
    } else {
      idCompaniesListResult = this.documentationForm.get('empresaForm').value;
    }

    if ((this.documentationForm.get('centroForm').value === "") || (this.documentationForm.get('centroForm').value && this.documentationForm.get('centroForm').value.length == 0)) {
      this.idCentrosSelectedList = [];
      idCentrosListResult = this.idCentrosSelectedList;
    } else {
      idCentrosListResult = this.documentationForm.get('centroForm').value;
    }

    this.tipoDocumentoId = this.globals.diplomas;

    let fechaFin;
    if (this.documentationForm.get('fechaHastaForm').value!==null)
    {
      fechaFin = new Date(this.documentationForm.get('fechaHastaForm').value);
      fechaFin.setHours(23, 59, 59);
    }

    let fechaInicio;
    if (this.documentationForm.get('fechaDesdeForm').value!==null)
    {
      fechaInicio = new Date(this.documentationForm.get('fechaDesdeForm').value);
      fechaInicio.setHours(0, 0, 0);
    }

    let listaIdsTipoDocumento = [];
    if (this.documentationForm.get('subTipoDocForm').value && this.documentationForm.get('subTipoDocForm').value.length > 0)
      listaIdsTipoDocumento = this.documentationForm.get('subTipoDocForm').value;
    else
      listaIdsTipoDocumento = [this.tipoDocumentoId];

    let idEmpresasList: number[] = [];
    let idCentrosList: number[] = [];
    //Método que comprueba si alguno de los filtros de Empresa y Centro está en 'activo' o en 'inactivo' y va añadiendo empresas/centros a sus respectivas listas
    this.utils.envioDatosConFiltroActivoInactivo (this.documentationForm.get('selectEmpresasRadioForm').value,
                                        this.documentationForm.get('selectCentrosRadioForm').value,
                                        this.documentationForm.get('empresaForm').value,
                                        this.documentationForm.get('centroForm').value,
                                        this.empresasList,
                                        idEmpresasList,
                                        idCentrosList);

    let idsListResult: any[] = [];
    //Se comprueba si el usuario había seleccionado alguna empresa/centro en los campos 'empresaForm' y 'centroForm' para
    //alterar o no los atributos a enviar al BACK
    idsListResult = this.utils.valoraListasFinalesAEnviarConFiltro(this.documentationForm.get('empresaForm').value,
                                        this.documentationForm.get('centroForm').value,
                                        this.empresasList,
                                        idEmpresasList,
                                        idCentrosList);

    idCompaniesListResult = idsListResult[0];
    idCentrosListResult = idsListResult[1];

    this.medDocDataDto = {
      listaIdsTipoDocumento: listaIdsTipoDocumento,
      listaIdsEmpresas: idCompaniesListResult,
      listaIdsCentros: idCentrosListResult,
      fechaInicio: fechaInicio || '',
      fechaFin: fechaFin || '',
      listaFiltroMetadatosDto: [
        {
          nombreMetadato: this.globals.metadato_trabajador_activo,
          listaIdsValoresDato: this.documentationForm.get('activoForm').value ? [this.documentationForm.get('activoForm').value] : []
        }
        ,
        {
          nombreMetadato: this.globals.metadato_nombre_curso,
          listaIdsValoresDato: this.documentationForm.get('nombreCursoForm').value ? [this.documentationForm.get('nombreCursoForm').value] : []
        }
        ,
        {
          nombreMetadato: this.globals.metadato_puesto_trabajo,
          listaIdsValoresDato: this.documentationForm.get('puestoTrabajoForm').value ? [this.documentationForm.get('puestoTrabajoForm').value] : []
        }
        ,
        {
          nombreMetadato: this.globals.metadato_nombre_o_nif_trabajador,
          listaIdsValoresDato: (this.documentationForm.get('trabajadorODniForm').value && this.documentationForm.get('trabajadorODniForm').value.length > 0) ? [this.documentationForm.get('trabajadorODniForm').value] : []
        }
        ,
        {
          nombreMetadato: this.globals.metadato_subcategoria_formacion,
          listaIdsValoresDato: (this.documentationForm.get('subCategoriaForm').value && this.documentationForm.get('subCategoriaForm').value.length > 0) ? this.documentationForm.get('subCategoriaForm').value : []
        }
        ,
        {
          nombreMetadato: this.globals.metadato_tipo_reciclaje,
          listaIdsValoresDato: (this.documentationForm.get('tipoReciclajeForm').value && this.documentationForm.get('tipoReciclajeForm').value.length > 0) ? this.documentationForm.get('tipoReciclajeForm').value : []
        }
        ,
        {
          nombreMetadato: this.globals.metadato_tipo_fecha,
          listaIdsValoresDato: this.documentationForm.get('tipoFechaForm').value ? [this.documentationForm.get('tipoFechaForm').value] : []
        }
        ,
        {
          nombreMetadato: this.globals.metadato_estado_reciclaje,
          listaIdsValoresDato: (this.documentationForm.get('estadoForm').value && this.documentationForm.get('estadoForm').value.length > 0) ? this.documentationForm.get('estadoForm').value : []
        }
      ]
    }

    this.spinner.show();
    this.userService.getMedicalDocuments(this.medDocDataDto).subscribe(results => {
      let result: FormacionCertificadosInterface[] = [];
      if (results != undefined) {
        results.forEach(item => {
          var nDatoIdCurso = 0;
          var nDatoCurso = 0;
          var nDatoModalidad = 0;
          var nDatoHoras = 0;
          var nDatoTrabajador = 0;
          var nDatoAniosReciclaje = 0;
          var nDatoTipoReciclaje = 0;
          var nDatoSubcategoriaFormacion = 0;

          var c = 0;
          item.datos.forEach(dato => {
            if (dato.nombre === this.globals.metadato_id_curso) nDatoIdCurso = c;
            if (dato.nombre === this.globals.metadato_curso) nDatoCurso = c;
            if (dato.nombre === this.globals.metadato_modalidad) nDatoModalidad = c;
            if (dato.nombre === this.globals.metadato_horas) nDatoHoras = c;
            if (dato.nombre === this.globals.metadato_trabajador) nDatoTrabajador = c;
            if (dato.nombre === this.globals.metadato_tipo_reciclaje) nDatoTipoReciclaje = c;
            if (dato.nombre === this.globals.metadato_anios_reciclaje) nDatoAniosReciclaje = c;
            if (dato.nombre === this.globals.metadato_subcategoria_formacion) nDatoSubcategoriaFormacion = c;

            c++;
          })

          let num = item.datos[nDatoHoras]?.valor;
          let horas = '0';
          try
          {
            horas = parseFloat(num).toFixed(2).replace('.',',');
          }catch(err){
          }

          var fechaReciclajeVar = item.datos[nDatoAniosReciclaje]?.valor > 0 ? moment(item.fechaDocumento).add(item.datos[nDatoAniosReciclaje].valor, 'years').format('YYYY-MM-DD') : undefined;

          // Filtro por estados: colores de semáforo, comentamos para meter el filtro en el back, ya que aqui en el front parece bastante
          // lento
          //if(this.passFilterState(fechaReciclajeVar)){
            result.push({
              idDocumento: item.idDocumento,
              fechaFin: item.fechaDocumento,
              fechaReciclaje: fechaReciclajeVar,
              empresa: item.empresa?.nombre,
              centro: item.centro?.nombre,
              tipoDocumento: item.tipoDocumento?.nombre,
              idTipoDocumento: item.tipoDocumento?.idTipoDocumento,
              idCurso: item.datos[nDatoIdCurso]?.valor,
              nombreCurso: item.datos[nDatoCurso]?.valor,
              modalidadCurso: item.datos[nDatoModalidad]?.valor,
              trabajador: item.datos[nDatoTrabajador]?.valorDto?.nombre + ' ' + item.datos[nDatoTrabajador]?.valorDto?.apellidos + '<br>' + item.datos[nDatoTrabajador]?.valorDto?.nif,
              nifTrabajador: item.datos[nDatoTrabajador]?.valorDto?.nif,
              puestoTrabajo: item.datos[nDatoTrabajador]?.valorDto?.puestoTrabajoDtoList,
              horas: horas,
              subcategoria: item.datos[nDatoSubcategoriaFormacion]?.valor,
              tipoReciclaje: item.datos[nDatoTipoReciclaje]?.valor,
              accionesRealizadas: item.accionesRealizadas,
              ubicacion: item.ubicacion,
              listaHistoricoDocumentoDto: [],
              //listaHistoricoDocumentoDto: item?.listaHistoricoDocumentoDto || [] //Se comenta ya que ahora el Back sólo va a devolver si tiene acciones realizadas o no
              documentosHijos: item?.documentosHijos || []
            });
          //}
        });

        this.dataSource = new MatTableDataSource(result);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        //Fix sort problem: sort mayúsculas y minúsculas
        this.dataSource.sortingDataAccessor = (item, property) => {
          if (!item[property])
            return "";

          if (property == 'fecha')
            return new Date(item.fecha);

          if (property == 'horas')
            return Number(item[property]);

          if (typeof item[property] === 'string')
            return item[property].toLocaleLowerCase();

          return item[property];

        };

        //variable auxiliar
        this.dataSourceAux = new MatTableDataSource(results);
        this.dataSourceAux.sort = this.sort;
        this.dataSourceAux.paginator = this.paginator;

        this.dataSourceAux.sortingDataAccessor = (item, property) => {
          if (!item[property])
            return "";

          if (property == 'fecha')
            return new Date(item.fechaFin);

          if (typeof item[property] === 'string')
            return item[property].toLocaleLowerCase();

          return item[property];
        };

        this.mostrarTabla = true;
        if (environment.debug) console.log("Succes");
      }
      this.spinner.hide();
    }), (error => {
      if (environment.debug) console.log("Error");
    })
  }

  previsualizar(element) {
    this.spinner.show();
    this.medDocDataDto = {
      listaIdsDocumentos: [element.idDocumento],
      listaIdsTiposDocumentos: [element.idTipoDocumento],
      listaUuidsDocumentos: [element.ubicacion],
      loginSimuladoActivado: this.isLoginSimulado,
      accion: { idAccionDoc: "3" }
    }
    this.utils.getFile(this.medDocDataDto).subscribe(pdfBase64 => {
      if(pdfBase64){
        const byteArray = new Uint8Array(atob(pdfBase64.fichero).split('').map(char => char.charCodeAt(0)));
        let blob = new Blob([byteArray], { type: 'application/pdf' });
        // Here is your URL you can use
        const url = window.URL.createObjectURL(blob);
        // i.e. display the PDF content via iframe
        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = url;
        dialogConfig.width = "50%";
        dialogConfig.hasBackdrop = true;
        dialogConfig.disableClose = true;

        const dialogRef = this.dialog.open(PdfView, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
        });

        //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
        if (!this.isLoginSimulado){
          //despues tenemos que volver a traer la lista de documentos
          //para refrescar la pagina y que se vean los iconos de Nuevo correctamente
          //this.getFilteredDocuments();
          this.utils.recargarTablaDatosPorAccion(element, this.dataSource.filteredData, this.spinner, false, null, false, null, false);
        }
      }
      this.spinner.hide();

    })
  }

  /*descargar seleccion*/
  descargar(element) {
    this.spinner.show();
    this.medDocDataDto = any;
      //const filename = element.idDocumento + ' - ' + element.nombreCurso + '.pdf';
    if (Number(element.tipoDocumento.idTipoDocumento) > 0) {
      this.medDocDataDto = {
        listaIdsDocumentos: [element.idDocumento],
        listaIdsTiposDocumentos: [element.tipoDocumento.idTipoDocumento],
        listaUuidsDocumentos: [element.ubicacion],
        loginSimuladoActivado: this.isLoginSimulado,
        accion: { idAccionDoc: "2" }
      }
    } else {
      this.medDocDataDto = {
        listaIdsDocumentos: [element.idDocumento],
        listaIdsTiposDocumentos: [element.idTipoDocumento],
        listaUuidsDocumentos: [element.ubicacion],
        loginSimuladoActivado: this.isLoginSimulado,
        accion: { idAccionDoc: "2" }
      }
    }
    this.utils.getFile(this.medDocDataDto).subscribe(pdfBase64 => {
      if(pdfBase64){
        const linkSource = `data:application/pdf;base64,${pdfBase64.fichero}`;
        const filename = pdfBase64.nombreFichero + '.pdf';
        const downloadLink = document.createElement('a');
        downloadLink.href = linkSource;
        downloadLink.download = filename;
        downloadLink.click();

        //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
        if (!this.isLoginSimulado){
          //despues tenemos que volver a traer la lista de documentos
          //para refrescar la pagina y que se vean los iconos de Nuevo correctamente
          //this.getFilteredDocuments();
          this.utils.recargarTablaDatosPorAccion(element, this.dataSource.filteredData, this.spinner, false, null, false, null, false);
        }
      }
      this.spinner.hide();

    })
  }

  /*compartir */
  compartir(element) {
    this.compartirData(element, 1);
  }

  descargarMultiple() {
    this.spinner.show();
    let listaIdsDocumentos: number[] = [];
    let listaIdsTiposDocumentos: number[] = [];
    let listaUuidsDocumentos: string[] = [];
    if (this.dataSource.data) {
      this.dataSource.data.forEach(documento => {
        if (documento.checked) {
          listaIdsDocumentos.push(documento.idDocumento);
          listaIdsTiposDocumentos.push(documento.idTipoDocumento);
          listaUuidsDocumentos.push(documento.ubicacion);
        }
      });

      if (listaIdsDocumentos.length > 0 && listaIdsDocumentos.length <= this.globals.extranet_maximo_documentos_multiple) {
        this.utils.getZipFile({
          listaIdsDocumentos,
          listaIdsTiposDocumentos,
          listaUuidsDocumentos,
          loginSimuladoActivado: this.isLoginSimulado,
          accion: { idAccionDoc: "2" }
        }).subscribe(zipBase64 => {
          if(zipBase64){
            //Variables para traducción
            var nombreZip = "Diplomas Certificados";
            this.translate.get('DIPLOMAS_CERTIFICADOS').subscribe((res: string) => {
              nombreZip = res;
            });
            let downloadLink = document.createElement('a');
            downloadLink.href = `data:application/zip;base64,${zipBase64.fichero}`;
            downloadLink.download = nombreZip + '.zip';
            downloadLink.click();

            //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
            if (!this.isLoginSimulado){
              //despues tenemos que volver a traer la lista de documentos
              //para refrescar la pagina y que se vean los iconos de Nuevo correctamente
              let jsonInfoDocumentosDto: any[] = [];
              listaIdsDocumentos.forEach(idDocumentoInfo => {
                  let jsonInfoDocumentoDto = {
                    idDocumento: idDocumentoInfo
                  };
                  jsonInfoDocumentosDto.push(jsonInfoDocumentoDto);
              });
              //this.getFilteredDocuments();
              this.utils.recargarTablaDatosMultiplePorAccion(jsonInfoDocumentosDto, this.dataSource.filteredData, this.spinner, false, null, false, null, false);
            }
          }
          this.spinner.hide();

        })
      }else if (listaIdsDocumentos.length > this.globals.extranet_maximo_documentos_multiple){
      	this.spinner.hide();
      	this.utils.mostrarMensajeSwalFireSobrepasadoLimiteDescargaMultiple(listaIdsDocumentos.length);
      }else{
        this.spinner.hide();
        let titulo = "Debe seleccionar al menos un elemento a descargar";
        this.translate.get('ERROR_SELECCIONA_DESCARGAR').subscribe((res: string) => {
          titulo = res;
        });
        this.utils.mostrarMensajeSwalFire('error', titulo, '', 'var(--blue)', false);
      }
    }
  }

  /*compartir Múltiple */
  compartirMultiple() {
    let listaIdsDocumentos: number[] = [];
    let listaDocumentos: any[] = [];
    if (this.dataSource.data) {
      this.dataSource.data.forEach(documento => {
        if (documento.checked) {
          listaDocumentos.push(documento);
          listaIdsDocumentos.push(documento.idDocumento);
        }
      });
    }
    if (listaIdsDocumentos.length > 0 && listaIdsDocumentos.length <= this.globals.extranet_maximo_documentos_multiple){
        this.compartirMultipleData(listaIdsDocumentos, 1, listaDocumentos);
    }else if (listaIdsDocumentos.length > this.globals.extranet_maximo_documentos_multiple){
        this.utils.mostrarMensajeSwalFireSobrepasadoLimiteDescargaMultiple(listaIdsDocumentos.length);
    }else{
        let titulo = "Debe seleccionar al menos un elemento a compartir";
        this.translate.get('ERROR_SELECCIONA_COMPARTIR').subscribe((res: string) => {
          titulo = res;
        });
        this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
    }
  }

  /*compartir múltiple*/
  compartirMultipleData(listaIdsDocumentos, mode, listaDocumentos) {

    let listaIdsTiposDocumentos: number[] = [];
    let listaUuidsDocumentos: string[] = [];
    listaDocumentos.forEach(documento => {
      listaIdsTiposDocumentos.push(documento.idTipoDocumento);
      listaUuidsDocumentos.push(documento.ubicacion);
    });

    let menuNameComponent = 'Documentación Vigilancia';
    this.translate.get('DOCUMENTACION_VIGILANCIA').subscribe((res: string) => {
      menuNameComponent = res;
    });
    let subMenuNameComponent = 'Registros de formación';
    this.translate.get('REGISTROS_FORMACION').subscribe((res: string) => {
      subMenuNameComponent = res;
    });
    let filenameComponent = subMenuNameComponent;

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      element: listaDocumentos,
      menuName: menuNameComponent,
      subMenuName: subMenuNameComponent
    };
    dialogConfig.width = "50%";
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;

    const dialogRef = this.dialog.open(ShareDocumentComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined) {
        let data = {
          to: result.emailFormControl,
          cc: result.ccFormControl,
          cco: result.ccoFormControl,
          subject: result.subjectFormControl,
          body: result.bodyFormControl,

          documentoDownloadDto: {
            listaIdsDocumentos,
            listaIdsTiposDocumentos,
            listaUuidsDocumentos,
            loginSimuladoActivado: this.isLoginSimulado,
            accion: {
              idAccionDoc: mode
            },
            filename: filenameComponent + ".zip"
          }
        }

         let titulo = "Se ha procedido al envío por correo electrónico de la documentación indicada";
         this.translate.get('ENVIO_DOC_INICIADA').subscribe((res: string) => {
           titulo = res;
         });
        this.utils.mostrarMensajeSwalFire('info', titulo, '','var(--blue)', false);
        this.utils.compartirDocumentoZip(data).subscribe(result => {
          if (!result) {
            let titulo = "Error al enviar el mensaje";
            this.translate.get('ERROR_ENVIO_MENSAJE').subscribe((res: string) => {
              titulo = res;
            });
            this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
          }else{
             //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
             if (!this.isLoginSimulado){
               //Recarga los datos de nuevo para quitar nuevo documento y mostrar las acciones de los documentos
               let jsonInfoDocumentosDto: any[] = [];
               listaIdsDocumentos.forEach(idDocumentoInfo => {
                  let jsonInfoDocumentoDto = {
                    idDocumento: idDocumentoInfo
                  };
                  jsonInfoDocumentosDto.push(jsonInfoDocumentoDto);
               });

               //this.getFilteredDocuments();
               this.utils.recargarTablaDatosMultiplePorAccion(jsonInfoDocumentosDto, this.dataSource.filteredData, this.spinner, false, null, false, null, false);
             }
          }
        }), (error => {
          if (environment.debug) console.log("Error al Enviar EMAIL - Compartir Documento");
        });
      }
    });

  }

  /*compartir selección*/
  compartirData(element, mode) {

    let menuNameComponent = 'Documentación Vigilancia';
    this.translate.get('DOCUMENTACION_VIGILANCIA').subscribe((res: string) => {
      menuNameComponent = res;
    });
    let subMenuNameComponent = 'Registros de formación';
    this.translate.get('REGISTROS_FORMACION').subscribe((res: string) => {
      subMenuNameComponent = res;
    });

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      element: element,
      menuName: menuNameComponent,
      subMenuName: subMenuNameComponent
    };
    dialogConfig.width = "50%";
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;

    const dialogRef = this.dialog.open(ShareDocumentComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined) {
        let data = {
          to: result.emailFormControl,
          cc: result.ccFormControl,
          cco: result.ccoFormControl,
          subject: result.subjectFormControl,
          body: result.bodyFormControl,

          documentoDownloadDto: {
            listaIdsDocumentos: [element.idDocumento],
            listaIdsTiposDocumentos: [element.idTipoDocumento],
            listaUuidsDocumentos: [element.ubicacion],
            loginSimuladoActivado: this.isLoginSimulado,
            accion: {
              idAccionDoc: mode
            },
            filename: element.tipoDocumento + ".pdf"
          }
        }

         let titulo = "Se ha procedido al envío por correo electrónico de la documentación indicada";
         this.translate.get('ENVIO_DOC_INICIADA').subscribe((res: string) => {
           titulo = res;
         });
        this.utils.mostrarMensajeSwalFire('info', titulo, '','var(--blue)', false);
        this.utils.compartirDocumento(data).subscribe(result => {
          if (!result) {
            let titulo = "Error al enviar el mensaje";
            this.translate.get('ERROR_ENVIO_MENSAJE').subscribe((res: string) => {
              titulo = res;
            });
            this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
          }else{
              //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
              if (!this.isLoginSimulado){
                //Recarga los datos de nuevo para quitar nuevo documento y mostrar las acciones de los documentos
                //this.getFilteredDocuments();
                this.utils.recargarTablaDatosPorAccion(element, this.dataSource.filteredData, this.spinner, false, null, false, null, false);
              }
          }
        }), (error => {
          if (environment.debug) console.log("Error al Enviar EMAIL - Compartir Documento");
        });
      }
    });
  }

  /*Descarga unificado(Un pdf, donde en su interior son varios pdf del mismo trabajador)*/
  descargarUnificadoTrabajador(){
    let listaIdsDocumentos: number[] = [];
    let listaIdsTiposDocumentos: number[] = [];
    let listaUuidsDocumentos: number[] = [];
    let listaDocumentos: any[] = [];
    let esMismoTrabajador = true;
    let auxNifTrabajador = '';
    if (this.dataSource.data) {
      this.dataSource.data.forEach(formacion =>
      {
        if (formacion.checked && esMismoTrabajador) {
            if (auxNifTrabajador === ''){ //Si ya tiene información, es que anteriormente he recorrido una formación
                auxNifTrabajador = formacion.nifTrabajador;
                listaIdsDocumentos.push(formacion.idDocumento);
                listaIdsTiposDocumentos.push(formacion.idTipoDocumento);
                listaUuidsDocumentos.push(formacion.ubicacion);
            }else{
                if (auxNifTrabajador === formacion.nifTrabajador){//Entonces de momento el nif sigue siendo el mismo que el anterior
                    listaIdsDocumentos.push(formacion.idDocumento);
                    listaIdsTiposDocumentos.push(formacion.idTipoDocumento);
                    listaUuidsDocumentos.push(formacion.ubicacion);
                }else{
                    esMismoTrabajador = false;
                }
            }
        }
      });
    }

    if(!esMismoTrabajador){
        let titulo = "Debe seleccionar elementos filtrados que tengan el mismo trabajador";
        this.translate.get('ERROR_SELECCIONA_MISMO_TRABAJADOR').subscribe((res: string) => {
          titulo = res;
        });
        this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
    }else{
        if (listaIdsDocumentos != null && listaIdsDocumentos.length > 0
              && listaIdsTiposDocumentos != null && listaIdsTiposDocumentos.length > 0
              && listaUuidsDocumentos != null && listaUuidsDocumentos.length > 0) {
            this.descargarUnificadoTrabajadorData(listaIdsDocumentos, listaIdsTiposDocumentos, listaUuidsDocumentos, 2)
        }else{
            let titulo = "Debe seleccionar al menos un elemento a descargar";
            this.translate.get('ERROR_SELECCIONA_DESCARGAR').subscribe((res: string) => {
              titulo = res;
            });
            this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
        }
    }
  }

  descargarUnificadoTrabajadorData(listaIdsDocumentos, listaIdsTiposDocumentos, listaUuidsDocumentos, mode) {
    if (listaIdsDocumentos.length > 0) {
      //Variables para traducción
      let filename = "Ficheros Unificados";
      this.translate.get('FICHEROS_UNIFICADOS').subscribe((res: string) => {
        filename = res;
      });

      this.utils.getFilesUnificado({
        listaIdsDocumentos,
        listaIdsTiposDocumentos,
        listaUuidsDocumentos,
        loginSimuladoActivado: this.isLoginSimulado,
        accion: { idAccionDoc: mode }
      }).subscribe(pdfBase64 => {
        if(pdfBase64){
          const linkSource = `data:application/pdf;base64,${pdfBase64.fichero}`;
          const downloadLink = document.createElement('a');
          downloadLink.href = linkSource;
          downloadLink.download = filename + '.pdf';
          downloadLink.click();

          //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
          if (!this.isLoginSimulado){
            //despues tenemos que volver a traer la lista de documentos
            //para refrescar la pagina y que se vean los iconos de Nuevo correctamente
            let jsonInfoDocumentosDto: any[] = [];
            listaIdsDocumentos.forEach(idDocumentoInfo => {
                let jsonInfoDocumentoDto = {
                  idDocumento: idDocumentoInfo
                };
                jsonInfoDocumentosDto.push(jsonInfoDocumentoDto);
            });

            //this.getFilteredDocuments();
            this.utils.recargarTablaDatosMultiplePorAccion(jsonInfoDocumentosDto, this.dataSource.filteredData, this.spinner, false, null, false, null, false);
          }else{
            this.spinner.hide();//En caso de que se estuviera simulando, se oculta el spinner que sólo se oculta cuando se recarga la tabla de datos
          }
        }else{
        	this.spinner.hide();
        }
      })
    }
  }

  descargarCurso(){
    let listaIdsTiposDocumentos: number[] = [];
    let listaUuidsDocumentos: string[] = [];
    let listaIdsDocumentos: number[] = [];
    let listaDocumentos: any[] = [];
    if (this.dataSource.data) {
      this.dataSource.data.forEach(formacionCurso => {
        if (formacionCurso.checked) {
          listaIdsDocumentos.push(formacionCurso.idDocumento);
          listaIdsTiposDocumentos.push(100);//NOTA IMPORTANTE: Por petición de PREVING, se tiene que enviar con el tipo de documento 100
          listaUuidsDocumentos.push(formacionCurso.ubicacion);
        }
      });
    }

    if (listaIdsDocumentos.length === 0 || listaIdsDocumentos.length > 1){
        let titulo = "Debe seleccionar un elemento a descargar";
        this.translate.get('ERROR_SELECCIONA_UNICO_DESCARGAR').subscribe((res: string) => {
          titulo = res;
        });
        this.utils.mostrarMensajeSwalFire('error', titulo, '', 'var(--blue)', false);
    }else{
        this.descargarCursoData(listaIdsDocumentos, listaIdsTiposDocumentos, listaUuidsDocumentos, 2)
    }
  }

  descargarCursoData(listaIdsDocumentos, listaIdsTiposDocumentos, listaUuidsDocumentos, mode) {
    this.spinner.show();
    this.utils.getFile({
      listaIdsDocumentos,
      listaIdsTiposDocumentos,
      listaUuidsDocumentos,
      loginSimuladoActivado: this.isLoginSimulado,
      accion: { idAccionDoc: mode }
    }).subscribe(pdfBase64 => {
      if(pdfBase64){
        const linkSource = `data:application/pdf;base64,${pdfBase64.fichero}`;
        const filename = pdfBase64.nombreFichero + '.pdf';
        const downloadLink = document.createElement('a');
        downloadLink.href = linkSource;
        downloadLink.download = filename;
        downloadLink.click();

        //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
        if (!this.isLoginSimulado){
          //despues tenemos que volver a traer la lista de documentos
          //para refrescar la pagina y que se vean los iconos de Nuevo correctamente
          let jsonInfoDocumentosDto: any[] = [];
          listaIdsDocumentos.forEach(idDocumentoInfo => {
              let jsonInfoDocumentoDto = {
                idDocumento: idDocumentoInfo
              };
              jsonInfoDocumentosDto.push(jsonInfoDocumentoDto);
          });

          this.utils.recargarTablaDatosMultiplePorAccion(jsonInfoDocumentosDto, this.dataSource.filteredData, this.spinner, false, null, false, null, false);
        }else{
          this.spinner.hide();//En caso de que se estuviera simulando, se oculta el spinner que sólo se oculta cuando se recarga la tabla de datos
        }
      }else{
        this.spinner.hide();
      }
    })
  }

  checkAllRows() {
    if (this.dataSource.filteredData != undefined) {
      if (this.dataSource !== undefined && this.dataSource !== {}) {
        if (this.dataSource.filteredData.every(val => val.checked == true))
          this.dataSource.filteredData.forEach(val => { val.checked = false });
        else
          this.dataSource.filteredData.forEach(val => { val.checked = true });
      }
    } else {
      if (this.dataSource !== undefined && this.dataSource !== {}) {
        if (this.dataSource.every(val => val.checked == true))
          this.dataSource.forEach(val => { val.checked = false });
        else
          this.dataSource.forEach(val => { val.checked = true });
      }
    }
  }

  exportAsExcel() {
    this.spinner.show();
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    let JSONWS: XLSX.WorkSheet;
    let dataJS = [];

    //Variables para traducción
    var nombreExcel = "Diplomas Certificados";
    this.translate.get('DIPLOMAS_CERTIFICADOS').subscribe((res: string) => {
      nombreExcel = res;
    });
    var columnaFechaFin = "Fecha Fin";
    this.translate.get('FECHA_FIN').subscribe((res: string) => {
      columnaFechaFin = res;
    });
    var columnaFechaReciclaje = "Fecha Reciclaje";
    this.translate.get('FECHA_RECICLAJE').subscribe((res: string) => {
      columnaFechaReciclaje = res;
    });
    var columnaCategoria = "Categoría";
    this.translate.get('CATEGORIA').subscribe((res: string) => {
      columnaCategoria = res;
    });
    var columnaNombreCurso = "Nombre Curso";
    this.translate.get('NOMBRE_CURSO').subscribe((res: string) => {
      columnaNombreCurso = res;
    });
    var columnaSubcategoria = "Subcategoría";
    this.translate.get('SUBCATEGORIA').subscribe((res: string) => {
      columnaSubcategoria = res;
    });
    var columnaModalidad = "Modalidad";
    this.translate.get('MODALIDAD').subscribe((res: string) => {
      columnaModalidad = res;
    });
    var columnaTipoReciclaje = "Tipo Reciclaje";
    this.translate.get('TIPO_RECICLAJE').subscribe((res: string) => {
      columnaTipoReciclaje = res;
    });
    var columnaHoras = "Horas";
    this.translate.get('HORAS').subscribe((res: string) => {
      columnaHoras = res;
    });
    var columnaTrabajador = "Trabajador";
    this.translate.get('TRABAJADOR').subscribe((res: string) => {
      columnaTrabajador = res;
    });
    var columnaTrabajadorNif = "NIF/NIE";
    this.translate.get('NIF_NIE').subscribe((res: string) => {
      columnaTrabajadorNif = res;
    });

    var columnaPuestoTrabajo = "Puesto Trabajo";
    this.translate.get('PUESTO_TRABAJO').subscribe((res: string) => {
      columnaPuestoTrabajo = res;
    });

    let isElementosSelect: boolean = false;

    this.dataSource._orderData(this.dataSource.data).forEach(item => {
      this.tipoReciclajeList;
      if (item.checked) {
        isElementosSelect = true;
        let new_item = {};
        this.tableHeaders.forEach(tableHeader => {
          switch (tableHeader) {
            case 'fechaFin':
              new_item[columnaFechaFin] = (new Date(item['fechaFin'])).toLocaleDateString();
              break;
            case 'fechaReciclaje':
              new_item[columnaFechaReciclaje] = item['fechaReciclaje'] !== undefined ? (new Date(item['fechaReciclaje'])).toLocaleDateString() : '-';
              break;
            case 'tipoDocumento':
              new_item[columnaCategoria] = item.tipoDocumento;
              break;
            case 'nombreCurso':
              new_item[columnaNombreCurso] = item.nombreCurso;
              new_item[columnaCategoria] = this.getLiteralTranslation(item.tipoDocumento);
              new_item[columnaSubcategoria] = item.subcategoria === 'NO_PROCEDE' ? '' : this.getLiteralTranslation(item.subcategoria);
              new_item[columnaModalidad] = this.getLiteralTranslation(item.modalidadCurso);
              new_item[columnaTipoReciclaje] = this.getTipoReciclajeDescripcion(item.tipoReciclaje);
              break;
            case 'trabajador':
              let trabajadorYNif = item.trabajador.split("<br>");
              new_item[columnaTrabajador] = trabajadorYNif[0];
              new_item[columnaTrabajadorNif] = trabajadorYNif[1];
              break;
            case 'puestoTrabajo':
              new_item[columnaPuestoTrabajo] = item.puestoTrabajo.map(puesto => {
                return puesto['nombre'];
              }).join(', ');
              break;
            case 'horas':
              new_item[columnaHoras] = item.horas;
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

  getTipoReciclajeDescripcion(idTipoReciclajeParam){
    var nombreReciclaje = 'NO_PROCEDE';
    this.translate.get('NO_PROCEDE').subscribe((res: string) => {
      nombreReciclaje = res;
    });
    this.tipoReciclajeList.forEach(tipoReciclaje => {
      if(tipoReciclaje.idTipoReciclaje.toString() === idTipoReciclajeParam){
        nombreReciclaje = tipoReciclaje.nombre;
      }
    })
    return nombreReciclaje;
  }

  getLiteralTranslation(literal){
    var translation = literal;
    this.translate.get(literal).subscribe((res: string) => {
      translation = res;
    });
    return translation;
  }


  mostrarMasElementos(element) {
    let result = false;
    if (element.puestoTrabajo.length > 1) {
      result = true;
    }

    element.puestoTrabajo.forEach(element => {
      if (element.length > 1) {
        result = true;
      }
    });

    return result;
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

  verHistoricoDocumento(element) {
    const dialogConfig = new MatDialogConfig();
    this.utils.verHistoricoDocumentoComun(dialogConfig, element);
  }

  getColorSemaforo(element) {
    if(element.fechaReciclaje === undefined) {
      return green_color;
    }
    return this.getColorSemaforoFecha(element.fechaReciclaje);
  }

  getColorSemaforoFecha(fechaReciclaje){
    const now = moment()
    if(fechaReciclaje === undefined) {
      return green_color;
    }
    const fechaReciclajeMoment = moment(fechaReciclaje)
    const diff = fechaReciclajeMoment.diff(now, 'months')
    if(diff < 0) {
      return red_color;
    } else if(diff <= 3) {
      return yellow_color;
    } else {
      return green_color;
    }
  }

  getTooltip(element) {
    let subcategoriaLabel: string = '';
    this.translate.get(element.subcategoria).subscribe((res: string) => {
      subcategoriaLabel = res;
    });
    let noProcedeLabel: string = '';
    this.translate.get('NO_PROCEDE').subscribe((res: string) => {
      noProcedeLabel = res;
    });

    let subcategoriaTexto: string = element.idTipoDocumento === 48 ? '\nSubcategoría: ' + subcategoriaLabel : '';

    return 'Nombre del curso: ' + element.nombreCurso + '\nCategoría: ' + element.tipoDocumento + subcategoriaTexto +
      '\nModalidad: ' + element.modalidadCurso + '\nTipo reciclaje: ' + this.getTipoReciclajeDescripcion(element.tipoReciclaje);

  }

  passFilterState(fechaReciclaje){
    if (!this.documentationForm.get('estadoForm').value ||
      this.documentationForm.get('estadoForm').value.length == 0){
      return true;
    }
    else{
      var semaphoreColor = this.getColorSemaforoFecha(fechaReciclaje);
      switch (semaphoreColor) {
        case green_color:
          return this.isFilterState('VG');
          break;
        case yellow_color:
          return this.isFilterState('PR');
          break;
        case red_color:
          return this.isFilterState('DR');
          break;
      }
    }
  }

  isFilterState(recycleState){
    return this.documentationForm.get('estadoForm').value.find(estado => estado === recycleState) !== undefined;
  }

}

