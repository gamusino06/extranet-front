import { ElementRef, Inject, Input, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { MyErrorStateMatcher } from '../modalModifyBillsMail/modalModifyBillsMail.component';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { TranslateService } from '@ngx-translate/core';
import { Globals } from '../../extranet/globals';
import { environment } from '../../../environments/environment';
import {AllowedExtensions} from '../../extranet/my-courses/contact-manager/contact-manager.component';
import {WorkerDocument} from '../../Model/WorkerCard/WorkerDocument';
import {AutorizacionTrabajador} from '../../Model/Autorizacion/AutorizacionTrabajador';
import {AutorizacionTrabajadorTipo} from '../../Model/Autorizacion/AutorizacionTrabajadorTipo';
import {AutorizacionesDTO} from '../../Model/Autorizacion/AutorizacionesDTO';
import {any} from 'codelyzer/util/function';
import {NgxSpinnerService} from 'ngx-spinner';

@Component({
  selector: 'app-add-authorization-document',
  templateUrl: './addAuthorizationDocument.component.html',
  styleUrls: ['./addAuthorizationDocument.component.scss']
})

export class AddAuthorizationDocumentComponent implements OnInit {
  newAuthorization: AutorizacionesDTO = {
    idautorizaciontrabajador: null,
    idtrabajador: null,
    idcliente: null,
    autorizaciontipo: null,
    observaciones: null,
    fechaentrega: null,
    fechacaducidad: null,
    activo: null,
    nombre: null,
    tipomyme: null,
    borrado: null,
    usuariocreador: null,
    fechacreacion: null,
    usuarioultimaedicion: null,
    fechaultimaedicion: null,
    nombreUnico: null,
    anyo: null,
    file: null,
    firmaElectronica: null,
    fileFlag: null
  };
  addAuthorizationDocumentGroup: FormGroup;
  matcher = new MyErrorStateMatcher();
  editAuthData: any;
  public Editor = DecoupledEditor;
  environment = environment;
  workerData: any;
  authorizationTypesList: AutorizacionTrabajadorTipo[] = [];
  today = new Date();
  fileList: any[] = [];
  constructor(
    public dialogRef: MatDialogRef<AddAuthorizationDocumentComponent>,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    public globals: Globals,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private spinner: NgxSpinnerService) {

    DecoupledEditor
    .create( document.querySelector( '#Editor' ), {
        removePlugins: [ 'exportPdf', 'Link' ],
        toolbar: [ 'bold', 'italic', 'bulletedList', 'numberedList', 'blockQuote' ]
    } )
    .catch( error => {
      if (environment.debug) {
        console.log( error );
      }
    } );
  }

  ngOnInit() {
    this.addAuthorizationDocumentGroup = this.formBuilder.group({
      tipoForm: new FormControl('', [
        Validators.required,
      ]),
      fechaEntregaForm: new FormControl('', [
      ]),
      fechaCaducidadForm: new FormControl('', [
      ]),
      caducidad: new FormControl('', [
      ]),
      observacionesForm: new FormControl('', [
      ]),
      attachment: new FormControl(null)
    });
    if (this.addAuthorizationDocumentGroup.controls['caducidad'].value) {
      this.addAuthorizationDocumentGroup.controls['fechaCaducidadForm'].disable();
    }

    this.spinner.show();
    // Cargar datos del Documento
    this.loadDocumentData();
    this.spinner.hide();
  }

  loadDocumentData() {
    this.workerData = this.data.workerData;
    this.authorizationTypesList = this.data.authorizationTypesList;
    this.editAuthData = this.data.editAuthData;
    this.newAuthorization.idtrabajador = this.workerData.idTrabajador;
    this.newAuthorization.idcliente = this.workerData.empresa.idEmpresa;
    this.newAuthorization.borrado = 0;

    if (this.editAuthData !== undefined) {
      // this.populateEditAutData();
    }
  }

  populateEditAutData():void {
    this.newAuthorization.idautorizaciontrabajador = this.editAuthData.idautorizaciontrabajador;
    this.newAuthorization.idtrabajador =  this.editAuthData.idtrabajador;
    this.newAuthorization.idcliente = this.editAuthData.idcliente;
    this.newAuthorization.autorizaciontipo = this.editAuthData.autorizaciontipo;
    this.newAuthorization.observaciones = this.editAuthData.observaciones;
    this.newAuthorization.fechaentrega =  this.editAuthData.fechaentrega;
    this.newAuthorization.fechacaducidad = this.editAuthData.fechacaducidad;
    this.newAuthorization.activo = this.editAuthData.activo;

    this.newAuthorization.nombre = this.editAuthData.name;
    this.newAuthorization.tipomyme = this.editAuthData.extension;
    this.newAuthorization.nombreUnico = this.editAuthData.uniqueName;
    this.newAuthorization.borrado = this.editAuthData.isRemoved;
    this.newAuthorization.fechacreacion = this.editAuthData.creationDate;
    this.newAuthorization.usuariocreador = this.editAuthData.createdBy;
    this.newAuthorization.fechaultimaedicion = this.editAuthData.modifiedDate;
    this.newAuthorization.usuarioultimaedicion = this.editAuthData.modifiedBy;
    this.newAuthorization.anyo = this.editAuthData.anyo;
    this.newAuthorization.file = this.editAuthData.file;
    this.newAuthorization.firmaElectronica = this.editAuthData.firmaElectronica;
    this.newAuthorization.fileFlag = this.editAuthData.fileFlag;

    const file = {name: this.newAuthorization.nombre, type: "application/pdf"};
    this.fileList.push(file);
  }

  disableAnimation = true;
  ngAfterViewInit(): void {
    setTimeout(() => this.disableAnimation = false);
  }
  check() {
    if (this.addAuthorizationDocumentGroup.controls['caducidad'].value) {
      this.addAuthorizationDocumentGroup.controls['fechaCaducidadForm'].disable();
    } else {
      this.addAuthorizationDocumentGroup.controls['fechaCaducidadForm'].enable();
    }
  }

  hasFile() {
    return this.addAuthorizationDocumentGroup.get('attachment').value !== null;
  }
  deleteFile() {
    this.addAuthorizationDocumentGroup.controls.attachment.setValue(null);
  }
  handleFileInput(e) {
    this.addAuthorizationDocumentGroup.controls.attachment.setValue(e.target.files[0]);
  }
  disabledSendButton(): boolean {
    return (
      this.addAuthorizationDocumentGroup.invalid
    );
  }
  onFileListChange(event) {
    console.log(event);
    this.fileList = JSON.parse(JSON.stringify(event));
    if (event.length > 0) {
      this.newAuthorization.nombre = event[0].name.split('.').slice(0, -1).join('.');
      this.newAuthorization.nombreUnico = event[0].name;
      this.newAuthorization.tipomyme = '.' + event[0].name.split('.').slice(-1);

      this.getBase64(event[0]).then(
        data => {
            this.newAuthorization.file = data;
        }
      );
    } else {
      this.newAuthorization.nombre = null;
      this.newAuthorization.nombreUnico = null;
      this.newAuthorization.tipomyme = null;
      this.newAuthorization.file = null;
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
  closeModal(): void {
    this.dialogRef.close();
  }
}
