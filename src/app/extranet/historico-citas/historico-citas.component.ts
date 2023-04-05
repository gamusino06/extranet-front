import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { environment } from '../../../environments/environment';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl, FormBuilder, FormGroup } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { Empresa } from 'src/app/Model/Empresa';
import { Centro } from 'src/app/Model/Centro';
import { UtilsService } from 'src/app/services/utils.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Globals } from '../globals';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { PdfView } from 'src/app/modales/pdfView/pdfView.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as _moment from 'moment';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MY_FORMATS } from '../../../config/config';
import { TranslateService } from '@ngx-translate/core';
import { ChangeDetectorRef } from '@angular/core';

const moment = _moment;

export interface HistoricDocumentsInterface {
  idCita: number;
  fecha: string;
  fechaString: string;
  hora: string;
  tipo: string;
  idEmpresa: number;
  centro: any;
  idCentroMedico: number;
  centroMedico: string;
  trabajador: string;
  idTrabajador:number;
  motivo: string;
  idMotivo:number;
  asistencia: string;
  anulada: string;
  puedeAnular: string;
  origenCita: number;
}

@Component({
  selector: 'app-historico-citas',
  templateUrl: './historico-citas.component.html',
  styleUrls: ['./historico-citas.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})

export class HistoricoCitasComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    public utils: UtilsService,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
    public globals: Globals,
    private translate: TranslateService,
    private cdRef:ChangeDetectorRef) {
  }
  environment = environment;
  documentationForm: FormGroup;
  empresasList: Empresa[];
  centroList: Centro[];
  tipoDocumentoList: any;
  subTipoDocumentoList: any;
  empresas: any[];
  mostrarTabla: boolean;

  //validators
  validNameSurname = this.globals.workerPattern;
  validNifNie = this.globals.nifNiePattern;

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
    'empresasCentros',
    'centroMedico',
    'tipo',
    'motivo',
    'trabajador',
    'asistencia',
    'anulada',
    'specialAction'];

  idCompaniesSelectedList = [];
  idCentrosSelectedList = [];
  tipoDocumentoId: any;
  medDocDataDto: any;
  dataSource: any;
  dataSourceAux = new MatTableDataSource<HistoricDocumentsInterface>();

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('TABLEHISTORICDOCUMENTS') table: ElementRef;
  @ViewChild('TABLEHISTORICDOCUMENTS') exportTableDirective: ElementRef;

  //Evita que se produzca el ERROR Error: ExpressionChangedAfterItHasBeenCheckedError
  ngAfterViewChecked()
  {
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    this.mostrarTabla = false;
    /*inicializacion de formulario*/
    this.initForm();
    this.getUserData();
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

    if(localStorage.getItem('workerData')) {
      const workerData = JSON.parse(localStorage.getItem('workerData'));
      this.documentationForm.controls['nifForm'].setValue(workerData.workerNIF);
      this.documentationForm.controls['trabajadorActivoForm'].setValue(workerData.workerIsActive);
      localStorage.removeItem('workerData');
      this.onSubmit();
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
      nombreTrabajadorForm: new FormControl(''),
      apellidosTrabajadorForm: new FormControl(''),
      nifForm: new FormControl(''),
      asisteForm: new FormControl(0),
      trabajadorActivoForm: new FormControl(1),
      fechaDesdeForm: new FormControl(moment()),
      fechaHastaForm: new FormControl(moment()),
      selectAllCheckBox: new FormControl(''),
      selectEmpresasRadioForm: new FormControl('1'),
      selectCentrosRadioForm: new FormControl('1'),
      todosCentrosForm: true
    }
    );
    this.setInitDates();
  }

  setInitDates() {
    var now = new Date();
    now.setMonth(now.getMonth() + 1);
    now.setHours(23, 59, 59);
    this.maxDate = now;
    var oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - 365);
    oneYearAgo.setHours(0, 0, 0);
    this.minDate = oneYearAgo;
    this.documentationForm.controls['fechaDesdeForm'].setValue(oneYearAgo);
    this.documentationForm.controls['fechaHastaForm'].setValue(now);
  }

  getUserData(): void {
    this.userService.getUser().subscribe(user => {
      this.empresasList = user.empresas;
      this.updateEmpresasYCentros();

      //this.getCitas();  //NOTA IMPORTANTE: Por petición de Preving, el 28/01/2022, se comenta que se obtenga las citaciones
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

  onSubmit() {
    this.getCitas();
  }

  getCitas(): void {
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

    let data = {
      listaIdsEmpresas: idsListResult[0],
      listaIdsCentros: idsListResult[1],
      nombreTrabajador: this.documentationForm.get('nombreTrabajadorForm').value,
      apellidosTrabajador: this.documentationForm.get('apellidosTrabajadorForm').value,
      nifTrabajador: this.documentationForm.get('nifForm').value,
      fechaInicio: this.documentationForm.get('fechaDesdeForm').value,
      fechaFin: this.documentationForm.get('fechaHastaForm').value,
      asiste: this.documentationForm.get('asisteForm').value,
      trabajador_activo: this.documentationForm.get('trabajadorActivoForm').value
    };
    this.spinner.show();
    this.userService.getCitas(data).subscribe(citasTrabajadores => {
      if(citasTrabajadores !== undefined && citasTrabajadores.length > 0){
        let result: HistoricDocumentsInterface[] = [];
        citasTrabajadores.forEach((item) => {
          result.push({
            idCita: item.idCita,
            fecha: item.fecha,
            fechaString: item.fechaString,
            idEmpresa: item.centro.empresa.idEmpresa,
            centro: item.centro,
            idCentroMedico: item.centroMedico.idCentroMedico,
            centroMedico: item.centroMedico.nombre,
            hora: item.fecha,
            tipo: item.tipoCita?.nombre,
            motivo: item.motivoCita?.nombre,
            idMotivo: item.motivoCita?.idMotivoCita,
            trabajador: item.trabajador?.nombre + ' ' + item.trabajador?.apellidos + '<br>' + item.trabajador?.nif,
            idTrabajador: item.trabajador?.idTrabajador,
            asistencia: item.asistido,
            anulada: item.anulada,
            puedeAnular: item.puedeAnular,
            origenCita: item.origenCita
          });
        });
        this.dataSource = new MatTableDataSource(result);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.dataSource.sortingDataAccessor = (item, property) => {
          if(property == 'fecha')
            return item['fecha'];

          if(property == 'motivo')
            return item['motivo'];

          if(property == 'tipo')
            return item['tipo'];

          if(property == 'anulada')
            return item['anulada'];

          if(property == 'asistencia')
            return item['asistencia'];

          if(property == 'trabajador')
            return item['trabajador'];

          if(property == 'empresasCentros')
            return item['idEmpresa'];

          if(property == 'centroMedico')
            return item['centroMedico'];
        };

        this.mostrarTabla = true;
      }else{
        this.utils.mostrarMensajeSwalFireCitasNoEncontradas();
      }
      this.spinner.hide();
    }, error => {
      this.spinner.hide();
      this.utils.mostrarMensajeSwalFire('error', error.error.message, '', 'var(--blue)', false);
    })
  }

  resetForm(): void {
    setTimeout(() => {
      this.documentationForm.get('empresaForm').setValue([]);
      this.documentationForm.get('centroForm').setValue([]);
      this.documentationForm.get('nombreTrabajadorForm').setValue("");
      this.documentationForm.get('apellidosTrabajadorForm').setValue("");
      this.documentationForm.get('nifForm').setValue("");
      this.documentationForm.get('selectEmpresasRadioForm').setValue("1");
      this.documentationForm.get('selectCentrosRadioForm').setValue("1");
      this.documentationForm.get('asisteForm').setValue("0");
      this.documentationForm.get('trabajadorActivoForm').setValue(1);
      this.setInitDates();
      //this.getUserData();//Evitamos llamada al Back
      this.updateEmpresasYCentros();
      this.initColsOrder();
    });
  }

  exportAsExcel() {
    this.spinner.show();
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    let JSONWS: XLSX.WorkSheet;
    let dataJS = [];


    //Variables para traducción
    var nombreExcel = "Historico Citas";
    this.translate.get('HISTORICO_CITAS').subscribe((res: string) => {
      nombreExcel = res;
    });
    var columnaFecha = "Fecha";
    this.translate.get('FECHA').subscribe((res: string) => {
      columnaFecha = res;
    });
    var columnaEmpresaCentro = "Empresa - Centro";
    this.translate.get('EMPRESA_CENTRO').subscribe((res: string) => {
      columnaEmpresaCentro = res;
    });
    var columnaMedico = "Centro Médico";
    this.translate.get('CENTRO_MEDICO').subscribe((res: string) => {
      columnaMedico = res;
    });
    var columnaTipo = "Tipo";
    this.translate.get('TIPO').subscribe((res: string) => {
      columnaTipo = res;
    });
    var columnaMotivo = "Motivo";
    this.translate.get('MOTIVO').subscribe((res: string) => {
      columnaMotivo = res;
    });
    var columnaTrabajador = "Trabajador";
    this.translate.get('TRABAJADOR').subscribe((res: string) => {
      columnaTrabajador = res;
    });
    var columnaTrabajadorNif = "NIF/NIE";
    this.translate.get('NIF_NIE').subscribe((res: string) => {
      columnaTrabajadorNif = res;
    });
    var columnaAsistencia = "Asistencia";
    this.translate.get('ASISTENCIA').subscribe((res: string) => {
      columnaAsistencia = res;
    });
    var columnaAnulada = "Anulada";
    this.translate.get('ANULADA').subscribe((res: string) => {
      columnaAnulada = res;
    });

    let isElementosSelect: boolean = false;

    this.dataSource.filteredData.forEach(item => {
      if (item.checked) {
        isElementosSelect = true;
        let new_item = {};
        new_item[columnaFecha] = (new Date(item['fecha'])).toLocaleString();

        if (item['centro']){
          new_item[columnaEmpresaCentro] = item.centro.empresa.nombre + ' - ' + item.centro.nombre
        }

        new_item[columnaMedico] = item.centroMedico;
        new_item[columnaTipo] = item.tipo;
        new_item[columnaMotivo] = item.motivo;
        let trabajadorYNif = item.trabajador.split("<br>");
        new_item[columnaTrabajador] = trabajadorYNif[0];
        new_item[columnaTrabajadorNif] = trabajadorYNif[1];
        new_item[columnaAsistencia] = item.asistencia ? 'si' : 'no';
        new_item[columnaAnulada] = item.anulada ? 'si' : 'no';
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

  anulacionCita(element) {
    this.spinner.show();
    let empresaCita = {
      idEmpresa: element.idEmpresa,
    }
    let centroCita = {
      idCentro: element.centro.idCentro,
    }
    let centroMedicoCita = {
      idCentroMedico: element.idCentroMedico,
    }
    let motivoCitacion = {
      idMotivoCita: element.idMotivo,
    }
    let trabajadorCita = {
      idTrabajador: element.idTrabajador,
    }

    let data = {
      idCita: element.idCita,
      empresaDto: empresaCita,
      centro: centroCita,
      centroMedico: centroMedicoCita,
      fecha: element.fecha,
      horaCita: element.hora,
      trabajador: trabajadorCita,
      motivoCita: motivoCitacion
    };
    this.utils.anulacionCita(data).subscribe(response => {
      this.spinner.hide();
      let titulo = "Cita anulada correctamente";
      this.translate.get('CITA_ANULADA_CORRECTAMENTE').subscribe((res: string) => {
          titulo = res;
      });

      Swal.fire({
        icon: 'success',
        title: titulo,
        allowOutsideClick: false
      }).then((result) => {
        if (result.isConfirmed) {
          //this.getCitas();
          this.actualizarCitaConAnulacion(element);
        }
      })
    }, error => {
      this.spinner.hide();
      Swal.fire({
        icon: 'error',
        title: error.error.message,
        allowOutsideClick: false
      }).then((result) => {
        if (result.isConfirmed) {
          //this.getCitas();
        }
      })
    })
  }

  //Metodo que actualiza la cita para que ya no se pueda anular, ya que ya fue anulada en Back
  actualizarCitaConAnulacion(element){
    this.dataSource.filteredData.forEach(cita => {
      if (cita.idCita === element.idCita){
        cita.asistencia = false;
        cita.anulada = true;
        cita.puedeAnular = false;
      }
    });
  }



}
