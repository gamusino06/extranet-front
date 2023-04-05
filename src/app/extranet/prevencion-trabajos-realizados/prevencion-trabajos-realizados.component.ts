import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../environments/environment';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PdfView } from 'src/app/modales/pdfView/pdfView.component';
import { Empresa } from 'src/app/Model/Empresa';
import { Centro } from 'src/app/Model/Centro';
import { UserService } from 'src/app/services/user.service';
import { UtilsService } from 'src/app/services/utils.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Globals } from '../globals';
import * as XLSX from 'xlsx';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as _moment from 'moment';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MY_FORMATS } from '../../../config/config';
import { TranslateService } from '@ngx-translate/core';
import { ChangeDetectorRef } from '@angular/core';

const moment = _moment;

export interface PrevencionTrabajosRealizadosInterface {
  idDocumento: number;
  fecha: string;
  empresa: string;
  centro: string;
  empresaCentroNombre: string;
  nombreActividad: string;
  observaciones: string;
}

@Component({
  selector: 'app-prevencion-trabajos-realizados',
  templateUrl: './prevencion-trabajos-realizados.component.html',
  styleUrls: ['./prevencion-trabajos-realizados.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class PrevencionTrabajosRealizadosComponent implements OnInit {

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
  environment = environment;
  documentationForm: FormGroup;
  empresasList: Empresa[];
  centroList: Centro[];
  tipoDocumentoList: any;
  actividadesList: any;
  subTipoDocumentoList: any;

  closeImgUrl = '../../assets/img/close.svg';
  searchImgUrl = '../../assets/img/search.svg';

  cleanImgUrl = '../../assets/img/borrar_filtros.svg';
  excelImgUrl = '../../assets/img/excel.svg';
  mailImgUrl = '../../assets/img/mail.svg';
  downloadImgUrl = '../../assets/img/download.svg';
  maxDate: Date;
  minDate: Date;

  tableHeaders: string[] = [
    'checklist',
    'fecha',
    'empresa',
    'nombreActividad',
    'observaciones'];

  idCompaniesSelectedList = [];
  idCentrosSelectedList = [];
  tipoDocumentoId: any;
  medDocDataDto: any;
  dataSource: any;
  dataSourceAux = new MatTableDataSource<PrevencionTrabajosRealizadosInterface>();

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('TABLEDOCUMENTS') table: ElementRef;
  @ViewChild('TABLEDOCUMENTS') exportTableDirective: ElementRef;

  //validators
  validActividad = this.globals.workerPattern;

  //Evita que se produzca el ERROR Error: ExpressionChangedAfterItHasBeenCheckedError
  ngAfterViewChecked()
  {
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    /*inicializacion de formulario*/
    this.initForm();
    this.getUserData();
    this.getTipoDocumento();
    //this.getActividades(); //Como el campo 'actividadForm' del formulario es un input, se comenta
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
      empresaForm: new FormControl(''),
      centroForm: new FormControl(''),
      actividadForm: new FormControl(''),
      fechaDesdeForm: new FormControl(moment()),
      fechaHastaForm: new FormControl(moment()),
      selectEmpresasRadioForm: new FormControl('1'),
      selectCentrosRadioForm: new FormControl('1'),
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
      this.getFilteredDocuments();
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

  getTipoDocumento() {
    this.userService.getSubtiposDocumento([this.globals.informes_tecnicos]).subscribe(result => {
      if(result){
      	this.tipoDocumentoList = result;
      }else{
      	this.spinner.hide();
      }
    }, (error => {
      if (environment.debug) console.log("Error al cargar los tipos de documento: " + error);
    }));
  }

  getActividades() {
    this.userService.getActividades().subscribe(result => {
      if(result){
      	this.actividadesList = result;
      }else{
      	this.spinner.hide();
      }
    }, (error => {
      if (environment.debug) console.log("Error al cargar las actividades: " + error);
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
    }
  }

  onSubmit() {
    this.getFilteredDocuments();
  }

  resetForm(): void {
    setTimeout(() => { //setTimeout needed on form reset
        this.setInitDates();

        this.documentationForm.controls['selectEmpresasRadioForm'].setValue('1');
        this.documentationForm.controls['selectCentrosRadioForm'].setValue('1');
        this.documentationForm.controls['empresaForm'].setValue([]);
        this.documentationForm.controls['centroForm'].setValue([]);
        this.documentationForm.controls['actividadForm'].setValue('');

        //this.getUserData(); //NOTA IMPORTANTE: No se vuelve a obtener los documentos cuando se limpie el filtro por petición de Preving (23/09/2021)
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
    //Método que comprueba si alguno de los fitlros de Empresa y Centro está en 'activo' o en 'inactivo' y va añadiendo empresas/centros a sus respectivas listas
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
      listaIdsTipoDocumento: [this.globals.trabajos_realizados],
      listaIdsEmpresas: idCompaniesListResult,
      listaIdsCentros: idCentrosListResult,
      fechaInicio: fechaInicio || '',
      fechaFin: fechaFin || '',
      listaFiltroMetadatosDto: [
        {
          nombreMetadato: this.globals.metadato_actividad,
          listaIdsValoresDato: this.documentationForm.get('actividadForm').value ? [this.documentationForm.get('actividadForm').value] : []
        }
      ]
    }

    this.spinner.show();
    this.userService.getMedicalDocuments(this.medDocDataDto).subscribe(results => {
      let result: PrevencionTrabajosRealizadosInterface[] = [];
      if (results != undefined) {
        results.forEach(item => {
          var nDatoObservaciones = 0;
          var nDatoActividad = 0;
          var c = 0;
          item.datos.forEach(dato => {
            if (dato.nombre === this.globals.metadato_observaciones) nDatoObservaciones = c;
            if (dato.nombre === this.globals.metadato_actividad) nDatoActividad = c;
            c++;
          })
          var auxEmpresaCentroNombre;
          if (item.centro != null)
            auxEmpresaCentroNombre = item.empresa.nombre + ' - ' + item.centro?.nombre
          else
            auxEmpresaCentroNombre = item.empresa.nombre;
          result.push({
            idDocumento: item.idDocumento,
            empresa: item.empresa?.nombre,
            centro: item.centro?.nombre,
            empresaCentroNombre: auxEmpresaCentroNombre,
            nombreActividad: item.datos[nDatoActividad]?.valor,
            fecha: item.fechaDocumento,
            observaciones: item.datos[nDatoObservaciones]?.valor
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

        if (environment.debug) console.log("Succes");
      }
      this.spinner.hide();

    }), (error => {
      if (environment.debug) console.log("Error");
    })
  }

  exportAsExcel() {
    this.spinner.show();
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    let JSONWS: XLSX.WorkSheet;
    let dataJS = [];

    let nombreArchivo = "Trabajos Realizados";
    this.translate.get('TRABAJOS_REALIZADOS').subscribe((res: string) => {
      nombreArchivo = res;
    });
    let empresa_text = "Empresa";
    this.translate.get('EMPRESA').subscribe((res: string) => {
      empresa_text = res;
    });
    let centroTrabajo_text = "Centro de trabajo";
    this.translate.get('CENTRO_TRABAJO').subscribe((res: string) => {
      centroTrabajo_text = res;
    });
    var columnaFecha = "Fecha";
    this.translate.get('FECHA').subscribe((res: string) => {
      columnaFecha = res;
    });
    var columnaNombre = "Nombre";
    this.translate.get('NOMBRE').subscribe((res: string) => {
      columnaNombre = res;
    });
    var columnaNombreActividad = "Nombre actividad";
    this.translate.get('NOMBRE_ACTIVIDAD').subscribe((res: string) => {
      columnaNombreActividad = res;
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
                new_item[empresa_text + " - " + centroTrabajo_text] = item.empresa + '-' + item.centro;
              } else {
                new_item[empresa_text + " - " + centroTrabajo_text] = item.empresa;
              }
              break;
            case 'nombre':
              new_item[columnaNombre] = item.nombre;
              break;
            case 'nombreActividad':
              new_item[columnaNombreActividad] = item.nombreActividad;
              break;
            case 'observaciones':
              new_item[columnaObservaciones] = item.observaciones;
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
      XLSX.writeFile(wb, nombreArchivo + '.xlsx');
    }

    this.spinner.hide();

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
    if (fieldName == 'idTipoDocumento') {
      if (this[formName].controls[formControlName].value.length > 0) {
        this.getSubTipoDocumento();
      } else {
        if (formControlName == 'tipoDocForm') {
          this.subTipoDocumentoList = [];
        }
      }
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

}
