import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { UserService } from 'src/app/services/user.service';
import { UtilsService } from 'src/app/services/utils.service';
import Swal from 'sweetalert2';
import {ConfirmationModal} from '../../../Model/ConfirmationModal';
import {TranslateService} from '@ngx-translate/core';
import {Globals} from '../../globals';
import * as XLSX from "xlsx";
import {formatDate} from "@angular/common";

export interface worker {
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
}

export interface historic {
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
  asistencia: boolean;
  anulada: string;
  puedeAnular: string;
  origenCita: number;
  checked: boolean;
}

@Component({
  selector: 'app-pt-citaciones',
  templateUrl: './pt-citaciones.component.html',
  styleUrls: ['./pt-citaciones.component.scss']
})
export class PtCitacionesComponent implements OnInit, AfterViewInit {

  @Input('workerData') workerData: worker;
  @Input('appointmentList') appointmentList: historic[];
  @Output() updateAppointmentList = new EventEmitter<any[]>();
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  dataSource: any;
  showTable: boolean = false;
  tableHeaders: string[] = [
    'checklist',
    'presented',
    'fecha',
    'centroMedico',
    'tipo',
    'motivo',
    'anulada',
    'botonAnular'
  ];
  allCheckbox: boolean = false;
  pageSize = 10;

  cancelAppointmentConfirmationModal: ConfirmationModal = {
    title: 'MODALS.CONFIRMATION_MODAL.CANCEL_APPOINTMENT',
    text: '',
    showCancelButton: true,
    icon: 'info',
    modalSize: ''
  };
  showCancelAppointmentConfirmationModal = false;
  canceledAppointment = null;
  excelImgUrl = "../../assets/img/excel.svg";

  constructor(
    private spinner: NgxSpinnerService,
    private userService: UserService,
    public utils: UtilsService,
    public translate: TranslateService,
    public globals: Globals
    ) { }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.appointmentList);
    this.getAppointments();
  }

  ngAfterViewInit() {
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

      if(property == 'centroMedico')
        return item['centroMedico'];
    };
  }

  getAppointments() {
    if(this.appointmentList.length > 0) {
      this.showTable = true;
    } else {
      let data = {
        listaIdsEmpresas: [this.workerData?.empresa?.idEmpresa],
        listaIdsCentros: [this.workerData?.centro?.idCentro],
        nombreTrabajador: '',
        apellidosTrabajador: '',
        nifTrabajador: this.workerData?.nif,
        fechaInicio: new Date(1900, 1, 1),
        fechaFin: new Date(2500, 1, 1),
        asiste: 0,
        trabajador_activo: 1
      };
      this.spinner.show();
      this.userService.getCitas(data).subscribe(citasTrabajadores => {
        if(citasTrabajadores !== undefined && citasTrabajadores.length > 0){
          let result: historic[] = [];
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
              origenCita: item.origenCita,
              checked: false
            });
          });
          this.dataSource = new MatTableDataSource(result);
          this.updateAppointmentList.emit(result);
          this.ngAfterViewInit();
          this.showTable = true;
        }else{
          this.utils.mostrarMensajeSwalFireCitasNoEncontradas();
        }
        this.spinner.hide();
      }, error => {
        this.spinner.hide();
        this.utils.mostrarMensajeSwalFire('error', error.error.message, '', 'var(--blue)', false);
      });
    }
  }

  checkAllRows(checked: boolean) {
    if (this.dataSource !== undefined && this.dataSource.filteredData != undefined) {
      if(checked) {
        this.dataSource.filteredData.forEach(val => { val.checked = true });
      } else {
        this.dataSource.filteredData.forEach(val => { val.checked = false });
      }
    }
  }

  updateAllCheckbox() {
    this.allCheckbox = this.dataSource.filteredData.every(val => val.checked == true);
  }

  cancelAppointment(element) {
    this.canceledAppointment = element;
    this.showCancelAppointmentConfirmationModal = true;
  }

  acceptCancelAppointmentConfirmationModal() {
    const element = this.canceledAppointment;
    this.spinner.show();
    const empresaCita = {
      idEmpresa: element.idEmpresa,
    };
    const centroCita = {
      idCentro: element.centro.idCentro,
    };
    const centroMedicoCita = {
      idCentroMedico: element.idCentroMedico,
    };
    const motivoCitacion = {
      idMotivoCita: element.idMotivo,
    };
    const trabajadorCita = {
      idTrabajador: element.idTrabajador,
    };
    const data = {
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
      let titulo = 'Cita anulada correctamente';
      this.translate.get('CITA_ANULADA_CORRECTAMENTE').subscribe((res: string) => {
        titulo = res;
      });

      Swal.fire({
        icon: 'success',
        title: titulo,
        allowOutsideClick: false
      }).then((result) => {
        if (result.isConfirmed) {
          this.showCancelAppointmentConfirmationModal = false;
          this.actualizarCitaConAnulacion(element);
        }
      });
    }, error => {
      this.spinner.hide();
      Swal.fire({
        icon: 'error',
        title: error.error.message,
        allowOutsideClick: false
      }).then((result) => {
        if (result.isConfirmed) {
          this.showCancelAppointmentConfirmationModal = false;
        }
      });
    });
  }

  actualizarCitaConAnulacion(element) {
    this.dataSource.filteredData.forEach(cita => {
      if (cita.idCita === element.idCita) {
        cita.asistencia = false;
        cita.anulada = true;
        cita.puedeAnular = false;
      }
    });
  }

  closeCancelAppointmentConfirmationModal() {
    this.canceledAppointment = null;
    this.showCancelAppointmentConfirmationModal = false;
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

    var columnaEstado = "Estado";
    this.translate.get('ESTADO').subscribe((res: string) => {
      columnaEstado = res;
    });
    var columnaFecha = "Fecha";
    this.translate.get('FECHA').subscribe((res: string) => {
      columnaFecha = res;
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
    var columnaAnulada = "Anulada";
    this.translate.get('ANULADA').subscribe((res: string) => {
      columnaAnulada = res;
    });

    let isElementosSelect: boolean = false;

    //Rellenamos los datos del excel
    this.dataSource.filteredData.forEach(item => {
      if (item.checked) {
        isElementosSelect = true;
        let new_item = {};
        new_item[columnaEstado] = item.asistencia ? 'Presentado' : 'No presentado';
        new_item[columnaFecha] = (new Date(item['fecha'])).toLocaleString();
        new_item[columnaMedico] = item.centroMedico;
        new_item[columnaTipo] = item.tipo;
        new_item[columnaMotivo] = item.motivo;
        new_item[columnaAnulada] = item.anulada ? 'Si' : 'No';
        dataJS.push(new_item);
      }
    })

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

  checkNotPresentAppointment(element) {
    const today = formatDate(new Date(), 'yyyy-MM-dd', 'en_US');
    const  appointmentDay = formatDate(new Date(element.fecha), 'yyyy-MM-dd', 'en_US');
    return !element.asistencia && today > appointmentDay;
  }
}
