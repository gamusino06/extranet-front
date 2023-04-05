import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {isUndefined} from 'util';
import {MatTableDataSource} from '@angular/material/table';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {CustomerService} from '../../services/customer.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {UtilsService} from '../../services/utils.service';
import {TranslateService} from '@ngx-translate/core';
import {Globals} from '../globals';
import {MatSort} from '@angular/material/sort';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {DescargaArchivoComponent} from '../consultas-prl/descarga-archivo/descarga-archivo.component';
import {DescargaDocComponent} from './descarga-doc/descarga-doc.component';
import * as _moment from 'moment';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {MY_FORMATS} from '../../../config/config';
import {map} from "rxjs/operators";
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';


const moment = _moment;

export interface Documentos {
  fechaRegistro: string;
  nombreDocumento: string;
  tipoDocumento: string;
}

@Component({
  selector: 'app-documentacion-juridica',
  templateUrl: './documentacion-juridica.component.html',
  styleUrls: ['./documentacion-juridica.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class DocumentacionJuridicaComponent implements OnInit {
  cleanImgUrl = '../../assets/img/borrar_filtros.svg';
  searchImgUrl = '../../assets/img/search.svg';
  excelImgUrl = '../../assets/img/excel.svg';
  mailImgUrl = '../../assets/img/mail.svg';
  downloadImgUrl = '../../assets/img/download.svg';

  documentosForm: FormGroup;
  userForm: FormGroup;
  maxDate: Date;
  minDate: Date;
  dataSource: MatTableDataSource<Documentos>;
  documentos: any[];
  error: boolean;
  archivoSeleccionado: number = 0;
  documentoVista: any = null;
  documentosAdjuntos: any = null;

  @ViewChild(MatSort) sort: MatSort;

  tableHeaders: string[] = [
    'documentoId',
    'fechaRegistro',
    'nombreDocumento',
    'tipoDocumento'
  ];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private cdRef:ChangeDetectorRef,
    public utils: UtilsService,
    public translate: TranslateService,
    public dialog: MatDialog,
    public globals: Globals,
    private customerService: CustomerService
  ) {
    this.sacarId();
  }

  ngOnInit(): void {
    this.initForm();
    this.getDocumentos(this.documentosForm);
  }

  initForm() {
    this.documentosForm = this.formBuilder.group({
      filter_name: new FormControl(),
      filter_from: new FormControl(),
      filter_to: new FormControl()
    });
  }

  /**
   * Metodo para obtener todos los documentos segun el id
   * @param dataForm
   */
  getDocumentos(dataForm: FormGroup) {
    this.archivoSeleccionado = 0;
    this.documentoVista = null;

    let filtros = '&documentType=1';

    if(dataForm.value.filter_name != null){
        filtros += '&criterion=' + dataForm.value.filter_name;
    }

    if(dataForm.value.filter_from != null){
      let anio = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(dataForm.value.filter_from);
      let mes = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(dataForm.value.filter_from);
      let dia = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(dataForm.value.filter_from);

      filtros += '&from=' + anio+'-'+mes+'-'+dia;
    }

    if(dataForm.value.filter_to != null){
      let anio2= new Intl.DateTimeFormat('en', { year: 'numeric' }).format(dataForm.value.filter_to);
      let mes2 = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(dataForm.value.filter_to);
      let dia2 = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(dataForm.value.filter_to);

      filtros += '&to=' + anio2+'-'+mes2+'-'+dia2;
    }

    this.spinner.show();
    this.customerService.getDocumentsByFilter(parseInt(sessionStorage.getItem('customerId')), 1, this.translate.getDefaultLang(), filtros)
      .subscribe(data => {
        this.documentos = data;
        this.spinner.hide();

        const documentos: any[] = [];
        for(let documento of this.documentos){
          documentos.push({
            documentoId: documento.id,
            fechaRegistro: documento.created,
            nombreDocumento: documento.name,
            tipoDocumento: documento.documentType.denomination
          })
        }

        if(documentos.length == 0)
          this.error == true;

        this.route.paramMap
          .pipe( map( () => window.history.state))
          .subscribe( state => {
            if (this.documentos.length <= 0 || !this.documentos.some(documento => documento.id === state.id))
              return false;
            if (state.selected)
              this.verDocumento(state.id);
          });
        this.dataSource = new MatTableDataSource(documentos);
        this.dataSource.sort = this.sort;
      }, error => {
        this.utils.mostrarMensajeSwalFire('error', "Ha ocurrido un error al intentar obtener los documentos", '','var(--blue)', false);
        this.error = true;
        this.spinner.hide();
      });
  }

  /**
   * Metodo que recoge la información del documento segun su ID
   * @param idDocumento
   */
  verDocumento(idDocumento: number){
    let documentoElegido;
    for(let documento of this.documentos){
      if(documento.id == idDocumento)
        documentoElegido = documento;
    }

    this.spinner.show();
    this.customerService.findAllAttachments(idDocumento, Number(sessionStorage.getItem('customerId'))).subscribe(data => {
      this.documentosAdjuntos = data;
    }, error => {
      this.utils.mostrarMensajeSwalFire('error', "Ha ocurrido un error al intentar obtener loa información solicitada", '','var(--blue)', false);
      this.spinner.hide();
    })

    this.customerService.getDocumentById(idDocumento, documentoElegido.documentType.id, this.translate.getDefaultLang(), parseInt(sessionStorage.getItem('customerId')))
      .subscribe(data =>{
        this.documentoVista = data[0].doc;

        this.archivoSeleccionado = idDocumento;
        this.spinner.hide();
      }, error => {
        this.utils.mostrarMensajeSwalFire('error', "Ha ocurrido un error al intentar obtener la información solicitada", '','var(--blue)', false);
        this.spinner.hide();
      })
  }

  /**
   * Metodo para abrir el modal de archivos adjuntos
   */
  descargarAtachment(){
    let datos = {
      documents: this.documentosAdjuntos,
      documentoPadre: this.documentoVista
    }

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = datos;
    dialogConfig.width = "40%";
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;

    const dialogRef = this.dialog.open(DescargaDocComponent, dialogConfig);
  }

  sacarId(){
    if(!sessionStorage.getItem('customerId') || isUndefined(sessionStorage.getItem('customerId')))
      this.router.navigate(['extranet/juridico']);
  }

  get numeroCustomers(){
    return sessionStorage.getItem('customerQuantities');
  }

  drop(event: CdkDragDrop<string[]>) {

    moveItemInArray(this.tableHeaders, event.previousIndex, event.currentIndex);
    let objToSave: object = {};

    if (localStorage.getItem('tableColsOrder')) {
      objToSave = JSON.parse(localStorage.getItem('tableColsOrder'));
    }
    objToSave[this.constructor.name + 'IA'] = this.tableHeaders;
    localStorage.setItem('tableColsOrder', JSON.stringify(objToSave));

  }

}
