// Core
import { TranslateService } from "@ngx-translate/core";
import { NgxSpinnerService } from "ngx-spinner";
import { first, filter, tap } from "rxjs/operators";
import * as moment from "moment";

// Angular / Material
import { Component, ViewChild } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";

// Services
import { UserService } from "src/app/services/user.service";
import { JobProcedureService } from "src/app/services/job-procedure.service";
import { MessageService } from "src/app/services/message.service";
import { UtilsService } from "src/app/services/utils.service";

// Components
import { JobProcedureModalComponent } from "src/app/extranet/job-procedures/job-procedure-modal/job-procedure-modal.component";
import { DocsModalComponent } from "src/app/extranet/job-procedures/components/docs-modal/docs-modal.component";
import { ConfirmationMessageModalComponent } from "src/app/shared/confirmation-modal/confirmation-modal.component";

// Utils
import { FileUtils } from "src/app/services/file-utils.service";

// Models
import { FilterDto } from "../models/filter-dto.model";

@Component({
  selector: "app-job-procedure-list",
  templateUrl: "./job-procedure-list.component.html",
  styleUrls: ["./job-procedure-list.component.scss"],
})
export class JobProcedureListComponent {
  desactivateImgUrl = "../../assets/img/Desarchivar.svg";
  activateImgUrl = "../../assets/img/Archivar.svg";
  cleanImgUrl = "../../../assets/img/borrar_filtros.svg";
  showTable: boolean = false;
  searchForm: FormGroup;

  arrowDownImgUrl = "../../../assets/img/arrow_down.svg";
  mailImgUrl = "../../../assets/img/mail.svg";
  downloadImgUrl = "../../../assets/img/download.svg";
  searchImgUrl = "../../../assets/img/search.svg";
  excelImgUrl = "../../../assets/img/excel.svg";
  empresas: any[];

  dataSourceList: MatTableDataSource<any> = new MatTableDataSource<any>();
  totalPages: number = 0;
  pageIndex: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;

  displayedColumns: string[] = [
    "checklist",
    "state",
    "entryDate",
    "title",
    "observations",
    "actions",
  ];
  hideStateLegend: boolean = false;

  allChecked: boolean = false;
  jobProcedureChecked: any[] = [];
  ALL = "ALL";
  defaultState = true;
  maxDate: Date;
  minDate: Date;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private jobProcedureService: JobProcedureService,
    private spinner: NgxSpinnerService,
    private messageService: MessageService,
    public utils: UtilsService,
    public dialog: MatDialog,
    public userService: UserService,
    public translate: TranslateService,
    private formBuilder: FormBuilder,
    private fileUtils: FileUtils
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.userService.getUser().subscribe((user) => {
      this.empresas = user.empresas;
      this.updateEmpresasYCentros();
    });
  }

  search(page = null): void {
    this.spinner.show();

    const newSearch = page === null;
    if (newSearch) {
      page = 0;
      this.paginator.firstPage();
    }
    const filterDto: FilterDto = this.createFilterDto();

    const centerId = this.searchForm.get("centroForm").value;
    const companyId = this.searchForm.get("empresaForm").value;

    this.jobProcedureService
      .getFilteredList(filterDto, companyId, centerId)
      .pipe(
        first(),
        tap(() => this.spinner.hide())
      )
      .subscribe(
        (jobProcedureList) => {
          this.displayedColumns = this.displayedColumns;
          this.hideStateLegend = [true].includes(
            this.searchForm.get("state").value
          );
          this.dataSourceList.data = jobProcedureList.content;
          this.totalPages = jobProcedureList.totalPages;
          this.totalElements = jobProcedureList.totalElements;
          this.showTable = true;
        },
        (error) => {
          console.error(error);
          this.displayedColumns = this.displayedColumns;
          this.hideStateLegend = [true].includes(
            this.searchForm.get("state").value
          );
          const errorMessage = this.translate.instant(
            "PROCEDIMIENTOS_TRABAJO.JOB_PROCEDURE_LIST.ERROR.LIST"
          );
          this.messageService.showErrorMessage(errorMessage);
        }
      );
  }

  createSortList(): any[] {
    if (this.sort.active != null && !!this.sort.direction) {
      return [
        {
          field: this.sort.active === "state" ? "active" : this.sort.active,
          direction: this.sort.direction,
        },
      ];
    }

    return [];
  }

  changePage(event): void {
    this.pageIndex = event.pageIndex;
    this.search(this.pageIndex);
  }

  getColorStatus(status: boolean): string {
    return status ? "green" : "red";
  }

  toggleCheckAllRows({ checked }): void {
    if (this.dataSourceList.data.length === 0) return;

    this.dataSourceList.data.forEach((row) => (row.checked = checked));
    this.allChecked = checked;

    if (!checked) this.jobProcedureChecked = [];
  }

  checkRow(element): void {
    if (element.checked) {
      this.jobProcedureChecked.push(element);
    } else {
      this.jobProcedureChecked = this.jobProcedureChecked.filter(
        (jobProcedureChecked) => jobProcedureChecked.id !== element.id
      );
    }

    this.allChecked = this.jobProcedureChecked.length === this.paginator.length;
  }

  getDevelopmentOrientationPdf(): void {
    this.spinner.show();

    this.jobProcedureService
      .getDevelopmentOrientationPdf()
      .pipe(
        first(),
        tap(() => this.spinner.hide())
      )
      .subscribe(
        (response) => {
          const blob = new Blob([response], { type: "application/pdf" });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download =
            "Orientación al desarrollo de procedimientos de trabajo.pdf";
          link.click();
          link.remove();
        },
        (error) => {
          console.error(error);
          const errorMessage = this.translate.instant(
            "PROCEDIMIENTOS_TRABAJO.JOB_PROCEDURE_LIST.ERROR.PDF"
          );
          this.messageService.showErrorMessage(errorMessage);
        }
      );
  }

  private createFilterDto(): FilterDto {
    return {
      search: this.createSearchFilter(),
      page: this.pageIndex,
      pageSize: this.paginator.pageSize,
      sortList: this.createSortList(),
    };
  }

  createSearchFilter(): string {
    let filter = "";

    // procedimiento de trabajo
    if (
      this.searchForm.get("procedimientoTrabajoForm").value != null &&
      this.searchForm.get("procedimientoTrabajoForm").value != ""
    ) {
      let measure = this.searchForm
        .get("procedimientoTrabajoForm")
        .value.split(" ");
      measure.forEach((element) => {
        filter =
          filter + "title~" + element + ",'" + "observations~" + element + ",";
      });
    }

    // Status
    if (
      this.searchForm.get("state").value != null &&
      this.searchForm.get("state").value != this.ALL
    ) {
      let status = this.searchForm.get("state").value;
      status = status.toString().replaceAll(",", ":");
      filter = filter + "active:" + status + ",";
    }

    if (
      this.searchForm.get("entryDateIniForm").value != null &&
      this.searchForm.get("entryDateIniForm").value != ""
    ) {
      let startIniForm = this.searchForm.get("entryDateIniForm").value;
      filter = filter + `entryDate>=` + this.formatDate(startIniForm) + ",";
    }

    if (
      this.searchForm.get("entryDateEndForm").value != null &&
      this.searchForm.get("entryDateEndForm").value != ""
    ) {
      let startEndForm = this.searchForm.get("entryDateEndForm").value;
      filter = filter + `entryDate<=` + this.formatDate(startEndForm) + ",";
    }

    return filter;
  }

  formatDate(date, format = "YYYY-MM-DD") {
    let lastHour = moment(date);
    return lastHour.format(format);
  }

  // Show Job Procedure Modal
  showJobProcedureModal(jobProcedure): void {
    const centerId = this.searchForm.get("centroForm").value;

    if (!centerId) {
      this.messageService.showErrorMessage_i18n(
        "PROCEDIMIENTOS_TRABAJO.ERRORES.SELECCIONAR_CENTRO"
      );
    } else {
      const editMode = jobProcedure?.id !== undefined;
      const dialogRef = this.dialog.open(JobProcedureModalComponent, {
        hasBackdrop: true,
        disableClose: true,
        width: "50%",
        maxHeight: "700px",
        data: {
          jobProcedure,
        },
      });

      const instance = dialogRef.componentInstance;
      instance.editMode = editMode;
      const title =
        editMode === false
          ? "PROCEDIMIENTOS_TRABAJO.NEW_PROCEDURE"
          : "PROCEDIMIENTOS_TRABAJO.EDIT_PROCEDURE";
      instance.title = this.translate.instant(title);

      dialogRef
        .afterClosed()
        .pipe(
          filter((result) => result !== undefined),
          first()
        )
        .subscribe((result) => {
          this.saveJobProcedure(result.value, editMode);
        });
    }
  }

  saveJobProcedure(form, editMode: boolean) {
    const centerId = this.searchForm.get("centroForm").value;
    const successMessage = editMode
      ? "PROCEDIMIENTOS_TRABAJO.MSG_EXITO.MEDIDA_PREVENTIVA_EDITADA"
      : "PROCEDIMIENTOS_TRABAJO.MSG_EXITO.MEDIDA_PREVENTIVA_CREADA";

    // Todo: A la espera de que se acabe la tarea de drag&drop de ficheros. Por ahora se envía un array vacío
    const jobProcedureWithFileDto = {
      jobProcedure: {
        id: form.id,
        title: form.title,
        active: form.active,
        observations: form.observations,
        entryDate: this.getUTCDate(form.entryDate),
      },
      listUploadDocumentDto: [],
    };

    this.spinner.show();
    this.jobProcedureService
      .saveJobProcedure(jobProcedureWithFileDto, centerId)
      .pipe(first())
      .subscribe(
        (data) => {
          this.spinner.hide();
          this.messageService.showSuccessMessage_i18n(successMessage);
          this.search(this.pageIndex);
        },
        (error) => {
          this.spinner.hide();
          this.messageService.showErrorMessage_i18n(
            "PLANIFICACION_PRL.ERRORES.VUELVA_A_INTENTAR"
          );
        }
      );
  }

  // #region Docs
  showDocsModal(jobProcedure): void {
    const dialogRef = this.dialog.open(DocsModalComponent, {
      hasBackdrop: true,
      disableClose: true,
      width: "50%",
      maxHeight: "700px",
      data: { jobProcedure },
    });

    const instance = dialogRef.componentInstance;
    instance.title = this.translate.instant(
      "PLANIFICACION_PRL.GOAL_DOCS.TITLE"
    );

    dialogRef
      .afterClosed()
      .pipe(first())
      .subscribe((reload) => {
        if (reload) {
          this.search();
        }
      });
  }
  // #endregion Goal Docs

  getUTCDate(paramDate) {
    return new Date(moment(paramDate).format("YYYY-MM-DDTHH:mm:ss[Z]"));
  }

  //#region Form Functions
  initForm() {
    this.searchForm = this.formBuilder.group({
      empresaForm: new FormControl("", [Validators.required]),
      centroForm: new FormControl("", [Validators.required]),
      state: new FormControl(this.defaultState),
      procedimientoTrabajoForm: new FormControl(""),
      entryDateIniForm: new FormControl(null),
      entryDateEndForm: new FormControl(null),
    });
    this.maxDate = new Date();
  }

  resetForm(): void {
    setTimeout(() => {
      this.initForm();
      this.updateEmpresasYCentros();
      this.jobProcedureChecked = [];
      this.dataSourceList.data = [];
    });
  }

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

  exportResultsToPdf(): void {
    const jobProceduresSelected: Number[] = this.dataSourceList.data
      .filter((jobProcedure) => jobProcedure.checked)
      .map((jobProcedure) => jobProcedure.id);

    if (jobProceduresSelected.length === 0) {
      const titulo = this.translate.instant("ERROR_SELECCIONA_EXPORTAR");
      this.utils.mostrarMensajeSwalFire(
        "error",
        titulo,
        "",
        "var(--blue)",
        false
      );
      return;
    }

    this.spinner.show();

    this.jobProcedureService
      .exportResultsToPdf(jobProceduresSelected)
      .pipe(
        first(),
        tap(() => this.spinner.hide())
      )
      .subscribe(
        (response) => {
          const blob = new Blob([response], { type: "application/pdf" });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = "Instrucciones de procedimientos de trabajo.pdf";
          link.click();
          link.remove();
        },
        (error) => {
          console.error(error);
          this.messageService.showErrorMessage_i18n(
            "PROCEDIMIENTOS_TRABAJO.ERRORES.VUELVA_A_INTENTAR"
          );
        }
      );
  }

  exportResultsToXls(): void {
    const jobProceduresSelected: Number[] = this.dataSourceList.data
      .filter((jobProcedure) => jobProcedure.checked)
      .map((jobProcedure) => jobProcedure.id);

    if (jobProceduresSelected.length === 0) {
      const titulo = this.translate.instant("ERROR_SELECCIONA_EXPORTAR");
      this.utils.mostrarMensajeSwalFire(
        "error",
        titulo,
        "",
        "var(--blue)",
        false
      );
      return;
    }

    this.spinner.show();

    this.jobProcedureService
      .exportResultsToXls(jobProceduresSelected)
      .pipe(
        first(),
        tap(() => this.spinner.hide())
      )
      .subscribe(
        (excelBlob) => {
          this.fileUtils.downloadFileFromBlob(
            excelBlob,
            `procedimientos_de_trabajo.xlsx`
          );
        },
        (error) => {
          console.error(error);
          this.messageService.showErrorMessage_i18n(
            "PROCEDIMIENTOS_TRABAJO.ERRORES.VUELVA_A_INTENTAR"
          );
        }
      );
  }

  openJobProcedureChangeActiveModal(jobProcedure): void {
    const message = !jobProcedure.active
      ? "PROCEDIMIENTOS_TRABAJO.CHANGE_INACTIVE_TO_ACTIVE_TEXT"
      : "PROCEDIMIENTOS_TRABAJO.CHANGE_ACTIVE_TO_INACTIVE_TEXT";
    const dialogRef = this.dialog.open(ConfirmationMessageModalComponent, {
      hasBackdrop: true,
      disableClose: true,
      width: "40%",
      maxHeight: "700px",
      data: {
        message,
      },
    });
    const title = !jobProcedure.active
      ? "PROCEDIMIENTOS_TRABAJO.CHANGE_INACTIVE"
      : "PROCEDIMIENTOS_TRABAJO.CHANGE_ACTIVE";
    const instance = dialogRef.componentInstance;
    instance.title = this.translate.instant(title);

    dialogRef
      .afterClosed()
      .pipe(
        filter((result) => result !== undefined),
        first()
      )
      .subscribe((result) => {
        this.changeActiveJobProcedure(jobProcedure);
      });
  }
  changeActiveJobProcedure(jobProcedure) {
    const message = !jobProcedure.active
      ? "PROCEDIMIENTOS_TRABAJO.CHANGE_INACTIVE_TO_ACTIVE_TEXT_SUCCESS"
      : "PROCEDIMIENTOS_TRABAJO.CHANGE_ACTIVE_TO_INACTIVE_TEXT_SUCCESS";
    this.spinner.show();
    this.jobProcedureService
      .changeActiveJobProcedure(jobProcedure.id)
      .pipe(first())
      .subscribe(
        (data) => {
          this.spinner.hide();
          this.messageService.showSuccessMessage_i18n(message);
          this.search();
        },
        (error) => {
          this.spinner.hide();
          this.messageService.showErrorMessage_i18n(
            "PLANIFICACION_PRL.ERRORES.VUELVA_A_INTENTAR"
          );
        }
      );
  }
}
