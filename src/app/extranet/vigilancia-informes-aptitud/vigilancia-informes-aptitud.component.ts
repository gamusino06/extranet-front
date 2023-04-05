import { Component, ComponentFactoryResolver, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../environments/environment';
import { UserService } from 'src/app/services/user.service';
import { UtilsService } from 'src/app/services/utils.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatPaginator } from '@angular/material/paginator';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { SafeHtml } from '@angular/platform-browser';
import { PdfView } from 'src/app/modales/pdfView/pdfView.component';
import { ShareDocumentComponent } from 'src/app/modales/shareDocument/shareDocument.component';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { Globals } from '../globals';
import { AcceptGdprDocumentComponent } from '../../modales/acceptGdprDocument/acceptGdprDocument.component';
import { HistoricoAccionesDocumentoComponent } from 'src/app/modales/historicoAccionesDocumento/historicoAccionesDocumento.component';


import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as _moment from 'moment';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MY_FORMATS } from '../../../config/config';
import { TranslateService } from '@ngx-translate/core';
import { ChangeDetectorRef } from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {Router} from '@angular/router';
import { THIS_EXPR, ThrowStmt } from '@angular/compiler/src/output/output_ast';
import { ConfirmationModal } from 'src/app/Model/ConfirmationModal';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { ConnectedOverlayPositionChange } from '@angular/cdk/overlay';
import { BreakpointObserver } from '@angular/cdk/layout';
import {AptitudeReportService} from '../../services/aptitude-report.service';

const moment = _moment;

/* Mock Data */
export interface informesAptitud {
  checked: boolean;
  idDocumento: number;
  nombreDocumento: string;
  fechaDocumento: Date;
  empresaCentroNombre: string;
  trabajadorNombre: SafeHtml;
  puestoTrabajo: any[];
  motivo: string;
  aptitudNombre: string;
  observaciones: string;
  protocolos?: any[];
  fechaBaja: string;
  accionesRealizadas: boolean;
  idTipoDocumento: number;
  ubicacion: string;
  gdprId: number;
  fechaAceptacionGdpr: Date;
  gdpr: any;
  listaHistoricoDocumentoDto: any[];
  nif?: string;
  datos?: any[];
  lastMedicalExaminationDate?: string;
  renouncedMedicalExamination?: boolean;
  nextRecognitionDate?: Date;
  periodicity?: string;
  periodMonths?: number;
  lastRecognitionDate: Date;
  lastRecognitionDateConfirmed: Date;
  centerId: any;
  datosSolicitudCita: any;
}

class CampoMostrar{
  nombre:String;
  visibleTabla:Boolean;
  visibleExcel:Boolean;
  columnStyle:String;

  constructor(nombreCampo:String, visibleEnTabla:Boolean, visibleEnExcel:Boolean, columnStyle: String) {
    this.nombre=nombreCampo;
    this.visibleTabla=visibleEnTabla;
    this.visibleExcel=visibleEnExcel;
    this.columnStyle = columnStyle;
  }
}

@Component({
  selector: 'app-vigilancia-informes-aptitud',
  templateUrl: './vigilancia-informes-aptitud.component.html',
  styleUrls: ['./vigilancia-informes-aptitud.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', padding: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class VigilanciaInformesAptitudComponent implements OnInit {
  cleanImgUrl = "../../assets/img/borrar_filtros.svg";
  searchImgUrl = "../../assets/img/search.svg";
  excelImgUrl = "../../assets/img/excel.svg";
  mailImgUrl = "../../assets/img/mail.svg";
  downloadImgUrl = "../../assets/img/download.svg";
  eyeImgUrl = "../../assets/img/eye.svg";
  listImgUrl = "../../assets/img/icon-list.svg";
  previewImgUrl = "../../assets/img/preview-doc.svg";
  addAppointmentImgUrl = "../../assets/img/new-appointment.svg";
  appointmentHistoricalImgUrl = "../../assets/img/appointment-historical.svg";
  environment = environment;

  empresas: any[];
  searchForm: FormGroup;
  aptitudList: any[];
  aprobDocDataDto: any;
  maxDate: Date;
  minDate: Date;
  mostrarTabla: boolean;
  isLoginSimulado: boolean = false;
  expandedElement: informesAptitud | null;
  showAppointmentModal = false;
  AppointmentModalConfigurationObj: ConfirmationModal = {
    title: 'MODALS.CONFIRMATION_MODAL.APPOINTMENT_DISABLE',
    text: '',
    showCancelButton: false,
    icon: 'warning',
    modalSize: ''
  };
  activeDateLeaving: boolean = false;
  workerData: any;

  private listaCampos: CampoMostrar[] = [
    new CampoMostrar("checklist", true, true, 'col-checkbox'),
    new CampoMostrar("newList", true, true, 'col-shield'),
    new CampoMostrar("status", true, true, 'col-state'),
    new CampoMostrar("trabajadorNombre", true, true, 'col-worker'),
    new CampoMostrar("empresaCentroNombre", true, true, 'col-company'),
    new CampoMostrar("puestoTrabajo", true, true, 'col-job-position'),
    new CampoMostrar("protocolos", true, true, 'col-protocol hola'),
    new CampoMostrar("lastMedicalRecognitionDate", true, true, 'col-date-last-rm'),
    new CampoMostrar("nextMedicalRecognitionDate", true, true, 'col-date-next-rm'),
    new CampoMostrar("periodicity", true, true, 'col-periodicity'),
    new CampoMostrar("motivo", true, true, 'col-reason'),
    new CampoMostrar("fechaBaja", true, true, 'col-date-discharge'),
    new CampoMostrar("aptitudNombre", true, true, 'col-aptitude'),
    new CampoMostrar("observaciones", false, true, undefined),
    new CampoMostrar("specialAction", true, true, 'col-buttons'),
  ];

  tableHeaders: string[] = this.listaCampos
    .filter((campo) => campo.visibleTabla)
    .map(({ nombre }) => nombre.toString());

  excelHeaders: string[] = this.listaCampos
    .filter((campo) => campo.visibleExcel)
    .map(({ nombre }) => nombre.toString());

  dataSource = new MatTableDataSource<informesAptitud>();

  historicalColumnHeaderAndStyle: CampoMostrar[];

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    public utils: UtilsService,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
    private globals: Globals,
    private modalRgpd: MatDialog,
    private translate: TranslateService,
    private cdRef:ChangeDetectorRef,
    private router: Router,
    private aptitudeReportService: AptitudeReportService
  ) { }

  //validators
  validNameSurname = this.globals.workerPattern;
  validNifNie = this.globals.nifNiePattern;
  validPuesto = this.globals.puestoPattern;

  global = this.globals;

  //Evita que se produzca el ERROR Error: ExpressionChangedAfterItHasBeenCheckedError
  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    //En el caso de que se esté realizando un loginSimulado, no tendrá que guardarse
    let loginSimulado = localStorage.getItem("loginSimulado");
    if (loginSimulado !== null && loginSimulado === "true")
      this.isLoginSimulado = true;

    this.mostrarTabla = false;
    this.initForm();
    this.userService.getUser().subscribe((user) => {
      this.empresas = user.empresas;
      this.updateEmpresasYCentros();

      //this.getDocumentos();//NOTA IMPORTANTE: Por petición de PREVING (13/01/2022) a partir de ahora las pantallas con descarga de documentos, se omite la 1º llamada.
    });

    this.userService.getAptitudes().subscribe((aptitudes) => {
      if (aptitudes) {
        this.aptitudList = aptitudes;
      } else {
        this.spinner.hide();
      }
    });

    //transformNecesario es el item que nos dices si ha llegado a través
    //de la barra de favoritos, si es true entonces hacemos el translateX
    let transform = JSON.parse(localStorage.getItem("transformNecesario"));
    if (transform == true) {
      $(document).ready(function () {
        $(".mat-tab-list").css("transform", "translateX(0px)");
      });
    }

    if (screen.width < 1530) {
      $(document).ready(function () {
        $("mat-tab-list").css("transform", "translateX(0px)");
      });
    }

    this.workerData = JSON.parse(localStorage.getItem('workerData'));
    localStorage.removeItem('workerData');
    if(this.workerData !== null && this.workerData.dataSource !== undefined){
      this.searchForm.setValue(this.workerData.searchForm);
      this.onSubmit();
    }

  }

  initForm() {
    //'activoForm' seteado a 1 por petición del cliente
    this.searchForm = this.formBuilder.group({
      allCheckbox: new FormControl(false),
      inForceCheckbox: new FormControl(true),
      timedOutCheckbox: new FormControl(true),
      closeToTimeOutCheckbox: new FormControl(true),
      unrealizedCheckbox: new FormControl(false),
      renounceCheckbox: new FormControl(false),
      empresaForm: new FormControl(""),
      centroForm: new FormControl(""),
      trabajadorODniForm: new FormControl(""),
      puestoForm: new FormControl(""),
      activoForm: new FormControl(1),
      aptitudForm: new FormControl(""),
      fechaDesdeForm: new FormControl(moment()),
      fechaHastaForm: new FormControl(moment()),
      selectEmpresasRadioForm: new FormControl("1"),
      selectCentrosRadioForm: new FormControl("1"),
      todosCentrosForm: true,
    });
    this.setDefaultForm();
  }

  setDefaultForm(): void {
    var now = new Date();
    now.setHours(23, 59, 59);
    this.maxDate = now;
    var nYearsAgo = new Date();
    nYearsAgo.setDate(
      nYearsAgo.getDate() - 365 * this.globals.extranet_intervalo_fechas_filtro
    );
    nYearsAgo.setHours(0, 0, 0);
    this.minDate = nYearsAgo;
    this.searchForm.controls["allCheckbox"].setValue(false);
    this.searchForm.controls["inForceCheckbox"].setValue(true);
    this.searchForm.controls["timedOutCheckbox"].setValue(true);
    this.searchForm.controls["closeToTimeOutCheckbox"].setValue(true);
    this.searchForm.controls["unrealizedCheckbox"].setValue(false);
    this.searchForm.controls["renounceCheckbox"].setValue(false);
    this.searchForm.controls["fechaDesdeForm"].setValue(nYearsAgo);
    this.searchForm.controls["fechaHastaForm"].setValue(now);
    this.searchForm.controls["empresaForm"].setValue([]);
    this.searchForm.controls["centroForm"].setValue([]);
    this.searchForm.controls["selectEmpresasRadioForm"].setValue("1");
    this.searchForm.controls["selectCentrosRadioForm"].setValue("1");
    this.searchForm.controls["trabajadorODniForm"].setValue("");
    this.searchForm.controls["activoForm"].setValue(1); //'activoForm' seteado a 1 por petición del cliente
    this.searchForm.controls["puestoForm"].setValue("");
    this.searchForm.controls["aptitudForm"].setValue([]);
  }

  onAllCheckboxChange(): void {
    this.searchForm.controls["inForceCheckbox"].setValue(
      this.searchForm.get("allCheckbox").value
    );
    this.searchForm.controls["timedOutCheckbox"].setValue(
      this.searchForm.get("allCheckbox").value
    );
    this.searchForm.controls["closeToTimeOutCheckbox"].setValue(
      this.searchForm.get("allCheckbox").value
    );
    this.searchForm.controls["unrealizedCheckbox"].setValue(
      this.searchForm.get("allCheckbox").value
    );
    this.searchForm.controls["renounceCheckbox"].setValue(
      this.searchForm.get("allCheckbox").value
    );
  }

  modifyAllCheckboxStatus(): void {
    this.searchForm.controls['allCheckbox'].setValue(
      this.searchForm.get('inForceCheckbox').value
      && this.searchForm.get('timedOutCheckbox').value
      && this.searchForm.get('closeToTimeOutCheckbox').value
      && this.searchForm.get('unrealizedCheckbox').value
      && this.searchForm.get('renounceCheckbox').value);
  }

  resetForm(): void {
    setTimeout(() => {
      this.setDefaultForm();
      this.updateEmpresasYCentros();
    });
  }

  onSubmit(): void {
    this.displayDateLeaving();
    this.updateHistoricalColumnHeaderAndStyle();
    this.getDocumentos();
  }

  updateEmpresasYCentros() {
    if (this.empresas.length == 1) {
      this.searchForm.controls.empresaForm.setValue([
        this.empresas[0].idEmpresa,
      ]);
      this.empresas.forEach((empresa) => {
        if (empresa.centros.length == 1) {
          this.searchForm.controls.centroForm.setValue([
            empresa.centros[0].idCentro,
          ]);
        }
      });
    }
  }

  getDocumentos() {
    let fechaFin;

    if (this.searchForm.get("fechaHastaForm").value !== null) {
      fechaFin = new Date(this.searchForm.get("fechaHastaForm").value);
      fechaFin.setHours(23, 59, 59);
    }

    let fechaInicio;
    if (this.searchForm.get("fechaDesdeForm").value !== null) {
      fechaInicio = new Date(this.searchForm.get("fechaDesdeForm").value);
      fechaInicio.setHours(0, 0, 0);
    }

    let idEmpresasList: number[] = [];
    let idCentrosList: number[] = [];
    //Método que comprueba si alguno de los fitlros de Empresa y Centro está en 'activo' o en 'inactivo' y va añadiendo empresas/centros a sus respectivas listas
    this.utils.envioDatosConFiltroActivoInactivo(
      this.searchForm.get("selectEmpresasRadioForm").value,
      this.searchForm.get("selectCentrosRadioForm").value,
      this.searchForm.get("empresaForm").value,
      this.searchForm.get("centroForm").value,
      this.empresas,
      idEmpresasList,
      idCentrosList
    );

    let idsListResult: any[] = [];
    //Se comprueba si el usuario había seleccionado alguna empresa/centro en los campos 'empresaForm' y 'centroForm' para
    //alterar o no los atributos a enviar al BACK
    idsListResult = this.utils.valoraListasFinalesAEnviarConFiltro(
      this.searchForm.get("empresaForm").value,
      this.searchForm.get("centroForm").value,
      this.empresas,
      idEmpresasList,
      idCentrosList
    );

    let data = {
      listaIdsTipoDocumento: [this.globals.informes_aptitud],
      listaIdsEmpresas: idsListResult[0],
      listaIdsCentros: idsListResult[1],
      fechaInicio: fechaInicio || "",
      fechaFin: fechaFin || "",
      listaFiltroMetadatosDto: [
        {
          nombreMetadato: this.globals.metadato_aptitud,
          listaIdsValoresDato: this.searchForm.get("aptitudForm").value || [],
        },
        {
          nombreMetadato: this.globals.metadato_nombre_o_nif_trabajador,
          listaIdsValoresDato: this.searchForm.get("trabajadorODniForm").value
            ? [this.searchForm.get("trabajadorODniForm").value]
            : [],
        },
        {
          nombreMetadato: this.globals.metadato_trabajador_activo,
          listaIdsValoresDato: this.searchForm.get("activoForm").value
            ? [this.searchForm.get("activoForm").value]
            : [],
        },
        {
          nombreMetadato: this.globals.metadato_puesto_trabajo,
          listaIdsValoresDato: this.searchForm.get("puestoForm").value
            ? [this.searchForm.get("puestoForm").value]
            : [],
        },
      ],
      allCheckbox: this.searchForm.get("allCheckbox").value,
      inForceCheckbox: this.searchForm.get("inForceCheckbox").value,
      timedOutCheckbox: this.searchForm.get("timedOutCheckbox").value,
      closeToTimeOutCheckbox: this.searchForm.get("closeToTimeOutCheckbox")
        .value,
      unrealizedCheckbox: this.searchForm.get("unrealizedCheckbox").value,
      renounceCheckbox: this.searchForm.get("renounceCheckbox").value,
    };
    this.spinner.show();
    this.userService.getInformesAptitud(data).subscribe(documentos => {
      if(documentos !== undefined && documentos.length > 0){
        const result: informesAptitud[] = this.parseAptitudeReport(documentos);
        this.dataSource = new MatTableDataSource(result);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        //Fix sort problem: sort mayúsculas y minúsculas
        this.dataSource.sortingDataAccessor = (item, property) => {
          if (property == "lastMedicalRecognitionDate")
            return new Date(item.lastRecognitionDate);

          if (property == "nextMedicalRecognitionDate")
            return new Date(item.nextRecognitionDate);

          if (typeof item[property] === "string")
            return item[property].toLocaleLowerCase();

          return item[property];
        };

        this.mostrarTabla = true;
      } else if (documentos !== undefined && documentos.length === 0) {
        this.utils.mostrarMensajeSwalFireDocumentosNoEncontrados();
        const result: informesAptitud[] = [];
        this.dataSource = new MatTableDataSource(result);
        this.mostrarTabla = false;
      }
      this.spinner.hide();
    }),
      (error) => {
        if (environment.debug) console.log("Error");
        this.spinner.hide();
      };
  }

  mostrarMasElementos(element) {
    let result = false;
    if (element.puestoTrabajo.length > 1) {
      result = true;
    }

    element.puestoTrabajo.forEach((element) => {
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
      values.forEach((item) => {
        result.push(item[fieldName]);
      });
      this[formName].controls[formControlName].setValue(result);
    }
  }

  selectAllTwoDimension(
    formName,
    formControlName,
    values,
    values2,
    subArrayfieldName,
    toCompare,
    fieldName
  ) {
    let result = [];
    values.forEach((item1) => {
      values2.forEach((item2) => {
        if (item1[toCompare] === item2) {
          item1[subArrayfieldName].forEach((subItems) => {
            result.push(subItems[fieldName]);
          });
        }
      });
    });

    /*si viene 1 elemento en los controls es que estamos marcando el selectAll...
    si hay mas de uno deseleccionamos*/
    if (this[formName].controls[formControlName].value.length != 1) {
      this[formName].controls[formControlName].setValue([]);
    } else {
      this[formName].controls[formControlName].setValue(result);
    }
  }

  checkAllRows(event) {
    if (this.dataSource.data)
      this.dataSource.data.forEach((val) => {
        val.checked = event.checked;
      });
  }

  previsualizar(element) {
    this.openModalAcceptRgpd(element, 3, null, null);
  }

  /*descargar seleccion*/
  descargar(element) {
    this.openModalAcceptRgpd(element, 2, null, null);
  }

  /*compartir */
  compartir(element) {
    this.openModalAcceptRgpd(element, 1, null, null);
  }

  /*compartir Múltiple */
  compartirMultiple() {
    let listaIdsDocumentos: number[] = [];
    let listaDocumentos: any[] = [];
    if (this.dataSource.data) {
      this.dataSource.data.forEach((documento) => {
        if (documento.checked) {
          listaDocumentos.push(documento);
          listaIdsDocumentos.push(documento.idDocumento);
        }
      });
    }

    if (
      listaIdsDocumentos.length > 0 &&
      listaIdsDocumentos.length <=
        this.globals.extranet_maximo_documentos_multiple
    ) {
      this.openModalAcceptRgpd(null, 1, listaDocumentos, listaIdsDocumentos);
    } else if (
      listaIdsDocumentos.length >
      this.globals.extranet_maximo_documentos_multiple
    ) {
      this.utils.mostrarMensajeSwalFireSobrepasadoLimiteDescargaMultiple(
        listaIdsDocumentos.length
      );
    } else {
      let titulo = "Debe seleccionar al menos un elemento a compartir";
      this.translate
        .get("ERROR_SELECCIONA_COMPARTIR")
        .subscribe((res: string) => {
          titulo = res;
        });
      this.utils.mostrarMensajeSwalFire(
        "error",
        titulo,
        "",
        "var(--blue)",
        false
      );
    }
  }

  /*descarga multiple*/
  descargarMultiple() {
    let listaIdsDocumentos: number[] = [];
    let listaDocumentos: any[] = [];
    if (this.dataSource.data) {
      this.dataSource.data.forEach((documento) => {
        if (documento.checked) {
          listaDocumentos.push(documento);
          listaIdsDocumentos.push(documento.idDocumento);
        }
      });
    }

    if (
      listaIdsDocumentos.length > 0 &&
      listaIdsDocumentos.length <=
        this.globals.extranet_maximo_documentos_multiple
    ) {
      this.openModalAcceptRgpd(null, 2, listaDocumentos, listaIdsDocumentos);
    } else if (
      listaIdsDocumentos.length >
      this.globals.extranet_maximo_documentos_multiple
    ) {
      this.utils.mostrarMensajeSwalFireSobrepasadoLimiteDescargaMultiple(
        listaIdsDocumentos.length
      );
    } else {
      let titulo = "Debe seleccionar al menos un elemento a descargar";
      this.translate
        .get("ERROR_SELECCIONA_DESCARGAR")
        .subscribe((res: string) => {
          titulo = res;
        });
      this.utils.mostrarMensajeSwalFire(
        "error",
        titulo,
        "",
        "var(--blue)",
        false
      );
    }
  }

  /*Metodo que abre la modal y redirecciona a los metodos*/
  openModalAcceptRgpd(element, mode, listaDocumentos, listaIdsDocumentos) {
    let flag: boolean = false;
    if (listaIdsDocumentos != null) {
      listaDocumentos.forEach((documento) => {
        if (documento.fechaAceptacionGdpr === undefined) {
          element = documento;
          flag = true;
        }
      });
    }

    if (
      flag ||
      (element != null && element.fechaAceptacionGdpr === undefined)
    ) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = element;
      dialogConfig.height = "80%";
      dialogConfig.hasBackdrop = true;
      dialogConfig.disableClose = true;
      const dialogRef = this.modalRgpd.open(
        AcceptGdprDocumentComponent,
        dialogConfig
      );
      dialogRef.afterClosed().subscribe((result) => {
        if (localStorage.getItem("acceptModal") === "true") {
          switch (mode) {
            case 1:
              if (listaIdsDocumentos != null && listaIdsDocumentos.length > 0) {
                this.compartirMultipleData(
                  listaIdsDocumentos,
                  mode,
                  listaDocumentos
                );
              } else {
                this.compartirData(element, mode);
              }
              break;
            case 2:
              if (listaIdsDocumentos != null && listaIdsDocumentos.length > 0) {
                this.descargarMultipleData(
                  listaIdsDocumentos,
                  mode,
                  listaDocumentos
                );
              } else {
                this.descargaData(element, mode);
              }
              break;
            case 3:
              this.previsualizarData(element, mode);
              break;
          }
          //Seteamos a false la variable globlal 'acceptModal'
          localStorage.setItem("acceptModal", "false");
        }
      });
    } else {
      switch (mode) {
        case 1:
          if (listaIdsDocumentos != null && listaIdsDocumentos.length > 0) {
            this.compartirMultipleData(
              listaIdsDocumentos,
              mode,
              listaDocumentos
            );
          } else {
            if (listaIdsDocumentos != null && listaIdsDocumentos.length === 0) {
              let titulo = "Debe seleccionar al menos un elemento a compartir";
              this.translate
                .get("ERROR_SELECCIONA_COMPARTIR")
                .subscribe((res: string) => {
                  titulo = res;
                });
              this.utils.mostrarMensajeSwalFire(
                "error",
                titulo,
                "",
                "var(--blue)",
                false
              );
            } else {
              this.compartirData(element, mode);
            }
          }
          break;
        case 2:
          if (listaIdsDocumentos != null && listaIdsDocumentos.length > 0) {
            this.descargarMultipleData(
              listaIdsDocumentos,
              mode,
              listaDocumentos
            );
          } else {
            if (listaIdsDocumentos != null && listaIdsDocumentos.length === 0) {
              let titulo = "Debe seleccionar al menos un elemento a descargar";
              this.translate
                .get("ERROR_SELECCIONA_DESCARGAR")
                .subscribe((res: string) => {
                  titulo = res;
                });
              this.utils.mostrarMensajeSwalFire(
                "error",
                titulo,
                "",
                "var(--blue)",
                false
              );
            } else {
              this.descargaData(element, mode);
            }
          }
          break;
        case 3:
          this.previsualizarData(element, mode);
          break;
      }
    }
  }

  /*compartir selección*/
  compartirData(element, mode) {
    let menuNameComponent = "Documentación Vigilancia";
    this.translate.get("DOCUMENTACION_VIGILANCIA").subscribe((res: string) => {
      menuNameComponent = res;
    });
    let subMenuNameComponent = "Informes de Aptitud";
    this.translate.get("INFORMES_APTITUD").subscribe((res: string) => {
      subMenuNameComponent = res;
    });

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      element: element,
      menuName: menuNameComponent,
      subMenuName: subMenuNameComponent,
    };
    dialogConfig.width = "50%";
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;

    const dialogRef = this.dialog.open(ShareDocumentComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
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
              idAccionDoc: mode,
            },
            filename: element.nombreDocumento + ".pdf",
          },
        };

        let titulo =
          "Se ha procedido al envío por correo electrónico de la documentación indicada";
        this.translate.get("ENVIO_DOC_INICIADA").subscribe((res: string) => {
          titulo = res;
        });
        this.utils.mostrarMensajeSwalFire(
          "info",
          titulo,
          "",
          "var(--blue)",
          false
        );

        this.utils.compartirDocumento(data).subscribe((result) => {
          if (!result) {
            let titulo = "Error al enviar el mensaje";
            this.translate
              .get("ERROR_ENVIO_MENSAJE")
              .subscribe((res: string) => {
                titulo = res;
              });
            this.utils.mostrarMensajeSwalFire(
              "error",
              titulo,
              "",
              "var(--blue)",
              false
            );
          }

          //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
          if (!this.isLoginSimulado) this.gdprMethod([element], mode); //GDPR && Reload Info Document
        }),
          (error) => {
            if (environment.debug)
              console.log("Error al Enviar EMAIL - Compartir Documento");
          };
      }
    });
  }

  /*compartir múltiple*/
  compartirMultipleData(listaIdsDocumentos, mode, listaDocumentos) {
    let menuNameComponent = "Documentación Vigilancia";
    this.translate.get("DOCUMENTACION_VIGILANCIA").subscribe((res: string) => {
      menuNameComponent = res;
    });
    let subMenuNameComponent = "Informes de Aptitud";
    this.translate.get("INFORMES_APTITUD").subscribe((res: string) => {
      subMenuNameComponent = res;
    });
    let filenameComponent = subMenuNameComponent;

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      element: listaDocumentos,
      menuName: menuNameComponent,
      subMenuName: subMenuNameComponent,
    };
    dialogConfig.width = "50%";
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;

    const dialogRef = this.dialog.open(ShareDocumentComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result != undefined) {
        let listaIdsTiposDocumentos: number[] = [];
        let listaUuidsDocumentos: string[] = [];

        listaDocumentos.forEach((documento) => {
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
              idAccionDoc: mode,
            },
            filename: filenameComponent + ".zip",
          },
        };

        let titulo =
          "Se ha procedido al envío por correo electrónico de la documentación indicada";
        this.translate.get("ENVIO_DOC_INICIADA").subscribe((res: string) => {
          titulo = res;
        });
        this.utils.mostrarMensajeSwalFire(
          "info",
          titulo,
          "",
          "var(--blue)",
          false
        );
        this.utils.compartirDocumentoZip(data).subscribe((result) => {
          if (!result) {
            let titulo = "Error al enviar el mensaje";
            this.translate
              .get("ERROR_ENVIO_MENSAJE")
              .subscribe((res: string) => {
                titulo = res;
              });
            this.utils.mostrarMensajeSwalFire(
              "error",
              titulo,
              "",
              "var(--blue)",
              false
            );
          }

          //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
          if (!this.isLoginSimulado) this.gdprMethod(listaDocumentos, mode); //GDPR && Reload Info Document
        }),
          (error) => {
            if (environment.debug)
              console.log("Error al Enviar EMAIL - Compartir Documento");
          };
      }
    });
  }

  /*Previsualizar seleccion*/
  previsualizarData(element, mode) {
    this.spinner.show();
    let data = {
      listaIdsDocumentos: [element.idDocumento],
      listaIdsTiposDocumentos: [element.idTipoDocumento],
      listaUuidsDocumentos: [element.ubicacion],
      loginSimuladoActivado: this.isLoginSimulado,
      accion: { idAccionDoc: mode },
    };
    this.utils.getFile(data).subscribe((pdfBase64) => {
      if (pdfBase64) {
        const byteArray = new Uint8Array(
          atob(pdfBase64.fichero)
            .split("")
            .map((char) => char.charCodeAt(0))
        );
        let blob = new Blob([byteArray], { type: "application/pdf" });
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
        if (!this.isLoginSimulado) this.gdprMethod([element], mode); //GDPR && Reload Info Document

        dialogRef.afterClosed().subscribe((result) => {});
      }
      this.spinner.hide();
    });
  }

  /*descargar seleccion*/
  descargaData(element, mode) {
    this.spinner.show();
    let data = {
      listaIdsDocumentos: [element.idDocumento],
      listaIdsTiposDocumentos: [element.idTipoDocumento],
      listaUuidsDocumentos: [element.ubicacion],
      loginSimuladoActivado: this.isLoginSimulado,
      accion: { idAccionDoc: mode },
    };
    this.utils.getFile(data).subscribe((pdfBase64) => {
      if (pdfBase64) {
        const linkSource = `data:application/pdf;base64,${pdfBase64.fichero}`;
        const filename = pdfBase64.nombreFichero + ".pdf";
        const downloadLink = document.createElement("a");
        downloadLink.href = linkSource;
        downloadLink.download = filename;
        downloadLink.click();

        //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
        if (!this.isLoginSimulado) this.gdprMethod([element], mode); //GDPR && Reload Info Document
      }
      this.spinner.hide();
    });
  }

  /*descargar múltiple*/
  descargarMultipleData(listaIdsDocumentos, mode, listaDocumentos) {
    this.spinner.show();
    //Variables para traducción
    let filename = "Informes aptitud";
    this.translate.get("INFORMES_APTITUD").subscribe((res: string) => {
      filename = res;
    });

    let listaIdsTiposDocumentos: number[] = [];
    let listaUuidsDocumentos: string[] = [];

    listaDocumentos.forEach((documento) => {
      listaIdsTiposDocumentos.push(documento.idTipoDocumento);
      listaUuidsDocumentos.push(documento.ubicacion);
    });

    this.utils
      .getZipFile({
        listaIdsDocumentos,
        listaIdsTiposDocumentos,
        listaUuidsDocumentos,
        loginSimuladoActivado: this.isLoginSimulado,
        accion: { idAccionDoc: mode },
        filename: filename,
      })
      .subscribe((zipBase64) => {
        if (zipBase64) {
          let downloadLink = document.createElement("a");
          downloadLink.href = `data:application/zip;base64,${zipBase64.fichero}`;
          downloadLink.download = filename + ".zip";
          downloadLink.click();

          //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
          if (!this.isLoginSimulado) this.gdprMethod(listaDocumentos, mode); //GDPR && Reload Info Document
        }
        this.spinner.hide();
      });
  }

  /*Metodo GDPR*/
  gdprMethod(elements, accionDocumento) {
    let listaIdsDocuments: any[] = [];
    let listaIdsTiposDocuments: number[] = [];
    let flag: boolean = false;
    elements.forEach((element) => {
      listaIdsDocuments.push(element.idDocumento);
      listaIdsTiposDocuments.push(element.idTipoDocumento);
      if (element.fechaAceptacionGdpr === undefined) {
        flag = true;
      }
    });

    //JSON que sirve para recargar los datos de nuevo para quitar nuevo documento o no y mostrar las acciones de los documentos
    let jsonInfoDocumentosDto: any[] = [];
    listaIdsDocuments.forEach((idDocumentoInfo) => {
      let jsonInfoDocumentoDto = {
        idDocumento: idDocumentoInfo,
      };
      jsonInfoDocumentosDto.push(jsonInfoDocumentoDto);
    });

    this.aprobDocDataDto = {
      listaIdsDocumentos: listaIdsDocuments,
      listaIdsTiposDocumentos: listaIdsTiposDocuments,
      loginSimuladoActivado: this.isLoginSimulado,
      accion: { idAccionDoc: accionDocumento },
    };

    //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
    if (!this.isLoginSimulado) {
      if (flag) {
        this.userService
          .setFechaAprobacionDocumentoGdpr(this.aprobDocDataDto)
          .subscribe((aprobPolitica) => {
            if (!aprobPolitica) {
              this.spinner.hide();
              let titulo =
                "Se ha producido un error al guardar la política de aceptación de terminos del documento";
              this.translate
                .get("ERROR_GUARDAR_POLITICA")
                .subscribe((res: string) => {
                  titulo = res;
                });
              this.utils.mostrarMensajeSwalFire(
                "error",
                titulo,
                "",
                "var(--blue)",
                false
              );
            } else {
              //Si no hubo errores, se actualiza la información de los documentos con acciones realizadas
              //this.getDocumentos();
              this.utils.recargarTablaDatosMultiplePorAccion(
                jsonInfoDocumentosDto,
                this.dataSource.filteredData,
                this.spinner,
                false,
                null,
                false,
                null,
                true
              );
            }
          });
      } else {
        //Si los documentos tienen aceptada la gdpr, entonces se actualiza la información de los documentos con acciones realizadas
        //this.getDocumentos();
        this.utils.recargarTablaDatosMultiplePorAccion(
          jsonInfoDocumentosDto,
          this.dataSource.filteredData,
          this.spinner,
          false,
          null,
          false,
          null,
          true
        );
      }
    }
  }

  //Muestra el historico de acciones del documento
  verHistoricoDocumento(element) {
    const dialogConfig = new MatDialogConfig();
    this.utils.verHistoricoDocumentoComun(dialogConfig, element);
  }

  async exportAsExcel() {
    this.spinner.show();
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    let JSONWS: XLSX.WorkSheet;
    let dataJS = [];

    //Variables para traducción
    var nombreExcel = "Informes aptitud";
    this.translate.get("INFORMES_APTITUD").subscribe((res: string) => {
      nombreExcel = res;
    });
    var columnaFecha = "Fecha";
    this.translate.get("FECHA").subscribe((res: string) => {
      columnaFecha = res;
    });
    var columnaEmpresaCentro = "Empresa - Centro";
    this.translate.get("EMPRESA_CENTRO").subscribe((res: string) => {
      columnaEmpresaCentro = res;
    });
    var columnaTrabajador = "Trabajador";
    this.translate.get("TRABAJADOR").subscribe((res: string) => {
      columnaTrabajador = res;
    });
    var columnaTrabajadorNif = "NIF/NIE";
    this.translate.get("NIF_NIE").subscribe((res: string) => {
      columnaTrabajadorNif = res;
    });
    var columnaPuesto = "Puesto de Trabajo";
    this.translate.get("PUESTO_TRABAJO").subscribe((res: string) => {
      columnaPuesto = res;
    });
    var columnaMotivo = "Motivo";
    this.translate.get("MOTIVO").subscribe((res: string) => {
      columnaMotivo = res;
    });
    var columnaAptitud = "Aptitud";
    this.translate.get("APTITUD").subscribe((res: string) => {
      columnaAptitud = res;
    });
    var columnaObservaciones = "Observaciones";
    this.translate.get("OBSERVACIONES").subscribe((res: string) => {
      columnaObservaciones = res;
    });
    var columnaProtocolos = "Protocolos";
    this.translate.get("PROTOCOLOS").subscribe((res: string) => {
      columnaProtocolos = res;
    });
    var columnaFechaBaja = "Fecha de Baja";
    this.translate.get("FECHA_BAJA").subscribe((res: string) => {
      columnaFechaBaja = res;
    });
    let statusColumn = '';
    this.translate.get('ESTADO').subscribe((res: string) => {
      statusColumn = res;
    });
    let nextRecognitionDateColumn = '';
    this.translate.get('VIGILANCIA_INFORMES_APTITUD.NEXT_MEDICAL_RECOGNITION_DATE').subscribe((res: string) => {
      nextRecognitionDateColumn = res.charAt(0).toUpperCase() + res.slice(1).toLowerCase();
    });
    let lastRecognitionDateColumn = '';
    this.translate.get('VIGILANCIA_INFORMES_APTITUD.RM_DATE').subscribe((res: string) => {
      lastRecognitionDateColumn = res.charAt(0).toUpperCase() + res.slice(1).toLowerCase();
    });
    let periodicityColumn = '';
    this.translate.get('VIGILANCIA_INFORMES_APTITUD.PERIODICITY').subscribe((res: string) => {
      periodicityColumn = res.charAt(0).toUpperCase() + res.slice(1).toLowerCase();
    });

    // populate protocols
    await this.setProtocols(this.dataSource.data);

    let isElementosSelect: boolean = false;

    this.dataSource._orderData(this.dataSource.data).forEach((item) => {
      if (item.checked) {
        isElementosSelect = true;
        let new_item = {};

        this.excelHeaders.forEach((excelHeader) => {
          switch (excelHeader) {
            case "fechaDocumento":
              new_item[columnaFecha] = new Date(
                item["fechaDocumento"]
              ).toLocaleDateString();
              break;
            case "empresaCentroNombre":
              new_item[columnaEmpresaCentro] = item.empresaCentroNombre;
              break;
            case "trabajadorNombre":
              let trabajadorYNif = String(item.trabajadorNombre).split("<br>");
              new_item[columnaTrabajador] = trabajadorYNif[0];
              new_item[columnaTrabajadorNif] = trabajadorYNif[1];
              break;
            case "puestoTrabajo":
              new_item[columnaPuesto] = item.puestoTrabajo
                .map((puesto) => {
                  return puesto["nombre"];
                })
                .join(", ");
              break;
            case "motivo":
              new_item[columnaMotivo] = item.motivo;
              break;
            case "aptitudNombre":
              new_item[columnaAptitud] = item.aptitudNombre;
              break;
            case "observaciones":
              new_item[columnaObservaciones] = item.observaciones;
              break;
            case "protocolos":
              new_item[columnaProtocolos] = item.protocolos;
              break;
            case "fechaBaja":
              let fechaBaja = null;
              if (item["fechaBaja"] != null)
                fechaBaja = new Date(item["fechaBaja"]).toLocaleDateString();
              new_item[columnaFechaBaja] = fechaBaja;
              break;
            case 'status':
              new_item[statusColumn] = this.utils.getStatusColorTranslated(item);
              break;
            case 'lastMedicalRecognitionDate':
              new_item[lastRecognitionDateColumn] = item.lastRecognitionDate;
              break;
            case 'nextMedicalRecognitionDate':
              new_item[nextRecognitionDateColumn] = item.nextRecognitionDate;
              break;
            case 'periodicity':
              new_item[periodicityColumn] = item.periodicity;
              break;
          }
        });
        dataJS.push(new_item);
      }
    });

    if (isElementosSelect == false) {
      let titulo = "Debe seleccionar al menos un elemento a exportar";
      this.translate
        .get("ERROR_SELECCIONA_EXPORTAR")
        .subscribe((res: string) => {
          titulo = res;
        });
      this.utils.mostrarMensajeSwalFire(
        "error",
        titulo,
        "",
        "var(--blue)",
        false
      );
    } else {
      let result = XLSX.utils.sheet_add_json(JSONWS, dataJS);

      XLSX.utils.book_append_sheet(wb, result, "Sheet1");

      /* save to file */
      XLSX.writeFile(wb, nombreExcel + ".xlsx");
    }

    //this.dataSource.paginator._changePageSize(paginacion);

    this.spinner.hide();
  }

  /**
   * Given a list of documents, calls getProtocols service to fetch protocol data
   * @param data
   */
  async setProtocols(documents) {
    const documentsWithoutProtocols = new Map<Number, informesAptitud>();
    documents.map(element => {
      if(element.checked && element.protocolos === undefined && element.idDocumento !== 0){
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

  /**
   * Function that searches for and displays
   *  the history of the aptitude report
   * @param element Last aptitude report
   */
  onShowReportHistorical(element) {
    if (element.hasAlreadyHistoricalChecked === undefined) {
      this.spinner.show();
      let jobPositionId = element.puestoTrabajo.length > 0 ?
                    (element.puestoTrabajo[0].idPuestoTrabajo !== undefined ?
                      element.puestoTrabajo[0].idPuestoTrabajo : "") : "";
      let companyId = element.datosSolicitudCita?.idEmpresa !== undefined ?
                    element.datosSolicitudCita.idEmpresa : 0;
      let centerId = element.centerId !== undefined ? element.centerId : 0;
      this.utils.getPastAptitudeReportsByUser(element.nif,
                                              element.fechaDocumento,
                                              companyId,
                                              centerId,
                                              jobPositionId).subscribe(
        data => {
        if (data.length) {
          element.listOfDocuments = this.parseAptitudeReport(data);
        }
        else {
          element.listOfDocuments = null;
        }
      },
        error => {
          console.log(error);
          let titulo = "";
          this.spinner.hide();
          this.translate.get("ERROR").subscribe((res: string) => { titulo = res; });
          this.utils.mostrarMensajeSwalFire(
            "error",
            titulo,
            "",
            "var(--blue)",
            false
          );
        },
        () => {
          this.spinner.hide();
          element.hasAlreadyHistoricalChecked = true;
          this.expandedElement = this.expandedElement === element ? undefined : element;
          event.stopPropagation();
        }
      );
    } else {
      element.hasAlreadyHistoricalChecked = true;
      this.expandedElement = this.expandedElement === element ? undefined : element;
      event.stopPropagation();
    }
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
          let appointmentData = {
            ...element.datosSolicitudCita,
            urlPrevious: "vigilancia-informes-aptitud",
            dataSource: this.dataSource.data,
            searchForm: this.searchForm.value
          }
          localStorage.setItem('workerData', JSON.stringify(appointmentData));
          localStorage.setItem('aptitudeReportRedirectCenterId', JSON.stringify(data.centroId));
          this.router.navigate([this.globals.extranet_url + this.global.extranet_citacion_web_provincia_url]);
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

  onShowAppointmentHistorical(element) {
    const workerData = {
      workerNIF: element.nif,
      workerIsActive: (element.fechaBaja === undefined || element.fechaBaja === null) ? 1 : 2
    }
    localStorage.setItem('workerData', JSON.stringify(workerData));
    this.router.navigate([this.globals.extranet_url + 'historico-citas']);
  }

  parseAptitudeReport(documentos) {
    const result: informesAptitud[] = [];
    let trabajadorDto;

    documentos.forEach(item => {
      trabajadorDto = item.datos.find(obj => obj.nombre == this.globals.metadato_trabajador)?.valorDto;

      var nDatoTrabajador = 0;
      var c = 0;
      item.datos.forEach(dato => {
        if (dato.nombre === this.globals.metadato_trabajador) nDatoTrabajador = c;
        c++;
      })
      var auxEmpresaCentroNombre;
      if (item.centro != null)
        auxEmpresaCentroNombre = item.empresa?.nombre + ' - ' + item.centro?.nombre
      else
        auxEmpresaCentroNombre = item.empresa?.nombre;

      //Fecha de baja es la del trabajador
      result.push({
        checked: false,
        idDocumento: item.idDocumento,
        nombreDocumento: item.nombre,
        fechaDocumento: item.fechaDocumento,
        empresaCentroNombre: auxEmpresaCentroNombre,
        trabajadorNombre: trabajadorDto ? (trabajadorDto.nombre + ' ' + trabajadorDto.apellidos + '<br>' + trabajadorDto.nif) : '',
        puestoTrabajo: item.datos[nDatoTrabajador]?.valorDto?.puestoTrabajoDtoList,
        motivo: item.datos.find(obj => obj.nombre == this.globals.metadato_motivo)?.valor,
        aptitudNombre: item.datos.find(obj => obj.nombre == this.globals.metadato_aptitud)?.valorDto.nombre,
        observaciones: item.datos.find(obj => obj.nombre == this.globals.metadato_observaciones)?.valor,
        fechaBaja: item.datos[nDatoTrabajador]?.valorDto?.fechaBaja,
        accionesRealizadas: item.accionesRealizadas,
        idTipoDocumento: item.tipoDocumento?.idTipoDocumento,
        ubicacion: item.ubicacion,
        gdprId: item.gdpr?.idGdpr,
        fechaAceptacionGdpr: item.fechaAceptacion,
        gdpr: item.gdpr,
        listaHistoricoDocumentoDto: [],
        nif: trabajadorDto?.nif,
        renouncedMedicalExamination: item.datos.find(obj => obj.nombre == this.globals.medicalExamination)?.valorDto.renouncedMedicalExamination,
        nextRecognitionDate: item.datos.find(obj => obj.nombre == this.globals.medicalExamination)?.valorDto.nextRecognitionDate,
        periodicity: item.datos.find(obj => obj.nombre == this.globals.medicalExamination)?.valorDto.periodName,
        periodMonths: item.datos.find(obj => obj.nombre == this.globals.medicalExamination)?.valorDto.periodMonths,
        lastRecognitionDate: item.datos.find(obj => obj.nombre == this.globals.medicalExamination)?.valorDto.lastRecognitionDate,
        lastRecognitionDateConfirmed: item.datos[nDatoTrabajador]?.valorDto?.ultimaCitaProgramada,
        centerId: item.centro.idCentro,
        datosSolicitudCita: {
          "idEmpresa": item.empresa.idEmpresa,
          "nombreTrabajador": trabajadorDto.nombre + " " + trabajadorDto.apellidos,
          "idTrabajador": trabajadorDto.idTrabajador,
          "motivo": item.datos.find(obj => obj.nombre == this.globals.metadato_motivo)?.valor
        }
        //listaHistoricoDocumentoDto: item?.listaHistoricoDocumentoDto || [] //Se comenta ya que ahora el Back sólo va a devolver si tiene acciones realizadas o no
      });
    });
    return result;
  }

  displayDateLeaving(): void{
    if(this.searchForm.get("activoForm").value === 1){
      this.listaCampos.find((campo) => campo.nombre === "fechaBaja").visibleTabla = false;
      this.activeDateLeaving = true;
    }
    else{
      this.listaCampos.find((campo) => campo.nombre === "fechaBaja").visibleTabla = true;
      this.activeDateLeaving = false;
    }
    this.tableHeaders = this.listaCampos
    .filter((campo) => campo.visibleTabla)
    .map(({ nombre }) => nombre.toString());
  }

  showProtocolsPopUp(element) {
    this.aptitudeReportService.showProtocolsPopUp(element);
  }

  updateHistoricalColumnHeaderAndStyle() {
    this.historicalColumnHeaderAndStyle = [];
    this.tableHeaders.forEach(header => {
      this.historicalColumnHeaderAndStyle.push(
        this.listaCampos.find(column => {
          return column.nombre === header;
        }));
    });
  }
}
