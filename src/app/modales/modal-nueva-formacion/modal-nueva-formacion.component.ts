import { Component, Inject, OnInit } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ModalDocumentacionComponent } from '../modal-documentacion/modal-documentacion.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-modal-nueva-formacion',
  templateUrl: './modal-nueva-formacion.component.html',
  styleUrls: ['./modal-nueva-formacion.component.scss']
})
export class ModalNuevaFormacionComponent implements OnInit {

  public training = {
    description: '',
    courseModality: null,
    courseModalityId: null,
    courseType: null,
    courseTypeId: null,
    address: '',
    hours: null,
    initDate: null,
    recycleDate: null,
    endDate: null,
    evaluation: 1,
    uploadDocumentDto: {
      fileName: null,
      fileExtension: null,
      file: null
    },
    originalDocument: null,
    deleteOldFile: false,
  }

  continueReadingButton: boolean = false;
  legalText = '';

  toCreateDocs = []

  constructor(
    public dialogRef: MatDialogRef<ModalDocumentacionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public translate: TranslateService,
    private spinner: NgxSpinnerService) { }

  closeModal() {
    this.dialogRef.close();
  }

  ngOnInit(): void {

    if (this.data.mode === 0) {
      // create
      console.log(this.data)
    } else {
      // edit
      this.training = this.data.currentTraining
      this.training.courseModalityId = this.data.currentTraining.courseModality.id
      this.training.courseTypeId = this.data.currentTraining.courseType.id
      this.initFile()
      console.log(this.training)
    }
  }

  initFile () {
    if (this.training.uploadDocumentDto !== undefined && this.training.uploadDocumentDto !== null) {
      let file = new File([null],
        `${this.training.uploadDocumentDto.fileName.trim()}.${this.training.uploadDocumentDto.fileExtension}`);
      this.toCreateDocs.push(file)
      this.training.originalDocument = file
    } else {
      this.training.uploadDocumentDto = {
        fileName: null,
        fileExtension: null,
        file: null
      }
    }
  }

  setCertificate() {
    if (this.training !== null && this.toCreateDocs.length !== 0 && this.toCreateDocs[0] !== this.training.originalDocument) {
      console.log(this.toCreateDocs[0])
      console.log(this.training.originalDocument)
      console.log(this.training.uploadDocumentDto)
      this.training.uploadDocumentDto.fileName = this.toCreateDocs[0].name.split('.').slice(0, -1).join('.');
      this.training.uploadDocumentDto.fileExtension = this.toCreateDocs[0].name.split('.').pop();
      this.getBase64(this.toCreateDocs[0]).then(
        data => {
          this.training.uploadDocumentDto.file = data;
        }
      );
    } else {
      delete this.training.uploadDocumentDto
      this.training.deleteOldFile = true
      // this.training.uploadDocumentDto = null;
    }
    delete this.training.originalDocument
    if (this.training.evaluation === 2) {
      if (this.training.uploadDocumentDto !== undefined) {
        delete this.training.uploadDocumentDto
      }
      this.training.deleteOldFile = true
    }
  }

  getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',').pop());
      reader.onerror = error => reject(error);
    });
  }

  onFileAddError (event) {
    console.log(this.toCreateDocs)
  }

  saveEnabled () {
    return this.training.description !== null
      && this.training.courseModalityId !== null
      && this.training.courseTypeId !== null
      && this.training.address !== null
      && this.training.hours !== null
      && this.training.initDate !== null
      && this.training.endDate !== null;
  }

  save () {
    this.setCertificate()
    this.dialogRef.close(this.training)
  }

  isContinueReading() {
    return this.continueReadingButton;
  }

  continueReading() {
    this.continueReadingButton = !this.continueReadingButton;
  }

  changeEvaluation () {
    console.log(this.training)
  }

}
