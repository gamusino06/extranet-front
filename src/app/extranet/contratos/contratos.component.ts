import { ElementRef } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Empresa } from 'src/app/Model/Empresa';
import { TiposDocumento } from 'src/app/Model/TiposDocumento';
import { UserService } from 'src/app/services/user.service';
import { UtilsService } from 'src/app/services/utils.service';
import { PdfView } from 'src/app/modales/pdfView/pdfView.component';
import * as XLSX from 'xlsx';
import { Globals } from '../globals';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import Swal from 'sweetalert2';
import { ShareDocumentComponent } from 'src/app/modales/shareDocument/shareDocument.component';
import { TranslateService } from '@ngx-translate/core';

import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import * as _moment from 'moment';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {MY_FORMATS} from '../../../config/config';
import { ChangeDetectorRef } from '@angular/core';

const moment =  _moment;
export interface ContractsInterface {
  checked: boolean;
  idDocumento: number;
  fechaDocumento: Date;
  nombreDocumento: string;
  tipoDocumento: TiposDocumento;
  nombreEmpresa: string;
  nombreEntidad: string;
  activo: string;
  fechaBaja: Date;
  documentosHijos: any[];
  accionesRealizadas: boolean;
  listaHistoricoDocumentoDto: any[];
  ubicacion: string;
}

@Component({
  selector: 'app-contratos',
  templateUrl: './contratos.component.html',
  styleUrls: ['./contratos.component.css'],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})
export class ContratosComponent implements OnInit {
  environment = environment;
  cleanImgUrl = '../../assets/img/borrar_filtros.svg';
  searchImgUrl = '../../assets/img/search.svg';
  excelImgUrl = '../../assets/img/excel.svg';
  mailImgUrl = '../../assets/img/mail.svg';
  downloadImgUrl = '../../assets/img/download.svg';

  userForm: FormGroup;
  empresasList: Empresa[];
  empresa: string;
  entidadList: any[];
  idCompaniesSelectedList = [];
  idEntitiesSelectedList = [];
  contractsDataDto: any;
  result: any;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('TABLECONTRACS') table: ElementRef;
  @ViewChild('TABLECONTRACS') exportTableDirective: ElementRef;
  sortBy: any;
  maxDate: Date;
  minDate: Date;
  mostrarTabla: boolean;
  isLoginSimulado: boolean = false;

  tableHeaders: string[] = [
    'checklist',
    'newList',
    'fechaDocumento',
    'nombreEmpresa',
    'nombreEntidad',
    'tipoDocumento',
    'activo',
    'fechaBaja',
    'specialAction'
  ];

  dataSource: MatTableDataSource<ContractsInterface>;

  //Para calcular numero maximo de dicumentos hijos por fila
  documentosHijosRows:number[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    public utils: UtilsService,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
    private globals: Globals,
    private translate: TranslateService,
    private cdRef:ChangeDetectorRef
  ) { }

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
    this.getEntities();

    //Restore table cols order
    if (localStorage.getItem('tableColsOrder')) {
      let localStorageObj: object;
      localStorageObj = JSON.parse(localStorage.getItem('tableColsOrder'));

      if (localStorageObj[this.constructor.name] &&
        Array.isArray(localStorageObj[this.constructor.name]) &&
        localStorageObj[this.constructor.name].length == this.tableHeaders.length)
        this.tableHeaders = localStorageObj[this.constructor.name];
    }

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
        $('.mat-tab-list').css('transform', 'translateX(-430px)');
      });
    }
  }

  initForm() {
    this.userForm = this.formBuilder.group({
      empresaForm: new FormControl(''),
      entidadForm: new FormControl(''),
      activoForm: new FormControl(0),
      fechaDesdeForm: new FormControl(moment()),
      fechaHastaForm: new FormControl(moment()),
      selectEmpresasRadioForm: new FormControl('1'),
      selectCentrosRadioForm: new FormControl('1'),
      selectAllCheckBox: new FormControl(''),
      todosCentrosForm: true
    });
    this.setDefaultForm();
  }
  setDefaultForm(): void {
    // SET DATE INI AND END
    var now = new Date();
    now.setHours(23, 59, 59);
    this.maxDate = now;
    //NOTA IMPORTANTE: Por petición de PREVING, en Personas Trabajadoras (tb en citación) y Contratos, la fecha desde es de 2001
    var nYearsAgo = new Date(this.globals.extranet_fecha_mas_antigua); //("2001-01-01 00:00:00")Año,Mes,Día,Hora,Minutos,Segundos)
    /*nYearsAgo.setDate(nYearsAgo.getDate() - (365 * this.globals.extranet_intervalo_fechas_filtro));
    nYearsAgo.setHours(0, 0, 0);*/
    this.minDate = nYearsAgo;
    this.userForm.controls['selectEmpresasRadioForm'].setValue('1');
    this.userForm.controls['fechaDesdeForm'].setValue(nYearsAgo);
    this.userForm.controls['fechaHastaForm'].setValue(now);
    this.userForm.controls['activoForm'].setValue(0);
    this.userForm.get('empresaForm').setValue([]);
    this.userForm.get('entidadForm').setValue([]);
  }
  resetForm(): void {
    setTimeout(() => { //setTimeout needed on form reset
      this.setDefaultForm();
      this.updateEmpresasYCentros();
      //this.getFilteredContracts();//NOTA IMPORTANTE: No se vuelve a obtener los documentos cuando se limpie el filtro por petición de Preving (23/09/2021)
    });
  }

  getUserData(): void {
    this.userService.getUser().subscribe(user => {
      this.empresasList = user.empresas;
      this.updateEmpresasYCentros();
      //this.getFilteredContracts();//NOTA IMPORTANTE: Por petición de PREVING (13/01/2022) a partir de ahora las pantallas con descarga de documentos, se omite la 1º llamada.
    });
  }

  updateEmpresasYCentros() {
    if (this.empresasList.length == 1) {
      this.userForm.controls.empresaForm.setValue([this.empresasList[0].idEmpresa]);
      /*this.empresasList.forEach(empresa => {
        if (empresa.centros.length == 1) {
          this.userForm.controls.centroForm.setValue([empresa.centros[0].idCentro]);
        }
      })*/
    }
  }

  getEntities() {
    this.userService.getEntitiesUser().subscribe(entities => {
      if (entities) {
        this.entidadList = entities;
      }else{
        this.spinner.hide();
      }
    });
  }

  onSubmit(): void {
    this.getFilteredContracts();
  }


  getFilteredContracts() {
    let idCompaniesListResult: number[] = [];
    let idEntitiesListResult;

    if ((this.userForm.get('empresaForm').value === "") || (this.userForm.get('empresaForm').value && this.userForm.get('empresaForm').value.length == 0)) {
      this.idCompaniesSelectedList = [];
      idCompaniesListResult = this.idCompaniesSelectedList;
    } else {
      idCompaniesListResult = this.userForm.get('empresaForm').value;
    }

    if ((this.userForm.get('entidadForm').value === "") || (this.userForm.get('entidadForm').value && this.userForm.get('entidadForm').value.length == 0)) {
      this.idEntitiesSelectedList = [];
      idEntitiesListResult = this.idEntitiesSelectedList;
    } else {
      idEntitiesListResult = this.userForm.get('entidadForm').value;
    }

    let fechaFin;
    if (this.userForm.get('fechaHastaForm').value!==null)
    {
      fechaFin = new Date(this.userForm.get('fechaHastaForm').value);
      fechaFin.setHours(23, 59, 59);
    }

    let fechaInicio;
    if (this.userForm.get('fechaDesdeForm').value!==null)
    {
      fechaInicio = new Date(this.userForm.get('fechaDesdeForm').value);
      fechaInicio.setHours(0, 0, 0);
    }

    let idEmpresasList: number[] = [];
    let idCentrosList: number[] = [];
    //Método que comprueba si alguno de los fitlros de Empresa y Centro está en 'activo' o en 'inactivo' y va añadiendo empresas/centros a sus respectivas listas
    this.utils.envioDatosConFiltroActivoInactivo (this.userForm.get('selectEmpresasRadioForm').value,
                                        0,
                                        this.userForm.get('empresaForm').value,
                                        "",
                                        this.empresasList,
                                        idEmpresasList,
                                        idCentrosList);

    //Se comprueba si el usuario había seleccionado alguna empresa en el campo 'empresaForm' para
    //alterar o no los atributos a enviar al BACK
    if (this.userForm.get('empresaForm').value.length === 0) {
        idCompaniesListResult = idEmpresasList;
    } else if (this.userForm.get('empresaForm').value.length > 0 && idCompaniesListResult.length === 0){
        this.userForm.get('empresaForm').value.forEach(idEmpresa => {
            idCompaniesListResult.push(idEmpresa);
        });
    }

    this.contractsDataDto = {
      listaIdsTipoDocumento: [this.globals.contratos],
      listaIdsEmpresas: idCompaniesListResult,
      activo: this.userForm.get('activoForm').value,
      fechaInicio: fechaInicio || '',
      fechaFin: fechaFin || '',
      listaFiltroMetadatosDto: [
        {
          nombreMetadato: "entidad",
          listaIdsValoresDato: this.userForm.get('entidadForm').value || []
        }
      ]
    }

    this.spinner.show();
    this.userService.getFilteredBills(this.contractsDataDto).subscribe(results => {
      if(results !== undefined && results.length > 0){
        let result:ContractsInterface[] = [];
        let documentosHijosCount: number[] = [];
        results.forEach(item => {
          var nDatoFechaBaja = 0;
          var nDatoEntidad = 0;
          var c = 0;
          item.datos.forEach(dato => {
            if (dato.nombre === this.globals.metadato_fecha_baja) nDatoFechaBaja = c;
            if (dato.nombre === this.globals.metadato_entidad) nDatoEntidad = c;
            c++;
          })

          result.push({
            checked: false,
            idDocumento: item.idDocumento,
            fechaDocumento: item.fechaDocumento,
            nombreDocumento: item.nombre,
            tipoDocumento: item.tipoDocumento,
            nombreEmpresa: item.empresa.nombre,
            nombreEntidad: item.datos[nDatoEntidad]?.valorDto.nombre,
            activo: item.activo,
            fechaBaja: item.datos[nDatoFechaBaja]?.valor,
            documentosHijos: item.documentosHijos,
            accionesRealizadas:item.accionesRealizadas,
            ubicacion: item.ubicacion,
            listaHistoricoDocumentoDto: []
            //listaHistoricoDocumentoDto: item?.listaHistoricoDocumentoDto || [] //Se comenta ya que ahora el Back sólo va a devolver si tiene acciones realizadas o no
          });
         documentosHijosCount.push(item.documentosHijos.length);
        });

        if (documentosHijosCount.length > 0)
            this.documentosHijosRows = Array(Math.max(...documentosHijosCount));
        else
            this.documentosHijosRows = []

        this.dataSource = new MatTableDataSource(result);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        //Fix sort problem: sort mayúsculas y minúsculas
        this.dataSource.sortingDataAccessor = (item, property) => {
          if (!item[property])
            return "";

          if (property == 'fecha')
            return new Date(item.fechaDocumento);

          if (property == 'fechaBaja')
            return new Date(item.fechaBaja);

          if (typeof item[property] === 'string')
            return item[property].toLocaleLowerCase();


          return item[property];

        };

        this.mostrarTabla = true;
      }else if(results !== undefined && results.length === 0){
        this.utils.mostrarMensajeSwalFireDocumentosNoEncontrados();
      }
      this.spinner.hide();
    }), (error => {
      if (environment.debug) console.log("Error");
    })
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

  isValidForm() { // TO DO: replicar la logica para las fechas
    let importeDesdeFormValue = this.userForm.controls['importeDesdeForm'].value;
    let importeHastaFormValue = this.userForm.controls['importeHastaForm'].value;

    if (importeDesdeFormValue === null && importeHastaFormValue === null) {
      return true;
    }

    if (importeDesdeFormValue === "" && importeHastaFormValue === "") {
      return true;
    }

    if ((importeDesdeFormValue !== "" || importeDesdeFormValue !== null)
      && (importeHastaFormValue === "" || importeHastaFormValue === null)) {
      return false;
    }
    else {
      if ((importeDesdeFormValue === "" || importeDesdeFormValue === null)
        && (importeHastaFormValue !== "" || importeHastaFormValue !== null)) {
        return false;
      }
      else {
        return true;
      }

    }
  }

  checkAllRows(event) {
    if (this.dataSource.data)
      this.dataSource.data.forEach(val => {
        val.checked = event.checked;
        val.documentosHijos.forEach(val => { val.checked = event.checked });
      });
  }

  exportAsExcel() {
    this.spinner.show();
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    let JSONWS: XLSX.WorkSheet;
    let dataJS = [];

    //Variables para traducción
    var nombreExcel = "Contratos";
    this.translate.get('CONTRATOS').subscribe((res: string) => {
      nombreExcel = res;
    });
    var columnaFecha = "Fecha";
    this.translate.get('FECHA').subscribe((res: string) => {
      columnaFecha = res;
    });
    var columnaNombreEmpresa = "Empresa";
    this.translate.get('EMPRESA').subscribe((res: string) => {
      columnaNombreEmpresa = res;
    });
    var columnaNombreEntidad = "Entidad";
    this.translate.get('ENTIDAD').subscribe((res: string) => {
      columnaNombreEntidad = res;
    });
    var columnaTipoDocumento = "Tipo Documento";
    this.translate.get('TIPO_DOCUMENTO').subscribe((res: string) => {
      columnaTipoDocumento = res;
    });
    var columnaActivo = "Activo";
    this.translate.get('ACTIVO').subscribe((res: string) => {
      columnaActivo = res;
    });
    var columnaFechaBaja = "Fecha Baja";
    this.translate.get('FECHA_BAJA').subscribe((res: string) => {
      columnaFechaBaja = res;
    });
    var yesText = "Si";
    this.translate.get('SI').subscribe((res: string) => {
      yesText = res;
    });

    let isElementosSelect: boolean = false;

    this.dataSource._orderData(this.dataSource.data).forEach(item => {
      if (item.checked) {
        isElementosSelect = true;
        let new_item = {};

        this.tableHeaders.forEach(tableHeader => {
          switch (tableHeader) {
            case 'fechaDocumento':
              new_item[columnaFecha] = (new Date(item['fechaDocumento'])).toLocaleDateString();
              break;
            case 'nombreEmpresa':
              new_item[columnaNombreEmpresa] = item.nombreEmpresa;
              break;
            case 'nombreEntidad':
              new_item[columnaNombreEntidad] = item.nombreEntidad;
              break;
            case 'tipoDocumento':
              new_item[columnaTipoDocumento] = item.tipoDocumento.nombre;
              break;
            case 'activo':
              new_item[columnaActivo] = item['activo'] ? yesText : 'No';
              break;
            case 'fechaBaja':
              new_item[columnaFechaBaja] = item.fechaBaja ? (new Date(item.fechaBaja)).toLocaleDateString() : "";
              break;
          }

        })
        dataJS.push(new_item);

        item.documentosHijos.forEach(item => {

          var nDatoFechaBaja = 0;
          var nDatoEntidad = 0;
          var c = 0;
          item.datos.forEach(dato => {
            if (dato.nombre === this.globals.metadato_fecha_baja) nDatoFechaBaja = c;
            if (dato.nombre === this.globals.metadato_entidad) nDatoEntidad = c;
            c++;
          })
          new_item = {};
          new_item[columnaFecha] = (new Date(item['fechaDocumento'])).toLocaleDateString();
          new_item[columnaNombreEmpresa] = item.empresa.nombre;
          new_item[columnaNombreEntidad] = item.datos[nDatoEntidad]?.valorDto.nombre;
          new_item[columnaTipoDocumento] = item.tipoDocumento.nombre;
          new_item[columnaActivo] = item['activo'];
          new_item[columnaFechaBaja] = item.datos[nDatoFechaBaja].valor ? (new Date(item.datos[nDatoFechaBaja].valor)).toLocaleDateString() : "";
          dataJS.push(new_item);
        });
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

  /*compartir */
  compartir(element) {
    let menuNameComponent = 'Administración';
    this.translate.get('ADMINISTRACION').subscribe((res: string) => {
      menuNameComponent = res;
    });
    let subMenuNameComponent = 'Contratos';
    this.translate.get('CONTRATOS').subscribe((res: string) => {
      subMenuNameComponent = res;
    });
    let nombreDocumento;
    if(element.nombreDocumento){
      nombreDocumento = element.nombreDocumento;
    }else{
      nombreDocumento = element.nombre;
    }
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      element: element,
      menuName: menuNameComponent,
      subMenuName: subMenuNameComponent
  }
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
              listaIdsTiposDocumentos: [element.tipoDocumento.idTipoDocumento],
              listaUuidsDocumentos: [element.ubicacion],
              loginSimuladoActivado: this.isLoginSimulado,
              accion:{
                  idAccionDoc:'1'
              },
              filename:nombreDocumento + ".pdf"
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
          }else{
            //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
            if (!this.isLoginSimulado){
              //Recarga los datos de nuevo para quitar nuevo documento y mostrar las acciones de los documentos
              //this.recargarTablaDatosPorAccion(element);
              this.utils.recargarTablaDatosPorAccion(element, this.dataSource.filteredData, this.spinner, false, null, false, null, false);
            }
          }
        }),(error => {
          if (environment.debug) console.log("Error al Enviar EMAIL - Compartir Documento");
        });
      }

    });
  }

  /*compartir Múltiple */
  compartirMultiple() {
    let listaIdsDocumentos: number[] = [];
    let listaIdsTiposDocumentos: number[] = [];
    let listaUuidsDocumentos: string[] = [];
    let listaDocumentos: any[] = [];
    let documentosConAcciones = false;

    if (this.dataSource.data) {
      this.dataSource.data.forEach(documento => {
        if (documento.checked) {
          listaDocumentos.push(documento);
          listaIdsDocumentos.push(documento.idDocumento);
          listaIdsTiposDocumentos.push(documento.tipoDocumento.idTipoDocumento);
          listaUuidsDocumentos.push(documento.ubicacion);
          if(documento.accionesRealizadas)
            documentosConAcciones = true;
          documento.documentosHijos.forEach(documentoHijo =>
          {
            if(documentoHijo.checked){
              listaDocumentos.push(documentoHijo);
              listaIdsDocumentos.push(documentoHijo.idDocumento);
              listaIdsTiposDocumentos.push(documentoHijo.tipoDocumento.idTipoDocumento);
              listaUuidsDocumentos.push(documentoHijo.ubicacion);
              if(documentoHijo.accionesRealizadas)
                documentosConAcciones = true;
            }
          });
        }
      });
    }

    if (listaIdsDocumentos != null && listaIdsDocumentos.length === 0){
        let titulo = "Debe seleccionar al menos un elemento a compartir";
        this.translate.get('ERROR_SELECCIONA_COMPARTIR').subscribe((res: string) => {
          titulo = res;
        });
        this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
    }else if (listaIdsDocumentos.length > this.globals.extranet_maximo_documentos_multiple){
        this.utils.mostrarMensajeSwalFireSobrepasadoLimiteDescargaMultiple(listaIdsDocumentos.length);
    }else{
        let menuNameComponent = 'Administración';
        this.translate.get('ADMINISTRACION').subscribe((res: string) => {
          menuNameComponent = res;
        });
        let subMenuNameComponent = 'Contratos';
        this.translate.get('CONTRATOS').subscribe((res: string) => {
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
                       idAccionDoc:'1'
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
                    let jsonInfoDocumentosDto: any[] = [];
                    listaIdsDocumentos.forEach(idDocumentoInfo => {
                        let jsonInfoDocumentoDto = {
                          idDocumento: idDocumentoInfo
                        };
                        jsonInfoDocumentosDto.push(jsonInfoDocumentoDto);
                    });

                    //this.recargarTablaDatosMultiplePorAccion(jsonInfoDocumentosDto);
                    this.utils.recargarTablaDatosMultiplePorAccion(jsonInfoDocumentosDto, this.dataSource.filteredData, this.spinner, false, null, false, null, false);
                  }
               }
               }),(error => {
                 if (environment.debug) console.log("Error al Enviar EMAIL - Compartir Documento");
               });
           }
        });
    }
  }

  /*previsualizar */
  previsualizar(element) {
    this.spinner.show();
    this.contractsDataDto = {
      listaIdsDocumentos: [element.idDocumento],
      listaIdsTiposDocumentos: [element.tipoDocumento.idTipoDocumento],
      listaUuidsDocumentos: [element.ubicacion],
      loginSimuladoActivado: this.isLoginSimulado,
      accion: { idAccionDoc: "3" }
    }
    this.utils.getFile(this.contractsDataDto).subscribe(pdfBase64 => {
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
        if (!this.isLoginSimulado){
          //Recarga los datos de nuevo para quitar nuevo documento y mostrar las acciones de los documentos
          //this.recargarTablaDatosPorAccion(element);
          this.utils.recargarTablaDatosPorAccion(element, this.dataSource.filteredData, this.spinner, false, null, false, null, false);
        }

        dialogRef.afterClosed().subscribe(result => {
        });
      }
      this.spinner.hide();
    })
  }

  /*descargar seleccion*/
  descargar(element) {
    this.spinner.show();
      this.contractsDataDto = {
      listaIdsDocumentos: [element.idDocumento],
      listaIdsTiposDocumentos: [element.tipoDocumento.idTipoDocumento],
      listaUuidsDocumentos: [element.ubicacion],
      loginSimuladoActivado: this.isLoginSimulado,
      accion: { idAccionDoc: "2" }
    }
    this.utils.getFile(this.contractsDataDto).subscribe(pdfBase64 => {
      if(pdfBase64){
        const linkSource = `data:application/pdf;base64,${pdfBase64.fichero}`;
        const filename = pdfBase64.nombreFichero + '.pdf';
        const downloadLink = document.createElement('a');
        downloadLink.href = linkSource;
        downloadLink.download = filename;
        downloadLink.click();

        //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
        if (!this.isLoginSimulado){
          //Recarga los datos de nuevo para quitar nuevo documento y mostrar las acciones de los documentos
          //this.recargarTablaDatosPorAccion(element);
          this.utils.recargarTablaDatosPorAccion(element, this.dataSource.filteredData, this.spinner, false, null, false, null, false);
        }
      }
      this.spinner.hide();
    })
  }

  descargarMultiple() {
    let listaIdsDocumentos: number[] = [];
    let listaIdsTiposDocumentos: number[] = [];
    let listaUuidsDocumentos: string[] = [];
    let documentosConAcciones = false;
    if (this.dataSource.data){
      this.dataSource.data.forEach(contrato => {
        if (contrato.checked){
          listaIdsDocumentos.push(contrato.idDocumento);
          listaIdsTiposDocumentos.push(contrato.tipoDocumento.idTipoDocumento);
          listaUuidsDocumentos.push(contrato.ubicacion);
          if(contrato.accionesRealizadas)
            documentosConAcciones = true;
        }
        contrato.documentosHijos.forEach(item => {
          if (item.checked){
            listaIdsDocumentos.push(item.idDocumento);
            listaIdsTiposDocumentos.push(item.tipoDocumento.idTipoDocumento);
            listaUuidsDocumentos.push(item.ubicacion);
            if(item.accionesRealizadas)
              documentosConAcciones = true;
          }
        });
      });

      this.spinner.show();
      if (listaIdsDocumentos.length > 0 && listaIdsDocumentos.length <= this.globals.extranet_maximo_documentos_multiple){
         //Variables para traducción
         var nombreZip = "Contratos";
         this.translate.get('CONTRATOS').subscribe((res: string) => {
           nombreZip = res;
         });
         this.utils.getZipFile({
            listaIdsDocumentos,
            listaIdsTiposDocumentos,
            listaUuidsDocumentos,
            loginSimuladoActivado: this.isLoginSimulado,
            accion: { idAccionDoc: "2" },
            filename: nombreZip
          }).subscribe(zipBase64 => {
            if(zipBase64){
              let downloadLink = document.createElement('a');
              downloadLink.href = `data:application/zip;base64,${zipBase64.fichero}`;
              downloadLink.download = nombreZip + '.zip';
              downloadLink.click();

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

                //this.recargarTablaDatosMultiplePorAccion(jsonInfoDocumentosDto);
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
          this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
      }
    }
  }

  //Muestra el historico de acciones del documento
  verHistoricoDocumento(element) {
    const dialogConfig = new MatDialogConfig();
    this.utils.verHistoricoDocumentoComun(dialogConfig, element);
  }

}

