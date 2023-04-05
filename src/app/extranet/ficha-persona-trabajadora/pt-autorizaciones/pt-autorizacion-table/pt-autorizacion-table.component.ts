import {Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort, Sort} from '@angular/material/sort';
import {MatCheckbox} from '@angular/material/checkbox';

import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {worker} from '../../pt-formacion/pt-formacion.component';
import {UtilsService} from '../../../../services/utils.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {Globals} from '../../../globals';
import {TranslateService} from '@ngx-translate/core';
import {WorkersCardService} from '../../../../services/workers-card.service';
import {MatTableDataSource} from '@angular/material/table';
import {WorkerDocument} from '../../../../Model/WorkerCard/WorkerDocument';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { PdfView } from 'src/app/modales/pdfView/pdfView.component';
import { ModalConfirmacionComponent } from 'src/app/modales/modal-confirmacion/modal-confirmacion.component';
import { ShareDocumentComponent } from 'src/app/modales/shareDocument/shareDocument.component';
import * as XLSX from 'xlsx';
import {WorkerDocumentEmail} from '../../../../Model/WorkerCard/WorkerDocumentEmail';
import {AutorizacionTrabajador} from '../../../../Model/Autorizacion/AutorizacionTrabajador';
import * as moment from 'moment';
import {AutorizacionesDTO} from '../../../../Model/Autorizacion/AutorizacionesDTO';


const redColor = '#F01F1F';
const yellowColor = '#FED74D';
const greenColor = '#45925A';

@Component({
  selector: 'app-pt-autorizacion-table',
  templateUrl: './pt-autorizacion-table.component.html',
  styleUrls: ['./pt-autorizacion-table.component.scss']
})
export class PtAutorizacionTableComponent implements OnInit {

  mailImgUrl = '../../../../assets/img/mail.svg';
  downloadImgUrl = '../../../../assets/img/download.svg';
  eyeImgUrl = '../../../../assets/img/eye.svg';
  deleteImgUrl = '../../../../assets/img/delete.svg';
  editImgUrl = '../../../../assets/img/icon-edit.svg';

  dataSource: any;
  showTable = false;
  paginator: MatPaginator;
  sort: Sort;
  pageSize = 10;
  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    if (mp) {
      this.paginator = mp;
      this.dataSource.paginator = this.paginator;
    }
  }

  @ViewChild(MatSort) set matSort(srt: MatSort) {
    if (srt) {
      this.sort = srt;
      this.dataSource.sort = this.sort;
    }
  }
  @ViewChild('allCheckbox') allCheckbox: MatCheckbox;

  autorizacionList: any[];
  columnsToDisplay = ['checklist', 'status', 'fechaAutorizacion', 'fechaCaducidad', 'tipoAutorizacion', 'specialAction'];
  excelImgUrl = '../../assets/img/excel.svg';

  @Input('workerData') workerData: worker;
  @Input('triggerTableReload') triggerTableReload: number;
  @Output('editAuthorizationEvent') editAuthorizationEvent = new EventEmitter<AutorizacionTrabajador>();

  constructor(
    public utils: UtilsService,
    private spinner: NgxSpinnerService,
    public globals: Globals,
    private translate: TranslateService,
    private ptAutorizacionService: WorkersCardService,
    public dialogPreviewFile: MatDialog,
    public dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<AutorizacionesDTO>(this.autorizacionList);
    this.showTable = false;
    this.getAllAutorizacionesTrabajador();
  }

  getAllAutorizacionesTrabajador() {
    this.spinner.show();
    const body = {
      idTrabajador: this.workerData.idTrabajador,
      idCliente: this.workerData.empresa.idEmpresa
    };

    this.ptAutorizacionService.getAllAutorizacionesTrabajador(body)
      .subscribe(data => {
          this.autorizacionList = data;
          if (this.autorizacionList.length === 0) {
            this.utils.mostrarMensajeSwalFireDocumentosNoEncontrados();
          }
      }, error => {
          console.log(error);
      },
        () => {
          this.dataSource = new MatTableDataSource<AutorizacionesDTO>(this.autorizacionList);
          this.spinner.hide();
          this.showTable = true;
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.triggerTableReload !== undefined && !changes.triggerTableReload.firstChange &&
      changes.triggerTableReload.previousValue !== changes.triggerTableReload.currentValue) {
      this.ngOnInit();
    }
  }
  /**
   * Toggles and untoggles list checkboxes
   */
  checkAllRows(): void {
    if (this.autorizacionList !== undefined || Object.keys(this.autorizacionList).length !== 0) {
      if (this.autorizacionList.filter(val => !val.blocked).every(val => val.checked === true)) {
        this.autorizacionList.filter(val => !val.blocked).forEach(val => {
          val.checked = false;
        });
        if (this.allCheckbox.checked) {
          this.allCheckbox.toggle();
        }
      } else {
        this.autorizacionList.filter(val => !val.blocked).forEach(val => {
          val.checked = true;
        });
        if (!this.allCheckbox.checked) {
          this.allCheckbox.toggle();
        }
      }
    }
  }

  sortData(sort: Sort) {
    const data = this.dataSource.data;
    if (!sort.active || sort.direction === '') {
      return;
    }

    this.autorizacionList = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      const nameA: string = a.name.toString();
      const nameB: string = b.name.toString();
      switch (sort.active) {
        case 'tipoAutorizacion' || 'fechaCaducidad' || 'fechaAutorizacion' :
          return (nameA < nameB ? -1 : 1) * (isAsc ? 1 : -1);
        default:
          return 0;
      }
    });
  }

  dropColumn(event: CdkDragDrop<string[]>, tableHeaders) {
    if (event.currentIndex === 0) {
      return;
    }
    moveItemInArray(tableHeaders, event.previousIndex, event.currentIndex);
  }
  getColorSemaforo(element) {
    const now = moment(new Date());
    if (element.fechacaducidad === undefined) {
      return greenColor;
    }
    const fechaCaducidad = moment(element.fechacaducidad);
    const diff = fechaCaducidad.diff(now, 'days');
    if (diff < 0) {
      return redColor;
    } else if (diff <= 40) {
      return yellowColor;
    } else {
      return greenColor;
    }
  }
  showAuthorization(auth) {
    this.editAuthorizationEvent.emit(auth);
  }

  downloadAuthorization(documento) {
    this.spinner.show();
    const errorText = this.utils.translateText('ERROR_EN_LA_DESCARGA', 'Ha ocurrido un error en la descarga');
    this.ptAutorizacionService.getFile(documento).subscribe( // AÑADIR EL DESCARGAR DE AUTORIZACION
      pdfBase64 => {
        if (pdfBase64) {
          const linkSource = `data:application/pdf;base64,${pdfBase64.file}`;
          const filename = pdfBase64.name + pdfBase64.extension;
          const downloadLink = document.createElement('a');
          downloadLink.href = linkSource;
          downloadLink.download = filename;
          downloadLink.click();
        } else {
          this.utils.mostrarMensajeSwalFire('error', '', errorText, 'var(--blue)', false);
        }
      },
      error => {
        console.log(error);
        this.utils.mostrarMensajeSwalFire('error', '', errorText, 'var(--blue)', false);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  deleteAuthorization(element: any) {
    let successText = 'El elemento se ha eliminado correctamente';
    this.translate.get('PLANIFICACION_PRL.DELETE_MODAL.SUCCESS_MESSAGE').subscribe((res: string) => { successText = res; });
    let errorText = 'No se ha podido eliminar el elemento';
    this.translate.get('PLANIFICACION_PRL.DELETE_MODAL.ERROR_MESSAGE').subscribe((res: string) => { errorText = res; });

    if (element.idautorizaciontrabajador !== undefined && element.idautorizaciontrabajador !== null) {
      this.spinner.show();
      this.ptAutorizacionService.deleteAuthorization(element.idautorizaciontrabajador).subscribe( // AÑADIR EL ELIINAR DE AUTORIZACION
        response => {
          if (response > 0) {  // the document has been updated
            this.utils.mostrarMensajeSwalFire('info', '', successText, 'var(--blue)', false);
            this.spinner.hide();
            this.getAllAutorizacionesTrabajador();
          } else {  // not updated
            this.utils.mostrarMensajeSwalFire('error', '', errorText, 'var(--blue)', false);
            this.spinner.hide();
          }
        }, error => {
          this.utils.mostrarMensajeSwalFire('error', '', errorText, 'var(--blue)', false);
          this.spinner.hide();
        }
      );
    }
  }

  previewAuthorization(authorization: any) {
  }
  onShowDeleteModal(authorizationId: number) {
    let questionText = '¿Está seguro de que desea eliminar el elemento seleccionado?';
    this.translate.get('PLANIFICACION_PRL.DELETE_MODAL.DESCRIPTION').subscribe((res: string) => { questionText = res; });

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      title: '',
      text: questionText,
      showCancelButton: true,
      modalSize: '',
      icon: 'question'
    };
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;

    const questionDialog = this.dialog.open(ModalConfirmacionComponent, dialogConfig);

    questionDialog.afterClosed().subscribe(
      result => {
      //  if (result) { this.deleteAuthorization(authorizationId); }
      }
    );
  }


  /**
   * Genere and Download an Excel with the selected row of the table
   */
  exportAsExcel() {
    this.spinner.show();
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    let JSONWS: XLSX.WorkSheet;
    const dataJS = [];

    const fileName = this.utils.translateText('PERSONA_TRABAJADORA.DOCUMENTATION', 'Documentación');

    const stateRow = this.utils.translateText('ESTADO', 'Estado');
    const registrationDateRow = this.utils.translateText('FECHA_ALTA', 'Fecha de alta');
    const jobPositionRow = this.utils.translateText('PERSONA_TRABAJADORA.JOB_POSITION', 'Puesto de trabajo');
    const documentRow = this.utils.translateText('DOCUMENTO', 'Documento');
    const submitDateRow = this.utils.translateText('PT_DOCUMENTACION.TABLE.SUBMIT_DATE', 'Fecha de entrega');
    const expirationDateRow = this.utils.translateText('PT_DOCUMENTACION.TABLE.EXPIRATION_DATE', 'Fecha caducidad');

    const expired = this.utils.translateText('PT_DOCUMENTACION.LEGEND.DOCUMENTATION_IS_EXPIRED', 'Documentación dada de baja');

    this.autorizacionList.filter(document => document.checked).map(
      document => {
        const newItem = {};
        newItem[stateRow] = this.getColorSemaforo(document) ? expired : '';
        newItem[registrationDateRow] = (new Date(document.creationDate)).toLocaleDateString();
        newItem[jobPositionRow] = document.jobPosition.nombre;
        newItem[documentRow] = document.documentType.description;
        newItem[submitDateRow] = (new Date(document.submitDate)).toLocaleDateString();
        newItem[expirationDateRow] = (new Date(document.expirationDate)).toLocaleDateString();
        dataJS.push(newItem);
      }
    );

    if (!dataJS.length) {
      const titulo = this.utils.translateText('ERROR_SELECCIONA_EXPORTAR', 'Debe seleccionar al menos un elemento a exportar');
      this.utils.mostrarMensajeSwalFire('error', titulo, '', 'var(--blue)', false);
    } else {
      const result = XLSX.utils.sheet_add_json(JSONWS, dataJS);
      XLSX.utils.book_append_sheet(wb, result, 'Sheet1');

      /* save to file */
      XLSX.writeFile(wb, fileName + '.xlsx');
    }
    this.spinner.hide();
  }

  /**
   * Genere and Download a Zip with the selected rows of the table
   */
  massiveDownload() {
    const selectedDocuments = this.autorizacionList.filter(document => document.checked);

    if (!!selectedDocuments.length) {
      this.spinner.show();
      this.ptAutorizacionService.getZip(selectedDocuments).subscribe(
        zipBase64 => {
          if (zipBase64.file) {
            const zipFile = document.createElement('a');
            zipFile.href = `data:application/zip;base64,${zipBase64.file}`;
            zipFile.download = this.utils.translateText('PERSONA_TRABAJADORA.DOCUMENTATION', 'Documentación');
            zipFile.click();
          }
        },
        error => {
          console.log(error);
          const titulo = this.utils.translateText('ERROR', 'Se ha producido un error');
          this.utils.mostrarMensajeSwalFire('error', titulo, '', 'var(--blue)', false);
        }
      ).add(() => {
        this.spinner.hide();
      });
    } else {
      const titulo = this.utils.translateText('ERROR_SELECCIONA_DESCARGAR', 'Debe seleccionar al menos un elemento a descargar');
      this.utils.mostrarMensajeSwalFire('error', titulo, '', 'var(--blue)', false);
    }
  }

  /**
   * Genere and Share a Zip with the selected rows of the table
   */
  shareDocument(document = null) {
    const dialogConfig = new MatDialogConfig();
    const selectedDocuments = document ? [document] : this.autorizacionList.filter(document => document.checked);
    const menuNameComponent = this.utils.translateText('PERSONA_TRABAJADORA.FICHA', 'Persona Trabajadora');
    const subMenuNameComponent = this.utils.translateText('PERSONA_TRABAJADORA.DOCUMENTATION', 'Documentación');
    const sendingInfoTitle = this.utils.translateText('ENVIO_DOC_INICIADA', 'Se ha procedido al envío por correo electrónico de la documentación indicada');
    const sendingErrorTitle = this.utils.translateText('ERROR_ENVIO_MENSAJE', 'Error al enviar el mensaje');

    if (selectedDocuments.length > 0) {

      dialogConfig.data = {
        element: document ? {name: document.name, extension: document.extension} : {name: 'documents', extension: '.zip'},
        menuName: menuNameComponent,
        subMenuName: subMenuNameComponent
      };
      dialogConfig.width = '50%';
      dialogConfig.hasBackdrop = true;
      dialogConfig.disableClose = true;

      const dialogRef = this.dialog.open(ShareDocumentComponent, dialogConfig);
      dialogRef.afterClosed().subscribe(result => {
          if (result !== undefined) {
            this.spinner.show();
            const email: WorkerDocumentEmail = {
              receiverEmail: result.emailFormControl,
              ccReceiverEmail: result.ccFormControl,
              ccoReceiverEmail: result.ccoFormControl,
              subject: result.subjectFormControl,
              body: result.bodyFormControl,
              documentList: selectedDocuments
            };
            this.ptAutorizacionService.shareFile(email).subscribe(
              value => {
                if (value === true) {
                  this.utils.mostrarMensajeSwalFire('info', sendingInfoTitle, '', 'var(--blue)', false);
                } else {
                  this.utils.mostrarMensajeSwalFire('error', sendingErrorTitle, '', 'var(--blue)', false);
                }
              },
              error => {
                console.log(error);
                this.utils.mostrarMensajeSwalFire('error', sendingErrorTitle, '', 'var(--blue)', false);
              }
            ).add(() => this.spinner.hide());
          }
        }
      );
    } else {
      const titulo = this.utils.translateText('ERROR_SELECCIONA_DESCARGAR', 'Debe seleccionar al menos un elemento a descargar');
      this.utils.mostrarMensajeSwalFire('error', titulo, '', 'var(--blue)', false);
    }
  }
}
