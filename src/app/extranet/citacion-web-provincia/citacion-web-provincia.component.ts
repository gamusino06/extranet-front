import { Component, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../environments/environment';
import { UserService } from 'src/app/services/user.service';
import { UtilsService } from 'src/app/services/utils.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatPaginator } from '@angular/material/paginator';
import { FormBuilder, FormControl, FormGroup, RequiredValidator, Validators } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { SafeHtml } from '@angular/platform-browser';
import { Globals } from '../globals';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as _moment from 'moment';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MY_FORMATS } from '../../../config/config';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import {ConfirmationModal} from 'src/app/Model/ConfirmationModal';
import { ChangeDetectorRef } from '@angular/core';
import { SelectProvinciaComponent } from '../components/select-provincia/select-provincia.component';
import { AppointmentService } from 'src/app/services/appointment.service';

const moment = _moment;

/* Mock Data */
export interface centroMedicoInterface {
  nombre: string;
  idCentroMedico: string;
  fechaAlta: string;
  nombreLocalidad: string;
  provincia: string;
  calle: string;
  cp: string;
  telefono: string;
  horario: string;
  web: string;
  email: string;
  latitud: string;
  longitud: string;
}

@Component({
  selector: 'app-citacion-web-provincia',
  templateUrl: './citacion-web-provincia.component.html',
  styleUrls: ['./citacion-web-provincia.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})

export class CitacionWebProvinciaComponent implements OnInit {
  environment = environment;
  cleanImgUrl = '../../assets/img/borrar_filtros.svg';
  searchImgUrl = '../../assets/img/search.svg';
  excelImgUrl = '../../assets/img/excel.svg';
  mailImgUrl = '../../assets/img/mail.svg';
  downloadImgUrl = '../../assets/img/download.svg';

  empresas: any[];
  provinciaList: any[];
  localidadList: [];
  searchForm: FormGroup;
  aptitudList: any[];
  aprobDocDataDto: any;
  textLabel: any;
  showResponseErrorModal: boolean = false;
  centersId: any[];
  user: any;
  workerData: any;
  redirectedFromAptitudeReportCenterId = undefined;
  bloqueadoUps:boolean = true;

  errorResponseModalObject: ConfirmationModal = {
    title: 'MODALS.CONFIRMATION_MODAL.RESPONSE_ERROR',
    text: '',
    showCancelButton: false,
    icon: 'error',
    modalSize: ''
  }

  tableHeaders: string[] = [
    'fechaDocumento',
    'nombre',
    'direccion',
    'localidad',
    'datosContacto',
    'specialAction'
  ];
  dataSource = new MatTableDataSource<centroMedicoInterface>();

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(SelectProvinciaComponent) hijoProvincia;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    public utilsService: UtilsService,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
    private globals: Globals,
    private translate: TranslateService,
    private router: Router,
    private cdRef:ChangeDetectorRef,
    private appointmentService: AppointmentService
  ) { }

  //Evita que se produzca el ERROR Error: ExpressionChangedAfterItHasBeenCheckedError
  ngAfterViewChecked()
  {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.spinner.show();
    this.initForm();

    const promiseArray = [];
    const getUserPromise = new Promise((resolve, rejects) => {
      // get user and user's accessible center list
      this.userService.getUser().subscribe(user => {
        this.user = user;
        const centersIdList = [];
        this.user.empresas.forEach(company => {
          const filteredCenterList = company.centros.filter(center => center.activoVS);
          const filteredCenterIdList = filteredCenterList.map(a => a.idCentro);
          centersIdList.push(...filteredCenterIdList);
        });
        this.centersId = centersIdList;
        resolve(true);
      }, (err) => {
        if (environment.debug) console.log(err);
        rejects(true);
      });
    });
    promiseArray.push(getUserPromise);
    if (this.centersId.length <= 0) {
      this.empresas = [];
    } else {
      const getCompanyByActiveAppointmentManagementsPromise = new Promise((resolve, rejects) => {
        // get companies related to a list of centers which have any active appointment management
        this.appointmentService.getCompanyByActiveAppointmentManagements(this.centersId, this.globals.COMPANY_APPOINTMENT_MANAGEMENT)
          .subscribe(companyList => {
            const auxCompanyList = [];
            this.user.empresas.forEach(company => {
              const found = companyList.some(el => el === company.idEmpresa);
              if (found && company.tieneVS && company.activoVS) {
                auxCompanyList.push(company);
              }
            });
            this.empresas = auxCompanyList;
            this.updateEmpresas();
            resolve(true);
          }, (err) => {
            if (environment.debug) console.log(err);
            rejects(true);
          });
      });
      promiseArray.push(getCompanyByActiveAppointmentManagementsPromise);
    }
    const getProvinciasPromise = new Promise((resolve, reject) => {
      this.getProvincias();
      resolve(true);
    });
    promiseArray.push(getProvinciasPromise);

    Promise.all(promiseArray)
      .then(res => {
        // if (environment.debug) console.log(res);
      })
      .catch(err => {
        if (environment.debug) console.log(err);
      })
      .finally(() => {
        this.translate.get('PROVINCIA_CENTRO_MEDICO').subscribe((res: string) => {
          this.textLabel = res;
        });

        // Set the values of this page from utils services
        this.workerData = JSON.parse(localStorage.getItem('workerData'));
        if(this.workerData !== null && this.empresas.find(empresa => empresa.idEmpresa === this.workerData.idEmpresa)){
          this.searchForm.controls.empresaForm.setValue(this.workerData.idEmpresa);
          this.getProvincia(this.workerData.idEmpresa);
          localStorage.removeItem('workerData');
        }
        if (this.searchForm.controls.empresaForm.value === '') {
          this.searchForm.controls.empresaForm.setValue(this.utilsService.citaValues.idEmpresa);
          if (this.utilsService.citaValues.idEmpresa !== '') {
            this.getProvincia(this.utilsService.citaValues.idEmpresa);
            this.comprobarUpseling(this.utilsService.citaValues.idEmpresa);
          }
        }

        if (localStorage.getItem('aptitudeReportRedirectCenterId') !== undefined) {
          this.redirectedFromAptitudeReportCenterId = localStorage.getItem('aptitudeReportRedirectCenterId');
          localStorage.removeItem('aptitudeReportRedirectCenterId');
        }

        $(document).ready(() => {
          $('.mat-tab-list').css('transform', 'translateX(0px)');
        });

        if(this.workerData !== null){ this.onSubmit(); }
        else{ this.spinner.hide(); }
      });
  }

  initForm() {
    this.searchForm = this.formBuilder.group({
      empresaForm: new FormControl(''),
      provinciaForm: new FormControl(''),
      selectEmpresasRadioForm: new FormControl('1'),
    });
    this.setDefaultForm();
    //this.getCentrosMedicos(); //NOTA IMPORTANTE: Petición de Preving 28/09/2021, se omite la primera llamada.
  }

  previous() {
    if(this.workerData !== null) { localStorage.setItem('workerData', JSON.stringify(this.workerData)); }
    this.router.navigate([this.globals.extranet_url + this.workerData.urlPrevious]);
  }

  setDefaultForm(): void {
    this.searchForm.controls['empresaForm'].setValue('');
    this.searchForm.controls['provinciaForm'].setValue([]);
    this.searchForm.controls['selectEmpresasRadioForm'].setValue('1');
  }

  onSubmit(): void {
    this.getCentrosMedicos();
  }

  updateEmpresas() {
    if (this.empresas.length == 1) {
      this.searchForm.controls.empresaForm.setValue(this.empresas[0].idEmpresa);
      this.getProvincia(this.empresas[0].idEmpresa);
      this.comprobarUpseling(this.empresas[0].idEmpresa);
    }
  }

  getProvincias() {
    /*mapeo de objeto JSON a enviar*/
    const dataReq = {};
    this.utilsService.getProvincias(dataReq).subscribe(data => {
      if (data) {
        this.provinciaList = data;
      }
    });
  }

  getCentrosMedicos() {
    let clienteId = this.searchForm.get('empresaForm').value || 0;
    let listaProvinciasId = this.searchForm.get('provinciaForm').value || [];
    const moduleId = 1; // 1 PCE - 2 PCP
    const centerId = this.redirectedFromAptitudeReportCenterId;

    this.spinner.show();

    if(clienteId == 0){
      let response_error = "Debe seleccionar una empresa";

      this.translate.get('SELECCIONAR_EMPRESA').subscribe((res: string) => {
        response_error = res;
      });
      this.utilsService.mostrarMensajeSwalFire('error', response_error, '', 'var(--blue)', false);
      this.spinner.hide();
    }
    else {
      if (listaProvinciasId.length == 0) {
        let response_error = "Debe seleccionar al menos una provincia";

        this.translate.get('SELECCIONAR_PROVINCIA').subscribe((res: string) => {
          response_error = res;
        });
        this.utilsService.mostrarMensajeSwalFire('error', response_error, '', 'var(--blue)', false);
        this.spinner.hide();
      }
      else{

        this.utilsService.getCentrosMedicos({
          clienteId,
          listaProvinciasId,
          moduleId,
          centerId
        }).subscribe(data => {

          let result: centroMedicoInterface[];
          result = [];
          if (data !== undefined) {
            data.forEach(item => {
              let aux: centroMedicoInterface;
              aux = {
                nombre: item.nombre,
                idCentroMedico: item.idCentroMedico,
                fechaAlta: item.fechaAlta,
                nombreLocalidad: item.localidad?.nombre,
                provincia: item.localidad?.provincia.nombre,
                calle: item.calle,
                cp: item.cp,
                telefono: item.telefono,
                horario: item.horario,
                web: item.web,
                email: item.email,
                latitud: item.latitud,
                longitud: item.longitud
              }
              result.push(aux);
            })
          }
          this.dataSource = new MatTableDataSource<centroMedicoInterface>(result);
          this.dataSource.sort = this.sort;
          this.dataSource.sortingDataAccessor = (item, property) => {
            if (property == 'direccion')
              return item['calle']?.toLocaleLowerCase();

            if (property == 'localidad')
              return item['nombreLocalidad']?.toLocaleLowerCase();

            if (typeof item[property] === 'string')
              return item[property].toLocaleLowerCase();

          };
          this.dataSource.paginator = this.paginator;
          if (this.empresas !== undefined && this.empresas.length !== 0) this.spinner.hide();
        }), (error => {
          if (environment.debug) console.log(error);
        });
      }
    }
  }

  resetForm(): void {
    setTimeout(() => {
      this.setDefaultForm();
      this.updateEmpresas();

      //Indicamos al componente de provincia y localidad que debe de limpiar el texto de búsqueda
      this.hijoProvincia.setValueInputProvinciaFilter();
    });
  }

  onSelectDate(element) {
    let empresa = this.searchForm.controls['empresaForm'].value;
    if (empresa.length === 0) {
      let response_error = "Debe seleccionar una empresa";

      this.translate.get('SELECCIONAR_EMPRESA').subscribe((res: string) => {
        response_error = res;
      });
      this.utilsService.mostrarMensajeSwalFire('error', response_error, '', 'var(--blue)', false);
    } else {
      let nombreEmpresa = this.empresas.find(x => x.idEmpresa === empresa).nombre;
      //save the form values
      let aux = {
        idCentroMedico: element.idCentroMedico,
        nombreCentroMedico: element.nombre,
        idEmpresa: empresa,
        nombreEmpresa: nombreEmpresa
      }
      if(this.workerData !== null) { localStorage.setItem('workerData', JSON.stringify(this.workerData)); }
      this.utilsService.setFormValues(aux);
      this.router.navigate([this.globals.extranet_url + this.globals.extranet_citacion_web_calendario_url]);
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
  }

  redirectLocation(element) {
    let urlCentroMedicoLatitud = element.latitud;
    let urlCentroMedicoLongitud = element.longitud;
    let urlFinalMapsCentroMedico = this.globals.urlGenericaMaps + "q=" + urlCentroMedicoLatitud + "," + urlCentroMedicoLongitud;
    window.open(urlFinalMapsCentroMedico, "_blank");
  }

  getProvincia(element) {
    this.empresas.forEach(empresa => {
      if (empresa.idEmpresa === element) {
        this.searchForm.controls['provinciaForm'].setValue([empresa.localidad?.provincia.idProvincia]);
      }
    });
  }

  closeResponseErrorModal(){
    this.showResponseErrorModal = false;
  }

  comprobarUpseling(empresa){
    this.userService.comprobarAbsentismo(empresa)
      .subscribe(data => {
        this.bloqueadoUps = data;
        this.utilsService.bloqueadoUpsCita = this.bloqueadoUps;
      }, error => {
        this.utilsService.mostrarMensajeSwalFire('error', 'Ha ocurrido un error al comprobar la petición', '', 'var(--blue)', false);
        this.bloqueadoUps = false;
      });
  }
}
