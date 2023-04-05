// Core
import { Component, Input, OnInit, ViewChild, OnChanges, OnDestroy, SimpleChanges, ChangeDetectorRef } from "@angular/core";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import { TranslateService } from "@ngx-translate/core";
import { Router } from "@angular/router";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { filter, first, switchMap, tap, takeUntil } from "rxjs/operators";
import { MatPaginator } from "@angular/material/paginator";
import { MatSelect } from "@angular/material/select";
import { MatOption } from "@angular/material/core";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { Subject } from "rxjs";
import { NgxSpinnerService } from "ngx-spinner";
import * as _moment from "moment";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import Swal from "sweetalert2";
import { environment } from "../../../../environments/environment";

// Services
import { UserService } from "src/app/services/user.service";
import { UtilsService } from "src/app/services/utils.service";
import { AptitudeReportService } from "../../../services/aptitude-report.service";
import { PreventiveMeasureScheduleService } from "src/app/services/preventive-measure-schedule.service";
import { SchedulingsService } from "src/app/services/schedulings.service";
import { MessageService } from "src/app/services/message.service";
import { MY_FORMATS } from "../../../../config/config";
import { Idioma } from "../../../Model/Idioma";
import { Globals } from "../../globals";

// Components
import { ConfirmationModal } from "src/app/Model/ConfirmationModal";
import { PreventiveMeasureModalComponent } from "../planificacion/components/preventive-measure-modal/preventive-measure-modal.component";
import { PreventiveMeasureMassiveModalComponent } from "../planificacion/components/preventive-measure-massive-modal/preventive-measure-massive-modal.component";
import { PreventiveMeasureModalExcelComponent } from "../planificacion/components/preventive-measure-add-excel/preventive-measure-modal-excel.component";
import { PreventiveMeasureExcelErrorModalComponent } from "../planificacion/components/preventive-measure-excel-error-modal/preventive-measure-excel-error-modal.component";
import { DeleteModalComponent } from "src/app/extranet/planificacion-prl/components/delete-modal/delete-modal.component";
import { PreventiveMeasureDetailModalComponent } from "../planificacion/components/preventive-measure-detail-modal/preventive-measure-detail-modal.component";
import { GeneratePreventivePlanningModalComponent } from "../components/generate-preventive-planning-modal/generate-preventive-planning-modal.component";
import { PreventiveMeasureDocsModalComponent } from "../planificacion/components/preventive-measure-docs-modal/preventive-measure-docs-modal.component";
import { EmailingModalComponent } from "../components/emailing-modal/emailing-modal.component";

// Utils
import { FileUtils } from "src/app/services/file-utils.service";
import { EmailFields, EMAIL_FIELDS } from "../models/EmailDTO";

const moment = _moment;
const red_color = "#F01F1F";
const yellow_color = "#FED74D";
const green_color = "#45925A";

/* Mock Data */
export class preventiveMeasure {
  id: number;
  preventiveMeasure: string;
  location: string;
  cause: string;
  priority: number;
  scheduledDate: Date;
  executionDate: Date;
  checked: boolean;
}

@Component({
  selector: "app-planificaciones-prl",
  templateUrl: "./planificaciones-prl.component.html",
  styleUrls: ["./planificaciones-prl.component.css"],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class PlanificacionesPrlComponent
  implements OnInit, OnChanges, OnDestroy
{
  // Variables
  @Input() isCurrentPlanning: Boolean = true;
  @Input() scheduleList: any;

  ngOnChanges(changes: SimpleChanges): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  private destroy$ = new Subject();
  // Type
  OWN_CREATION = 0;
  PT = 1;

  // Status
  IMPLANTED = 1;
  PLANNED = 2;
  NOT_PLANNED = 3;

  // Date Type
  START_DATE = 1;
  SCHEDULED_DATE = 2;
  EXECUTION_DATE = 3;

  ALL = "ALL";

  environment = environment;
  editMassiveIcon = "../../../../assets/img/icon-edit-massive.svg";
  cleanImgUrl = "../../../assets/img/borrar_filtros.svg";
  searchImgUrl = "../../../assets/img/search.svg";
  excelImgUrl = "../../../assets/img/excel.svg";
  mailImgUrl = "../../../assets/img/mail.svg";
  downloadImgUrl = "../../../assets/img/download.svg";
  eyeImgUrl = "../../../assets/img/eye.svg";
  previewImgUrl = "../../../assets/img/preview-doc.svg";
  addAppointmentImgUrl = "../../../assets/img/new-appointment.svg";
  appointmentHistoricalImgUrl =
    "../../../assets/img/appointment-historical.svg";
  imgPerfil = "../../../assets/img/user.svg";
  imgPerfilMujer = "../../../assets/img/user_female.svg";
  downloadForOfflineImgUrl = "../../../assets/img/download_for_offline.svg";

  idTrabajador: number;
  puestoPrincipalSeleccionado: number;
  tipoPuestoSeleccionado: String;
  modificarPuesto: boolean = false;
  altaMasivaTrabajadores = false; //mostrar boton de alta masiva
  showTrabajadorDetails: boolean = false;
  aprobDocDataDto: any;

  tieneVS: boolean = false;
  isLoginSimulado: boolean = false;
  maxDate: Date;
  minDate: Date;

  showAltaIndividual: boolean = false;
  showModAlta: boolean = false;
  verResultado: boolean = false;
  modAltaForm: FormGroup;
  idiomasList: Idioma[];
  empresaSeleccionada: String = "";
  centroSeleccionado: String = "";
  noPermisoTrabajador: boolean;
  noEncontrado: boolean;
  datosTrabajadorBuscado: any;
  puestosBuscados: any[] = [];
  showAppointmentModal: Boolean = false;
  AppointmentModalConfigurationObj: ConfirmationModal = {
    title: "MODALS.CONFIRMATION_MODAL.APPOINTMENT_DISABLE",
    text: "",
    showCancelButton: false,
    icon: "warning",
    modalSize: "",
  };

  empresas: any[];
  searchForm: FormGroup;
  trabajadorSeleccionado: any;
  searchTrabajadoresForm: FormGroup;
  trabajadoresBuscados: any;
  busqueda: any;
  reactivar: boolean = false;
  altaTrabajadorBool: boolean = false;
  swithunitario: boolean = true;
  existenPuestosCentro: boolean = false;
  workerData: any;

  displayedColumns: string[] = [
    "checklist",
    "status",
    "origin",
    "location",
    "preventiveMeasure",
    "cause",
    "priority",
    "scheduledDate",
    "executionDate",
    "actions",
  ];

  statusList = [
    {
      value: this.IMPLANTED,
      viewValue: "PLANIFICACION_PRL.MEASURE.IMPLANTED",
    },
    {
      value: this.PLANNED,
      viewValue: "PLANIFICACION_PRL.MEASURE.PLANNED",
    },
    {
      value: this.NOT_PLANNED,
      viewValue: "PLANIFICACION_PRL.MEASURE.NOT_PLANNED",
    },
  ];
  priorityList = [
    { id: 1, label: "PLANIFICACION_PRL.PRIORITY.INSTANT" },
    { id: 2, label: "PLANIFICACION_PRL.PRIORITY.SHORT" },
    { id: 3, label: "PLANIFICACION_PRL.PRIORITY.MEDIUM" },
    { id: 4, label: "PLANIFICACION_PRL.PRIORITY.LARGE" },
  ];
  typeList = [
    {
      value: this.OWN_CREATION,
      viewValue: "PLANIFICACION_PRL.MEASURE.TYPE.CLIENT",
    },
    {
      value: this.PT,
      viewValue: "PLANIFICACION_PRL.MEASURE.TYPE.PT",
    },
  ];
  dateTypeList = [
    {
      value: this.START_DATE,
      viewValue: "PLANIFICACION_PRL.FECHA_INICIO",
    },
    {
      value: this.SCHEDULED_DATE,
      viewValue: "PLANIFICACION_PRL.FECHA_PREVISTA",
    },
    {
      value: this.EXECUTION_DATE,
      viewValue: "PLANIFICACION_PRL.FECHA_IMPLANTACION",
    },
  ];
  originList = [];
  showTable: boolean = false;
  preventiveMeasurePage: any;
  pageIndex: number = 0;
  pageSize: number = 10;
  measuresChecked: any[] = [];

  TECHNICAL_CREATION = 1;
  dataSourceMeasures: MatTableDataSource<preventiveMeasure>;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild("statusSelect") statusSelect: MatSelect;
  @ViewChild("typeSelect") typeSelect: MatSelect;
  @ViewChild("originSelect") originSelect: MatSelect;
  @ViewChild("prioritySelect") prioritySelect: MatSelect;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    public utils: UtilsService,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
    public globals: Globals,
    private modalRgpd: MatDialog,
    public translate: TranslateService,
    private cdRef: ChangeDetectorRef,
    private router: Router,
    private aptitudeReportService: AptitudeReportService,
    private preventiveMeasureScheduleService: PreventiveMeasureScheduleService,
    private schedulingsService: SchedulingsService,
    private messageService: MessageService,
    private fileUtils: FileUtils
  ) {}

  //validators
  validNameSurname = this.globals.workerPattern;
  validNifNie = this.globals.nifNiePattern;

  //Evita que se produzca el ERROR Error: ExpressionChangedAfterItHasBeenCheckedError
  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    //En el caso de que se esté realizando un loginSimulado, no tendrá que guardarse
    let loginSimulado = localStorage.getItem("loginSimulado");
    if (loginSimulado !== null && loginSimulado === "true")
      this.isLoginSimulado = true;

    this.dataSourceMeasures = new MatTableDataSource();

    this.initForm();
    this.userService.getUser().subscribe((user) => {
      this.empresas = user.empresas;
      this.updateEmpresasYCentros();
      user.areas.forEach((area) => {
        if (area.idArea == this.globals.idAreaVS) this.tieneVS = true;
      });
    });

    //transformNecesario es el item que nos dices si ha llegado a través
    //de la barra de favoritos, si es true entonces hacemos el translateX
    let transform = JSON.parse(localStorage.getItem("transformNecesario"));
    if (transform == true) {
      $(document).ready(function () {
        $(".mat-tab-list").css("transform", "translateX(0px)");
      });
    }

    //en caso de que sea una pantalla pequeña
    if (screen.width < 1530) {
      $(document).ready(function () {
        $(".mat-tab-list").css("transform", "translateX(0px)");
      });
    }

    // this.iniciarFormulario();

    this.workerData = JSON.parse(localStorage.getItem("workerData"));
    localStorage.removeItem("workerData");
    if (this.workerData !== null && this.workerData.worker !== undefined) {
      // this.showTrabajador(this.workerData.worker)
      this.searchForm.setValue(this.workerData.searchForm);
    }

    this.preventiveMeasureScheduleService.getOriginList().subscribe((data) => {
      this.originList = data.map((origin) => {
        return {
          value: origin,
          viewValue: origin.name,
        };
      });
    });
  }

  initForm() {
    this.searchForm = this.formBuilder.group({
      empresaForm: new FormControl("", [Validators.required]),
      centroForm: new FormControl("", [Validators.required]),
      estadoForm: new FormControl(""),
      originForm: new FormControl(""),
      typeForm: new FormControl(""),
      priorityForm: new FormControl(""),
      dateTypeForm: new FormControl(this.dateTypeList[0].value),
      measureForm: new FormControl(""),
      dateIniForm: new FormControl(""),
      dateEndForm: new FormControl(""),
      schedulingsForm: new FormControl(""),
    });

    this.setFormWatchers();
    this.setDefaultForm();
  }

  resetForm(): void {
    setTimeout(() => {
      this.initForm();
      this.updateEmpresasYCentros();
      this.measuresChecked = [];
      this.dataSourceMeasures.data = [];
    });
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
  }

  changePage(event) {
    this.pageIndex = event.pageIndex;
    this.searchMeasures(this.pageIndex);
  }

  allChecked() {
    for (let i = 0; i < this.dataSourceMeasures.data.length; ++i) {
      if (!this.measuresChecked.filter(m => m.id === this.dataSourceMeasures.data[i].id).length) {
        return false;
      }
    }
    return true;
  }

  searchMeasures(page = null): void {
    if (this.searchForm.invalid) {
      this.searchForm.get("empresaForm").markAsTouched();
      this.searchForm.get("centroForm").markAsTouched();
    } else {
      const newSearch = page === null;
      if (newSearch) {
        page = 0;
        this.paginator.firstPage();
      }
      const filterDTO = this.createFilter(page);

      this.spinner.show();
      this.preventiveMeasureScheduleService
        .getFilteredMeasures(
          filterDTO,
          this.searchForm.get("empresaForm").value,
          this.searchForm.get("centroForm").value
        )
        .subscribe((response) => {
          this.preventiveMeasurePage = response;
          let data = response.content;
          if (newSearch) {
            this.measuresChecked = [];
          } else {
            data = this.checkElements(data);
          }
          this.dataSourceMeasures.data = data;

          this.showTable = true;
          this.spinner.hide();
        })
        .add(() => {
          // when the request ends
          this.spinner.hide();
        });
    }
  }

  checkElements(data) {
    // Check if measuresChecked contains the measure
    return data.map((measure) => {
      measure.checked = this.measuresChecked.filter(m => m.id === measure.id).length > 0;
      return measure;
    });
  }

  createFilter(page) {
    // filterDTO {
    //   search: string;
    //   page: number;
    //   pageSize: number;
    //   sortList: [];
    // }
    return {
      search: this.createSearchFilter(),
      page: page,
      pageSize: this.paginator.pageSize,
      sortList: this.createSortList(),
    };
  }

  createSortList() {
    const sortList = [];
    if (this.sort.active != null && !!this.sort.direction) {
      sortList.push({
        field: this.sort.active,
        direction: this.sort.direction,
      });
    } else {
      sortList.push({
        field: "priority",
        direction: "asc",
      });
      sortList.push({
        field: "preventiveMeasure",
        direction: "asc",
      });
    }
    return sortList;
  }

  /**
   * Parse search form to filter query
   */
  createSearchFilter(): string {
    let filter = "";

    // Status
    if (
      this.searchForm.get("estadoForm").value != null &&
      this.searchForm.get("estadoForm").value.length > 0
    ) {
      let status = this.searchForm
        .get("estadoForm")
        .value.filter((value) => value != this.ALL);
      status = status.toString().replaceAll(",", ":");
      filter = filter + "status¬" + status + ",";
    }

    // Origin
    if (
      this.searchForm.get("originForm").value != null &&
      this.searchForm.get("originForm").value.length > 0
    ) {
      let origins = this.searchForm
        .get("originForm")
        .value.filter((value) => value != this.ALL);
      origins = origins.map((origin) => {
        return origin.id;
      });
      let origin = origins.toString().replaceAll(",", ":");
      filter = filter + "originId¬" + origin + ",";
    }

    // Type
    if (
      this.searchForm.get("typeForm").value != null &&
      this.searchForm.get("typeForm").value.length > 0 &&
      this.searchForm.get("typeForm").value.length < 2
    ) {
      let type = this.searchForm.get("typeForm").value;
      filter = filter + "type:" + type + ",";
    }

    // Priority
    if (
      this.searchForm.get("priorityForm").value != null &&
      this.searchForm.get("priorityForm").value.length > 0
    ) {
      let priority = this.searchForm
        .get("priorityForm")
        .value.filter((value) => value != this.ALL);
      priority = priority.toString().replaceAll(",", ":");
      filter = filter + "priorityId¬" + priority + ",";
    }

    // Measure
    if (
      this.searchForm.get("measureForm").value != null &&
      this.searchForm.get("measureForm").value != ""
    ) {
      let measure = this.searchForm.get("measureForm").value.split(" ");
      measure.forEach((element) => {
        filter = filter + "preventiveMeasure~" + element + ",";
      });
    }

    const dateField = this.getDatesForm(
      this.searchForm.get("dateTypeForm").value
    );
    if (
      this.searchForm.get("dateIniForm").value != null &&
      this.searchForm.get("dateIniForm").value != ""
    ) {
      let startIniForm = this.getLastHourToDateBefore(
        this.searchForm.get("dateIniForm").value
      );
      filter = filter + `${dateField}>` + startIniForm + ",";
    }

    if (
      this.searchForm.get("dateEndForm").value != null &&
      this.searchForm.get("dateEndForm").value != ""
    ) {
      let startEndForm = this.getFirstHourToDateAfter(
        this.searchForm.get("dateEndForm").value
      );
      filter = filter + `${dateField}<` + startEndForm + ",";
    }

    if (
      this.searchForm.get("schedulingsForm").value != null &&
      this.searchForm.get("schedulingsForm").value != ""
    ) {
      let schedulings = this.searchForm.get("schedulingsForm").value.id;
      filter = filter + "schedulingId:" + schedulings + ",";
    }

    return filter;
  }

  /**
   * Get the last hour of the day before the date
   * @param date
   * @returns
   */
  getLastHourToDateBefore(date) {
    let lastHour = moment(date).subtract(1, "days").endOf("day");
    return lastHour.format("yyyy-MM-DDTHH:mm:ss");
  }

  /**
   * Get the first hour of the day after the date
   * @param date
   * @returns
   */
  getFirstHourToDateAfter(date) {
    let firstHour = moment(date).add(1, "days").startOf("day");
    return firstHour.format("yyyy-MM-DDTHH:mm:ss");
  }

  /**
   * Get the date in the form
   * acording to the date type selected
   * @param date
   * @param dateType
   */
  getDatesForm(dateType) {
    switch (dateType) {
      case this.START_DATE:
        return "startDate";
      case this.SCHEDULED_DATE:
        return "scheduledDate";
      case this.EXECUTION_DATE:
        return "executionDate";
    }
  }

  /**
   * Select all status
   */
  toggleAllSelection(selector, form) {
    this[selector].options.forEach((item: MatOption) => {
      if (this.searchForm.controls[form].value.includes(this.ALL)) {
        item.select();
      } else {
        item.deselect();
      }
    });
  }

  /**
   * Check if all status are selected
   */
  optionClick(selector, form) {
    let isAllSelected = true;
    this[selector].options.forEach((item: MatOption) => {
      if (!item.selected && item.value != this.ALL) {
        isAllSelected = false;
      }
    });
    if (isAllSelected) {
      this.searchForm.controls[form].setValue([
        ...this.searchForm.controls[form].value,
        this.ALL,
      ]);
    } else {
      this.searchForm.controls[form].setValue(
        this[selector].value.filter((value) => value != this.ALL)
      );
    }
  }

  // @Deprecated ¿?
  updateEmpresasYCentros() {
    if (this.empresas.length == 1) {
      this.searchForm.controls.empresaForm.setValue([
        this.empresas[0].idEmpresa,
      ]);
      this.empresas.forEach((empresa) => {
        if (empresa.centros.length == 1)
          this.searchForm.controls.centroForm.setValue([
            empresa.centros[0].idCentro,
          ]);
      });
    }
  }

  editPreventiveMeasureModal(preventiveMeasure): void {
    const editMode = preventiveMeasure?.id !== undefined;
    let auxPreventiveMeasure = preventiveMeasure;
    if (editMode) {
      this.spinner.show();
      // Peticion para recuperar los datos de la medida preventiva (todos) (Y tenerlos actualizados)
      this.preventiveMeasureScheduleService
        .getById(preventiveMeasure?.id)
        .subscribe((res) => {
          auxPreventiveMeasure = res;
          this.spinner.hide();
          this.openPreventiveMeasureModal(auxPreventiveMeasure);
        });
    }
  }

  openPreventiveMeasureModal(preventiveMeasure): void {
    const editMode = preventiveMeasure?.id !== undefined;
    const dialogRef = this.dialog.open(PreventiveMeasureModalComponent, {
      hasBackdrop: true,
      disableClose: true,
      width: "50%",
      maxHeight: "700px",
      data: {
        preventiveMeasure,
        empresas: this.empresas,
      },
    });

    const instance = dialogRef.componentInstance;
    instance.editMode = editMode;
    const title =
      editMode === false
        ? "PLANIFICACION_PRL.NUEVA_MEDIDA_PREVENTIVA"
        : "PLANIFICACION_PRL.EDITAR_MEDIDA_PREVENTIVA";
    this.translate.get(title).subscribe((res: string) => {
      instance.title = res;
    });
    instance.priorities = this.priorityList;
    instance.origins = this.originList.map((origin) => {
      return {
        ...origin.value,
      };
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((result) => result !== undefined),
        first()
      )
      .subscribe((result) => {
        this.savePreventiveMeasure(result.value, editMode);
      });
  }

  openPreventiveMeasureModalMasiva(): void {
    const dialogRef = this.dialog.open(PreventiveMeasureModalExcelComponent, {
      hasBackdrop: true,
      disableClose: true,
      width: "50%",
      maxHeight: "700px",
      data: {
        empresas: this.empresas,
        showErrorMessage: this.showErrorMessage,
        showSuccessMessage: this.showSuccessMessage,
      },
    });
    const instance = dialogRef.componentInstance;
    instance.title = this.translate.instant(
      "PLANIFICACION_PRL.NUEVA_MEDIDA_MASIVA"
    );

    dialogRef
      .afterClosed()
      .pipe(first())
      .subscribe(() => this.searchMeasures());
  }

  openGeneratePreventivePlanningModal() {
    if (!this.isCurrentPlanning && !this.getSchedulingId()) {
      const title = this.translate.instant("PLANIFICACION_PRL.HISTORICAL_SCHEDULINGS.NO_SCHEDULINGS_TO_SELECT");
      this.utils.mostrarMensajeSwalFire("error", title, "", "var(--blue)", false);
      return;
    }
    if (
      !this.searchForm.get("empresaForm").value ||
      !this.searchForm.get("centroForm").value
    ) {
      const title = this.translate.instant("MEASURE.GENERATE_PLANNING.ERROR");
      this.utils.mostrarMensajeSwalFire("error", title, "", "var(--blue)", false);
      return;
    }

    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "40%";
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = false;
    dialogConfig.data = {};

    const dialogRef = this.dialog.open(
      GeneratePreventivePlanningModalComponent,
      {
        width: "50%",
        maxHeight: "700px",
      }
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        this.generatePreventivePlanning(result);
      }
    });
  }

  private getSchedulingId() {
    let schedulingId = null;
    if (this.searchForm.get("schedulingsForm").value) {
      schedulingId = this.searchForm.get("schedulingsForm").value.id;
    }
    return schedulingId;
  }

  generatePreventivePlanning(withAttached) {
    this.spinner.show();
    if (withAttached) {
      this.preventiveMeasureScheduleService
        .getPreventiveMeasureSchedulePdfAndAttachmentsZip(
          this.getSchedulingId(),
          this.searchForm.get("centroForm").value
        ).subscribe(
          (res) => {
            const url = window.URL.createObjectURL(res);
            const a = document.createElement("a");
            a.href = url;
            a.download = "PlanificacionPRLConAdjuntos.zip";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            this.showReportGenerationResult(true);
          },
          () => this.showReportGenerationResult(false)
        );
    } else {
      this.createPreventiveMeasureSchedulePDF();
    }
  }

  private createPreventiveMeasureSchedulePDF() {
    this.preventiveMeasureScheduleService
      .getPreventiveMeasureSchedulePDF(
        this.getSchedulingId(),
        this.searchForm.get("centroForm").value
      ).subscribe(
        (res) => {
          const url = window.URL.createObjectURL(res);
          const a = document.createElement("a");
          a.href = url;
          a.download = "PlanificacionPRL.pdf";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          this.showReportGenerationResult(true);
        },
        () => this.showReportGenerationResult(false)
      );
  }

  private showReportGenerationResult(wasOk) {
    if (wasOk) {
      this.spinner.hide();
      this.showSuccessMessage(
        this.translate.instant("MEASURE.GENERATE_PLANNING.SUCCESS")
      );
    } else {
      this.spinner.hide();
      this.showErrorMessage(
        this.translate.instant("MEASURE.GENERATE_PLANNING.ERROR")
      );
    }
  }

  openPreventiveMeasureModalExcelError(data): void {
    const dialogRef = this.dialog.open(
      PreventiveMeasureExcelErrorModalComponent,
      {
        hasBackdrop: true,
        disableClose: true,
        width: "50%",
        maxHeight: "750px",
        data: data,
      }
    );
    const instance = dialogRef.componentInstance;
    const title =
      "PLANIFICACION_PRL.ERROR_IMPORTACION_EXCEL_MEDIDAS_PREVENTIVAS";
    this.translate.get(title).subscribe((res: string) => {
      instance.title = res;
    });
  }

  savePreventiveMeasure(form, editMode: boolean) {
    let successMessage =
      editMode === false
        ? "PLANIFICACION_PRL.MSG_EXITO.MEDIDA_PREVENTIVA_CREADA"
        : "PLANIFICACION_PRL.MSG_EXITO.MEDIDA_PREVENTIVA_EDITADA";
    successMessage = this.translate.instant(successMessage);
    let errorMessage = this.translate.instant(
      "PLANIFICACION_PRL.ERRORES.VUELVA_A_INTENTAR"
    );
    const preventiveMeasureScheduleParsed = {
      id: form.id,
      preventiveMeasure: form.preventiveMeasure,
      origin: form.origin,
      location: form.location,
      responsible: form.responsible,
      cost: form.cost,
      cause: form.cause,
      observations: form.observations,
      executionDate: this.getUTCDate(form.executionDate),
      scheduledDate: this.getUTCDate(form.scheduledDate),
      priority: form.priority,
      startDate: this.getUTCDate(form.startDate),
    };
    let centerId = form.centroForm;

    this.spinner.show();
    this.preventiveMeasureScheduleService
      .savePreventiveMeasureSchedule(preventiveMeasureScheduleParsed, centerId)
      .pipe(first())
      .subscribe(
        (data) => {
          this.spinner.hide();
          this.showSuccessMessage(successMessage).then(() => {
            this.searchMeasures();
          });
        },
        (error) => {
          this.spinner.hide();
          this.showErrorMessage(errorMessage);
        }
      );
  }

  getUTCDate(paramDate) {
    return new Date(moment(paramDate).format("YYYY-MM-DDTHH:mm:ss[Z]"));
  }

  showSuccessMessage(message) {
    return Swal.fire({
      icon: "success",
      title: message,
      confirmButtonColor: "var(--blue)",
      allowOutsideClick: true,
    });
  }

  showErrorMessage(message) {
    return Swal.fire({
      icon: "error",
      title: message,
      confirmButtonColor: "var(--blue)",
      allowOutsideClick: false,
    });
  }

  getColorStatus(element): string {
    return element?.color || red_color;
  }

  openDeleteModal(preventiveMeasure): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "40%";
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = false;
    dialogConfig.data = {};

    const dialogRef = this.dialog.open(DeleteModalComponent, {
      width: "50%",
      maxHeight: "700px",
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) this.deleteMeasure(preventiveMeasure.id);
    });
  }

  deleteMeasure(id) {
    let successMessage;
    this.translate
      .get("PLANIFICACION_PRL.DELETE_MODAL.SUCCESS_MESSAGE")
      .subscribe((res: string) => {
        successMessage = res;
      });
    let errorMessage;
    this.translate
      .get("PLANIFICACION_PRL.DELETE_MODAL.ERROR_MESSAGE")
      .subscribe((res: string) => {
        errorMessage = res;
      });
    this.spinner.show();
    this.preventiveMeasureScheduleService.deleteMeasure(id).subscribe(
      (data) => {
        this.spinner.hide();
        this.showSuccessMessage(successMessage).then(() => {
          this.searchMeasures();
        });
      },
      (error) => {
        this.spinner.hide();
        console.error(error);
        this.showErrorMessage(errorMessage);
      }
    );
  }

  isNotTechnicalMeasure(preventiveMeasure) {
    return preventiveMeasure?.type === this.OWN_CREATION;
  }

  massiveAssignment() {
    const measuresSelected = this.dataSourceMeasures.filteredData.filter(
      (item: any) => item.checked
    );

    if (measuresSelected.length === 0) return;

    this.showAssignPreventiveMeasureModal(measuresSelected);
  }

  showAssignPreventiveMeasureModal(measures) {
    const client = this.empresas.find(
      (client) => client.idEmpresa === this.searchForm.value.empresaForm
    );
    const center = client.centros.find(
      (center) => center.idCentro === this.searchForm.value.centroForm
    );

    const emailFields = this.getAssignEmailFields();

    // Add name field to the selected measures
    measures.forEach((measure) => {
      measure.name = measure.preventiveMeasure;
    });

    const modal = this.dialog.open(EmailingModalComponent, {
      disableClose: true,
      hasBackdrop: true,
      width: "50%",
      maxHeight: "700px",
      data: {
        dataToEmail: measures,
        emailFields: emailFields,
        client: client,
        center: center,
      },
    });

    const instance = modal.componentInstance;
    const title = this.translate
      .get("PLANIFICACION_PRL.ASSIGN_MODAL.TITLE")
      .subscribe((res: string) => {
        instance.title = res;
      });

    const attachmentsTitle = this.translate
      .get("PLANIFICACION_PRL.ASSIGN_MODAL.MULTIPLE_PREVENTIVE_MEASURE")
      .subscribe((res: string) => {
        instance.attachmentsTitle = res;
      });
    modal.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        this.assignMeasures(result);
      }
    });
  }

  assignMeasures(data) {
    this.spinner.show();

    const successMessage = this.translate.instant(
      "PLANIFICACION_PRL.ASSIGN_MODAL.SUCCESS"
    );
    const errorMessage = this.translate.instant(
      "PLANIFICACION_PRL.ASSIGN_MODAL.ERROR"
    );

    this.preventiveMeasureScheduleService
      .assignPreventiveMeasure(data.emailData, data.client, data.center)
      .pipe(first())
      .subscribe(
        () => {
          this.spinner.hide();
          this.showSuccessMessage(successMessage).then(() => {
            this.searchMeasures();
          });
        },
        (error) => {
          this.spinner.hide();
          console.error(error);
          this.showErrorMessage(errorMessage);
        }
      );
  }

  getAssignEmailFields() {
    return [
      new EmailFields(EMAIL_FIELDS.EMAIL_FIELDS_CODE.TO, true),
      new EmailFields(EMAIL_FIELDS.EMAIL_FIELDS_CODE.CC, false),
      new EmailFields(EMAIL_FIELDS.EMAIL_FIELDS_CODE.CCO, false),
      new EmailFields(EMAIL_FIELDS.EMAIL_FIELDS_CODE.OBSERVATIONS, false),
    ];
  }

  showPreventiveMeasureDetailModal(element) {
    this.spinner.show();
    this.preventiveMeasureScheduleService.getById(element?.id).subscribe(
      (data) => {
        this.spinner.hide();
        const dialogRef = this.dialog.open(
          PreventiveMeasureDetailModalComponent,
          {
            width: "50%",
            maxHeight: "700px",
            data: {
              preventiveMeasure: data,
            },
          }
        );
      },
      (error) => {
        this.spinner.hide();
        console.error(error);
      }
    );
  }

  checkAllRows(event) {
    if (![undefined, null].includes(this.dataSourceMeasures)) {
      this.dataSourceMeasures.data.forEach((data) => {
        data.checked = event.checked;
        if (event.checked) {
          this.measuresChecked.push(data);
        } else {
          this.measuresChecked.splice(this.measuresChecked.indexOf(data), 1);
        }
      });
    }
  }

  checkRow(element) {
    if (element.checked) {
      this.measuresChecked.push(element);
    } else {
      this.measuresChecked.splice(this.measuresChecked.indexOf(element), 1);
    }
  }

  sharePlannificationMasive(): void {
    const client = this.searchForm.value.empresaForm;
    const center = this.searchForm.value.centroForm;

    if (
      [undefined, null, ""].includes(client) ||
      [undefined, null, ""].includes(center)
    ) {
      this.showErrorMessage(this.translate.instant("PLANIFICACION_PRL.SHARE_MODAL.ERROR_CLIENT_CENTER"));
      return;
    }

    if (!this.isCurrentPlanning && !this.getSchedulingId()) {
      this.showErrorMessage(this.translate.instant("PLANIFICACION_PRL.HISTORICAL_SCHEDULINGS.NO_SCHEDULINGS_TO_SELECT"));
      return;
    }

    this.openSharePlannificationModal();
  }

  openSharePlannificationModal(): void {
    const emailFields: EmailFields[] = [
      new EmailFields(EMAIL_FIELDS.EMAIL_FIELDS_CODE.TO, true),
      new EmailFields(EMAIL_FIELDS.EMAIL_FIELDS_CODE.SUBJECT, true),
      new EmailFields(EMAIL_FIELDS.EMAIL_FIELDS_CODE.OBSERVATIONS, false),
    ];
    const client = this.searchForm.value.empresaForm;
    const center = this.searchForm.value.centroForm;
    const dataToEmail = [];

    if (this.searchForm.value.schedulingsForm) {
      const schedulingData = {
        id: this.searchForm.value.schedulingsForm.id,
      };
      dataToEmail.push(schedulingData);
    }

    const modal = this.dialog.open(EmailingModalComponent, {
      disableClose: true,
      hasBackdrop: true,
      width: "50%",
      maxHeight: "700px",
      data: {
        dataToEmail,
        emailFields,
        client,
        center,
      },
    });

    const instance = modal.componentInstance;

    instance.hideDataToEmail = true;
    instance.title = this.translate.instant(
      "PLANIFICACION_PRL.SHARE_MODAL.TITLE"
    );

    modal
      .afterClosed()
      .pipe(
        first(),
        filter((result) => !!result),
        tap(() => this.spinner.show()),
        switchMap(({ emailData, client, center }) =>
          this.preventiveMeasureScheduleService.sharePreventiveMeasure(
            emailData,
            client,
            center
          )
        )
      )
      .subscribe(
        () => {
          this.spinner.hide();
          this.showSuccessMessage(
            this.translate.instant(
              "PLANIFICATION_PRL.SHARE_PLANIFICATION_MODAL.SUCCESS"
            )
          );
        },
        (error) => {
          this.spinner.hide();
          console.error(error);
          this.showErrorMessage(
            this.translate.instant(
              "PLANIFICATION_PRL.SHARE_PLANIFICATION_MODAL.ERROR"
            )
          );
        }
      );
  }

  setFormWatchers() {
    // watcher CentroForm
    this.searchForm
      .get("centroForm")
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((centerId) => {
        this.clearSchedulingsSelectionAndOptions();
        const auxCentroValue = centerId != "" ? centerId : null;
        if (!this.isCurrentPlanning && this.searchForm && !!auxCentroValue) {
          this.loadSchedulings(auxCentroValue);
        }
      });
    // watcher CentroForm
    this.searchForm
      .get("empresaForm")
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.clearSchedulingsSelectionAndOptions();
      });
  }

  clearSchedulingsSelectionAndOptions() {
    this.scheduleList = [];
    this.searchForm.controls["schedulingsForm"].setValue(undefined);
  }
  openPreventiveMeasureDocsModal(preventiveMeasure): void {
    const dialogRef = this.dialog.open(PreventiveMeasureDocsModalComponent, {
      hasBackdrop: true,
      disableClose: true,
      width: "50%",
      maxHeight: "700px",
      data: {
        preventiveMeasure,
        showSuccessMessage: this.showSuccessMessage,
        showErrorMessage: this.showErrorMessage,
      },
    });
    dialogRef.afterClosed().subscribe(() => {
      this.searchMeasures(this.pageIndex);
    });

    // Traductions
    let successMessage;
    this.translate
      .get("PLANIFICACION_PRL.GOAL_DOCS.SUCCESS_MESSAGE")
      .subscribe((res: string) => {
        successMessage = res;
      });
    let errorMessage;
    this.translate
      .get("PLANIFICACION_PRL.GOAL_DOCS.ERROR_MESSAGE")
      .subscribe((res: string) => {
        errorMessage = res;
      });
    const instance = dialogRef.componentInstance;
    this.translate
      .get("PLANIFICACION_PRL.GOAL_DOCS.TITLE")
      .subscribe((res: string) => {
        instance.title = res;
      });
  }

  loadSchedulings(centerId) {
    this.schedulingsService.getSchedulings(centerId).subscribe((data) => {
      if (!data.length) {
        this.showErrorMessage(
          this.translate.instant(
            "PLANIFICACION_PRL.HISTORICAL_SCHEDULINGS.NO_SCHEDULINGS_TO_SELECT"
          )
        );
        return;
      }

      this.scheduleList = data.map((schedule) => ({
        value: schedule,
        viewValue: schedule.name,
      }));

      this.searchForm.controls["schedulingsForm"].setValue(
        this.scheduleList[0].value
      );
    });
  }

  showEditMassivePreventiveMeasureModal() {
    const listPreventiveMeasureId = this.dataSourceMeasures.filteredData
      .filter((prevMeasure) => prevMeasure.checked)
      .map((prevMeasure) => prevMeasure.id);

    if (listPreventiveMeasureId.length === 0) {
      let titulo = this.translate.instant("ERROR_SELECCIONA_EDITAR");
      this.messageService.showErrorMessage_i18n(titulo);
    } else {
      const modal = this.dialog.open(PreventiveMeasureMassiveModalComponent, {
        disableClose: true,
        hasBackdrop: true,
        width: "50%",
        maxHeight: "700px",
      });

      const instance = modal.componentInstance;
      instance.title = this.translate.instant(
        "PLANIFICACION_PRL.MASSIVE_EDIT_MODAL.TITLE"
      );

      modal
        .afterClosed()
        .pipe(first())
        .subscribe((resultForm) => {
          if (resultForm !== undefined) {
            this.massiveEdit(listPreventiveMeasureId, resultForm);
          }
        });
    }
  }

  massiveEdit(listPreventiveMeasureId, resultForm) {
    const preventiveMeasureMassiveDto = {
      ...resultForm.value,
      executionDate: resultForm.value.executionDate ? this.getUTCDate(resultForm.value.executionDate) : null,
      scheduledDate: resultForm.value.scheduledDate ? this.getUTCDate(resultForm.value.scheduledDate) : null,
      startDate: resultForm.value.startDate ? this.getUTCDate(resultForm.value.startDate) : null,
      listPreventiveMeasureId
    }

    this.spinner.show();
    this.preventiveMeasureScheduleService.savePreventiveMeasureMassive(preventiveMeasureMassiveDto)
      .subscribe((result) => {
        this.spinner.hide();
        this.messageService.showSuccessMessage_i18n("PLANIFICACION_PRL.MASSIVE_EDIT_MODAL.SUCCESS")
        this.searchMeasures();
      },
      (error) => {
        this.spinner.hide();
        this.messageService.showErrorMessage_i18n("PLANIFICACION_PRL.MASSIVE_EDIT_MODAL.ERROR")
      });
  }

  exportToExcel() {
    const clientId = this.searchForm.get("empresaForm").value;
    const centerId = this.searchForm.get("centroForm").value;
    const preventiveMeasuresToExport = this.measuresChecked.map(
      (preventiveMeasure) => preventiveMeasure.id
    );

    if (preventiveMeasuresToExport.length === 0) {
      this.messageService.showErrorMessage_i18n("ERROR_SELECCIONA_EXPORTAR");
    } else {
      this.spinner.show();
      this.preventiveMeasureScheduleService
        .exportToExcel(preventiveMeasuresToExport)
        .pipe(first())
        .subscribe((excelBlob) => {
          this.spinner.hide();
          this.fileUtils.downloadFileFromBlob(
            excelBlob,
            `${clientId}_${centerId}_medidas_preventivas.xlsx`
          );
        });
    }
  }
}
