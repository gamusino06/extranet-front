import { animate, state, style, transition, trigger } from '@angular/animations';
import { environment } from '../../../environments/environment';
import { Component, EventEmitter, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Message } from 'src/app/Model/Message/Message';
import { UserService } from 'src/app/services/user.service';
import { DATE_TIME_FORMAT } from '../../../config/config';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { UtilsService } from 'src/app/services/utils.service';
import { TranslateService } from '@ngx-translate/core';
import { ChangeDetectorRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Documento } from 'src/app/Model/Documento';
import { Globals } from '../globals';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MY_FORMATS } from '../../../config/config';
import * as _moment from 'moment';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

export interface messageInterface {
  idMensaje: number;
  adjuntos: Documento[];
  fechaMensaje: Date;
  asunto: string;

  //fechaInicio: Date,
  //fechaFin: Date,
  tipoMensaje: string;
  idTipoMensaje: number;
  categoriaMensaje: string;
  subcategoriaMensaje: string,
  estadoMensaje: string;
  idEstadoMensaje: number;
  mensaje: SafeHtml;
  from: any;
  origen: boolean; // 0 - Mensaje; 1 - Comunicacion
  to: any[];
  cc: any[];

  expandedVisible: boolean;
}

export interface MessagesFilterDto {
  fechaInicio: Date,
  fechaFin: Date,
  listaIdTipos: [],
  listaIdCategorias: [],
  listaIdSubcategorias: [],
}

export interface Data {
  asunto: string,
  mensaje: string
}

//const ELEMENT_DATA: BuscadorMessageInterface[] = []

@Component({
  selector: 'app-message-center',
  templateUrl: './message-center.component.html',
  styleUrls: ['./message-center.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [
      { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
      { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ],
})

export class MessageCenterComponent implements OnInit {
  cleanImgUrl = '../../assets/img/borrar_filtros.svg';
  searchImgUrl = '../../assets/img/search.svg';
  environment = environment;
  DATE_FORMAT = DATE_TIME_FORMAT;
  messageForm: FormGroup;
  messageList: Message[];
  tiposList: any;
  categoriasList: any;
  subCategoriasList: any;
  maxDate: Date;
  minDate: Date;

  asuntoMensaje: string;
  mensaje: string;
  isLoginSimulado: boolean = false;

  resultado: messageInterface[];

  mostrarTabla: boolean;
  today = new Date().getDate();

  tableHeaders: string[] = ['fechaMensaje', 'tipoMensaje', 'categoriaMensaje', 'subcategoriaMensaje', 'enviadoPor', 'ver'];

  dataSource: MatTableDataSource<messageInterface>;

  //@ViewChild('sort', { static: false }) sort: MatSort;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @Output() mensajeLeido = new EventEmitter<boolean>();

  expandedElement: any;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    public utils: UtilsService,
    private modalMensaje: MatDialog,
    private sanitized: DomSanitizer,
    private spinner: NgxSpinnerService,
    public translate: TranslateService,
    public globals: Globals,
    private cdRef:ChangeDetectorRef
  ) { }

  //Evita que se produzca el ERROR Error: ExpressionChangedAfterItHasBeenCheckedError
  ngAfterViewChecked()
  {
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    //En el caso de que se esté realizando un loginSimulado, no tendrá que guardarse
    let loginSimulado = localStorage.getItem("loginSimulado");
    if (loginSimulado !== null && loginSimulado === "true")
      this.isLoginSimulado = true;

    //set to empty
    this.dataSource = new MatTableDataSource();

    this.messageForm = this.formBuilder.group({
      fechaInicioForm: new FormControl(''),
      fechaFinForm: new FormControl(''),
      tipoForm: new FormControl(''),
      categoriaForm: new FormControl(''),
      subcategoriaFrom: new FormControl(''),
    });

    this.setInitDates();
    this.spinner.show();
    this.getTiposMensajes();
    this.getCategoriasMensaje();
    //this.getSubcategoriasMensaje();
    /*datos de tabla*/
    //this.dataSource = new MatTableDataSource<BuscadorMessageInterface>(ELEMENT_DATA);
    //this.dataSource.sort = this.sort;
    //this.dataSource.paginator = this.paginator;

    this.mostrarTabla = false;
    //Restore table cols order
    this.initColsOrder();
    this.spinner.hide();
    //this.getMensajes(); //getMensajes() se llama ahora desde el método 'getSubcategoriasMensaje()'
  }

  myFilter = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay();
    return day !== this.today;
  }

  onSubmit(): void {
    this.getMensajes();
  }

  initForm() {
    this.messageForm = this.formBuilder.group({
      fechaInicioForm: new FormControl(''),
      fechaFinForm: new FormControl(''),
      tipoForm: new FormControl(''),
      categoriaForm: new FormControl(''),
      subcategoriaFrom: new FormControl(''),
    });
    this.setInitDates();
  }

  initColsOrder() {
    if (localStorage.getItem('tableColsOrder')) {
      let localStorageObj: object;
      localStorageObj = JSON.parse(localStorage.getItem('tableColsOrder'));
      if (localStorageObj[this.constructor.name] &&
        Array.isArray(localStorageObj[this.constructor.name]) &&
        localStorageObj[this.constructor.name].length == this.tableHeaders.length)
        this.tableHeaders = localStorageObj[this.constructor.name];
    }
  }

  setInitDates() {
    let dateInicio = new Date();
    dateInicio.setMonth(dateInicio.getMonth() - 6);
    dateInicio.setHours(0, 0, 0);
    let dateFin = new Date();
    dateFin.setHours(23, 59, 59);
    this.messageForm.get('fechaInicioForm').setValue(dateInicio);
    this.messageForm.get('fechaFinForm').setValue(dateFin);
    var nYearsAgo = new Date(this.globals.extranet_fecha_mas_antigua);
    this.maxDate = dateFin;
    this.minDate = dateInicio;
  }

  setDefaultForm(): void {
    // SET DATE INI AND END
    this.setInitDates();

    // Set de formularios
    this.messageForm.controls['tipoForm'].setValue("");
    this.messageForm.controls['categoriaForm'].setValue([]);
    this.messageForm.controls['subcategoriaFrom'].setValue([]);
  }

  resetForm(): void {
    setTimeout(() => { //setTimeout needed on form reset
      this.setDefaultForm();
      //this.getUserData(); //NOTA IMPORTANTE: No se vuelve a obtener los documentos cuando se limpie el filtro por petición de Preving (23/09/2021)
      this.initColsOrder();
    });
  }

  /*cambia el estado de lectura de el mensaje*/
  changeStateMessage(_idMensaje) {
    this.userService.checkMessageAsRead(_idMensaje).subscribe(data => {
      if(data){
      	this.resultado = data;
      }else{
      	this.spinner.hide();
      }
    }), (error => {
      if (environment.debug) console.log("Error");
    })
  }

  emitirEvento() {
    this.mensajeLeido.emit(true);
  }

  refresh(idMensaje) {
    //Se comenta para que cuando se cierra los detalles del mensaje, no vuelva a realizar el getMensajes cuando refresque para pasar el mensaje a leído
    //this.getMensajes();

    //Ahora se va a actualizar la tabla de mensajes para cambiar el estado del mensaje 'idEstadoMensaje' sin tener que volver a llamar a getMensajes (así se puede comentar la llamada al getMensajes anterior)
    this.dataSource.filteredData.forEach(mensaje => {
      if(mensaje.idMensaje === idMensaje){
        mensaje.idEstadoMensaje = this.globals.extranet_mensajes_estadoMensajeLeido; //Se indica el estado '2' de estado leido
      }
    });
  }

  getMensajes() {
    this.spinner.show();
    let data: MessagesFilterDto;

    let fechaFin;
    if (this.messageForm.get('fechaFinForm').value!==null)
    {
      fechaFin = new Date(this.messageForm.get('fechaFinForm').value);
      fechaFin.setHours(23, 59, 59);
    }

    let fechaInicio;
    if (this.messageForm.get('fechaInicioForm').value!==null)
    {
      fechaInicio = new Date(this.messageForm.get('fechaInicioForm').value);
      fechaInicio.setHours(0, 0, 0);
    }

    data = {
      fechaInicio: fechaInicio,
      fechaFin: fechaFin,
      listaIdTipos: this.messageForm.get('tipoForm').value || [1,2],
      listaIdCategorias: this.messageForm.get('categoriaForm').value || [],
      listaIdSubcategorias: this.messageForm.get('subcategoriaFrom').value || []
    }

    this.userService.getMensajes(data).subscribe(data => {
      if (data !== undefined && data.length > 0){
        let result: messageInterface[] = [];
        data.forEach(item => {
          result.push({
            idMensaje: item.idMensaje,
            adjuntos: item.adjuntos,
            fechaMensaje: item.fechaMensaje,
            asunto: item.asunto,
            tipoMensaje: item.tipoMensaje.nombre,
            idTipoMensaje: item.tipoMensaje.idTipoMensaje,
            categoriaMensaje: item.categoriaMensaje.nombre,
            subcategoriaMensaje: item.subcategoriaMensaje.nombre,
            estadoMensaje: item.estadoMensaje.nombre,
            idEstadoMensaje: item.estadoMensaje.idEstadoMensaje,
            mensaje: this.sanitized.bypassSecurityTrustHtml(item.mensaje),
            from: item.from,

//          Pruebas para tratar origen
            origen: item.origen,

            to: item.to,
            cc: item.cc,
            expandedVisible: false
          });
        });

        this.resultado = result;
        this.resultado.sort(function (a, b) {
          if (a.fechaMensaje > b.fechaMensaje) return -1;
          if (a.idEstadoMensaje < b.idEstadoMensaje) return -1;
        });


        this.dataSource = new MatTableDataSource(this.resultado);
        this.dataSource.sort = this.sort;
        this.dataSource.sortingDataAccessor = (item, property) =>{
          if(property == 'tipoMensaje'){
              return item['tipoMensaje'];
          }

          if(property == 'categoriaMensaje'){
              return item['categoriaMensaje'];
          }

          if(property == 'subcategoriaMensaje'){
              return item['subcategoriaMensaje'];
          }

          if(property == 'enviadoPor'){
              return item['from'].usuario.eMail;
          }

          if(property == 'fechaMensaje'){
              return item['fechaMensaje'];
          }

        }
        this.dataSource.paginator = this.paginator;
        this.mostrarTabla = true;
      } else if(data !== undefined && data.length === 0){
        this.utils.mostrarMensajeSwalFireMensajesNoEncontradas();
      }
      this.spinner.hide();

    }), (error => {
      if (environment.debug) console.log("Error");
    })
  }

  obtenerDetalleMensaje(element){
    if(!element.expandedVisible && !element.obtenidoCuerpoMensaje){
      this.spinner.show();
      // this.userService.getDetalleMensaje(element.idMensaje).subscribe(data => {

      this.userService.getDetalleMensaje(element.idMensaje, element.origen).subscribe(data => {


        if(data){
          element.mensaje = this.sanitized.bypassSecurityTrustHtml(data.mensaje);
          element.obtenidoCuerpoMensaje = true;
          this.spinner.hide();
        }else{
          this.spinner.hide();
        }
      }), (error => {
        if (environment.debug) console.log("Error");
      });
    }
  }

  getTiposMensajes() {
    this.userService.getTiposMensaje().subscribe(data => {
      if(data){
      	this.tiposList = data;
      }else{
      	this.spinner.hide();
      }
    }), (error => {
      if (environment.debug) console.log("Error");
    })
  }

  getCategoriasMensaje() {
    this.userService.getCategoriasMensaje().subscribe(data => {
      if(data){
        this.categoriasList = data;
        if (environment.debug) console.log("Succes");
      }else{
        this.spinner.hide();
      }
      this.getMensajes();
    }), (error => {
      if (environment.debug) console.log("Error");
    })
  }

  getSubcategoriasMensaje() {
    let data = {
      listaIdsCategorias: []
    }
    this.userService.getSubcategoriasMensaje(data).subscribe(data => {
      if(data){
      	this.subCategoriasList = data;
        if (environment.debug) console.log("Succes");
      }else{
      	this.spinner.hide();
      }
      this.getMensajes();
    }), (error => {
      if (environment.debug) console.log("Error");
    })
  }

  getSubCategoria() {
    this.messageForm.controls['subcategoriaFrom'].setValue([]);
    var filteredCategories = this.messageForm.get('categoriaForm').value.filter(function (el) {
      return el != null;
    });
    let data = {
      listaIdsCategorias: filteredCategories
    }
    if(data.listaIdsCategorias.length == 0){
      this.subCategoriasList = [];
    } else{
      this.userService.getSubcategoriasMensaje(data).subscribe(result => {
        if(result){
          this.subCategoriasList = result;
        }else{
          this.spinner.hide();
        }
      }, (error => {
        if (environment.debug) console.log("Error al cargar las subcategorias: " + error);
      }));
    }
  }

  closeModalMensaje() {
    this.modalMensaje.closeAll();
  }


  /*UTILS DE COMBO*/
  selectAll(formName, formControlName, values, fieldName) {
    /*si estan todos seleccionados*/
    if (this[formName].controls[formControlName].value.length == values.length + 1) {
      this[formName].controls[formControlName].setValue([]);
    } else {
      let result = [];
      values.forEach(item => {
        result.push(item[fieldName]);
      })
      this[formName].controls[formControlName].setValue(result);
    }
  }

  /*selectAllTwoDimension('userForm','centroForm',empresasList,userForm.value.empresaForm,'idEmpresa','idCentro')*/
  selectAllTwoDimension(formName, formControlName, values, values2, subArrayfieldName, toCompare, fieldName) {
    let result = [];
    values.forEach(item1 => {
      values2.forEach(item2 => {
        if (item1[toCompare] === item2) {
          item1[subArrayfieldName].forEach(subItems => {
            result.push(subItems[fieldName]);
          })

        }
      })
    });

    /*si estan todos seleccionados*/
    if (this[formName].controls[formControlName].value.length == result.length + 1) {
      this[formName].controls[formControlName].setValue([]);
    } else {
      this[formName].controls[formControlName].setValue(result);
    }
  }

  /*Se buscan mensajes desplegados y se contraen para que sólo esté visible uno unicamente*/
  contraerMensajesDesplegados(element){
    this.dataSource.filteredData.forEach(mensaje => {
      if (mensaje.idMensaje !== element.idMensaje){
        if (mensaje.expandedVisible != undefined && mensaje.expandedVisible){
          mensaje.expandedVisible=false;
        }
      }
    });
  }

  downloadAdjunto(item) {
    this.spinner.show();
    //Id de un archivo fuera de la extranet, tipo de documento = 2 (this.globals.adjunto_mensaje),
    //es que dicho adjunto fue compartido desde 'envioConsultaGeneral'
    // o 'envioProteccionDatos'(envío de documentación de extranet firmada por el usuario)
    if (item?.tipoDocumento?.idTipoDocumento === Number(this.globals.adjunto_mensaje)){
      this.utils.getAdjuntoMensaje({
        listaIdsDocumentos: [item.idDocumento],
        listaIdsTiposDocumentos: [item?.tipoDocumento?.idTipoDocumento],
        listaUuidsDocumentos: [item?.ubicacion],
        loginSimuladoActivado: this.isLoginSimulado,
        accion: { idAccionDoc: "2" }
      }).subscribe(adjunto => {
         if (adjunto != undefined && adjunto != null){
            let base64Fichero = adjunto.base64;
            //En los adjuntos de un archivo compartido por el usuario, el mimeType estará en la ruta del archivo, es decir, en 'adjunto.listaUuidsDocumentos[0]'
            let rutaAdjunto = adjunto.listaUuidsDocumentos[0];
            //Se elimina el primer '.' para que al realizar el split recoga el '.' del tipo de archivo
            let rutaAdjuntoModificada = rutaAdjunto.substring(1, rutaAdjunto.length);
            let arrayMimeType = rutaAdjuntoModificada.split('.');
            let mimeType = arrayMimeType[1];

            let downloadLink = document.createElement('a');
            let linkSource;
            if (mimeType === 'pdf')
              linkSource = `data:application/pdf;base64,${base64Fichero}`;
            else if (mimeType === 'zip')
               linkSource = `data:application/zip;base64,${base64Fichero}`;
            else
              linkSource = `data:`+ mimeType  +`;base64,${base64Fichero}`;

            downloadLink.href = linkSource;

            let filename = "";
            if (item.nombre === undefined)
              filename = "adjunto";
            else
              filename = item.nombre;

            downloadLink.download = filename;//Ya se incluye el mimeType
            downloadLink.click();
         }else if (adjunto == undefined || adjunto === null){
            let titulo = "Ha ocurrido un error en la descarga";
            this.translate.get('ERROR_EN_LA_DESCARGA').subscribe((res: string) => {
              titulo = res;
            });
            this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
         }
         this.spinner.hide();
      });
    }else{
      //Descarga de documentación compartida de la extranet
      this.utils.getFile({
        listaIdsDocumentos: [item.idDocumento],
        listaIdsTiposDocumentos: [item?.tipoDocumento?.idTipoDocumento],
        listaUuidsDocumentos: [item?.ubicacion],
        loginSimuladoActivado: this.isLoginSimulado,
        accion: { idAccionDoc: "2" }
      }).subscribe(base64 => {
        if (base64 != null){
          let downloadLink = document.createElement('a');
          downloadLink.href = `data:`+ base64.mimeType  +`;base64,${base64.fichero}`;

          let filename = "";
          if (item.nombre === undefined)
            filename = "adjunto" + '.' + base64.mimeType;
          else
          {
            if (item.nombre.indexOf('.')!==-1)
              filename = item.nombre;
            else
              filename = item.nombre + '.' + base64.mimeType;
          }
          downloadLink.download = filename;
          downloadLink.click();
        }else if (base64 === null){
          let titulo = "Ha ocurrido un error en la descarga";
          this.translate.get('ERROR_EN_LA_DESCARGA').subscribe((res: string) => {
            titulo = res;
          });
          this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
        }
        this.spinner.hide();
      })
    }
  }

}
