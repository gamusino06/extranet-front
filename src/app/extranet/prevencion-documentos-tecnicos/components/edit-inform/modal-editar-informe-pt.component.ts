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
  selector: 'app-modal-editar-informe-pt',
  templateUrl: './modal-editar-informe-pt.component.html',
  styleUrls: ['./modal-editar-informe-pt.component.css']
})
export class ModalEditarInformePtComponent implements OnInit {

  environment = environment;
  loading = false;
  submitted = false;
  dataToEdit: any;
  idEmpresa: any;
  idCentro: any;
  tipoDocumentoList: any;
  subTipoDocumentoList: any;
  modalEditarInformeForm: FormGroup;

  validObserva = this.globals.observePattern;

  constructor(
    public dialogRef: MatDialogRef<ModalEditarInformePtComponent>,
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
    this.setEditableValues();
  }

  initForm() {
    this.modalEditarInformeForm = this.formBuilder.group({
      tipoDocForm: new FormControl('', [Validators.required]),
      subTipoDocForm: new FormControl('', [Validators.required]),
      fechaCreacionForm: new FormControl('', [Validators.required]),
      descripcionForm: new FormControl('', [Validators.required])
    });


  }

  setInitDates() {
    const now = new Date();
    this.modalEditarInformeForm.controls.fechaCreacionForm.setValue(now);
  }

  setEditableValues() {
    // debugger;
    this.modalEditarInformeForm.controls.tipoDocForm.setValue(this.dataToEdit.idTipoDocumento);
    this.modalEditarInformeForm.controls.subTipoDocForm.setValue(this.dataToEdit.idSubtipoDocumento);
    this.modalEditarInformeForm.controls.fechaCreacionForm.setValue(this.dataToEdit.fecha);
    this.modalEditarInformeForm.controls.descripcionForm.setValue(this.dataToEdit.documento);
  }


  getTipoDocumento() {
    this.userService.getSubtiposDocumento([this.globals.informes_tecnicos]).subscribe(result => {
      if (result) {
        this.tipoDocumentoList = result.filter(val => val.idTipoDocumento.toString() === this.globals.documentacion_propia_pt );
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
      nombreDocumento: this.modalEditarInformeForm.controls.descripcionForm.value,
      idfamilia: this.modalEditarInformeForm.controls.tipoDocForm.value,
      idsubfamilia: this.modalEditarInformeForm.controls.subTipoDocForm.value,
      idUsuario: JSON.parse(localStorage.userDataFromUsuario).idUsuario,
      fechaGeneracion: this.modalEditarInformeForm.controls.fechaCreacionForm.value
    };


    let titulo = '';
    this.spinner.show();

    // debugger;

    this.reportsService.updateReport(this.dataToEdit.idDocumento, data).subscribe(
      () => {
        titulo = this.utils.translateText('DOCUMENTACION_PROPIA.DOCUMENTO_EDITADO', 'Documento editado con éxito');

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
        },
        () => {
          this.spinner.hide();
        }
    );

  }

  cancel() {
    this.modal.closeAll();
  }

  cerrarModal() {
    this.modal.closeAll();
  }

}


