import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {Globals} from '../../globals';
import {UtilsService} from '../../../services/utils.service';
import {MatSort} from '@angular/material/sort';
import {CustomerService} from '../../../services/customer.service';
import {QueryLine} from '../../../Model/QueryLine';
import {Query} from '../../../Model/Query';
import {QueryLineByAttachments} from '../../../Model/QueryLineByAttachments';
import {NgxSpinnerService} from 'ngx-spinner';
import {Router} from '@angular/router';

@Component({
  selector: 'app-nueva-consulta',
  templateUrl: './nueva-consulta.component.html',
  styleUrls: ['./nueva-consulta.component.css']
})
export class NuevaConsultaComponent implements OnInit {
  query: Query = new Query();
  newQuery: FormGroup;
  files: File[];
  file: File;
  validQuery: boolean;
  queryLine: QueryLine = new QueryLine();
  queryLineByAttachments: QueryLineByAttachments[] = new Array <QueryLineByAttachments> ();

  tableHeaders: string[] = [
    'nombre',
    'puesto',
    'email',
    'telefono',
    'titulo',
    'descripcion'
  ];

  constructor(
    public dialogRef: MatDialogRef<NuevaConsultaComponent>,
    private formBuilder: FormBuilder,
    public translate: TranslateService,
    private spinner: NgxSpinnerService,
    private router: Router,
    public globals: Globals,
    public utils: UtilsService,
    @Inject(MAT_DIALOG_DATA) public data:any,
    private customerService: CustomerService
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.newQuery = this.formBuilder.group({
      nombre: new FormControl('', Validators.required),
      puesto: new FormControl('', Validators.required),
      email: new FormControl('', Validators.required),
      telefono: new FormControl('', Validators.required),
      titulo: new FormControl('', Validators.required),
      descripcion: new FormControl('', Validators.required),
      fileFormControl: new FormControl(),
      urgente: new FormControl('1')
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  // this method validate Query
  validateQuery(form: FormGroup): boolean {
    this.validQuery = true;
    const workerPhone = new RegExp('^[9|8|7|6]?[0-9]{9}$');
    const workerEmail = new RegExp('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$');

    // check for the worker
    if (this.newQuery.value.nombre === null || this.newQuery.value.nombre === ''
      || this.newQuery.value.nombre === undefined) {
      form.controls.nombre.setErrors({emptyField: true});
      this.validQuery = false;
    } else if (this.newQuery.value.nombre.length > 150) {
      form.controls.nombre.setErrors({maxlength: true});
      this.validQuery = false;
    }

    if (this.newQuery.value.puesto === null || this.newQuery.value.puesto === ''
      || this.newQuery.value.puesto === undefined) {
      form.controls.puesto.setErrors({emptyField: true});
      this.validQuery = false;
    } else if (this.newQuery.value.puesto.length > 150) {
      form.controls.puesto.setErrors({maxlength: true});
      this.validQuery = false;
    }

    if (this.newQuery.value.email === null || this.newQuery.value.email === ''
      || this.newQuery.value.email === undefined) {
      form.controls.email.setErrors({emptyField: true});
      this.validQuery = false;
    }

    else if (this.newQuery.value.email.length >80) {
      form.controls.email.setErrors({maxlength: true});
      this.validQuery = false;
    } else if (!workerEmail.test(this.newQuery.value.email)) {
      form.controls.email.setErrors({pattern: true});
      this.validQuery = false;
    }

    if (this.newQuery.value.telefono === null || this.newQuery.value.telefono === ''
      || this.newQuery.value.telefono === undefined) {
      form.controls.telefono.setErrors({emptyField: true});
      this.validQuery = false;
    } else if (!workerPhone.test(this.newQuery.value.telefono)) {
      form.controls.telefono.setErrors({pattern: true});
      this.validQuery = false;
    } else if (this.newQuery.value.telefono.length >15) {
      form.controls.telefono.setErrors({maxlength: true});
      this.validQuery = false;
    }

    if (this.newQuery.value.titulo === null || this.newQuery.value.titulo === ''
      || this.newQuery.value.titulo === undefined) {
      form.controls.titulo.setErrors({emptyField: true});
      this.validQuery = false;
    } else if (this.newQuery.value.titulo.length >150) {
      form.controls.titulo.setErrors({maxlength: true});
      this.validQuery = false;
    }

    if (this.newQuery.value.descripcion === null || this.newQuery.value.descripcion === ''
      || this.newQuery.value.descripcion === undefined) {
      form.controls.descripcion.setErrors({emptyField: true});
      this.validQuery = false;
    }

    if (this.newQuery.value.urgente === null || this.newQuery.value.urgente === undefined) {
      form.controls.urgente.setErrors({emptyField: true});
      this.validQuery = false;
    }
    return this.validQuery;
  }

  enviar(datos: FormGroup){

    this.query.title = datos.value.titulo;
    this.query.worker = datos.value.nombre;
    this.query.priority = datos.value.urgente;
    this.query.workerEmail = datos.value.email;
    this.query.workerPhone = datos.value.telefono;
    this.query.workerPosition = datos.value.puesto;
    this.queryLine.message = datos.value.descripcion;

    this.query.queryStatus.id = 1;

    this.queryLine.extranet = 1;

    if(this.query.lines.length == 0){
      this.query.lines.push(this.queryLine);
    }

    let formData = new FormData();

    formData.append('query', JSON.stringify(this.query));

    if(this.files != undefined)
      for (let i = 0; i < this.files.length; i++) {
        formData.append('attachedFile' + i, this.files[i], this.files[i].name);
      }

    this.spinner.show();
    this.customerService.saveQuery(Number(sessionStorage.getItem('customerId')), this.query, this.files, formData, JSON.parse(localStorage.getItem('userDataFromUsuario')).idUsuario).subscribe(
      data => {
        this.spinner.hide();
        this.onNoClick();
      }, error => {
        this.spinner.hide();
        this.onNoClick();
      }
    );
  }

  handleFileInput(files: FileList) {

    const queryLineByAttachments: QueryLineByAttachments = new QueryLineByAttachments ();
    this.files = Array.from(files);
    let tamTotalArchivos = 0;
    for (var i = 0; i < this.files.length; i++) {
      tamTotalArchivos = tamTotalArchivos + this.files[i].size;
      queryLineByAttachments.attachmentName = this.files[i].name;
      queryLineByAttachments.attachmentContentType = this.files[i].type;
      this.queryLineByAttachments.push(queryLineByAttachments);
      this.queryLine.queryLineByAttachments = this.queryLineByAttachments;
    }

    if (tamTotalArchivos > this.globals.extranet_limite_adjuntos){ //20971520 Bytes
      //Inicializamos los ficheros
      this.newQuery.controls["fileFormControl"].setValue([]);
      this.files = [];

      let titulo = "Los archivos adjuntos superan el límite de 20MB";
      this.translate.get('ARCHIVOS_ADJUNTOS_LIMITE').subscribe((res: string) => {
        titulo = res;
      });

      this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
    }
  }
}
