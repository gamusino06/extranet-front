import { environment } from '../../../../../environments/environment';
import {Component, OnInit} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { UtilsService } from 'src/app/services/utils.service';
import { TranslateService } from '@ngx-translate/core';
import { Globals } from '../../../globals';
import { NgxSpinnerService } from 'ngx-spinner';
import * as _moment from 'moment';
import {ReportsService} from '../../../../services/reports.service';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import Swal from 'sweetalert2';

const moment = _moment;

@Component({
  selector: 'app-modal-nuevo-informe-pt',
  templateUrl: './modal-nuevo-informe-pt.component.html',
  styleUrls: ['./modal-nuevo-informe-pt.component.css']
})
export class ModalNuevoInformePtComponent implements OnInit {

  environment = environment;
  loading = false;
  submitted = false;
  value: any;
  idEmpresa: any;
  idCentro: any;
  tipoDocumentoList: any;
  subTipoDocumentoList: any;
  modalNuevoInformeForm: FormGroup;
  extensionDocumento: any;
  file: any;
  toCreateDocs: File[];

  validObserva = this.globals.observePattern;

  constructor(
    public dialogRef: MatDialogRef<ModalNuevoInformePtComponent>,
    private formBuilder: FormBuilder,
    private modal: MatDialog,
    private userService: UserService,
    public utils: UtilsService,
    public reportsService: ReportsService,
    private spinner: NgxSpinnerService,
    public translate: TranslateService,
    public globals: Globals
  ) { }

  ngOnInit() {
    this.initForm();
    this.getTipoDocumento();
    this.getSubTipoDocumento();
  }

  initForm() {
    this.modalNuevoInformeForm = this.formBuilder.group({
      tipoDocForm: new FormControl('', [Validators.required]),
      subTipoDocForm: new FormControl('', [Validators.required]),
      fechaCreacionForm: new FormControl(moment(), [Validators.required]),
      descripcionForm: new FormControl('', [Validators.required]),
      file: new FormControl(null, [Validators.required])
    });

    this.toCreateDocs = [];
    this.setInitDates();
    this.setInitDoc();
  }

  setInitDoc() {
    this.modalNuevoInformeForm.controls.tipoDocForm.setValue(107);
  }
  setInitDates() {
    const now = new Date();
    this.modalNuevoInformeForm.controls.fechaCreacionForm.setValue(now);
  }


  getTipoDocumento() {
    this.userService.getSubtiposDocumento([this.globals.informes_tecnicos]).subscribe(result => {
      if (result) {
        this.tipoDocumentoList = result.filter(val => val.idTipoDocumento.toString() === this.globals.documentacion_propia_pt );

        if (this.tipoDocumentoList.length === 1) {
          this.modalNuevoInformeForm.controls.tipoDocForm.setValue(this.tipoDocumentoList[0].idTipoDocumento);
        }
      } else {
        this.spinner.hide();
      }
    }, (error => {
      if (environment.debug) { console.log('Error al cargar los tipos de documento: ' + error); }
    }));
  }

  getSubTipoDocumento() {
    this.userService.getSubtiposDocumento([this.globals.documentacion_propia_pt]).subscribe(result => {
      if (result) {
        this.subTipoDocumentoList = result;
      } else {
        this.spinner.hide();
      }
    }, (error => {
      if (environment.debug) { console.log('Error al cargar los subtipos de documento: ' + error); }
    }));
  }

  accept() {
    // inserción en bbdd, recordar que hay que insertar en la tabla de histórico
    const data = {
      fkEmpresa: this.idEmpresa,
      fkCentro: this.idCentro,
      nombreDocumento: this.modalNuevoInformeForm.controls.descripcionForm.value,
      idfamilia: this.modalNuevoInformeForm.controls.tipoDocForm.value,
      idsubfamilia: this.modalNuevoInformeForm.controls.subTipoDocForm.value,
      idUsuario: JSON.parse(localStorage.userDataFromUsuario).idUsuario,
      fechaGeneracion: this.modalNuevoInformeForm.controls.fechaCreacionForm.value,
      // nombreFichero: 'pruebas',
      // extensionFichero: 'pdf',
      extensionFichero: this.extensionDocumento,
      archivo64: this.file
    };


    let titulo = '';
    this.spinner.show();

    this.reportsService.setNewReport(data).subscribe(
      () => {
        titulo = this.utils.translateText('DOCUMENTACION_PROPIA.DOCUMENTO_GUARDADO', 'Documento guardado con éxito');
        // this.utils.mostrarMensajeSwalFire('success', titulo, '','var(--blue)', false);

        Swal.fire({
          icon: 'success',
          title: titulo,
          confirmButtonColor: 'var(--blue)',
          allowOutsideClick: false
        }).then((result) => {
          if (result.isConfirmed) {
            this.dialogRef.close(true);
          }
        });
      },
        error => {
          console.error(error);
          titulo = this.utils.translateText('ERROR', 'Se ha producido un error');

          Swal.fire({
            icon: 'error',
            title: titulo,
            confirmButtonColor: 'var(--blue)',
            allowOutsideClick: false
          });

          // this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
        },
        () => {
          this.spinner.hide();
        }
    );

  }

  handleFileInput(e) {

    if (this.toCreateDocs.length !== 0) {
      this.extensionDocumento = this.toCreateDocs[0].name.split('.').slice(-1);

      this.getBase64(this.toCreateDocs[0]).then(
        data => {
          this.file = data;
        }
      );

      this.modalNuevoInformeForm.controls.file.setValue(this.toCreateDocs[0]);
    } else {
      this.extensionDocumento = null;
      this.file = null;
      this.modalNuevoInformeForm.controls.file.setValue(null);
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

  onFileAddError(error): void {
    let titulo = 'El fichero no cumple el formato establecido';
    this.translate.get('DOCUMENTACION_PROPIA.FORMAT.NOT_VALID').subscribe((res: string) => {
      titulo = res;
    });
    this.utils.mostrarMensajeSwalFire('error', titulo, '', 'var(--blue)', false);
  }

  cancel() {
    this.modal.closeAll();
  }

  cerrarModal() {
    this.modal.closeAll();
  }

}


