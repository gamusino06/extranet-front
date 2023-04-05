import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../environments/environment';
import { UtilsService } from 'src/app/services/utils.service';
import { UserService } from 'src/app/services/user.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatPaginator } from '@angular/material/paginator';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import * as XLSX from 'xlsx';
import { Globals } from '../globals';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import * as _moment from 'moment';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {MY_FORMATS} from '../../../config/config';
import { TranslateService } from '@ngx-translate/core';
import { ChangeDetectorRef } from '@angular/core';
import { SelectProvinciaComponent } from '../components/select-provincia/select-provincia.component';
import { SelectLocalidadComponent } from '../components/select-localidad/select-localidad.component';

const moment =  _moment;

/*mock data*/
export interface CalendarioCursosInterface {
  idDocumento: string;
  fecha: string;
  curso: string;
  direccion: string;
  provincia: string;
  localidad: string;
  codigoPostal: string;
  horario: string;
}

@Component({
  selector: 'app-calendario-cursos',
  templateUrl: './calendario-cursos.component.html',
  styleUrls: ['./calendario-cursos.component.css'],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})
export class CalendarioCursosComponent implements OnInit {
  environment = environment;
  cleanImgUrl = '../../assets/img/borrar_filtros.svg';
  searchImgUrl = '../../assets/img/search.svg';
  excelImgUrl = '../../assets/img/excel.svg';
  mailImgUrl = '../../assets/img/mail.svg';
  downloadImgUrl = '../../assets/img/download.svg';

  localidadList: [];
  provinciaList: any[];
  documentationForm: FormGroup;
  maxDate: Date;
  minDate: Date;
  mostrarTabla: boolean;

  tableHeaders: string[] = [
    'checklist',
    'fecha',
    'curso',
    'direccion',
    'localidad',
    'codigoPostal',
    'provincia',
    'horario'
  ];

  medDocDataDto: any;
  dataSource: any;
  dataSourceAux = new MatTableDataSource<CalendarioCursosInterface>();

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('TABLECALENDARIOCURSOS') table: ElementRef;
  @ViewChild(SelectProvinciaComponent) hijoProvincia;
  @ViewChild(SelectLocalidadComponent) hijoLocalidad;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    public utilsService: UtilsService,
    private spinner: NgxSpinnerService,
    private globals: Globals,
    public translate: TranslateService,
    private cdRef:ChangeDetectorRef
  ) { }

  //validators
  validator = this.globals.workerPattern;

  //Evita que se produzca el ERROR Error: ExpressionChangedAfterItHasBeenCheckedError
  ngAfterViewChecked()
  {
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    this.mostrarTabla = false;
    this.initForm();
    this.getLocalidades();
    this.getProvincias();
    this.initColsOrder();
    //this.getFilteredDocuments();  //NOTA IMPORTANTE: 13/12/2021 PREVING indica que se omita la primera llamada de la obtención de los cursos.

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

  initForm() {
    this.documentationForm = new FormGroup({
      localidadForm: new FormControl(''),
      provinciaForm: new FormControl(''),
      cursoForm: new FormControl(''),
      fechaDesdeForm: new FormControl(moment()),
      fechaHastaForm: new FormControl(moment()),
      selectAllCheckBox: new FormControl('')
    });
    this.setInitDates();
  }

  getLocalidades() {
    this.localidadList = [];
    this.documentationForm.controls['localidadForm'].setValue('');
    /*mapeo de objeto JSON a enviar*/
    let maxProvinciasSelected = this.globals.maxProvinciasSelected;
    let dataReq = {
      listaIdsProvincia: this.documentationForm.value.provinciaForm || []
    };
    if (dataReq.listaIdsProvincia.length>0 && dataReq.listaIdsProvincia.length<maxProvinciasSelected+1) {
      this.utilsService.getLocalidades(dataReq).subscribe(data => {
        if(data){
          this.localidadList = data;
        }else{
          this.spinner.hide();
        }
      });
    }else if (dataReq.listaIdsProvincia.length==0 || dataReq.listaIdsProvincia.length>maxProvinciasSelected) {
      this.localidadList = [];
      if (dataReq.listaIdsProvincia.length>maxProvinciasSelected) {
        let titulo = "Seleccione un máximo de "+maxProvinciasSelected+" provincias para filtrar por Localidad";
        this.translate.get('ALERT_PROVINCIAS').subscribe((res: string) => {
            titulo = res;
        });
        this.utilsService.mostrarMensajeSwalFire('warning', titulo, '','var(--blue)', false);
      }
    }
  }

  getProvincias() {
    /*mapeo de objeto JSON a enviar*/
    let dataReq = {};
    this.utilsService.getProvincias(dataReq).subscribe(data => {
      if(data){
        this.provinciaList = data;
      }else{
        this.spinner.hide();
      }
    })
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

  setInitDates() {
    var now = new Date();
    now.setHours(23, 59, 59);
    this.minDate = now;
    var oneYearLater = new Date();
    oneYearLater.setDate(oneYearLater.getDate() + (365 * 1));
    oneYearLater.setHours(0, 0, 0);
    this.maxDate = oneYearLater;
    this.documentationForm.controls['fechaDesdeForm'].setValue(now);
    this.documentationForm.controls['fechaHastaForm'].setValue(oneYearLater);
  }

  resetForm(): void {
    setTimeout(() => { //setTimeout needed on form reset
        this.documentationForm.get('provinciaForm').setValue([]);
        this.localidadList = [];
        this.documentationForm.get('localidadForm').setValue([]);
        this.documentationForm.get('cursoForm').setValue("");

        this.setInitDates();
        //this.getFilteredDocuments();  //NOTA IMPORTANTE: No se vuelve a obtener los documentos cuando se limpie el filtro por petición de Preving (23/09/2021)
        this.initColsOrder();

        //Indicamos al componente de provincia y localidad que debe de limpiar el texto de búsqueda
        this.hijoProvincia.setValueInputProvinciaFilter();
        this.hijoLocalidad.setValueInputLocalidadFilter();
    });
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

  /*Sort Data*/
  mostrarMasElementos(element) {
    let result = false;
    if (element.empresaCentros.length > 1) {
      result = true;
    }

    element.empresaCentros.centros.forEach(centro => {
      if (centro > 1) {
        result = true;
      }
    });

    return result;
  }

  onSubmit() {
    this.getFilteredDocuments();
  }

  getFilteredDocuments() {
    let fechaFin;
    if (this.documentationForm.get('fechaHastaForm').value!==null) {
      fechaFin = new Date(this.documentationForm.get('fechaHastaForm').value);
      fechaFin.setHours(23, 59, 59);
    }

    let fechaInicio;
    if (this.documentationForm.get('fechaDesdeForm').value!==null) {
      fechaInicio = new Date(this.documentationForm.get('fechaDesdeForm').value);
      fechaInicio.setHours(0, 0, 0);
    }

    this.medDocDataDto = {
      listaIdsTipoDocumento: [this.globals.calendario_cursos],
      fechaInicio: fechaInicio || '',
      fechaFin: fechaFin || '',
      listaFiltroMetadatosDto: [
        {
          nombreMetadato: this.globals.metadato_nombre_curso,
          listaIdsValoresDato: this.documentationForm.get('cursoForm').value ? [this.documentationForm.get('cursoForm').value] : []
        },
        {
         nombreMetadato: this.globals.metadato_localidad,
         listaIdsValoresDato: this.documentationForm.get('localidadForm').value ? this.documentationForm.get('localidadForm').value : []
        }
        ,
        {
         nombreMetadato: this.globals.metadato_provincia_localidad,
         listaIdsValoresDato: this.documentationForm.get('provinciaForm').value ? this.documentationForm.get('provinciaForm').value : []
        }
      ]
    }

    this.spinner.show();
    this.userService.getMedicalDocuments(this.medDocDataDto).subscribe(results => {
      let result: CalendarioCursosInterface[] = [];
      if (results != undefined) {
        results.forEach(item => {

          var nDatoCurso = 0;
          var nDatoDireccion = 0;
          var nDatoCodigoPostal = 0;
          var nDatoHorario = 0;
          var nDatoLocalidad = 0;
          var c = 0;
          item.datos.forEach(dato => {
            if (dato.nombre === this.globals.metadato_curso) nDatoCurso = c;
            if (dato.nombre === this.globals.metadato_direccion) nDatoDireccion = c;
            if (dato.nombre === this.globals.metadato_codigo_postal) nDatoCodigoPostal = c;
            if (dato.nombre === this.globals.metadato_horario) nDatoHorario = c;
            if (dato.nombre === this.globals.metadato_localidad) nDatoLocalidad = c;
            c++;
          })
          result.push({
            idDocumento: item.idDocumento,
            fecha: item.fechaDocumento,
            //curso: item.datos[nDatoCurso]?.valorDto.nombre,
            curso: item.datos[nDatoCurso]?.valor,
            direccion: item.datos[nDatoDireccion]?.valor,
            localidad: item.datos[nDatoLocalidad]?.valorDto.nombre,
            provincia: item.datos[nDatoLocalidad]?.valorDto.provincia.nombre,
            codigoPostal: item.datos[nDatoCodigoPostal]?.valor,
            horario: item.datos[nDatoHorario]?.valor,
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

    let calendarioCursos_text = "Calendario cursos";
    this.translate.get('CALENDARIO_CURSOS').subscribe((res: string) => {
      calendarioCursos_text = res;
    });
    let empresa_text = "Empresa";
    this.translate.get('EMPRESA').subscribe((res: string) => {
      empresa_text = res;
    });
    let curso_text = "Curso";
    this.translate.get('CURSO').subscribe((res: string) => {
      curso_text = res;
    });
    let fecha_text = "Fecha";
    this.translate.get('FECHA').subscribe((res: string) => {
      fecha_text = res;
    });
    let localidad_text = "Localidad";
    this.translate.get('LOCALIDAD').subscribe((res: string) => {
      localidad_text = res;
    });
    let direccion_text = "Dirección";
    this.translate.get('DIRECCION').subscribe((res: string) => {
      direccion_text = res;
    });
    let provincia_text = "Provincia";
    this.translate.get('PROVINCIA').subscribe((res: string) => {
      provincia_text = res;
    });
    let codigoPostal_text = "Codigo Postal";
    this.translate.get('CODIGO_POSTAL').subscribe((res: string) => {
      codigoPostal_text = res;
    });
    let horario_text = "Horario";
    this.translate.get('HORARIO').subscribe((res: string) => {
      horario_text = res;
    });

    let isElementosSelect : boolean = false;

    this.dataSource._orderData(this.dataSource.data).forEach(item => {
      if (item.checked) {
        isElementosSelect = true;
        let new_item = {};
        this.tableHeaders.forEach(tableHeader => {
          switch (tableHeader) {
            case 'fecha':
              new_item[fecha_text] = (new Date(item.fecha)).toLocaleDateString();
              break;
            case 'curso':
              new_item[curso_text] = item.curso;
              break;
            case 'direccion':
              new_item[direccion_text] = item.direccion;
              break;
            case 'localidad':
              new_item[localidad_text] = item.localidad;
              break;
            case 'provincia':
              new_item[provincia_text] = item.provincia;
              break;
            case 'codigoPostal':
              new_item[codigoPostal_text] = item.codigoPostal;
              break;
            case 'horario':
              new_item[horario_text] = item.horario;
              break;
            default:
              break;
          }
        });
        dataJS.push(new_item);
      }
    });

    if (isElementosSelect == false) {
      let titulo = "Debe seleccionar al menos un elemento a exportar";
      this.translate.get('ERROR_SELECCIONA_EXPORTAR').subscribe((res: string) => {
        titulo = res;
      });
      this.utilsService.mostrarMensajeSwalFire('error', titulo, '', 'var(--blue)', false);
    } else {
      let result = XLSX.utils.sheet_add_json(JSONWS, dataJS);
      XLSX.utils.book_append_sheet(wb, result, 'Sheet1');
      XLSX.writeFile(wb, calendarioCursos_text + '.xlsx');
    }

    this.spinner.hide();
  }

  openMoreTrainingCalendar(){
    window.open(this.globals.more_training_calendar_url, 'self');
  }

}
