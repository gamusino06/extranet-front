import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { environment } from '../../../environments/environment';
import {isUndefined} from 'util';
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {TranslateService} from "@ngx-translate/core";
import {CustomerService} from "../../services/customer.service";
import {NgxSpinnerService} from "ngx-spinner";
import {map} from "rxjs/operators";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {DescargaDocComponent} from "../documentacion-juridica/descarga-doc/descarga-doc.component";
import {saveAs} from 'file-saver';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {MY_FORMATS} from '../../../config/config';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

export interface Documento {
  id: number;
  fechaRegistro: string;
  nombreDocumento: string;
  tipoDocumento: string;
}

export interface Attached {
  id: number;
  name: string;
  url: string;
  type: string;
}

@Component({
  selector: 'app-documentacion-general',
  templateUrl: './documentacion-general.component.html',
  styleUrls: ['./documentacion-general.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class DocumentacionGeneralComponent implements OnInit {
  environment = environment;
  maxDate: Date;
  minDate: Date;
  cleanImgUrl = '../../assets/img/borrar_filtros.svg';
  searchImgUrl = '../../assets/img/search.svg';
  excelImgUrl = '../../assets/img/excel.svg';
  mailImgUrl = '../../assets/img/mail.svg';
  downloadImgUrl = '../../assets/img/download.svg';

  documentacionForm: FormGroup;
  types = [
    {id: 0, value: "TODOS"},
    {id: 4, value: "RECOMENDACIONES_PRL"},
    {id: 5, value: "NOVEDADES_JURIDICAS_PRL"},
    {id: 6, value: "AYUDAS_PRL"},
    {id: 7, value: "OTROS"}
  ];
  documentos: Documento[];
  attachments: Attached[];
  dataSource: MatTableDataSource<Documento>;
  attachedDataSource: MatTableDataSource<Attached>;
  @ViewChild(MatSort) sort: MatSort;

  error: boolean;
  selected = false;
  selectedId: number;
  documentSelected: Documento;

  tableHeaders: string[] = [
    'documento',
    'fechaRegistro',
    'nombreDocumento',
    'tipoDocumento'
  ];
  attachedHeaders: string[] = [
    'download',
    'attached'
  ];

  numeroCustomers = sessionStorage.getItem('customerQuantities');

  constructor(
              private router: Router,
              private route: ActivatedRoute,
              public translate: TranslateService,
              private formBuilder: FormBuilder,
              private spinner: NgxSpinnerService,
              private customerService: CustomerService) {
    this.sacarId();
  }

  ngOnInit(): void {
    this.error = false;
    this.initForm();
    this.getDocuments();
  }

  /**
   * Inicia los campos del formulario
   */
  initForm() {
    this.documentacionForm = this.formBuilder.group({
      name: new FormControl(),
      type: new FormControl(0),
      from: new FormControl(),
      to: new FormControl()
    });
  }

  /**
   * Reestablece los valores por defecto del formulario
   */
  resetForm() {
    this.documentacionForm.reset({
      type: 0
    });
  }

  /**
   * Obtiene los resultados según los filtros
   */
  getDocuments() {
    this.spinner.show();
    this.customerService.getDocumentsByFilter(parseInt(sessionStorage.getItem('customerId')), 0, this.translate.getDefaultLang(), this.getFilters())
      .subscribe( data => {
        this.documentos = [];
        if(data != null)
          data.map( document => {
            this.documentos.push({
              id: document.id,
              fechaRegistro: document.date,
              nombreDocumento: document.name,
              tipoDocumento: document.documentType.denomination
            });
          });
        this.spinner.hide();
        this.route.paramMap
          .pipe( map( () => window.history.state))
          .subscribe( state => {
            if (this.documentos.length <= 0 || !this.documentos.some(documento => documento.id === state.id))
              return false;
            this.selected = state.selected;
            this.selectedId = state.id;
            if (this.selected)
              this.selectDocument(this.selectedId);
          });
        this.dataSource = new MatTableDataSource(this.documentos);
        this.dataSource.sort = this.sort;
      }, error => {
        console.error(error);
        this.error = true;
        this.spinner.hide();
      });
  }

  /**
   * Obtiene los filtros realizados por el usuario
   */
  getFilters(){

    return `&criterion=${this.documentacionForm.get('name').value == null ? '' :
        this.documentacionForm.get('name').value}` +
      `&documentType=${this.documentacionForm.get('type').value == null ? 0 :
        this.documentacionForm.get('type').value}` +
      `&from=${this.documentacionForm.get('from').value == null ? '' :
        this.documentacionForm.get('from').value.toISOString().substr(0, 10)}` +
      `&to=${this.documentacionForm.get('to').value == null ? '' :
        this.documentacionForm.get('to').value.toISOString().substr(0, 10)}`

  }

  /**
   * Selecciona un documento para acceder a su vista detallada
   */
  selectDocument(id: number){
    this.selected = true;
    this.documentos.map( documento => {
      if(documento.id == id)
        this.documentSelected = documento;
    });
    this.getAttached(id);
  }

  /**
   * Obtiene los documentos adjuntos
   */
  getAttached(id: number){
    this.spinner.show();
    this.customerService.findAllAttachments(id, Number(sessionStorage.getItem('customerId')))
      .subscribe( data => {
        // console.table(data)
        this.attachments = [];
        if(data != null)
          data.map( attached => {
            this.attachments.push({
              id: attached.id,
              name: attached.attachedName,
              url: attached.attachedUrl,
              type: attached.attachedContentType
            });
          });
        this.spinner.hide();
        this.attachedDataSource = new MatTableDataSource(this.attachments);
        this.attachedDataSource.sort = this.sort;
      }, error => {
        console.error(error);
        this.error = true;
        this.spinner.hide();
      });
  }

  /**
   * Vuelve al listado de documentos
   */
  returnToDocuments() {
    this.selected = false;
    this.documentSelected = undefined;
  }

  /**
   * Metodo para abrir el modal de archivos adjuntos
   */
  downloadAtachment(id: number, attachedName: string){
    this.spinner.show();
    let blob = null;
    this.customerService.downloadDocument(id, Number(sessionStorage.getItem('customerId')))
      .subscribe(data => {
        blob = new Blob([data], {type: 'application/*'});
        const fileURL = URL.createObjectURL(blob);
        saveAs(blob, attachedName);
        this.spinner.hide();
      }, error => {
        if (environment.debug) console.log(error);
        this.spinner.hide();
      });
  }

  sacarId(){
    if(!sessionStorage.getItem('customerId') || isUndefined(sessionStorage.getItem('customerId')))
      this.router.navigate(['extranet/juridico']);
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
