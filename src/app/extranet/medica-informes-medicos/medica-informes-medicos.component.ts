import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../environments/environment';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PdfView } from 'src/app/modales/pdfView/pdfView.component';
import { Empresa } from 'src/app/Model/Empresa';
import { Centro } from 'src/app/Model/Centro';
import { TiposDocumento } from 'src/app/Model/TiposDocumento';
import Swal from 'sweetalert2';
import { UserService } from 'src/app/services/user.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Globals } from '../globals';
import * as XLSX from 'xlsx';
import { AcceptGdprDocumentComponent } from '../../modales/acceptGdprDocument/acceptGdprDocument.component';
import { ShareDocumentComponent } from 'src/app/modales/shareDocument/shareDocument.component';
import { HistoricoAccionesDocumentoComponent } from 'src/app/modales/historicoAccionesDocumento/historicoAccionesDocumento.component';

import {DateAdapter, ErrorStateMatcher, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MY_FORMATS } from 'src/config/config';
import * as _moment from 'moment';

const moment =  _moment;
import { TranslateService } from '@ngx-translate/core';
import { ChangeDetectorRef } from '@angular/core';
import {ORIGIN_TYPE} from '../prevencion-documentos-tecnicos/prevencion-documentos-tecnicos.component';
import {ModalNuevoInformeVsComponent} from './components/add-new-inform/modal-nuevo-informe-vs.component';

export interface MedicalDocumentsInterface {
  idDocumento: number;
  fecha: string;
  empresa: string;
  idEmpresa: number;
  centro: string;
  empresaCentroNombre: string;
  idCentro: number;
  idTipoDocumento: number;
  tipoDocumento: string;
  subtipoDocumento: string;
  documento: string;
  trabajadorNombre: string;
  puestoTrabajo: string;
  observaciones: string;
  proximoTest: string;
  recomendadoPcr: string;
  accionesRealizadas: boolean;
  ubicacion: string;
  gdprId: number;
  fechaAceptacionGdpr: Date;
  gdpr:any;
  listaHistoricoDocumentoDto: any[];
  origen: string;
}

@Component({
  selector: 'app-medica-informes-medicos',
  templateUrl: './medica-informes-medicos.component.html',
  styleUrls: ['./medica-informes-medicos.component.css'],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})
export class MedicaInformesMedicosComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    public utils: UtilsService,
    private router: Router,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
    public globals: Globals,
    private modalRgpd: MatDialog,
    private translate: TranslateService,
    private cdRef: ChangeDetectorRef,
    private modalNuevoInformeVS: MatDialog,
  ) { }
  environment = environment;
  documentationForm: FormGroup;
  empresasList: Empresa[];
  centroList: Centro[];
  tipoDocumentoList: any;
  formAuxTipoDocumentoList: number[] = [];  //Array auxiliar para guardar la lista del formulario
  subTipoDocumentoList: any;
  isLoginSimulado: boolean = false;

  mapaSubTipoDocTipoDoc = new Map();
  mapaTipoDocSubTipoDoc = new Map();

  closeImgUrl = '../../assets/img/close.svg';
  searchImgUrl = '../../assets/img/search.svg';
  cleanImgUrl = '../../assets/img/borrar_filtros.svg';
  excelImgUrl = '../../assets/img/excel.svg';
  mailImgUrl = '../../assets/img/mail.svg';
  downloadImgUrl = '../../assets/img/download.svg';
  maxDate: Date;
  minDate: Date;
  mostrarTabla: boolean;
  tableHeaders: string[] = [
    'checklist',
    'newList',
    'fecha',
    //'empresa',
    'tipoDocumento',
    'documento',
    'origen',
    'observaciones',
    'specialAction'];

  idCompaniesSelectedList = [];
  idCentrosSelectedList = [];
  idTipoDocumento: any;
  medDocDataDto: any;
  aprobDocDataDto: any;
  dataSource: any;
  dataSourceAux = new MatTableDataSource<MedicalDocumentsInterface>();

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('TABLEMEDICALDOCUMENTS') table: ElementRef;
  @ViewChild('TABLEMEDICALDOCUMENTS') exportTableDirective: ElementRef;

  //validators
  validName = this.globals.documentPattern;
  validObserva = this.globals.observePattern;

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
    this.getTipoDocumento();
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
    this.documentationForm = this.formBuilder.group({
      empresaForm: new FormControl('', [Validators.required]),
      centroForm: new FormControl('', [Validators.required]),
      nombreDocForm: new FormControl(''),
      tipoDocForm: new FormControl(''),
      subTipoDocForm: new FormControl(''),
      fechaDesdeForm: new FormControl(moment()),
      fechaHastaForm: new FormControl(moment()),
      observacionesForm: new FormControl(''),
      selectEmpresasRadioForm: new FormControl('1'),
      selectCentrosRadioForm: new FormControl('1'),
      selectAllCheckBox: new FormControl(''),
      todosCentrosForm: true,
      origen: new FormControl('')
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

  setDefaultForm() {
    // Set de formularios
    this.documentationForm.get('empresaForm').setValue([]);
    this.documentationForm.get('centroForm').setValue([]);
    this.documentationForm.get('selectEmpresasRadioForm').setValue("1");
    this.documentationForm.get('selectCentrosRadioForm').setValue("1");
    this.documentationForm.get('nombreDocForm').setValue("");
    this.documentationForm.get('tipoDocForm').setValue([]);
    this.documentationForm.get('subTipoDocForm').setValue([]);
    this.subTipoDocumentoList = []; //Necesario para que no se muestre el formulario de subtipoDocForm
    this.documentationForm.get('observacionesForm').setValue("");
    this.documentationForm.controls.origen.setValue('');
  }

  resetForm(): void {
    setTimeout(() => {
      this.setInitDates();
      this.setDefaultForm();
      this.updateEmpresasYCentros();
      this.initColsOrder();
    });
  }

  onSubmit(): void {
    this.getFilteredDocuments();
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
      this.empresasList.forEach(empresa => {
        if (empresa.centros.length == 1) {
          this.documentationForm.controls.centroForm.setValue([empresa.centros[0].idCentro]);
        }
      })
    }
  }

  getOriginType(origin) {
    return ORIGIN_TYPE[origin];
  }

  selectAllOrigin(formName, formControlName, values, fieldName) {
    if (this[formName].controls[formControlName].value.length !== 1) {
      this[formName].controls[formControlName].setValue([]);
    } else {
      const result = [];
      values.forEach(item => {
        result.push(item);
      });
      result.push(2);
      this[formName].controls[formControlName].setValue(result);
    }
  }

  openModalNuevoInformeVS() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '40%';
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;
    const dialogRef = this.modalNuevoInformeVS.open(ModalNuevoInformeVsComponent, dialogConfig);

    dialogRef.componentInstance.idEmpresa = this.documentationForm.controls.empresaForm.value;
    dialogRef.componentInstance.idCentro = this.documentationForm.controls.centroForm.value;

    dialogRef.afterClosed().subscribe( result => {
      if (result) {
        this.onSubmit();
      }
    });
  }

  //todo modal para editar un informe
  /*openModalEditarInformePT(element) {
    // debugger;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '40%';
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;
    const dialogRef = this.modalNuevoInformePT.open(ModalEditarInformePtComponent, dialogConfig);

    dialogRef.componentInstance.idEmpresa = this.documentationForm.controls.empresaForm.value;
    dialogRef.componentInstance.idCentro = this.documentationForm.controls.centroForm.value;



    dialogRef.componentInstance.dataToEdit = element;

    dialogRef.afterClosed().subscribe( result => {
      if (result) {
        this.onSubmit();
      }
    });
  }*/

  getTipoDocumento() {
    this.userService.getSubtiposDocumento([this.globals.informes_medicos]).subscribe(result => {
      if(result){
      	this.tipoDocumentoList = result;
      	let idsTiposDocumentosList: number[] = [];
      	result.forEach(tipoDoc => {
      	  idsTiposDocumentosList.push(tipoDoc.idTipoDocumento);
      	});
      	//Se obtiene el listado de subtipos pertenecientes a la lista de tipo de docs
      	this.getSubtiposDocumentoWithPadre(idsTiposDocumentosList);
      }else{
      	this.spinner.hide();
      }
    }, (error => {
      if (environment.debug) console.log("Error al cargar los tipos de documento: " + error);
    }));
  }

  getSubTipoDocumento() {
    if (this.documentationForm.get('tipoDocForm').value[0] !== undefined) {
      this.userService.getSubtiposDocumento(this.documentationForm.get('tipoDocForm').value).subscribe(result => {
        if(result){
        	this.subTipoDocumentoList = result;
        }else{
        	this.spinner.hide();
        }
      }, (error => {
        if (environment.debug) console.log("Error al cargar los tipos de documento: " + error);
      }));
    } else {
      this.subTipoDocumentoList = [];
    }
  }

  //Método que actualiza los subtipos y además elimina el elemento deseleccionado del formulario "subTipoDocForm"
  getSubtiposDocumentoWithTipoDocPadre(eventArray) {
    if (this.documentationForm.get('tipoDocForm').value[0] !== undefined) {
      let longitudTipoDocForm = this.documentationForm.get('tipoDocForm').value.length;
      let longitudFormAuxTipoDocumentoList = this.formAuxTipoDocumentoList.length;

      //Si es la primera vez que se selecciona un elemento, se realiza una copia
      if (this.formAuxTipoDocumentoList.length === 0){
          this.formAuxTipoDocumentoList = this.documentationForm.get('tipoDocForm').value.slice(0, longitudTipoDocForm);//Copia
      }

      //En el caso de que el array justo se haya deseleccionado el último, se setea la lista auxiliar
      if (eventArray != null && eventArray.length === 0){
        this.formAuxTipoDocumentoList = [];
      }

      //Se actualiza la lista de los subtipos con los nuevos tipoDoc que quedan seleccionados
      let listaSubTiposDoc: TiposDocumento [] = [];
      this.documentationForm.get('tipoDocForm').value.forEach(idTipoDoc => {
        let listaMapaSubTipos = this.mapaTipoDocSubTipoDoc.get(idTipoDoc);
        if (listaMapaSubTipos !== undefined){
          listaMapaSubTipos.forEach(idSubTipo => {
            listaSubTiposDoc.push(idSubTipo);
          });
        }
      });
      this.subTipoDocumentoList = listaSubTiposDoc;

      //Si 'event' es distinto de null, entonces es que ha sido llamado por un cambio en una selección (deschequeado
      //en este caso) del tipoDoc y habrá que quitar los hijos (Subtipos) de dicho tipoDoc que estuviesen seleccionado
      //en el formulario "tipoDocForm"
      if (eventArray != null){
        //Si el eventArray tiene un tamaño menor al de la lista auxiliar, entonces se ha deschequeado un elemento
        //y se procede a realizar las comprobaciones/modificaciones necesarias
        if (longitudTipoDocForm < longitudFormAuxTipoDocumentoList){
          let listaAuxSubTipoDocForm = [];
          //Se recorre el array con el contenido antes de realizar la acción de deschequear un elemento
          this.formAuxTipoDocumentoList.forEach(idTipoDoc => {
            //Se comprueba qué id ya NO existe en el formulario, es decir, qué elemento fue deschequeado, para así eliminar
            //todos los subtipos de dicho tipoDoc
            let isIncluided = this.documentationForm.get('tipoDocForm').value.includes(idTipoDoc);
            //Se procede a sacar los subtipos del TipoDoc deschequeado
            if (isIncluided){
              let listaSubTiposDoc = this.mapaTipoDocSubTipoDoc.get(idTipoDoc);
              if (listaSubTiposDoc !== undefined){
                //Si tiene subtipos se procede a buscar si están en el formulario 'subTipoDocForm' para eliminarlos
                this.documentationForm.get('subTipoDocForm').value.forEach(idSubTipoDoc => {
                  let subTipoEncontrado = listaSubTiposDoc.find(subTipo => subTipo.idTipoDocumento === idSubTipoDoc);
                  if(subTipoEncontrado !== undefined){
                    //Se agrega el elemento que no encuentra en la lista que se seteará más tarde en 'subTipoDocForm'
                    listaAuxSubTipoDocForm.push(idSubTipoDoc);
                  }
                });
              }
            }

          });
          //Seteo del nuevo array filtrado para el formulario 'subTipoDocForm'
          this.documentationForm.get('subTipoDocForm').setValue(listaAuxSubTipoDocForm);
        }
        //Ahora que ya se ha realizado las comprobaciones/modificaciones pertinentes, se vuelve a actualizar
        //la lista auxiliar del formulario "TipoDocForm"
        this.formAuxTipoDocumentoList = this.documentationForm.get('tipoDocForm').value.slice(0, longitudTipoDocForm);//Copia
      }
    } else {
      this.subTipoDocumentoList = [];
    }
  }

  getSubtiposDocumentoWithPadre(idsTiposDocumentosList) {
    this.userService.getSubtiposDocumentoWithPadre(idsTiposDocumentosList).subscribe(result => {
      if(result){
        result.forEach(subTipo => {
          //Rellenamos las subTipos y Tipo Padre en su mapa correspondiente
          this.mapaSubTipoDocTipoDoc.set(subTipo.idTipoDocumento, subTipo.tipoDocumentoPadre.idTipoDocumento);
          //Rellenamos las tipos de documento y sus subTipos en su mapa correspondiente
          let listaSubTiposDoc: TiposDocumento [] = [];
          //Se obtiene la lista de los subtipos del tipoPadre y actualizamos la lista, ya tenga contenido o esté vacía
          listaSubTiposDoc = this.mapaTipoDocSubTipoDoc.get(subTipo.tipoDocumentoPadre.idTipoDocumento);
          if (listaSubTiposDoc === undefined)
            listaSubTiposDoc = [];

          listaSubTiposDoc.push(subTipo);
          this.mapaTipoDocSubTipoDoc.set(subTipo.tipoDocumentoPadre.idTipoDocumento, listaSubTiposDoc);
        });
      }else{
        this.spinner.hide();
      }
    }, (error => {
      if (environment.debug) console.log("Error al cargar los tipos de documento: " + error);
    }));
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

    if (this.documentationForm.get('tipoDocForm').value === "" || this.documentationForm.get('tipoDocForm').value === "0"
        || this.documentationForm.get('tipoDocForm').value.length === 0) {
      this.idTipoDocumento = [this.globals.informes_medicos];
    } else if (this.documentationForm.get('subTipoDocForm').value !== "") {
      //NOTA IMPORTANTE: En el caso de haya valor en el formulario de subcategoria, quiere decir que hay que quitar el padre anteriormente agregado
      //en este caso, son varios tipos que pueden tener subcaterogias, por tanto sólo habrá que quitar dicho
      //valor del padre y agregar los seleccionados en la subcategorias
      let auxList = this.documentationForm.get('tipoDocForm').value.filter(idTipoDoc => {
          //Se buscará las subcategorias pertenecientes al idTipoDoc, y si estas están seleccionadas
          //en el formulario "subTipoDocForm", si lo están se elimina el padre, si no hay ningún hijo(subcategoria), se mantiene el padre
          let listaSubcategorias = this.mapaTipoDocSubTipoDoc.get(idTipoDoc);
          //Si es undefined, es que no tiene subcategorias, por tanto mantenemos el padre seleccionado en el filtro "tipoDocForm"
          if(listaSubcategorias === undefined)
            return true;
          //Si tiene subcategorias el padre, se recorre y se comprueba si al menos hay una subcategoria seleccionada en el formulario "subTipoDocForm"
          //que cumple la condición, si la hay, se devolverá 'false' para que se incluye el hijo y no el padre
          return listaSubcategorias.every(idSubCategoriaDelPadre => {
            return !this.documentationForm.get('subTipoDocForm').value.includes(idSubCategoriaDelPadre.idTipoDocumento);
          });
      });

      let listaSinPadreDeLaSubCategoria = [];
      //Se recorre la lista de subcategorias para ir agregando los ids de tipos a una lista
      this.documentationForm.get('subTipoDocForm').value.forEach(idSubcategoria => {
        listaSinPadreDeLaSubCategoria.push(idSubcategoria);
      });

      //Se recorre la lista ya filtrada sin el documento padre
      auxList.forEach(idCategoria => {
        listaSinPadreDeLaSubCategoria.push(idCategoria);
      });
      this.idTipoDocumento = listaSinPadreDeLaSubCategoria;

    } else {
      this.idTipoDocumento = this.documentationForm.get('tipoDocForm').value;
    }

    if(this.documentationForm.get('subTipoDocForm').value.length === 0 && this.documentationForm.get('tipoDocForm').value !=""){
      this.idTipoDocumento = this.documentationForm.get('tipoDocForm').value;
    }

    if (this.documentationForm.get('subTipoDocForm').value === "0" && this.idTipoDocumento != this.globals.informes_medicos) {
      this.idTipoDocumento = this.documentationForm.get('tipoDocForm').value;
    }

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

    let idEmpresasList: number[] = [];
    let idCentrosList: number[] = [];

    // PRV se crea un array para evitar problemas a la hora de tratar los datos a enviar al back
    const empresaLista: number[] = [];
    const centroLista: number[] = [];

    empresaLista.push(this.documentationForm.get('empresaForm').value);
    centroLista.push(this.documentationForm.get('centroForm').value);

    //Método que comprueba si alguno de los fitlros de Empresa y Centro está en 'activo' o en 'inactivo' y va añadiendo empresas/centros a sus respectivas listas
    this.utils.envioDatosConFiltroActivoInactivo (this.documentationForm.get('selectEmpresasRadioForm').value,
                                        this.documentationForm.get('selectCentrosRadioForm').value,
                                        empresaLista,
                                        centroLista,
                                        this.empresasList,
                                        idEmpresasList,
                                        idCentrosList);

    let origen = [];
    origen = this.documentationForm.get('origen').value;

    if (origen.length !== 0) {
      origen = origen.filter(item => item !== 2);
    }

    let idsListResult: any[] = [];
    //Se comprueba si el usuario había seleccionado alguna empresa/centro en los campos 'empresaForm' y 'centroForm' para
    //alterar o no los atributos a enviar al BACK
    idsListResult = this.utils.valoraListasFinalesAEnviarConFiltro(empresaLista,
                                        centroLista,
                                        this.empresasList,
                                        idEmpresasList,
                                        idCentrosList);

    idCompaniesListResult = idsListResult[0];
    idCentrosListResult = idsListResult[1];

    this.medDocDataDto = {
      listaIdsTipoDocumento: this.idTipoDocumento,
      listaIdsEmpresas: idCompaniesListResult,
      listaIdsCentros: idCentrosListResult,
      nombreDocumento: this.documentationForm.get('nombreDocForm').value,
      fechaInicio: fechaInicio || '',
      fechaFin: fechaFin || '',
      origen: origen === null || origen.length === 0 || origen.length === 2 ? [] : origen,
      listaFiltroMetadatosDto: [
        {
          nombreMetadato: "observaciones",
          listaIdsValoresDato: this.documentationForm.get('observacionesForm').value ? [this.documentationForm.get('observacionesForm').value] : []
        }
      ]
    }

    this.spinner.show();
    this.userService.getDocumentosVs(this.medDocDataDto).subscribe(results => {
      let result: MedicalDocumentsInterface[] = [];
      let trabajadorDto;

      if (results != undefined && results.length > 0) {
        results.forEach(item => {
          trabajadorDto = item.datos.find(obj => obj.nombre == this.globals.metadato_trabajador)?.valorDto;

          var nDatoObservaciones = 0;
          var nDatoProximoTest = 0;
          var nDatoRecomendadoPcr = 0;
          var nDatoTrabajador = 0;
          var c = 0;
          item.datos.forEach(dato => {
            if (dato.nombre === this.globals.metadato_observaciones) nDatoObservaciones = c;
            if (dato.nombre === this.globals.metadato_proximo_test) nDatoProximoTest = c;
            if (dato.nombre === this.globals.metadato_recomendado_pcr) nDatoRecomendadoPcr = c;
            if (dato.nombre === this.globals.metadato_trabajador) nDatoTrabajador = c;
            c++;
          })
          var auxEmpresaCentroNombre;
          if (item.centro != null)
            auxEmpresaCentroNombre = item.empresa.nombre + ' - ' + item.centro?.nombre
          else
            auxEmpresaCentroNombre = item.empresa.nombre;
          result.push({
            idDocumento: item.idDocumento,
            fecha: item.fechaDocumento,
            empresa: item.empresa.nombre,
            idEmpresa: item.empresa?.idEmpresa,
            centro: item.centro?.nombre,
            idCentro: item.centro?.idCentro,
            empresaCentroNombre: auxEmpresaCentroNombre,
            idTipoDocumento: item.tipoDocumento?.idTipoDocumento,
            tipoDocumento: item.tipoDocumento?.nombre,
            subtipoDocumento: item.subtipoDocumento?.nombre,
            documento: item.nombre,
            observaciones: item.datos[nDatoObservaciones]?.valor,
            proximoTest: item.datos[nDatoProximoTest]?.valor,
            recomendadoPcr: item.datos[nDatoRecomendadoPcr]?.valor,
            trabajadorNombre: trabajadorDto ? (trabajadorDto.nombre + ' ' + trabajadorDto.apellidos + ' ' + trabajadorDto.nif) : '',
            puestoTrabajo: item.datos[nDatoTrabajador]?.valorDto?.puestoTrabajoDtoList,
            accionesRealizadas:item.accionesRealizadas,
            ubicacion: item.ubicacion,
            gdprId: item.gdpr?.idGdpr ,
            fechaAceptacionGdpr: item.fechaAceptacion,
            gdpr:item.gdpr,
            listaHistoricoDocumentoDto: [],
            origen: item.origen
            //listaHistoricoDocumentoDto: item?.listaHistoricoDocumentoDto || [] //Se comenta ya que ahora el Back sólo va a devolver si tiene acciones realizadas o no
          });
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
            return new Date(item.fecha);

          if (typeof item[property] === 'string')
            return item[property].toLocaleLowerCase();
          return item[property];
        };

        this.mostrarTabla = true;
        if (environment.debug) console.log("Succes");
      }else if(results !== undefined && results.length === 0){
        this.utils.mostrarMensajeSwalFireDocumentosNoEncontrados();
      }
      this.spinner.hide();
    }), (error => {
      if (environment.debug) console.log("Error");
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


  previsualizar(element) {
    this.openModalAcceptRgpd(element,3, null, null);
  }

  /*descargar seleccion*/
  descargar(element) {
    this.openModalAcceptRgpd(element,2, null, null);
  }

  /*compartir */
  compartir(element) {
    this.openModalAcceptRgpd(element,1, null, null);
  }


  /*descarga multiple*/
  descargarMultiple() {
    let listaIdsDocumentos: number[] = [];
    let listaDocumentos: any[] = [];
    if (this.dataSource.data) {
      this.dataSource.data.forEach(documento =>
      {
        if (documento.checked) {
          listaDocumentos.push(documento);
          listaIdsDocumentos.push(documento.idDocumento);
        }
      });
    }

    if (listaIdsDocumentos.length > 0 && listaIdsDocumentos.length <= this.globals.extranet_maximo_documentos_multiple) {
      this.openModalAcceptRgpd(null, 2, listaDocumentos, listaIdsDocumentos);
    }else if (listaIdsDocumentos.length > this.globals.extranet_maximo_documentos_multiple){
    	this.utils.mostrarMensajeSwalFireSobrepasadoLimiteDescargaMultiple(listaIdsDocumentos.length);
    }else{
      let titulo = "Debe seleccionar al menos un elemento a descargar";
      this.translate.get('ERROR_SELECCIONA_DESCARGAR').subscribe((res: string) => {
        titulo = res;
      });
      this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
    }
  }

  /*compartir Múltiple */
  compartirMultiple() {
    let listaIdsDocumentos: number[] = [];
    let listaDocumentos: any[] = [];
    if (this.dataSource.data) {
      this.dataSource.data.forEach(documento =>
      {
        if (documento.checked) {
          listaDocumentos.push(documento);
          listaIdsDocumentos.push(documento.idDocumento);
        }
      });
    }

    if (listaIdsDocumentos.length > 0 && listaIdsDocumentos.length <= this.globals.extranet_maximo_documentos_multiple) {
      this.openModalAcceptRgpd(null, 1, listaDocumentos, listaIdsDocumentos);
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

  /*Metodo que abre la modal y redirecciona a los metodos*/
  openModalAcceptRgpd(element, mode, listaDocumentos, listaIdsDocumentos){
    // debugger;
    let flag: boolean = false;
    if (listaDocumentos != null){
        listaDocumentos.forEach(documento => {
            if (documento.fechaAceptacionGdpr === undefined){
                element = documento;
                flag = true;
            }
        });
    }

    if( flag || (element != null && element.fechaAceptacionGdpr === undefined && element.origen === "0") ){
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = element;
      dialogConfig.height = "80%";
      dialogConfig.hasBackdrop = true;
      dialogConfig.disableClose = true;
      const dialogRef = this.modalRgpd.open(AcceptGdprDocumentComponent, dialogConfig);
      dialogRef.afterClosed().subscribe(result => {
       if (localStorage.getItem('acceptModal') === 'true'){
           switch (mode) {
             case 1:
              if (listaIdsDocumentos != null && listaIdsDocumentos.length > 0){
                this.compartirMultipleData(listaIdsDocumentos, mode, listaDocumentos)
              }else{
                this.compartirData(element, mode);
              }
               break;
             case 2:
                if (listaIdsDocumentos != null && listaIdsDocumentos.length > 0){
                  this.descargarMultipleData(listaIdsDocumentos, mode, listaDocumentos)
                }else{
                  this.descargaData(element, mode);
                }
                break;
             case 3:
               this.previsualizarData(element, mode);
               break;
           }
           //Seteamos a false la variable globlal 'acceptModal'
           localStorage.setItem('acceptModal', 'false');
       }

     });
    } else {
      switch (mode) {
        case 1:
          if (listaIdsDocumentos != null && listaIdsDocumentos.length > 0){
            this.compartirMultipleData(listaIdsDocumentos, mode, listaDocumentos)
          }else{
            this.compartirData(element, mode);
          }
          break;
        case 2:
          if (listaIdsDocumentos != null && listaIdsDocumentos.length > 0){
            this.descargarMultipleData(listaIdsDocumentos, mode, listaDocumentos)
          }else{
            this.descargaData(element, mode);
          }
          break;
        case 3:
          this.previsualizarData(element, mode);
          break;
      }
    }
  }

  /*compartir selección*/
  compartirData(element, mode){
    let menuNameComponent = 'Documentación Vigilancia';
    this.translate.get('DOCUMENTACION_VIGILANCIA').subscribe((res: string) => {
      menuNameComponent = res;
    });
    let subMenuNameComponent = 'Informes de Empresa';
    this.translate.get('INFORMES_EMPRESA').subscribe((res: string) => {
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
          to:result.emailFormControl,
          cc: result.ccFormControl,
          cco: result.ccoFormControl,
          subject: result.subjectFormControl,
          body: result.bodyFormControl,

          documentoDownloadDto:{
              listaIdsDocumentos:[element.idDocumento],
              listaIdsTiposDocumentos: [element.idTipoDocumento],
              listaUuidsDocumentos: [element.ubicacion],
              loginSimuladoActivado: this.isLoginSimulado,
              accion:{
                  idAccionDoc:mode
              },
              filename:element.nombreDocumento + ".pdf"
          }
        }

        let titulo = "Se ha procedido al envío por correo electrónico de la documentación indicada";
        this.translate.get('ENVIO_DOC_INICIADA').subscribe((res: string) => {
          titulo = res;
        });
        this.utils.mostrarMensajeSwalFire('info', titulo, '','var(--blue)', false);
        this.utils.compartirDocumento(data).subscribe(result => {
          if (!result){
             let titulo = "Error al enviar el mensaje";
             this.translate.get('ERROR_ENVIO_MENSAJE').subscribe((res: string) => {
               titulo = res;
             });
             this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
          }

          //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
          if (!this.isLoginSimulado)
            this.gdprMethod([element], mode); //GDPR && Reload Info Document

        }),(error => {
          if (environment.debug) console.log("Error al Enviar EMAIL - Compartir Documento");
        });
      }
    });
  }

  /*compartir múltiple*/
  compartirMultipleData(listaIdsDocumentos, mode, listaDocumentos){
    let menuNameComponent = 'Documentación Vigilancia';
    this.translate.get('DOCUMENTACION_VIGILANCIA').subscribe((res: string) => {
      menuNameComponent = res;
    });
    let subMenuNameComponent = 'Informes de Empresa';
    this.translate.get('INFORMES_EMPRESA').subscribe((res: string) => {
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

         let listaIdsTiposDocumentos: number[] = [];
         let listaUuidsDocumentos: string[] = [];
         listaDocumentos.forEach(documento => {
           listaIdsTiposDocumentos.push(documento.idTipoDocumento);
           listaUuidsDocumentos.push(documento.ubicacion);
         });

         let data = {
           to:result.emailFormControl,
           cc: result.ccFormControl,
           cco: result.ccoFormControl,
           subject: result.subjectFormControl,
           body: result.bodyFormControl,

           documentoDownloadDto:{
               listaIdsDocumentos,
               listaIdsTiposDocumentos,
               listaUuidsDocumentos,
               loginSimuladoActivado: this.isLoginSimulado,
               accion:{
                   idAccionDoc:mode
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
           if (!result){
                let titulo = "Error al enviar el mensaje";
                this.translate.get('ERROR_ENVIO_MENSAJE').subscribe((res: string) => {
                  titulo = res;
                });
                this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
           }else{
              //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
              if (!this.isLoginSimulado){
                //Recarga los datos de nuevo para quitar nuevo documento y mostrar las acciones de los documentos
                this.gdprMethod(listaDocumentos, mode); //GDPR && Reload Info Document
              }
           }
         }),(error => {
           if (environment.debug) console.log("Error al Enviar EMAIL - Compartir Documento");
         });
       }
    });
  }


  previsualizarData(element, mode) {
    this.spinner.show();
    this.medDocDataDto = {
      listaIdsDocumentos: [element.idDocumento],
      listaIdsTiposDocumentos: [element.idTipoDocumento],
      listaUuidsDocumentos: [element.ubicacion],
      loginSimuladoActivado: this.isLoginSimulado,
      accion: { idAccionDoc: mode }
    };
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

        //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
        if (!this.isLoginSimulado)
          this.gdprMethod([element], mode); //GDPR && Reload Info Document

      }
      this.spinner.hide();
    });
  }

  descargaData(element, mode) {
    // debugger;
    this.spinner.show();
    this.medDocDataDto = {
      listaIdsDocumentos: [element.idDocumento],
      listaIdsTiposDocumentos: [element.idTipoDocumento],
      listaUuidsDocumentos: [element.ubicacion],
      loginSimuladoActivado: this.isLoginSimulado,
      accion: { idAccionDoc: mode }
    };
    this.utils.getFile(this.medDocDataDto).subscribe(pdfBase64 => {
      // debugger;
      if (pdfBase64) {
        const linkSource = `data:application/pdf;base64,${pdfBase64.fichero}`;
        const filename = pdfBase64.nombreFichero + '.pdf';
        const downloadLink = document.createElement('a');
        downloadLink.href = linkSource;
        downloadLink.download = filename;
        downloadLink.click();

        //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
        if (!this.isLoginSimulado)
          this.gdprMethod([element], mode); //GDPR && Reload Info Document

      }
      this.spinner.hide();
    });
  }

  descargarMultipleData(listaIdsDocumentos, mode, listaDocumentos) {
    this.spinner.show();
      if (listaIdsDocumentos.length > 0) {
        //Variables para traducción
        let filename = "Informes Empresa";
        this.translate.get('INFORMES_EMPRESA').subscribe((res: string) => {
          filename = res;
        });

        let listaIdsTiposDocumentos: number[] = [];
        let listaUuidsDocumentos: string[] = [];
        listaDocumentos.forEach(documento => {
          listaIdsTiposDocumentos.push(documento.idTipoDocumento);
          listaUuidsDocumentos.push(documento.ubicacion);
        });

        this.utils.getZipFile({
          listaIdsDocumentos,
          listaIdsTiposDocumentos,
          listaUuidsDocumentos,
          loginSimuladoActivado: this.isLoginSimulado,
          accion: { idAccionDoc: mode }
        }).subscribe(zipBase64 => {
          if(zipBase64){
            let downloadLink = document.createElement('a');
            downloadLink.href = `data:application/zip;base64,${zipBase64.fichero}`;
            downloadLink.download = filename + '.zip';
            downloadLink.click();

            //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
            if (!this.isLoginSimulado)
              this.gdprMethod(listaDocumentos, mode); //GDPR && Reload Info Document

          }
          this.spinner.hide();
        })
      } else {
        let titulo = "Debe seleccionar al menos un elemento a descargar";
        this.translate.get('ERROR_SELECCIONA_DESCARGAR').subscribe((res: string) => {
          titulo = res;
        });
        this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
      }
  }

  gdprMethod(elements, accionDocumento){
    let listaIdsDocuments: any[] = [];
    let listaIdsTiposDocuments: number[] = [];
    let flag: boolean = false;
    elements.forEach(element => {
      listaIdsDocuments.push(element.idDocumento);
      listaIdsTiposDocuments.push(element.idTipoDocumento);
      if(element.fechaAceptacionGdpr === undefined){
         flag = true;
      }
    });

    /*verHistoricoDocumento(element) {
      if (element.origen === "0") {
        const dialogConfig = new MatDialogConfig();
        this.utils.verHistoricoDocumentoComun(dialogConfig, element);
      }
    }*/

    //JSON que sirve para recargar los datos de nuevo para quitar nuevo documento o no y mostrar las acciones de los documentos
    let jsonInfoDocumentosDto: any[] = [];
    listaIdsDocuments.forEach(idDocumentoInfo => {
        let jsonInfoDocumentoDto = {
          idDocumento: idDocumentoInfo
        };
        jsonInfoDocumentosDto.push(jsonInfoDocumentoDto);
    });

    this.aprobDocDataDto = {
      listaIdsDocumentos: listaIdsDocuments,
      listaIdsTiposDocumentos: listaIdsTiposDocuments,
      loginSimuladoActivado: this.isLoginSimulado,
      accion: { idAccionDoc: accionDocumento }
    }

    //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
    if (!this.isLoginSimulado){
      if (flag){
          this.userService.setFechaAprobacionDocumentoGdpr(this.aprobDocDataDto).subscribe(aprobPolitica => {
              if(!aprobPolitica) {
                 this.spinner.hide();
                 let titulo = "Se ha producido un error al guardar la política de aceptación de terminos del documento";
                 this.translate.get('ERROR_GUARDAR_POLITICA').subscribe((res: string) => {
                   titulo = res;
                 });
                 this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
              }else{
                 //Si no hubo errores, se actualiza la información de los documentos con acciones realizadas
                 //this.getFilteredDocuments();
                 this.utils.recargarTablaDatosMultiplePorAccion(jsonInfoDocumentosDto, this.dataSource.filteredData, this.spinner, false, null, false, null, true);
              }
          });
      }else{
         //Si los documentos tienen aceptada la gdpr, entonces se actualiza la información de los documentos con acciones realizadas
         //this.getFilteredDocuments();
         this.utils.recargarTablaDatosMultiplePorAccion(jsonInfoDocumentosDto, this.dataSource.filteredData, this.spinner, false, null, false, null, true);
      }
    }
  }


  exportAsExcel() {
    this.spinner.show();
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    let JSONWS: XLSX.WorkSheet;
    let dataJS = [];

    //Variables para traducción
    var nombreExcel = "Informes Empresa";
    this.translate.get('INFORMES_EMPRESA').subscribe((res: string) => {
      nombreExcel = res;
    });
    var columnaFecha = "Fecha";
    this.translate.get('FECHA').subscribe((res: string) => {
      columnaFecha = res;
    });
    var columnaNombreEmpresaCentro = "Empresa - Centro";
    this.translate.get('EMPRESA_CENTRO').subscribe((res: string) => {
      columnaNombreEmpresaCentro = res;
    });
    var columnaTipoDeDocumento = "Tipo de Documento";
    this.translate.get('TIPO_DOCUMENTO').subscribe((res: string) => {
      columnaTipoDeDocumento = res;
    });
    var columnaDocumento = "Documento";
    this.translate.get('DOCUMENTO').subscribe((res: string) => {
      columnaDocumento = res;
    });
    var columnaObservaciones = "Observaciones";
    this.translate.get('OBSERVACIONES').subscribe((res: string) => {
      columnaObservaciones = res;
    });

    let isElementosSelect: boolean = false;

    this.dataSource._orderData(this.dataSource.data).forEach(item => {
      if (item.checked) {
        isElementosSelect = true;
        let new_item = {};
        this.tableHeaders.forEach(tableHeader => {
          switch (tableHeader) {
            case 'fecha':
              new_item[columnaFecha] = (new Date(item['fecha'])).toLocaleDateString();
              break;
            case 'empresa':
              if (item.centro != undefined) {
                new_item[columnaNombreEmpresaCentro] = item.empresa + '-' + item.centro;
              } else {
                new_item[columnaNombreEmpresaCentro] = item.empresa;
              }
              break;
            case 'tipoDocumento':
              new_item[columnaTipoDeDocumento] = item.tipoDocumento;
              break;
            case 'documento':
              new_item[columnaDocumento] = item.documento;
              break;
            case 'observaciones':
              new_item[columnaObservaciones] = item.observaciones;
              break;
            case 'origen':
              this.translate.get('ORIGEN').subscribe((res: string) => {
                if (item.origen === 0) {
                  this.translate.get('INTERNAL').subscribe((res2: string) => {
                    new_item[res] = res2;
                  });
                } else if (item.origen === 1) {
                  this.translate.get('EXTERNAL').subscribe((res2: string) => {
                    new_item [res] = res2;
                  });
                }
              });
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

    this.spinner.hide();

  }

  //Muestra el historico de acciones del documento
  verHistoricoDocumento(element) {
    const dialogConfig = new MatDialogConfig();
    this.utils.verHistoricoDocumentoComun(dialogConfig, element);
  }

  toggleElement(element,status){
    if(element.mostrar == false){
      element.mostrar = true;
    }else if (element.mostrar == true){
      element.mostrar = false;
    }else{
      element.mostrar=true;
    }
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
    if(fieldName =='idTipoDocumento'){
      if (this[formName].controls[formControlName].value.length > 0){
        //this.getSubTipoDocumento();
        this.getSubtiposDocumentoWithTipoDocPadre(null);
      }else{
        if(formControlName =='tipoDocForm'){
          this.subTipoDocumentoList = [];
        }
      }
    }
  }

  selectAllTwoDimension(formName,formControlName,values,values2,subArrayfieldName,toCompare,fieldName) {
    let result=[];
    values.forEach(item1=>{
      values2.forEach(item2=>{
        if(item1[toCompare] === item2){
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
    }else{
            this[formName].controls[formControlName].setValue(result);
    }
  }

}
