import { ValidatorUtils } from "./../../../services/validator-utils.service";
import { Component, OnInit, ViewChild } from "@angular/core";
import { ChangeDetectorRef } from "@angular/core";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from "@angular/material/core";
import { TranslateService } from "@ngx-translate/core";
import { filter, first } from "rxjs/operators";
import { environment } from "../../../../environments/environment";
import { UserService } from "src/app/services/user.service";
import { GoalsService } from "src/app/services/goals.service";

import { UtilsService } from "src/app/services/utils.service";
import { NgxSpinnerService } from "ngx-spinner";
import { MatPaginator } from "@angular/material/paginator";
import { MatSelect } from "@angular/material/select";
import { MatOption } from "@angular/material/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
// import { PdfView } from "src/app/modales/pdfView/pdfView.component";
import Swal from "sweetalert2";
import { Globals } from "../../globals";

import * as _moment from "moment";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { MY_FORMATS } from "../../../../config/config";
import { Router } from "@angular/router";
import { ConfirmationModal } from "src/app/Model/ConfirmationModal";
import { AptitudeReportService } from "../../../services/aptitude-report.service";
import { GoalModalComponent } from "./components/goal-modal/goal-modal.component";
import { DeleteModalComponent } from "../components/delete-modal/delete-modal.component";
import { GoalDocsModalComponent } from "./components/goal-docs-modal/goal-docs-modal.component";
import { GoalDetailModalComponent } from "./components/goal-detail-modal/goal-detail-modal.component";
import { EmailingModalComponent } from "../components/emailing-modal/emailing-modal.component";
import { EmailFields, EMAIL_FIELDS } from "../models/EmailDTO";
import { Subject } from "rxjs";
import { FileUtils } from "src/app/services/file-utils.service";

const moment = _moment;
const red_color = "#F01F1F";

/* Mock Data */
export interface goal {
  id: number;
  name: string;
  expectedDate: Date;
  executionDate: Date;
  client: any;
  center: any;
  documentList: goalDoc[];
  status: any;
  checked: boolean;
}

export interface goalDoc {
  id: number;
  goal: any;
  fileName: string;
  fileType: string;
  filePath: string;

  //
}

@Component({
  selector: "app-objetivos-prl",
  templateUrl: "./objetivos-prl.component.html",
  styleUrls: ["./objetivos-prl.component.css"],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class ObjetivosPrlComponent implements OnInit {
  // Variables
  GOAL_STATUS_SUCCESS = 1;
  GOAL_STATUS_PENDING = 2;
  GOAL_STATUS_DELAYED = 3;
  ALL = "ALL";

  environment = environment;
  cleanImgUrl = "../../../assets/img/borrar_filtros.svg";
  searchImgUrl = "../../../assets/img/search.svg";
  excelImgUrl = "../../../assets/img/excel.svg";
  pdfImgUrl = "../../../assets/img/pdf-2.png";
  mailImgUrl = "../../../assets/img/mail.svg";
  downloadImgUrl = "../../../assets/img/download.svg";
  eyeImgUrl = "../../../assets/img/eye.svg";
  previewImgUrl = "../../../assets/img/preview-doc.svg";
  imgPerfil = "../../../assets/img/user.svg";
  downloadForOfflineImgUrl = "../../../assets/img/download_for_offline.svg";
  goal: goal;
  resultGoals: goal[] = []; //To save resultGoals and reset paginatorT
  showTable = false;

  // Table Goals
  dataSourceGoals = new MatTableDataSource<goal>();
  displayedColumns: string[] = [
    "checklist",
    "status",
    "clientCenter",
    "name",
    "expectedDate",
    "executionDate",
    "actions",
  ];
  statusList = [
    {
      value: this.GOAL_STATUS_SUCCESS,
      viewValue: "PLANIFICACION_PRL.GOAL_SUCCESS",
    },
    {
      value: this.GOAL_STATUS_PENDING,
      viewValue: "PLANIFICACION_PRL.GOAL_PENDING",
    },
    {
      value: this.GOAL_STATUS_DELAYED,
      viewValue: "PLANIFICACION_PRL.GOAL_DELAYED",
    },
  ];
  idTrabajador: number;
  puestoPrincipalSeleccionado: number;
  tipoPuestoSeleccionado: String;
  modificarPuesto: boolean = false;
  showTrabajadorDetails: boolean = false;
  aprobDocDataDto: any;

  isLoginSimulado: boolean = false;

  maxDate: Date;
  minDate: Date;
  minCreatedDate: Date;
  minExecutionDate: Date;
  minExpectedDate: Date;

  //NOTA IMPORTANTE: Por petición de PREVING, en Personas Trabajadoras (tb en citación) y Contratos, la fecha desde es de 2001
  nYearsAgo = new Date(this.globals.extranet_fecha_mas_antigua); //("2001-01-01 00:00:00")Año,Mes,Día,Hora,Minutos,Segundos)

  showCreateGoal: boolean = false;
  showEditGoal: boolean = false;
  // verResultado: boolean = false;
  editGoalForm: FormGroup;

  // idiomasList: Idioma[];
  // empresaSeleccionada: String = '';
  // centroSeleccionado: String = '';

  // Modal Conf
  showModal: Boolean = false;
  ModalConfigurationObj: ConfirmationModal = {
    title: "MODALS.CONFIRMATION_MODAL.APPOINTMENT_DISABLE",
    text: "",
    showCancelButton: false,
    icon: "warning",
    modalSize: "",
  };

  // Table GoalDocs
  dataSourceGoalDoc = new MatTableDataSource<goalDoc>();
  tableHeadersGoalDoc: string[] = ["id", "name", "actions"];

  empresas: any[];
  searchForm: FormGroup;
  // Search Workers
  trabajadorSeleccionado: any;
  searchTrabajadoresForm: FormGroup;
  trabajadoresBuscados: any;

  // busqueda: any;

  reactivar: boolean = false;
  workerData: any;

  private destroy$ = new Subject();

  @ViewChild("statusSelect") statusSelect: MatSelect;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private goalsService: GoalsService,
    public utils: UtilsService,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
    public globals: Globals,
    private modalRgpd: MatDialog,
    public translate: TranslateService,
    private cdRef: ChangeDetectorRef,
    private router: Router,
    private aptitudeReportService: AptitudeReportService,
    private validatorUtils: ValidatorUtils,
    private fileUtils: FileUtils
  ) {}

  //validators
  validNameSurname = this.globals.workerPattern;
  validNifNie = this.globals.nifNiePattern;

  //#region Angular LifeCycle
  //Evita que se produzca el ERROR Error: ExpressionChangedAfterItHasBeenCheckedError
  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    //En el caso de que se esté realizando un loginSimulado, no tendrá que guardarse
    let loginSimulado = localStorage.getItem("loginSimulado");
    if (loginSimulado !== null && loginSimulado === "true")
      this.isLoginSimulado = true;

    // DataSource init
    this.dataSourceGoals = new MatTableDataSource();
    // To order with no case sensitive
    this.dataSourceGoals.sortingDataAccessor = (
      data: any,
      sortHeaderId: string
    ): string => {
      if (typeof data[sortHeaderId] === "string") {
        return data[sortHeaderId].toLocaleLowerCase();
      }

      return data[sortHeaderId];
    };

    this.initForm();
    this.getUserData();
  }
  //#endregion

  getUserData(): void {
    this.spinner.show();
    this.userService.getUser().subscribe((user) => {
      this.empresas = user.empresas;
      this.updateEmpresasYCentros();
      this.spinner.hide();
    });
  }

  openGoalModal(element): void {
    const editMode = element?.id !== undefined;
    const dialogRef = this.dialog.open(GoalModalComponent, {
      hasBackdrop: true,
      disableClose: true,
      width: "50%",
      maxHeight: "700px",
      data: {
        goal: element,
        empresas: this.empresas,
        showErrorMessage: this.showErrorMessage,
        showSuccessMessage: this.showSuccessMessage,
        getUTCDate: this.getUTCDate,
        getClientById: this.getClientById,
        getCenterById: this.getCenterById,
        editMode,
      },
    });
    const instance = dialogRef.componentInstance;
    const title =
      editMode === false
        ? "PLANIFICACION_PRL.NUEVO_OBJETIVO"
        : "PLANIFICACION_PRL.EDITAR_OBJETIVO";
    this.translate.get(title).subscribe((res: string) => {
      instance.title = res;
    });

    dialogRef
      .afterClosed()
      .pipe(
        first(),
        filter(
          (resp) => ![undefined, null, ""].includes(resp) && resp.reloadItems
        )
      )
      .subscribe(() => {
        this.searchGoals();
      });
  }

  showGoalDetailModal(element): void {
    const dialogRef = this.dialog.open(GoalDetailModalComponent, {
      width: "50%",
      maxHeight: "700px",
      data: {
        goal: element,
      },
    });
  }

  /**
   * Save goal
   * @param form
   * @param editMode
   */

  saveGoal(form, editMode: boolean) {
    let successMessage =
      editMode === false
        ? "PLANIFICACION_PRL.MSG_EXITO.OBJETIVO_CREADO"
        : "PLANIFICACION_PRL.MSG_EXITO.OBJETIVO_EDITADO";
    this.translate.get(successMessage).subscribe((res: string) => {
      successMessage = res;
    });
    let errorMessage;
    this.translate
      .get("PLANIFICACION_PRL.ERRORES.VUELVA_A_INTENTAR")
      .subscribe((res: string) => {
        errorMessage = res;
      });
    const goalParsed = {
      id: form.id,
      name: form.goalName,
      expectedDate: this.getUTCDate(form.expectedDate),
      executionDate: this.getUTCDate(form.executionDate),
      observations: form.observations,
      client: this.getClientById(form.empresaForm),
      center: this.getCenterById(form.empresaForm, form.centroForm),
    };

    this.spinner.show();
    this.goalsService.saveGoal(goalParsed).subscribe(
      (data) => {
        this.spinner.hide();
        this.showSuccessMessage(successMessage).then(() => {
          this.searchGoals();
        });
      },
      (error) => {
        this.spinner.hide();
        this.showErrorMessage(errorMessage);
      }
    );
  }

  getClientById(id) {
    return this.empresas.find((empresa) => empresa.idEmpresa === id);
  }

  getCenterById(clientId, centerid) {
    const client = this.empresas.find(
      (empresa) => empresa.idEmpresa === clientId
    );
    return client.centros.find((centro) => centro.idCentro === centerid);
  }

  getUTCDate(paramDate) {
    return new Date(moment(paramDate).format("YYYY-MM-DDTHH:mm:ss[Z]"));
  }

  /**
   * Select all status
   */
  statusToggleAllSelection() {
    this.statusSelect.options.forEach((item: MatOption) => {
      if (this.searchForm.controls.estadoForm.value.includes(this.ALL)) {
        item.select();
      } else {
        item.deselect();
      }
    });
  }

  /**
   * Check if all status are selected
   */
  statusOptionClick() {
    let isAllSelected = true;
    this.statusSelect.options.forEach((item: MatOption) => {
      if (!item.selected && item.value != this.ALL) {
        isAllSelected = false;
      }
    });
    if (isAllSelected) {
      this.searchForm.controls.estadoForm.setValue([
        ...this.searchForm.controls.estadoForm.value,
        this.ALL,
      ]);
    } else {
      this.searchForm.controls.estadoForm.setValue(
        this.statusSelect.value.filter((value) => value != this.ALL)
      );
    }
  }

  //#region Form Functions
  initForm() {
    this.searchForm = this.formBuilder.group({
      empresaForm: new FormControl("", [Validators.required]),
      centroForm: new FormControl("", [Validators.required]),
      objetivoForm: new FormControl(""),
      estadoForm: new FormControl([
        this.GOAL_STATUS_PENDING,
        this.GOAL_STATUS_DELAYED,
      ]),
      expectedDateIniForm: new FormControl(null),
      expectedDateEndForm: new FormControl(null),
      executionDateIniForm: new FormControl(null),
      executionDateEndForm: new FormControl(null),
      createdDateIniForm: new FormControl(null),
      createdDateEndForm: new FormControl(null),
    });
    this.setDefaultForm();
  }

  resetForm(): void {
    setTimeout(() => {
      this.initForm();
      this.updateEmpresasYCentros();
    });
  }

  setDefaultForm(): void {
    var now = new Date();
    now.setHours(23, 59, 59);
    this.maxDate = now;
    /*nYearsAgo.setDate(nYearsAgo.getDate() - (365 * this.globals.extranet_intervalo_fechas_filtro));
    nYearsAgo.setHours(0, 0, 0);*/
    this.minDate = this.nYearsAgo;
    this.minExecutionDate = this.nYearsAgo;
    this.minCreatedDate = this.nYearsAgo;
    this.minExpectedDate = this.nYearsAgo;
  }

  //#endregion Form Functions

  //#region Table Functions
  searchGoals(): void {
    if (!this.searchForm.valid) {
      this.searchForm.get("empresaForm").markAsTouched();
    } else {
      this.spinner.show();
      const searchFilter = this.createSearchFilter();
      const statusIds =
        this.searchForm.get("estadoForm").value.length > 0
          ? this.searchForm
              .get("estadoForm")
              .value.filter((value) => value != this.ALL)
          : this.statusList.map((status) => status.value);
      this.goalsService
        .getFilteredGoals(
          searchFilter,
          this.searchForm.get("empresaForm").value,
          statusIds
        )
        .subscribe((response) => {
          this.dataSourceGoals = new MatTableDataSource(response);
          this.dataSourceGoals.paginator = this.paginator;
          this.dataSourceGoals.sort = this.sort;
          this.showTable = true;
          this.spinner.hide();
        })
        .add(() => {
          // when the request ends
          this.spinner.hide();
        });
    }
  }

  createSearchFilter(): string {
    let filter = "";

    // Creation Date
    if (this.searchForm.get("createdDateIniForm").value != null) {
      let createdDateIni = this.getLastHourToDateBefore(
        this.searchForm.get("createdDateIniForm").value
      );
      filter = filter + "created>" + createdDateIni + ",";
    }

    if (this.searchForm.get("createdDateEndForm").value != null) {
      let createdDateEnd = this.getFirstHourToDateAfter(
        this.searchForm.get("createdDateEndForm").value
      );
      filter = filter + "created<" + createdDateEnd + ",";
    }

    // Expected Date
    if (this.searchForm.get("expectedDateIniForm").value != null) {
      let expectedDateIni = this.getLastHourToDateBefore(
        this.searchForm.get("expectedDateIniForm").value
      );
      filter = filter + "expectedDate>" + expectedDateIni + ",";
    }
    if (this.searchForm.get("expectedDateEndForm").value != null) {
      let expectedDateEnd = this.getFirstHourToDateAfter(
        this.searchForm.get("expectedDateEndForm").value
      );
      filter = filter + "expectedDate<" + expectedDateEnd + ",";
    }

    // Execution Date
    if (this.searchForm.get("executionDateIniForm").value != null) {
      let executionDateIni = this.getLastHourToDateBefore(
        this.searchForm.get("executionDateIniForm").value
      );
      filter = filter + "executionDate>" + executionDateIni + ",";
    }
    if (this.searchForm.get("executionDateEndForm").value != null) {
      let executionDateEnd = this.getFirstHourToDateAfter(
        this.searchForm.get("executionDateEndForm").value
      );
      filter = filter + "executionDate<" + executionDateEnd + ",";
    }

    // Goal Name
    if (
      this.searchForm.get("objetivoForm").value != null &&
      this.searchForm.get("objetivoForm").value != ""
    ) {
      let goalName = this.searchForm.get("objetivoForm").value.split(" ");
      goalName.forEach((element) => {
        filter = filter + "name~" + element + ",";
      });
    }

    // Center
    if (
      this.searchForm.get("centroForm").value != null &&
      this.searchForm.get("centroForm").value != ""
    ) {
      let centerIds = this.searchForm.get("centroForm").value;
      centerIds = centerIds.toString().replaceAll(",", ":");
      filter = filter + "centerId¬" + centerIds + ",";
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

  getColorStatus(element): string {
    return element?.color || red_color;
  }

  getI18nLabelStatus(status) {
    if (status?.code) {
      this.translate
        .get(`PLANIFICACION_PRL.GOAL_${status.code}`)
        .subscribe((res: string) => {
          return res;
        });
    } else {
      // Return default value PENDING
      this.translate
        .get("PLANIFICACION_PRL.GOAL_PENDING")
        .subscribe((res: string) => {
          return res;
        });
    }
  }
  //#endregion Search Functions

  updateEmpresasYCentros() {
    if (this.empresas.length == 1) {
      this.searchForm.controls.empresaForm.setValue(this.empresas[0].idEmpresa);
      this.empresas.forEach((empresa) => {
        let auxCentros = empresa.centros.filter(
          (centro) => centro.activo === true
        );
        if (auxCentros.length == 1) {
          this.searchForm.controls.centroForm.setValue([
            auxCentros[0].idCentro,
          ]);
        }
      });
    }
  }

  // #region Delete
  openDeleteGoalModal(goal) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "40%";
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;
    dialogConfig.data = {};

    const dialogRef = this.dialog.open(DeleteModalComponent, {
      hasBackdrop: true,
      disableClose: true,
      width: "40%",
      maxHeight: "700px",
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) this.deleteGoal(goal.id);
    });
  }

  deleteGoal(goalId) {
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
    try {
      this.spinner.show();
      this.goalsService.deleteGoal(goalId).subscribe((res) => {
        this.searchGoals();
        this.spinner.hide();
      });
      this.showSuccessMessage(successMessage);
    } catch (e) {
      this.showErrorMessage(errorMessage);
    }
  }

  // #endregion Delete

  // #region Goal Docs
  openGoalDocsModal(goal): void {
    const dialogRef = this.dialog.open(GoalDocsModalComponent, {
      hasBackdrop: true,
      disableClose: true,
      width: "50%",
      maxHeight: "700px",
      data: {
        goal,
        // showSuccessMessage: this.showSuccessMessage,
        // showErrorMessage: this.showErrorMessage,
      },
    });
    dialogRef.afterClosed().subscribe(() => {
      this.searchGoals();
    });

    // Traductions
    // let successMessage;
    // this.translate
    //   .get("PLANIFICACION_PRL.GOAL_DOCS.SUCCESS_MESSAGE")
    //   .subscribe((res: string) => {
    //     successMessage = res;
    //   });
    // let errorMessage;
    // this.translate
    //   .get("PLANIFICACION_PRL.GOAL_DOCS.ERROR_MESSAGE")
    //   .subscribe((res: string) => {
    //     errorMessage = res;
    //   });
    const instance = dialogRef.componentInstance;
    this.translate
      .get("PLANIFICACION_PRL.GOAL_DOCS.TITLE")
      .subscribe((res: string) => {
        instance.title = res;
      });
  }
  // #endregion Goal Docs

  // #region Export to Excel
  checkAllRows(event) {
    if (this.dataSourceGoals !== undefined && this.dataSourceGoals !== null) {
      this.dataSourceGoals.data.forEach((goal) => {
        goal.checked = event.checked;
      });
    }
  }

  exportToExcel() {
    const clientId = this.searchForm.get("empresaForm").value;
    const centerId = this.searchForm.get("centroForm").value;
    const goalsToExport = this.dataSourceGoals.data
      .filter((goal) => goal.checked)
      .map((goal) => goal.id);

    if (goalsToExport.length === 0) {
      let titulo = this.translate.instant("ERROR_SELECCIONA_EXPORTAR");
      this.utils.mostrarMensajeSwalFire(
        "error",
        titulo,
        "",
        "var(--blue)",
        false
      );
    } else {
      this.spinner.show();
      this.goalsService
        .exportToExcel(goalsToExport)
        .pipe(first())
        .subscribe((excelBlob) => {
          this.spinner.hide();
          this.fileUtils.downloadFileFromBlob(
            excelBlob,
            `${clientId}_${centerId}_objetivos.xlsx`
          );
        });
    }
  }

  exportToPDF() {
    const clientId = this.searchForm.get("empresaForm").value;
    const centerId = this.searchForm.get("centroForm").value;
    const goalsToExport = this.dataSourceGoals.data
      .filter((goal) => goal.checked)
      .map((goal) => goal.id);

    if (goalsToExport.length === 0) {
      let titulo = this.translate.instant("ERROR_SELECCIONA_EXPORTAR");
      this.utils.mostrarMensajeSwalFire(
        "error",
        titulo,
        "",
        "var(--blue)",
        false
      );
    } else {
      this.spinner.show();

      this.goalsService
        .exportToPdf(goalsToExport, clientId, centerId)
        .pipe(first())
        .subscribe((pdfBlob) => {
          this.spinner.hide();
          this.fileUtils.downloadFileFromBlob(
            pdfBlob,
            `${clientId}_${centerId}_objetivos.pdf`
          );
        });
    }
  }

  // #endregion Export to Excel

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

  /**
   * Show modal to share goals by email
   * @param goal optional
   */
  showGoalsEmailModal(goal = null) {
    const goals = goal
      ? [goal]
      : this.dataSourceGoals.data.filter((goal) => goal.checked);

    if (goals.length === 0) {
      const message = this.translate.instant("ERROR_SELECCIONA_COMPARTIR");
      this.showErrorMessage(message);
      return;
    }

    const client = this.empresas.find(
      (client) => client.idEmpresa === this.searchForm.value.empresaForm
    );
    const center = client.centros.find(
      (center) => center.idCentro === this.searchForm.value.centroForm
    );

    const emailFields = this.getShareGoalsEmailFields();

    const modal = this.dialog.open(EmailingModalComponent, {
      disableClose: true,
      hasBackdrop: true,
      width: "50%",
      maxHeight: "700px",
      data: {
        dataToEmail: goals,
        emailFields: emailFields,
        client: client,
        center: center,
      },
    });

    const instance = modal.componentInstance;

    // Modal title
    const title = this.translate.get("COMPARTIR").subscribe((res: string) => {
      instance.title = res;
    });

    // Modal selected elements title
    const attachmentsTitle = this.translate
      .get("PLANIFICACION_PRL.OBJETIVOS.SELECCIONADOS")
      .subscribe((res: string) => {
        instance.attachmentsTitle = res.toLowerCase();
      });

    modal
      .afterClosed()
      .pipe(
        first(),
        filter((result) => result !== undefined)
      )
      .subscribe((result) => {
        this.emailGoals(result);
      });
  }

  /**
   * Send goals by email
   * @param data
   */
  emailGoals(data) {
    this.spinner.show();

    const successMessage = this.translate.instant(
      "PLANIFICACION_PRL.OBJETIVOS.EMAIL.SUCCESS"
    );
    const errorMessage = this.translate.instant(
      "PLANIFICACION_PRL.OBJETIVOS.EMAIL.ERROR"
    );

    this.goalsService
      .emailGoals(data.emailData, data.client, data.center)
      .pipe(first())
      .subscribe(
        () => {
          this.spinner.hide();
          this.showSuccessMessage(successMessage);
        },
        (error) => {
          this.spinner.hide();
          console.error(error);
          this.showErrorMessage(errorMessage);
        }
      );
  }

  /**
   * Create email fields for goals
   * @returns Array<EmailFields>
   */
  getShareGoalsEmailFields() {
    return [
      new EmailFields(EMAIL_FIELDS.EMAIL_FIELDS_CODE.TO, true),
      new EmailFields(EMAIL_FIELDS.EMAIL_FIELDS_CODE.CC, false),
      new EmailFields(EMAIL_FIELDS.EMAIL_FIELDS_CODE.CCO, false),
      new EmailFields(EMAIL_FIELDS.EMAIL_FIELDS_CODE.SUBJECT, false),
      new EmailFields(EMAIL_FIELDS.EMAIL_FIELDS_CODE.OBSERVATIONS, false),
    ];
  }
}
