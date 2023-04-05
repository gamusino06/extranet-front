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
import * as XLSX from "xlsx";
import {WorkerDocumentEmail} from "../../../../Model/WorkerCard/WorkerDocumentEmail";

@Component({
  selector: 'app-pt-documentacion-table',
  templateUrl: './pt-documentacion-table.component.html',
  styleUrls: ['./pt-documentacion-table.component.scss']
})
export class PtDocumentacionTableComponent implements OnInit {

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

  @Input('documentList') documentList;

  columnsToDisplay = ['checklist', 'status', 'creationDate', 'jobPosition', 'name', 'submitDate', 'expirationDate', 'specialAction'];
  excelImgUrl = "../../assets/img/excel.svg";

  @Input('workerData') workerData: worker;
  @Input('triggerTableReload') triggerTableReload: number;
  @Output('editDocumentEvent') editDocumentEvent = new EventEmitter<WorkerDocument>();

  constructor(
    public utils: UtilsService,
    private spinner: NgxSpinnerService,
    public globals: Globals,
    private translate: TranslateService,
    private ptDocumentService: WorkersCardService,
    public dialogPreviewFile: MatDialog,
    public dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<WorkerDocument>(this.documentList);
    this.showTable = false;
    this.getAllDocumentsForWorker();
  }

  getAllDocumentsForWorker() {
    this.spinner.show();
    const body = {
      employeeId: this.workerData.idTrabajador,
      centerId: this.workerData.centro.idCentro,
      clientId: this.workerData.empresa.idEmpresa,
      jobPositionIdList: this.workerData.puestosTrabajo.map(p => p.idPuestoTrabajo)
    };

    this.ptDocumentService.getAllDocumentsForWorker(body)
      .subscribe(data => {
          this.documentList = data;
          if (this.documentList.length === 0) {
            this.utils.mostrarMensajeSwalFireDocumentosNoEncontrados();
          }
      }, error => {
          console.log(error);
      },
        () => {
          this.dataSource = new MatTableDataSource<WorkerDocument>(this.documentList);
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
    if (this.documentList !== undefined || Object.keys(this.documentList).length !== 0) {
      if (this.documentList.filter(val => !val.blocked).every(val => val.checked === true)) {
        this.documentList.filter(val => !val.blocked).forEach(val => {
          val.checked = false;
        });
        if (this.allCheckbox.checked) {
          this.allCheckbox.toggle();
        }
      } else {
        this.documentList.filter(val => !val.blocked).forEach(val => {
          val.checked = true;
        });
        if (!this.allCheckbox.checked) {
          this.allCheckbox.toggle();
        }
      }
    }
  }

  /**
   * Sorts the data in column Company-Center based on the parameter sort
   * @param sort
   */
  sortData(sort: Sort) {
    const data = this.dataSource.data;
    if (!sort.active || sort.direction === '') {
      return;
    }

    this.documentList = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      const nameA: string = a.name.toString();
      const nameB: string = b.name.toString();
      switch (sort.active) {
        case 'submitDate' || 'jobPosition' || 'name' || 'expirationDate' || 'creationDate':
          return (nameA < nameB ? -1 : 1) * (isAsc ? 1 : -1);
        default:
          return 0;
      }
    });
  }

  dropColumn(event: CdkDragDrop<string[]>, tableHeaders) {
    if (event.currentIndex === 0) return;
    moveItemInArray(tableHeaders, event.previousIndex, event.currentIndex);
  }

  documentIsExpired(element: any) {
    if (element.expirationDate === undefined) {
      return false;
    }
    const expirationDate = new Date(element.expirationDate);
    expirationDate.setHours(0); expirationDate.setMinutes(0); expirationDate.setSeconds(0); expirationDate.setMilliseconds(0);
    const actualDate = new Date();
    actualDate.setHours(0); actualDate.setMinutes(0); actualDate.setSeconds(0); actualDate.setMilliseconds(0);
    if (expirationDate < actualDate) {
      return true;
    }
    return false;
  }

  showDocument(doc) {
    this.editDocumentEvent.emit(doc);
  }

  downloadDocument(documento) {
    this.spinner.show();
    const errorText = this.utils.translateText('ERROR_EN_LA_DESCARGA','Ha ocurrido un error en la descarga');
    this.ptDocumentService.getFile(documento).subscribe(
      pdfBase64 =>{
        if(pdfBase64){
          const linkSource = `data:application/pdf;base64,${pdfBase64.file}`;
          const filename = pdfBase64.name + pdfBase64.extension;
          const downloadLink = document.createElement('a');
          downloadLink.href = linkSource;
          downloadLink.download = filename;
          downloadLink.click();
        }
        else {
          this.utils.mostrarMensajeSwalFire('error', '', errorText,'var(--blue)', false);
        }
      },
      error => {
        console.log(error);
        this.utils.mostrarMensajeSwalFire('error', '', errorText,'var(--blue)', false);
      },
      () =>{
        this.spinner.hide();
      }
    );
  }

  deleteDocument(documentId: number) {
    let successText = "El elemento se ha eliminado correctamente";
    this.translate.get('PLANIFICACION_PRL.DELETE_MODAL.SUCCESS_MESSAGE').subscribe((res: string) => { successText = res; });
    let errorText = "No se ha podido eliminar el elemento";
    this.translate.get('PLANIFICACION_PRL.DELETE_MODAL.ERROR_MESSAGE').subscribe((res: string) => { errorText = res; });

    if(documentId !== undefined && documentId !== null) {
      this.spinner.show();
      this.ptDocumentService.deleteDocument(documentId).subscribe(
        response => {
          if(response > 0) {  // the document has been updated
            this.utils.mostrarMensajeSwalFire('info', '', successText,'var(--blue)', false);
            this.spinner.hide();
            this.getAllDocumentsForWorker();
          } else {  // not updated
            this.utils.mostrarMensajeSwalFire('error', '', errorText,'var(--blue)', false);
            this.spinner.hide();
          }
        }, error => {
          this.utils.mostrarMensajeSwalFire('error', '', errorText,'var(--blue)', false);
          this.spinner.hide();
        }
      );
    }
  }

  onShowDeleteModal(documentId: number) {

    let questionTitle = 'Eliminar elemento';
    this.translate.get('PLANIFICACION_PRL.DELETE_MODAL.TITLE').subscribe((res: string) => { questionTitle = res; });
    let questionText = "Vas a eliminar el elemento seleccionado, ¿deseas continuar?";
    this.translate.get('PLANIFICACION_PRL.DELETE_MODAL.DESCRIPTION').subscribe((res: string) => { questionText = res; });

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      title: questionTitle,
      text: questionText,
      showCancelButton: true,
      icon: 'warning'
    };
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;

    const questionDialog = this.dialog.open(ModalConfirmacionComponent, dialogConfig);

    questionDialog.afterClosed().subscribe(
      isAcceptButtonClicked => {
        if(isAcceptButtonClicked) { this.deleteDocument(documentId); }
      }
    );
  }

  /**
   * Gets a document and displays it
   * @param newDocument
   */
  previewDocument(newDocument) {
    this.spinner.show();
    this.ptDocumentService.getFile(newDocument).subscribe(pdfBase64 => {
      if (pdfBase64) {
        const byteArray = new Uint8Array(atob(pdfBase64.file).split('').map(char => char.charCodeAt(0)));
        const blob = new Blob([byteArray], {type: 'application/pdf'});
        // Here is your URL you can use
        const url = window.URL.createObjectURL(blob);
        // i.e. display the PDF content via iframe
        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = url;
        dialogConfig.width = '50%';
        dialogConfig.hasBackdrop = true;
        dialogConfig.disableClose = true;

        const dialogRef = this.dialogPreviewFile.open(PdfView, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
        });
      }
      this.spinner.hide();
    });
  }


  /**
   * Genere and Download an Excel with the selected row of the table
   */
  exportAsExcel() {
    this.spinner.show();
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    let JSONWS: XLSX.WorkSheet;
    let dataJS = [];

    const fileName = this.utils.translateText('PERSONA_TRABAJADORA.DOCUMENTATION', 'Documentación');

    const stateRow = this.utils.translateText('ESTADO', 'Estado');
    const registrationDateRow = this.utils.translateText('FECHA_ALTA', 'Fecha de alta');
    const jobPositionRow = this.utils.translateText('PERSONA_TRABAJADORA.JOB_POSITION', 'Puesto de trabajo');
    const documentRow = this.utils.translateText('DOCUMENTO', 'Documento');
    const submitDateRow = this.utils.translateText('PT_DOCUMENTACION.TABLE.SUBMIT_DATE', 'Fecha de entrega');
    const expirationDateRow = this.utils.translateText('PT_DOCUMENTACION.TABLE.EXPIRATION_DATE', 'Fecha caducidad');

    const expired = this.utils.translateText('PT_DOCUMENTACION.LEGEND.DOCUMENTATION_IS_EXPIRED', 'Documentación dada de baja');

    this.documentList.filter(document => document.checked).map(
      document =>{
        let new_item = {};
        new_item[stateRow] = this.documentIsExpired(document) ? expired : '';
        new_item[registrationDateRow] = (new Date(document.creationDate)).toLocaleDateString();
        new_item[jobPositionRow] = document.jobPosition.nombre;
        new_item[documentRow] = document.documentType.description;
        new_item[submitDateRow] = (new Date(document.submitDate)).toLocaleDateString();
        new_item[expirationDateRow] = (new Date(document.expirationDate)).toLocaleDateString();
        dataJS.push(new_item);
      }
    );

    if(!dataJS.length){
      let titulo = this.utils.translateText('ERROR_SELECCIONA_EXPORTAR','Debe seleccionar al menos un elemento a exportar');
      this.utils.mostrarMensajeSwalFire('error', titulo, '', 'var(--blue)', false);
    }
    else{
      let result = XLSX.utils.sheet_add_json(JSONWS, dataJS);
      XLSX.utils.book_append_sheet(wb, result, 'Sheet1');

      /* save to file */
      XLSX.writeFile(wb, fileName + '.xlsx');
    }
    this.spinner.hide();
  }

  /**
   * Genere and Download a Zip with the selected rows of the table
   */
  massiveDownload(){
    const selectedDocuments = this.documentList.filter(document => document.checked);

    if(!!selectedDocuments.length){
      this.spinner.show();
      this.ptDocumentService.getZip(selectedDocuments).subscribe(
        zipBase64 =>{
          if (zipBase64.file){
            let zipFile = document.createElement('a');
            zipFile.href = `data:application/zip;base64,${zipBase64.file}`;
            zipFile.download = this.utils.translateText('PERSONA_TRABAJADORA.DOCUMENTATION', 'Documentación');
            zipFile.click();
          }
        },
        error => {
          console.log(error);
          const titulo = this.utils.translateText('ERROR','Se ha producido un error');
          this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
        }
      ).add(()=>{this.spinner.hide()});
    }
    else{
      const titulo = this.utils.translateText('ERROR_SELECCIONA_DESCARGAR','Debe seleccionar al menos un elemento a descargar');
      this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
    }
  }

  /**
   * Genere and Share a Zip with the selected rows of the table
   */
  shareDocument(document = null) {
    const dialogConfig = new MatDialogConfig();
    const selectedDocuments = document ? [document] : this.documentList.filter(document => document.checked);
    const menuNameComponent = this.utils.translateText('PERSONA_TRABAJADORA.FICHA', 'Persona Trabajadora');
    const subMenuNameComponent = this.utils.translateText('PERSONA_TRABAJADORA.DOCUMENTATION', 'Documentación');
    const sendingInfoTitle = this.utils.translateText('ENVIO_DOC_INICIADA', 'Se ha procedido al envío por correo electrónico de la documentación indicada');
    const sendingErrorTitle = this.utils.translateText('ERROR_ENVIO_MENSAJE', 'Error al enviar el mensaje');

    if(selectedDocuments.length > 0){

      dialogConfig.data = {
        element: document ? {name: document.name, extension: document.extension} : {name: 'documents', extension: '.zip'},
        menuName: menuNameComponent,
        subMenuName: subMenuNameComponent
      };
      dialogConfig.width = "50%";
      dialogConfig.hasBackdrop = true;
      dialogConfig.disableClose = true;

      const dialogRef = this.dialog.open(ShareDocumentComponent, dialogConfig);
      dialogRef.afterClosed().subscribe(result => {
          if(result !== undefined){
            this.spinner.show();
            let email: WorkerDocumentEmail = {
              receiverEmail: result.emailFormControl,
              ccReceiverEmail: result.ccFormControl,
              ccoReceiverEmail: result.ccoFormControl,
              subject: result.subjectFormControl,
              body: result.bodyFormControl,
              documentList: selectedDocuments
            };
            this.ptDocumentService.shareFile(email).subscribe(
              value => {
                if(value === true){
                  this.utils.mostrarMensajeSwalFire('info', sendingInfoTitle, '','var(--blue)', false);
                }
                else{
                  this.utils.mostrarMensajeSwalFire('error', sendingErrorTitle, '','var(--blue)', false);
                }
              },
              error => {
                console.log(error);
                this.utils.mostrarMensajeSwalFire('error', sendingErrorTitle, '','var(--blue)', false);
              }
            ).add(() => this.spinner.hide());
          }
        }
      );
    }
    else {
      const titulo = this.utils.translateText('ERROR_SELECCIONA_DESCARGAR','Debe seleccionar al menos un elemento a descargar');
      this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
    }
  }
}
