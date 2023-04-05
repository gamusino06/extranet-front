import {Component, Inject, Input, OnInit} from '@angular/core';
import { WorkersCardService } from "../../services/workers-card.service";
import { DocumentType } from "../../Model/WorkerCard/DocumentType";
import {WorkerDocument} from "../../Model/WorkerCard/WorkerDocument";
import {BasicEntity} from "../../Model/BasicEntity";
import {PuestoTrabajo} from "../../Model/PuestoTrabajo";
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import {formatDate} from "@angular/common";
import {NgxSpinnerService} from 'ngx-spinner';
import {PdfView} from '../pdfView/pdfView.component';

@Component({
  selector: 'app-modal-documentacion',
  templateUrl: './modal-documentacion.component.html',
  styleUrls: ['./modal-documentacion.component.scss']
})
export class ModalDocumentacionComponent implements OnInit {

  newDocument : WorkerDocument = {
    id: null,
    employeeId: null,
    clientId: null,
    center: null,
    jobPosition: null,
    submitDate: null,
    expirationDate: null,
    description: null,
    documentType: null,
    name: null,
    extension: null,
    uniqueName: null,
    isRemoved: null,
    createdBy: null,
    creationDate: null,
    modifiedBy: null,
    modifiedDate: null,
    file: null,
    fileYear: 0
  };
  centersList : BasicEntity[] = [];
  jobPositionList: PuestoTrabajo[] = [];
  documentTypesList : DocumentType[] = [];
  workerData: any;
  editDocumentData: any;
  initEditFormState: any;

  fileList: any[] = [];

  constructor(
    public workerUtils: WorkersCardService,
    public dialogRef: MatDialogRef<ModalDocumentacionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.spinner.show();
    // Cargar datos del Documento
    this.loadDocumentData();

    // Cargamos los datos de los selectores
    if (this.editDocumentData === undefined) {
      if (this.centersList === undefined) {
        this.newDocument.center = null;
      } else {
        const centerSelected = this.centersList.find(center => center.id === this.workerData.centro.idCentro);
        this.newDocument.center = centerSelected !== undefined ? centerSelected : null;
      }
    }

    this.workerUtils.getJobPositions(this.newDocument.employeeId, this.workerData.centro.idCentro).subscribe(
      data => {
        this.jobPositionList = data;
        if (this.editDocumentData === undefined) {
          const jopPositionSelected = data.find(job => job.idPuestoTrabajo === this.workerData.puestosTrabajo[0].idPuestoTrabajo);
          this.newDocument.jobPosition = jopPositionSelected !== undefined ? jopPositionSelected : null;
        } else {
          // this has to be assigned here due to data request
          const jopPositionSelected = data.find(job => job.idPuestoTrabajo === this.editDocumentData.jobPosition.idPuestoTrabajo);
          this.newDocument.jobPosition = jopPositionSelected !== undefined ? jopPositionSelected : null;
          this.initEditFormState.jobPosition = this.newDocument.jobPosition;
        }
      },
      error => {
        console.error(error);
      },
      () => {
        this.spinner.hide();
      }
    );
  }


  loadDocumentData() {
    this.workerData = this.data.workerData;
    this.documentTypesList = this.data.documentTypesList;
    this.centersList = this.data.centersList;
    this.editDocumentData = this.data.editDocumentData;
    this.newDocument.employeeId = this.workerData.idTrabajador;
    this.newDocument.clientId = this.workerData.empresa.idEmpresa;
    this.newDocument.isRemoved = 0;
    this.newDocument.fileYear = this.workerData.fileYear;

    if (this.editDocumentData !== undefined) {
      this.populateEditDocumentData();
    }
  }

  closeModal() {
    this.dialogRef.close();
  }

  onFileListChange(event) {
    console.log(event);
    this.fileList = JSON.parse(JSON.stringify(event));
    if(event.length > 0) {
      this.newDocument.name = event[0].name.split('.').slice(0, -1).join('.');
      this.newDocument.uniqueName = event[0].name;
      this.newDocument.extension = "." + event[0].name.split(".").slice(-1);

      this.getBase64(event[0]).then(
        data => {
          this.newDocument.file = data;
        }
      );
    } else {
      this.newDocument.name = null;
      this.newDocument.uniqueName = null;
      this.newDocument.extension = null;
      this.newDocument.file = null;
    }
  }

  disabledSaveButton(): boolean {
    return (
      this.newDocument.submitDate     == null ||
      this.newDocument.center         == null ||
      this.newDocument.jobPosition    == null ||
      this.newDocument.documentType   == null ||
      this.newDocument.name           == null ||
      this.modalHasNotChanges()
    );
  }

  getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',').pop());
      reader.onerror = error => reject(error);
    });
  }

  onCenterSelected() {
    this.spinner.show();
    this.newDocument.jobPosition = null;
    this.workerUtils.getJobPositions(this.newDocument.employeeId, this.newDocument.center.id).subscribe(
      data => {
        this.jobPositionList = data;
      },
      error => {
        console.error(error);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  populateEditDocumentData(): void {
    this.newDocument.id = this.editDocumentData.id;
    this.newDocument.submitDate = this.editDocumentData.submitDate;
    this.newDocument.expirationDate = this.editDocumentData.expirationDate;

    const documentTypeSelected = this.documentTypesList.find(documentType => documentType.id === this.editDocumentData.documentType.id);
    this.newDocument.documentType = documentTypeSelected !== undefined ? documentTypeSelected : null;

    this.newDocument.description = this.editDocumentData.description;

    const centerSelected = this.centersList.find(center => center.id === this.editDocumentData.center.id);
    this.newDocument.center = centerSelected !== undefined ? centerSelected : null;
    // TODO precargar el archivo
    this.newDocument.name = this.editDocumentData.name;
    this.newDocument.extension = this.editDocumentData.extension;
    this.newDocument.uniqueName = this.editDocumentData.uniqueName;
    this.newDocument.isRemoved = this.editDocumentData.isRemoved;
    this.newDocument.creationDate = this.editDocumentData.creationDate;
    this.newDocument.createdBy = this.editDocumentData.createdBy;
    this.newDocument.modifiedDate = this.editDocumentData.modifiedDate;
    this.newDocument.modifiedBy = this.editDocumentData.modifiedBy;
    this.newDocument.fileYear = this.editDocumentData.fileYear;

    let file = {name: this.newDocument.name, type: "application/pdf"};
    this.fileList.push(file);

    this.initEditFormState = JSON.parse(JSON.stringify(this.newDocument));
  }

  modalHasNotChanges(): boolean {
    if (this.editDocumentData !== undefined && (
        formatDate(Date.parse(this.initEditFormState.submitDate.toString()), 'yyyy-MM-dd', 'en_US') === formatDate(Date.parse(this.newDocument.submitDate.toString()), 'yyyy-MM-dd', 'en_US') &&
        formatDate(Date.parse(this.initEditFormState.expirationDate.toString()), 'yyyy-MM-dd', 'en_US') === formatDate(Date.parse(this.newDocument.expirationDate.toString()), 'yyyy-MM-dd', 'en_US') &&
        this.initEditFormState.center.id === this.newDocument.center.id &&
        this.initEditFormState.jobPosition.idPuestoTrabajo === this.newDocument.jobPosition.idPuestoTrabajo &&
        this.initEditFormState.documentType.id === this.newDocument.documentType.id &&
        this.initEditFormState.description === this.newDocument.description &&
        this.initEditFormState.name === this.newDocument.name)
    ) { // TODO meter comprobacion del archivo
      return true;
    }
    return false;
  }

}
