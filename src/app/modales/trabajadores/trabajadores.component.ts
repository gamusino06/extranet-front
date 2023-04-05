import { Component, Inject, ElementRef, ViewChild} from '@angular/core';
import {MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {DateAdapter, ErrorStateMatcher, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { UserService } from 'src/app/services/user.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { UtilsService } from 'src/app/services/utils.service';
import { Globals } from 'src/app/extranet/globals';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableExporterDirective } from 'mat-table-exporter';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MY_FORMATS } from 'src/config/config';
import * as _moment from 'moment';
import { ChangeDetectorRef } from '@angular/core';
import { Empresa } from 'src/app/Model/Empresa';

const moment = _moment;

/* Mock Data */
export interface trabajador {
  idTrabajador: number;
  nombreApellidos: string;
  nif: string;
  fechaAlta: Date;
  fechaBaja: Date;
  fechaNacimiento: Date;
  empresa: any;
  centro: any;
  telefono: string;
  email: string;
  genero: string;
  puestosTrabajo: string[];
  accionesRealizadas: boolean;
  idRelacion: number;
}

@Component({
  selector: 'trabajadores',
  templateUrl: 'trabajadores.component.html',
  styleUrls: ['trabajadores.component.scss'],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})
export class TrabajadoresComponent {

  //validators
  validNameSurname = this.globals.workerPattern;
  validNifNie = this.globals.nifNiePattern;

  cleanImgUrl = '../../assets/img/borrar_filtros.svg';
  searchImgUrl = '../../assets/img/search.svg';
  excelImgUrl = '../../assets/img/excel.svg';
  mailImgUrl = '../../assets/img/mail.svg';
  downloadImgUrl = '../../assets/img/download.svg';
  imgPerfil = '../../assets/img/user.svg';
  imgPerfilMujer = '../../assets/img/user_female.svg';

  trabajadores: any;
  idTrabajador: number;
  showTrabajadorDetails: boolean = false;
  mostrarTabla: boolean;
  trabajador: trabajador;
  aprobDocDataDto: any;
  selectedTrabajadores: any[];
  maxDate: Date;
  minDate: Date;
  dataSourceTrabajadores = new MatTableDataSource<trabajador>();
  tableHeadersTrabajadores: string[] = [
    'centro',
    'nombreApellidos',
    'puestosTrabajo',
    'fechaAlta',
    //'fechaBaja',
    'verDetalles'
  ];

  searchForm: FormGroup;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('paginatorT') paginatorT: MatPaginator;
  @ViewChild('TABLE') table: ElementRef;
  @ViewChild('TABLE') exportTableDirective: ElementRef;

  policyText: any;
  constructor(
    public dialogRef: MatDialogRef<TrabajadoresComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UserService,
    private formBuilder: FormBuilder,
    public utils: UtilsService,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
    private globals: Globals,
    public translate: TranslateService,
    private router: Router,
    private cdRef:ChangeDetectorRef) {
      this.selectedTrabajadores = data;
    }

  //Evita que se produzca el ERROR Error: ExpressionChangedAfterItHasBeenCheckedError
  ngAfterViewChecked()
  {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.mostrarTabla = false;
    this.initForm();
    /*this.userService.getUser().subscribe(user => {
      //this.getTrabajadoresCitacionWeb(); //NOTA IMPORTANTE: Por petición de PREVING (01/04/2022) a partir de ahora se omite la 1º llamada.
    });*/

    if (!this.utils.step2IsValid()) {
      this.router.navigate([this.globals.extranet_url + this.globals.extranet_citacion_web_calendario_url]);
    }
  }

  initForm() {
    this.searchForm = this.formBuilder.group({
      nombreForm: new FormControl(''),
      apellidosForm: new FormControl(''),
      dniForm: new FormControl(''),
      activoForm: new FormControl(1),
      fechaDesdeForm: new FormControl(moment()),
      fechaHastaForm: new FormControl(moment()),
    });
    this.setDefaultForm();
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
    this.searchForm.controls['activoForm'].setValue(1);
    this.searchForm.controls['fechaDesdeForm'].setValue(nYearsAgo);
    this.searchForm.controls['fechaHastaForm'].setValue(now);
  }

  onSubmit(): void {
    this.getTrabajadoresCitacionWeb();
  }

  getTrabajadoresCitacionWeb() {
    this.spinner.show();
    const userData = JSON.parse(localStorage.getItem('userDataFromUsuario'));
    let idCentrosTrabajo = userData.empresas
                      .find(empresa => empresa.idEmpresa == this.utils.citaValues.idEmpresa)
                      .centros.filter(centro => centro.activoVS)
                      .map(centro => centro.idCentro);
    let data = {
      listaIdsEmpresas: [this.utils.citaValues.idEmpresa],
      listaIdsCentros: idCentrosTrabajo,
      idCentro: this.utils.citaValues.idCentroMedico,
      requireAMJobCenterVerification: true,
      nombre: this.searchForm.get('nombreForm').value,
      apellidos: this.searchForm.get('apellidosForm').value,
      nif: this.searchForm.get('dniForm').value,
      fechaInicio: this.searchForm.get('fechaDesdeForm').value,
      fechaFin: this.searchForm.get('fechaHastaForm').value,
      activo: this.searchForm.get('activoForm').value
    };

    this.userService.getTrabajadoresCitacionWeb(data).subscribe(trabajadores => {
      if(trabajadores){
      	let result: trabajador[] = [];

      	//Se inserta la empresa que se haya seleccionado en las pantallas previas, que está indicado en el objeto público 'citaValues'
      	let empresa: any = {
      	  idEmpresa: parseInt(this.utils.citaValues.idEmpresa)
      	};

        trabajadores.forEach((item) => {
          if (!this.selectedTrabajadores.includes(item.idTrabajador)){
            result.push({
              idTrabajador: item.idTrabajador,
              nombreApellidos: item.nombre + ' ' + item.apellidos,
              nif: item.nif,
              fechaAlta: item.fechaAlta,
              fechaBaja: item.fechaBaja,
              fechaNacimiento: item.fechaNacimiento,
              //empresa: item.empresa, //Nota Importante: Ahora desde el BACK no se va a enviar la empresa para optimizar, por tanto se obtiene de la variable pública
              empresa: empresa,
              centro: item.centro,
              genero: item.sexo,
              telefono: item.telefono,
              email: item.email,
              puestosTrabajo: item.puestoTrabajoDtoList,
              accionesRealizadas: item.accionesRealizadas,
              idRelacion: item.idRelacion
            });
          }
        });
        this.trabajadores = [];
        this.trabajadores = result;
        this.dataSourceTrabajadores = new MatTableDataSource(result);
        this.dataSourceTrabajadores.paginator = this.paginatorT;
        this.dataSourceTrabajadores.sort = this.sort;

        //Fix sort problem: sort mayúsculas y minúsculas
        this.dataSourceTrabajadores.sortingDataAccessor = (item, property) => {
          if (property == 'fechaAlta')
            return new Date(item.fechaAlta);

          if (typeof item[property] === 'string')
            return item[property].toLocaleLowerCase();

          return item[property];

        };
        this.mostrarTabla = true;
      }
      this.spinner.hide();
    }), (error=> {
      this.spinner.hide();
    });
  }

  resetForm(): void {
    setTimeout(() => {
      this.setDefaultForm();
      //this.getTrabajadoresCitacionWeb(); //NOTA IMPORTANTE: Por petición de PREVING (01/04/2022) a partir de ahora se omite la 1º llamada.
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

  selectTrabajador(element) {
    this.dialogRef.close(element);
  }

  closeModal() {
    this.dialogRef.close();
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

}
