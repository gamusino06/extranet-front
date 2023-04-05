import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { UserService } from 'src/app/services/user.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Globals } from '../../globals';
import * as _moment from 'moment';
import { AcceptGdprDocumentComponent } from 'src/app/modales/acceptGdprDocument/acceptGdprDocument.component';
import { ShareDocumentComponent } from 'src/app/modales/shareDocument/shareDocument.component';
import { environment } from 'src/environments/environment';
import { PdfView } from 'src/app/modales/pdfView/pdfView.component';
import { AptitudeReportService } from 'src/app/services/aptitude-report.service';
import { Router } from '@angular/router';
import {informesAptitud} from "../../vigilancia-informes-aptitud/vigilancia-informes-aptitud.component";
import * as XLSX from "xlsx";

const moment = _moment;
const red_color = "#F01F1F";
const yellow_color = "#FED74D";
const green_color = "#45925A";

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

interface aptitudeReport {
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

@Component({
  selector: 'app-pt-reconocimientos',
  templateUrl: './pt-reconocimientos.component.html',
  styleUrls: ['./pt-reconocimientos.component.scss']
})
export class PtReconocimientosComponent implements OnInit, AfterViewInit {

  @Input('workerData') workerData: worker;
  @Input('aptitudeReportList') aptitudeReportList: aptitudeReport[];
  @Output() updateAptitudeReportList = new EventEmitter<any[]>();
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  dataSource: any;
  showTable: boolean = false;
  tableHeaders: string[] = [
    'checklist',
    // 'newList',
    'status',
    'lastMedicalRecognitionDate',
    'nextMedicalRecognitionDate',
    'motivo',
    'protocolos',
    'periodicity',
    'aptitudNombre',
    'specialAction'
  ];
  allCheckbox: boolean = false;
  pageSize = 10;

  isLoginSimulado: boolean = false;
  environment = environment;
  aprobDocDataDto: any;
  showAppointmentModal: Boolean = false;
  mailImgUrl = '../../../../assets/img/mail.svg';
  downloadImgUrl = '../../../../assets/img/download.svg';
  addAppointmentImgUrl = "../../../../assets/img/new-appointment.svg";
  appointmentHistoricalImgUrl = "../../../../assets/img/appointment-historical.svg";
  excelImgUrl = '../../../../assets/img/excel.svg';

  constructor(
    private spinner: NgxSpinnerService,
    private userService: UserService,
    public utils: UtilsService,
    public translate: TranslateService,
    private modalRgpd: MatDialog,
    public dialog: MatDialog,
    public globals: Globals,
    private router: Router,
    private aptitudeReportService: AptitudeReportService
  ) { }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.aptitudeReportList);
    this.getAptitudeReports();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (item, property) => {
      if (property == "lastMedicalRecognitionDate")
        return new Date(item.lastRecognitionDate);

      if (property == "nextMedicalRecognitionDate")
        return new Date(item.nextRecognitionDate);

      if (typeof item[property] === 'string')
        return item[property].toLocaleLowerCase();

      return item[property];
    };
  }

  getAptitudeReports() {
    if(this.aptitudeReportList.length > 0) {
      this.showTable = true;
    } else {
      const data = this.utils.formatAptitudeTabDto(this.workerData);

      this.spinner.show();
      this.userService.getDocumentos(data).subscribe(documentos => {
        if(documentos !== undefined && documentos.length > 0){
          let result: aptitudeReport[] = [];
          documentos.forEach((item, index) => {
            let trabajadorDto;
            var nDatoIdCurso = 0;
            var nDatoCurso = 0;
            var nDatoModalidad = 0;
            var nDatoHoras = 0;
            var nDatoAniosReciclaje = 0;
            var nDatoTipoReciclaje = 0;
            var nDatoSubcategoriaFormacion = 0;
            var nDatoTrabajador = 0;
            var nDatoOrigenCurso = 0;
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
              if (dato.nombre === this.globals.metadato_origen_curso) nDatoOrigenCurso = c;

              c++;
            });

            let num = item.datos[nDatoHoras]?.valor;
            let horas = '0';
            try
            {
              horas = parseFloat(num).toFixed(2).replace('.',',');
            }catch(err){
            }

            trabajadorDto = item.datos.find(obj => obj.nombre == this.globals.metadato_trabajador).valorDto;
            result.push({
              checked: false,
              idDocumento: item.idDocumento,
              nombreDocumento: item.nombre,
              fechaDocumento: item.fechaDocumento,
              fechaReciclaje: item.datos[nDatoAniosReciclaje]?.valor > 0 ? moment(item.fechaDocumento).add(item.datos[nDatoAniosReciclaje].valor, 'years').format('YYYY-MM-DD') : undefined,
              origen: item.datos[nDatoOrigenCurso]?.valor,
              tipoDocumento: item.tipoDocumento.nombre,
              idTipoDocumento: item.tipoDocumento.idTipoDocumento,
              empresaNombre: item.empresa.nombre,
              puestosTrabajo: trabajadorDto?.puestoTrabajoDtoList,
              motivo: item.datos.find(obj => obj.nombre == this.globals.metadato_motivo)?.valor || '',
              aptitudNombre: item.datos.find(obj => obj.nombre == this.globals.metadato_aptitud)?.valorDto.nombre || '',
              observaciones: item.datos.find(obj => obj.nombre == this.globals.metadato_observaciones)?.valor || '',
              modalidad: item.datos[nDatoModalidad]?.valor,
              tipo: item.tipoDocumento.nombre,
              horas: horas,
              nifTrabajador: item.datos[nDatoTrabajador]?.valorDto?.nif,
              idCurso: item.datos[nDatoIdCurso]?.valor,
              nombreCurso: item.datos[nDatoCurso]?.valor,
              modalidadCurso: item.datos[nDatoModalidad]?.valor,
              subcategoria: item.datos[nDatoSubcategoriaFormacion]?.valor,
              tipoReciclaje: item.datos[nDatoTipoReciclaje]?.valor,
              accionesRealizadas: item.accionesRealizadas,
              ubicacion: item.ubicacion,
              gdprId: item.gdpr?.idGdpr,
              fechaAceptacionGdpr: item.fechaAceptacion,
              gdpr: item.gdpr,
              listaHistoricoDocumentoDto: [],
              renouncedMedicalExamination: item.datos.find(obj => obj.nombre == this.globals.medicalExamination)?.valorDto.renouncedMedicalExamination,
              nextRecognitionDate: item.datos.find(obj => obj.nombre == this.globals.medicalExamination)?.valorDto.nextRecognitionDate,
              lastRecognitionDate: item.datos.find(obj => obj.nombre == this.globals.medicalExamination)?.valorDto.lastRecognitionDate,
              lastRecognitionDateConfirmed: item.datos[nDatoTrabajador]?.valorDto?.ultimaCitaProgramada,
              isLastDocument: item.isLastDocument,
              periodicity: item.datos.find(obj => obj.nombre == this.globals.medicalExamination)?.valorDto.periodName,
              centerId: item.centro.idCentro,
              datosSolicitudCita: {
                "idEmpresa": item.empresa.idEmpresa,
                "nombreTrabajador": trabajadorDto.nombre + " " + trabajadorDto.apellidos,
                "idTrabajador": trabajadorDto.idTrabajador,
                "motivo": item.datos.find(obj => obj.nombre == this.globals.metadato_motivo)?.valor,
                "idCentro": item.centro.idCentro
              }
            });
          });
          result = result.filter(obj => obj.idTipoDocumento == Number(this.globals.informes_aptitud));
          this.dataSource = new MatTableDataSource(result);
          this.updateAptitudeReportList.emit(result);
          this.ngAfterViewInit();
          this.showTable = true;
        } else {
          this.utils.mostrarMensajeSwalFireDocumentosNoEncontrados();
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

  showProtocolsPopUp(element) {
   this.aptitudeReportService.showProtocolsPopUp(element);
  }

  onShowAppointmentHistorical() {
    const workerData = {
      workerNIF: this.workerData.nif,
      workerIsActive: (this.workerData.fechaBaja === undefined || this.workerData.fechaBaja === null) ? 1 : 2
    }
    localStorage.setItem('workerData', JSON.stringify(workerData));
    this.router.navigate([this.globals.extranet_url + 'historico-citas']);
  }

  /**
   * Function that redirict to "Request Appointment" section
   * or display an error whene click in the request appointment icon
   * @param element Aptirude report information
   */
   onAddAppointment(element) {
    this.spinner.show();
    let data = {
      empresaId: element.datosSolicitudCita.idEmpresa,
      centroId: element.centerId,
      trabajadorId: element.datosSolicitudCita.idTrabajador
    };
    this.userService.checkAppointmentManagement(data).subscribe(
      bool =>{
        if(bool){
          this.spinner.hide();
          let searchForm = {
            empresaForm: "",
            centroForm: "",
            nombreForm: "",
            apellidosForm: "",
            dniForm: "",
            activoForm: 1,
            fechaDesdeForm: new Date(1900, 1, 1),
            fechaHastaForm: new Date(2500, 1, 1),
            selectEmpresasRadioForm: 1,
            selectCentrosRadioForm: 1,
            todosCentrosForm: true
          }
          let appointmentData = {
            ...element.datosSolicitudCita,
            urlPrevious: "prevencion-trabajadores",
            worker: this.workerData,
            searchForm: searchForm
          }
          localStorage.setItem('workerData', JSON.stringify(appointmentData));
          localStorage.setItem('aptitudeReportRedirectCenterId', JSON.stringify(element.datosSolicitudCita.idCentro));
          this.router.navigate([this.globals.extranet_url + this.globals.extranet_citacion_web_provincia_url]);
        }
        else{
          this.spinner.hide();
          this.showAppointmentModal = true;
        }
      }, (error) => {
        console.log('Error: ', error);
        let titulo = "";
        this.spinner.hide();
        this.translate.get("ERROR").subscribe((res: string) => { titulo = res; });
        this.utils.mostrarMensajeSwalFire(
          "error",
          titulo,
          "",
          "var(--blue)",
          false
        )
    });
  }

  //Llamada previsualizar desde ambas tablas
  previsualizar(element, tabla) {
    this.openModalAcceptRgpd(element, 3, null, null, tabla);
  }

  /*Metodo que abre la modal y redirecciona a los metodos*/
  openModalAcceptRgpd(element, mode, listaDocumentos, listaIdsDocumentos, tabla) {
    let flag: boolean = false;
    if (listaIdsDocumentos != null) {
      listaDocumentos.forEach(documento => {
        if (documento.fechaAceptacionGdpr === undefined) {
          element = documento;
          flag = true;
        }
      });
    }

    if (flag || (element != null && element.fechaAceptacionGdpr === undefined && tabla == 2)) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = element;
      dialogConfig.height = "80%";
      dialogConfig.hasBackdrop = true;
      dialogConfig.disableClose = true;

      const dialogRef = this.modalRgpd.open(AcceptGdprDocumentComponent, dialogConfig);
      dialogRef.afterClosed().subscribe(result => {
        if (localStorage.getItem('acceptModal') === 'true') {
          switch (mode) {
            case 1:
              if (listaIdsDocumentos != null && listaIdsDocumentos.length > 0) {
                this.compartirMultipleData(listaIdsDocumentos, mode, listaDocumentos, tabla)
              } else {
                this.compartirData(element, mode, tabla);
              }
              break;
            case 2:
              if (listaIdsDocumentos != null && listaIdsDocumentos.length > 0) {
                this.descargarMultipleData(listaIdsDocumentos, mode, listaDocumentos, tabla)
              } else {
                this.descargarData(element, mode, tabla);
              }
              break;
            case 3:
              this.previsualizarData(element, mode, tabla);
              break;
          }
          //Seteamos a false la variable globlal 'acceptModal'
          localStorage.setItem('acceptModal', 'false');
        }
      });
    } else {
      switch (mode) {
        case 1:
          if (listaIdsDocumentos != null && listaIdsDocumentos.length > 0) {
            this.compartirMultipleData(listaIdsDocumentos, mode, listaDocumentos, tabla)
          } else {
            this.compartirData(element, mode, tabla);
          }
          break;
        case 2:
          if (listaIdsDocumentos != null && listaIdsDocumentos.length > 0) {
            this.descargarMultipleData(listaIdsDocumentos, mode, listaDocumentos, tabla)
          } else {
            this.descargarData(element, mode, tabla);
          }
          break;
        case 3:
          this.previsualizarData(element, mode, tabla);
          break;
      }
    }
  }

  //Llamada descargar desde ambas tablas
  descargar(element, tabla) {
    this.openModalAcceptRgpd(element, 2, null, null, tabla);
  }

  //Llamada compartir desde ambas tablas
  compartir(element, tabla) {
    this.openModalAcceptRgpd(element, 1, null, null, tabla);
  }

  /*compartir múltiple*/
  compartirMultipleData(listaIdsDocumentos, mode, listaDocumentos, tabla) {
    let menuNameComponent = 'Prevención tecnica';
    this.translate.get('PREVENCION_TECNICA').subscribe((res: string) => {
      menuNameComponent = res;
    });
    let subMenuNameComponent = 'Documentos tecnicos';
    this.translate.get('DOCUMENTOS_TECNICOS').subscribe((res: string) => {
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
            }

            //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
            if (!this.isLoginSimulado){
              this.gdprMethod(listaDocumentos, mode);
            }
        }), (error => {
          if (environment.debug) console.log("Error al Enviar EMAIL - Compartir Documento");
        });
      }
    });
  }

  /*compartir */
  compartirData(element, mode, tabla) {
    let menuNameComponent;
    let subMenuNameComponent;
    let nombreDocumento;
    if (tabla == 1) {
      menuNameComponent = 'Vigilancia de la salud';
      this.translate.get('VIGILANCIA_SALUD').subscribe((res: string) => {
        menuNameComponent = res;
      });
      subMenuNameComponent = 'Registro de formacion';
      this.translate.get('REGISTRO_FORMACION').subscribe((res: string) => {
        subMenuNameComponent = res;
      });
      nombreDocumento = subMenuNameComponent;
    } else {
      menuNameComponent = 'Vigilancia de la salud';
      this.translate.get('VIGILANCIA_SALUD').subscribe((res: string) => {
        menuNameComponent = res;
      });
      subMenuNameComponent = 'Informes de aptitud';
      this.translate.get('INFORMES_APTITUD').subscribe((res: string) => {
        subMenuNameComponent = res;
      });
      nombreDocumento = subMenuNameComponent;
    }

    if (element.nombreDocumento) {
      nombreDocumento = element.nombreDocumento;
    } else {
      nombreDocumento = element.nombre;
    }

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
            filename: nombreDocumento + ".pdf"
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
            }

            //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
            if (!this.isLoginSimulado){
              this.gdprMethod([element], mode); //GDPR && Reload Info Document
            }
        }), (error => {
          if (environment.debug) console.log("Error al Enviar EMAIL - Compartir Documento");
        });
      }
    });
  }

  descargarMultipleData(listaIdsDocumentos, mode, listaDocumentos, tabla) {
    this.spinner.show();
    if (listaIdsDocumentos.length > 0) {
      const filename = 'DocumentosTécnicos.zip';
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
          downloadLink.download = filename;
          downloadLink.click();

          //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
          if (!this.isLoginSimulado){
            //reload || GDPR
            this.gdprMethod(listaDocumentos, mode); //GDPR && Reload Info Document
          }
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

  /*descargar seleccion*/
  descargarData(element, mode, tabla) {
    this.spinner.show();
    let data = {
      listaIdsDocumentos: [element.idDocumento],
      listaIdsTiposDocumentos: [element.idTipoDocumento],
      listaUuidsDocumentos: [element.ubicacion],
      loginSimuladoActivado: this.isLoginSimulado,
      accion: { idAccionDoc: mode }
    }
    this.utils.getFile(data).subscribe(pdfBase64 => {
      if(pdfBase64){
        const linkSource = `data:application/pdf;base64,${pdfBase64.fichero}`;
        const filename = pdfBase64.nombreFichero + '.pdf';
        const downloadLink = document.createElement('a');
        downloadLink.href = linkSource;
        downloadLink.download = filename;
        downloadLink.click();

        //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
        if (!this.isLoginSimulado){
          //reload || GDPR
          this.gdprMethod([element], mode); //GDPR && Reload Info Document
        }
      }
      this.spinner.hide();

    })
  }

  /*previsualizar seleccion*/
  previsualizarData(element, mode, tabla) {
    this.spinner.show();
    let data = {
      listaIdsDocumentos: [element.idDocumento],
      listaIdsTiposDocumentos: [element.idTipoDocumento],
      listaUuidsDocumentos: [element.ubicacion],
      loginSimuladoActivado: this.isLoginSimulado,
      accion: { idAccionDoc: mode }
    }
    this.utils.getFile(data).subscribe(pdfBase64 => {
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
          this.gdprMethod([element], mode); //GDPR && Reload Info Document
        }
        dialogRef.afterClosed().subscribe(result => {
        });
      }
      this.spinner.hide();

    })
  }

  /*Metodo GDPR*/
  gdprMethod(elements, accionDocumento) {
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

    //Si se está realizando la acción con el login simulado no se actualiza la tabla en caliente
    if (!this.isLoginSimulado){
      if (flag) {
        this.userService.setFechaAprobacionDocumentoGdpr(this.aprobDocDataDto).subscribe(aprobPolitica => {
          if (!aprobPolitica) {
            this.spinner.hide();
            let titulo = "Se ha producido un error al guardar la política de aceptación de terminos del documento";
            this.translate.get('ERROR_GUARDAR_POLITICA').subscribe((res: string) => {
              titulo = res;
            });
            this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
          }else{
            //Si no hubo errores, se actualiza la información de los documentos con acciones realizadas
            //this.getdocumentosTrabajador(this.trabajador.idTrabajador, [this.trabajador.empresa.idEmpresa], [this.trabajador.centro.idCentro]);
            this.utils.recargarTablaDatosMultiplePorAccion(jsonInfoDocumentosDto, this.dataSource.filteredData, this.spinner, false, null, false, null, true);
          }
        });
      }else{
        //Si los documentos tienen aceptada la gdpr, entonces se actualiza la información de los documentos con acciones realizadas
        //this.getdocumentosTrabajador(this.trabajador.idTrabajador, [this.trabajador.empresa.idEmpresa], [this.trabajador.centro.idCentro]);
        this.utils.recargarTablaDatosMultiplePorAccion(jsonInfoDocumentosDto, this.dataSource.filteredData, this.spinner, false, null, false, null, true);
      }
    }
  }

  // --- SECCIÓN FUNCIONES ACCIONES MASIVAS ---

  async setProtocols(documents) {
    const documentsWithoutProtocols = new Map<Number, informesAptitud>();
    documents.map(element => {
      if(element.protocolos === undefined && element.idDocumento !== 0){
        element.protocolos = '';
        documentsWithoutProtocols.set(element.idDocumento - element.idTipoDocumento * 10000000, element)
      }
    });
    if(documentsWithoutProtocols.size !== 0){
      const protocols = await this.userService.getProtocols(Array.from(documentsWithoutProtocols.keys())).toPromise()
      protocols.forEach(protocol =>{
        let document :informesAptitud = documentsWithoutProtocols.get(protocol.id);
        document.protocolos = protocol.name.replaceAll(';', ',');
      })
    }
  }

  async ExportAsExcel(name, default_name, documents, headers){
    // Activamos el spinner
    this.spinner.show();

    // Creamos los datos necesarios para
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    let JSONWS: XLSX.WorkSheet;
    let excel_data = [];

    // Definimos el nombre del fichero
    let fileName = this.utils.translateText(name, default_name);

    // Definimos las columnas que puede incluir el excel
    let columFecha          = this.utils.translateText("FECHA", "Fecha");
    let columEmpresaCentro  = this.utils.translateText("EMPRESA_CENTRO","Empresa - Centro");
    let columTrabajador     = this.utils.translateText("TRABAJADOR","Trabajador");
    let columTrabajadorNif  = this.utils.translateText("NIF_NIE","NIF/NIE");
    let columPuesto         = this.utils.translateText("PUESTO_TRABAJO","Puesto de Trabajo");
    let columMotivo         = this.utils.translateText("MOTIVO","Motivo");
    let columAptitud        = this.utils.translateText("APTITUD","Aptitud");
    let columObservaciones  = this.utils.translateText("OBSERVACIONES","Observaciones");
    let columProtocolos     = this.utils.translateText("PROTOCOLOS","Protocolos");
    let columFechaBaja      = this.utils.translateText("FECHA_BAJA","Fecha de Baja");
    let columEstado         = this.utils.translateText("ESTADO","Estado");
    let columProximoReco    = this.utils.translateText("VIGILANCIA_INFORMES_APTITUD.NEXT_MEDICAL_RECOGNITION_DATE","Fecha próximo rm");
    let columAnteriorReco   = this.utils.translateText("VIGILANCIA_INFORMES_APTITUD.RM_DATE","Fecha Rm");
    let columPeriodicidad   = this.utils.translateText("VIGILANCIA_INFORMES_APTITUD.PERIODICITY","PERIODICIDAD");

    // Obtenemos los protocolos de los documentos
    await this.setProtocols(documents);

    // Rellenamos el excel viendo los datos que tenemos que colocar
    // en función de las cabeceras
    documents.map(doc => {
      let new_row = {};
      headers.map(header => {
        switch (header){
          case "fechaDocumento":
            new_row[columFecha] = new Date(doc["fechaDocumento"]).toLocaleDateString();
            break;
          case "empresaCentroNombre":
            new_row[columEmpresaCentro] = doc.empresaNombre;
            break;
          case "trabajadorNombre":
            new_row[columTrabajador] = doc.datosSolicitudCita.nombreTrabajador;
            new_row[columTrabajadorNif] = doc.nifTrabajador;
            break;
          case "puestoTrabajo":
            new_row[columPuesto] = doc.puestosTrabajo.map((puesto) => { return puesto["nombre"] }).join(", ");
            break;
          case "motivo":
            new_row[columMotivo] = doc.motivo;
            break;
          case "aptitudNombre":
            new_row[columAptitud] = doc.aptitudNombre;
            break;
          case "observaciones":
            new_row[columObservaciones] = doc.observaciones;
            break;
          case "protocolos":
            new_row[columProtocolos] = doc.protocolos;
            break;
          case "fechaBaja":
            let fechaBaja = null;
            if (doc["fechaBaja"] != null)
              fechaBaja = new Date(doc["fechaBaja"]).toLocaleDateString();
            new_row[columFechaBaja] = fechaBaja;
            break;
          case 'status':
            let status_value = "";
            switch (this.utils.getStatusColor(doc)){
              case 0: status_value = this.utils.translateText("VIGILANCIA_INFORMES_APTITUD.LEGEND.DISCLAIMER", 'Renuncia'); break;
              case 2: status_value = this.utils.translateText("VIGILANCIA_INFORMES_APTITUD.LEGEND.EXPIRED", 'Caducado'); break;
              case 3: status_value = this.utils.translateText("VIGILANCIA_INFORMES_APTITUD.LEGEND.EXPIRING_SOON", 'Próximo a caducar'); break;
              case 4: status_value = this.utils.translateText("VIGILANCIA_INFORMES_APTITUD.LEGEND.IN_FORCE", 'Vigente'); break;
            }
            new_row[columEstado] = status_value;
            break;
          case 'nextMedicalRecognitionDate':
            new_row[columProximoReco] = doc.nextRecognitionDate;
            break;
          case 'lastMedicalRecognitionDate':
            new_row[columAnteriorReco] = doc.lastRecognitionDate;
            break;
          case 'periodicity':
            new_row[columPeriodicidad] = doc.periodicity;
            break;
        }
      });

      // Añadimos la fila a los datos que vamos a guardar en el excel
      excel_data.push(new_row);
    });

    // Añadimos los datos al excel
    let result = XLSX.utils.sheet_add_json(JSONWS, excel_data);
    XLSX.utils.book_append_sheet(wb, result, "Sheet1");

    //Guardamos y descargamos el fichero
    XLSX.writeFile(wb, fileName + ".xlsx");

    // Quitamos el Spinner
    this.spinner.hide();
  }

  /**
   * Función que recopila los diferentes documentos seleccionados y los
   * exporta a excel
   */
  exportarMultiple() {
    // Obtenemos los documentos seleccionados
    let listaDocumentos: any[] = this.dataSource.data ? this.dataSource.data.filter(doc => doc.checked) : [];
    let displayConsentModal = listaDocumentos.find(doc => doc.fechaAceptacionGdpr === undefined);

    // Ponemos las cabeceras de las columnas
    let headers = [
      'status',
      'trabajadorNombre',
      'empresaCentroNombre',
      'puestoTrabajo',
      'protocolos',
      'lastMedicalRecognitionDate',
      'nextMedicalRecognitionDate',
      'periodicity',
      'motivo',
      'fechaBaja',
      'aptitudNombre',
      'observaciones'
    ];

    // Si no se ha seleccionado ningún documento se muestra un error
    if(listaDocumentos.length == 0){
      let titulo = this.utils.translateText("ERROR_SELECCIONA_COMPARTIR", "Debe seleccionar al menos un elemento a compartir");
      this.utils.mostrarMensajeSwalFire("error", titulo, "","var(--blue)", false);

    }
    //Si no necesitamos la confirmación del usuario
    else if (displayConsentModal){
      // Creamos las variables
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = displayConsentModal;
      dialogConfig.height = "80%";
      dialogConfig.hasBackdrop = true;
      dialogConfig.disableClose = true;

      //Abrimos el modal de consentimiento
      const dialogRef = this.modalRgpd.open(AcceptGdprDocumentComponent, dialogConfig);

      //Al cerrar y aceptar procedemos al envío del correo
      dialogRef.afterClosed().subscribe((result) => {
        if (localStorage.getItem("acceptModal") === "true") {

          //Seteamos a false la variable global 'acceptModal'
          localStorage.setItem("acceptModal", "false");

          // Se genera el documento excel
          this.ExportAsExcel("INFORMES_APTITUD", "Informes aptitud", listaDocumentos, headers);
        }
      });
    }

    //Si no necesitamos la confirmación del usuario
    else{
      this.ExportAsExcel("INFORMES_APTITUD", "Informes aptitud", listaDocumentos, headers);
    }
  }

  /**
   * Función que nos dispone un modal para mandar los documentos seleccionados
   * en la tabla por medio de un correo. Tran su correcto envío se actualizarán
   * los documentos que contiene la tabla si no estamos en un login simulado.
   */
  compartirMultiple() {
    // Obtenemos los documentos seleccionados
    let listaDocumentos: any[] = this.dataSource.data ? this.dataSource.data.filter(doc => doc.checked) : [];
    let displayConsentModal = listaDocumentos.find(doc => doc.fechaAceptacionGdpr === undefined);

    // Nombre que le vamos a poner al archivo .zip
    let nombreZip = this.utils.translateText('SS_APTITUD', 'Informes de Aptitud');

    // Si necesitamos el consentimiento del usuario
    if(displayConsentModal !== undefined){
      // Creamos las variables
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = displayConsentModal;
      dialogConfig.height = "80%";
      dialogConfig.hasBackdrop = true;
      dialogConfig.disableClose = true;

      //Abrimos el modal de consentimiento
      const dialogRef = this.modalRgpd.open(AcceptGdprDocumentComponent, dialogConfig);

      //Al cerrar y aceptar procedemos al envío del correo
      dialogRef.afterClosed().subscribe((result) => {
        if (localStorage.getItem("acceptModal") === "true") {

          //Seteamos a false la variable global 'acceptModal'
          localStorage.setItem("acceptModal", "false");

          // Se intenta enviar los documentos en un correo
          let sendDocuments = this.utils.masiveActions(1, listaDocumentos, nombreZip, this.isLoginSimulado);

          // Si se envía el correo correctamente
          // y no nos encontramos en un Login simulado actualizamos los datos
          if (sendDocuments && !this.isLoginSimulado) this.gdprMethod(listaDocumentos, 1); //GDPR && Reload Info Document
        }
      });
    }

    //Si no necesitamos la confirmación del usuario
    else{
      // Se intenta enviar los documentos en un correo
      let sendDocuments = this.utils.masiveActions(1, listaDocumentos, nombreZip, this.isLoginSimulado);

      // Si se envía el correo correctamente
      // y no nos encontramos en un Login simulado actualizamos los datos
      if (sendDocuments && !this.isLoginSimulado) this.gdprMethod(listaDocumentos, 1);
    }
  }

  /**
   * Función que recopila los diferentes documentos seleccionados y los
   * descarga en un formato .zip
   */
  descargarMultiple() {
    //Cargamos los datos que vamos a necesitar
    let listaDocumentos: any[] = this.dataSource.data.filter(doc => doc.checked);
    let displayConsentModal = listaDocumentos.find(doc => doc.fechaAceptacionGdpr === undefined);

    // Nombre que le vamos a poner al archivo .zip
    let nombreZip = this.utils.translateText('SS_APTITUD', 'Informes de Aptitud');

    // Si necesitamos el consentimiento del usuario
    if(displayConsentModal !== undefined){
      // Creamos las variables
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = displayConsentModal;
      dialogConfig.height = "80%";
      dialogConfig.hasBackdrop = true;
      dialogConfig.disableClose = true;

      //Abrimos el modal de consentimiento
      const dialogRef = this.modalRgpd.open(AcceptGdprDocumentComponent, dialogConfig);

      //Al cerrar y aceptar procedemos al envío del correo
      dialogRef.afterClosed().subscribe((result) => {
        if (localStorage.getItem("acceptModal") === "true") {

          //Seteamos a false la variable global 'acceptModal'
          localStorage.setItem("acceptModal", "false");

          // Se intenta obtener los documentos y empaquetar en un .zip
          let downloadDocuments = this.utils.masiveActions(2, listaDocumentos, nombreZip, this.isLoginSimulado);

          // Si descarga correctamente los documentos
          // y no nos encontramos en un Login simulado actualizamos los datos
          if(downloadDocuments && !this.isLoginSimulado) this.gdprMethod(listaDocumentos, 1); //GDPR && Reload Info Document
        }
      });
    }

    else{
      // Se intenta obtener los documentos y empaquetar en un .zip
      let downloadDocuments = this.utils.masiveActions(2, listaDocumentos, nombreZip, this.isLoginSimulado);

      // Si descarga correctamente los documentos
      // y no nos encontramos en un Login simulado actualizamos los datos
      if(downloadDocuments && !this.isLoginSimulado) this.gdprMethod(listaDocumentos, 1); //GDPR && Reload Info Document
    }
  }
}
