import { Component, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../environments/environment';
import { UserService } from 'src/app/services/user.service';
import { UtilsService } from 'src/app/services/utils.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatPaginator } from '@angular/material/paginator';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { SafeHtml } from '@angular/platform-browser';
import { PdfView } from 'src/app/modales/pdfView/pdfView.component';
import { ShareDocumentComponent } from 'src/app/modales/shareDocument/shareDocument.component';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { Globals } from '../globals';
import { HistoricoAccionesDocumentoComponent } from 'src/app/modales/historicoAccionesDocumento/historicoAccionesDocumento.component';


import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as _moment from 'moment';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MY_FORMATS } from '../../../config/config';
import { TranslateService } from '@ngx-translate/core';
import { ChangeDetectorRef } from '@angular/core';

const moment = _moment;

/* Data */
export interface informesMedicosAsociados {
  id: number;
  protocolo: string;
  tipoIprome: string;
  denominacion: string;
  listaDocumentos: any[];
}

@Component({
  selector: 'app-informes-medicos-asociados',
  templateUrl: './vigilancia-informes-medicos-asociados.component.html',
  styleUrls: ['./vigilancia-informes-medicos-asociados.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})

export class VigilanciaInformesMedicosAsociadosComponent implements OnInit {
  cleanImgUrl = '../../assets/img/borrar_filtros.svg';
  searchImgUrl = '../../assets/img/search.svg';
  excelImgUrl = '../../assets/img/excel.svg';
  mailImgUrl = '../../assets/img/mail.svg';
  downloadImgUrl = '../../assets/img/download.svg';
  environment = environment;

  searchForm: FormGroup;
  aprobDocDataDto: any;
  mostrarTabla: boolean;
  isLoginSimulado: boolean = false;
  idiomas: any[] = [];

  tableHeaders: string[] = [
    'protocolo',
    'tipoIprome',
    'denominacion'
  ];
  dataSource = new MatTableDataSource<informesMedicosAsociados>();

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    public utils: UtilsService,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
    private globals: Globals,
    private modalRgpd: MatDialog,
    private translate: TranslateService,
    private cdRef:ChangeDetectorRef
  ) { }

  //validators
  validDenominacion = this.globals.documentPattern;

  //Evita que se produzca el ERROR Error: ExpressionChangedAfterItHasBeenCheckedError
  ngAfterViewChecked(){
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    //En el caso de que se esté realizando un loginSimulado, no tendrá que guardarse
    let loginSimulado = localStorage.getItem("loginSimulado");
    if (loginSimulado !== null && loginSimulado === "true")
      this.isLoginSimulado = true;

    this.mostrarTabla = false;

    this.spinner.show();
    this.initForm();
    this.getIdiomas();

    //transformNecesario es el item que nos dice si ha llegado a través
    //de la barra de favoritos, si es true entonces hacemos el translateX
    let transform = JSON.parse(localStorage.getItem('transformNecesario'));
    if(transform == true){
        $(document).ready(function(){
          $('.mat-tab-list').css('transform', 'translateX(0px)');
        });
    }

    if(screen.width < 1530){
      $(document).ready(function(){
        $('mat-tab-list').css('transform','translateX(0px)');
      });
    }
  }

  initForm() {
    this.searchForm = this.formBuilder.group({
      denominacionForm: new FormControl('')
    });
    this.setDefaultForm();
  }

  resetForm(): void {
    setTimeout(() => {
      this.setDefaultForm();
    });
  }

  setDefaultForm(): void {
    this.searchForm.controls['denominacionForm'].setValue('');
  }

  onSubmit(): void {
    this.getDocumentos();
  }

  getIdiomas() {
    this.userService.getIdiomas().subscribe(idiomas => {
      if(idiomas){
      	idiomas.forEach(item => {
          this.idiomas.push({
            nombre: item.nombre,
            iso_lang: item.lang,
            columnName: "lang_" + item.lang.replace('-', '_')
          });
          this.tableHeaders.push("lang_" + item.lang.replace('-', '_'));
        });
        //this.getDocumentos();
      }
      this.spinner.hide();
    }), (error => {
    });
  }

  getDocumentos() {
    let data = {
      listaIdsTipoDocumento: [this.globals.informes_medicos_asociados],
      listaFiltroMetadatosDto: [
        {
          nombreMetadato: this.globals.metadato_denominacion,
          valorDato: this.searchForm.get('denominacionForm').value || ''
        }
      ]
    }
    this.spinner.show();
    this.userService.getDocumentos(data).subscribe(documentos => {
      if(documentos !== undefined && documentos.length > 0){
      	let result: informesMedicosAsociados[] = [];
        documentos.forEach(item => {
          var nProtocolo = 0;
          var c = 0;
          item.datos.forEach(dato => {
            if (dato.nombre === this.globals.metadato_protocolo) nProtocolo = c;
            c++;
          })

          result.push({
            id: item.idDocumento,//No es un idDocumento como tal, sino que identifica la posición del registro en la tabla
            protocolo: item.datos[nProtocolo]?.valorDto?.nombre,
            tipoIprome: item.tipoIprome,
            denominacion: item.nombre,
            listaDocumentos:item.documentosHijos//Aquí si estarán los idsDocumentos asociados a cada idioma
          });
        });

        //Se recorre el resultado para setear los idiomas
        result.forEach(item => {
          let listaDocumentosDto: any[] = [];
          //Se recorren los documentos para sacar los idiomas y setearlo en el item para mostrar sus acciones dependiendo de si tienen disponible el idioma o no
          item.listaDocumentos.forEach(documento => {
            this.idiomas.forEach(idioma => {
              if(documento.datos[1].valorDto.nombre == idioma.iso_lang)
                item[idioma.columnName] = documento;
            });

            listaDocumentosDto.push({
              idDocumento: documento.idDocumento,
              idTipoDocumento: documento.tipoDocumento.idTipoDocumento,
              accionesRealizadas: documento.accionesRealizadas,
              ubicacion: documento.ubicacion,
              listaHistoricoDocumentoDto: []
            });
          });

          item.listaDocumentos = undefined;//Ya no es necesaria dicha información
        });

        this.dataSource = new MatTableDataSource(result);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        //Fix sort problem: sort mayúsculas y minúsculas
        this.dataSource.sortingDataAccessor = (item, property) => {
          if (typeof item[property] === 'string')
            return item[property].toLocaleLowerCase();

          return item[property];

        };

        this.mostrarTabla = true;
      }else if(documentos !== undefined && documentos.length === 0){
        this.utils.mostrarMensajeSwalFireDocumentosNoEncontrados();
      }
      this.spinner.hide();
    }), (error => {
      if (environment.debug) console.log("Error");
      this.spinner.hide();
    })
  }

  previsualizar(element) {
    this.previsualizarData(element, 3);
  }

  /*descargar seleccion*/
  descargar(element) {
    this.descargaData(element, 2);
  }

  /*compartir */
  compartir(element) {
    this.compartirData(element, 1);
  }

  /*Previsualizar seleccion*/
  previsualizarData(element, mode) {
    this.spinner.show();
    let data = {
      listaIdsDocumentos: [element.idDocumento],
      listaIdsTiposDocumentos: [element.tipoDocumento.idTipoDocumento],
      listaUuidsDocumentos: [element.ubicacion],
      loginSimuladoActivado: this.isLoginSimulado,
      accion: { idAccionDoc: mode }
    }
    this.utils.getFile(data).subscribe(pdfBase64 => {
      if(pdfBase64){
        const byteArray = new Uint8Array(atob(pdfBase64.fichero).split('').map(char => char.charCodeAt(0)));
        let blob = new Blob([byteArray], { type: 'application/pdf' });
        // Here is your URL you can use
        const url = window.URL.createObjectURL(blob);
        // i.e. display the PDF content via iframe
        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = url;
        dialogConfig.width = "50%";
        dialogConfig.hasBackdrop = true;
        dialogConfig.disableClose = true;

        //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
        if (!this.isLoginSimulado)
          this.utils.recargarTablaDatosPorAccion(element, this.dataSource.filteredData, this.spinner, true, this.idiomas, false, null, false);

        this.spinner.hide();
        const dialogRef = this.dialog.open(PdfView, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
        });
      }
      this.spinner.hide();
    })
  }

  /*descargar seleccion*/
  descargaData(element, mode) {
    this.spinner.show();
    let data = {
      listaIdsDocumentos: [element.idDocumento],
      listaIdsTiposDocumentos: [element.tipoDocumento.idTipoDocumento],
      listaUuidsDocumentos: [element.ubicacion],
      loginSimuladoActivado: this.isLoginSimulado,
      accion: { idAccionDoc: mode }
    }
    this.utils.getFile(data).subscribe(pdfBase64 => {
      if(pdfBase64){
        const linkSource = `data:application/pdf;base64,${pdfBase64.fichero}`;
        const filename = pdfBase64.nombreFichero + '.pdf';
        const downloadLink = document.createElement('a');
        downloadLink.href = linkSource;
        downloadLink.download = filename;
        downloadLink.click();

        //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
        if (!this.isLoginSimulado)
          this.utils.recargarTablaDatosPorAccion(element, this.dataSource.filteredData, this.spinner, true, this.idiomas, false, null, false);
      }
      this.spinner.hide();
    })
  }

  /*compartir selección*/
  compartirData(element, mode) {
    let menuNameComponent = 'Documentación Vigilancia';
    this.translate.get('DOCUMENTACION_VIGILANCIA').subscribe((res: string) => {
      menuNameComponent = res;
    });
    let subMenuNameComponent = 'Informes protocolos médicos asociados';
    this.translate.get('INFORMES_PROTOCOLOS_MEDICOS_ASOCIADOS').subscribe((res: string) => {
      subMenuNameComponent = res;
    });

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      element: element,
      menuName: menuNameComponent,
      subMenuName: subMenuNameComponent
    };
    dialogConfig.width = "50%";
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;

    const dialogRef = this.dialog.open(ShareDocumentComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined) {
        let data = {
          to: result.emailFormControl,
          cc: result.ccFormControl,
          cco: result.ccoFormControl,
          subject: result.subjectFormControl,
          body: result.bodyFormControl,

          documentoDownloadDto: {
            listaIdsDocumentos: [element.idDocumento],
            listaIdsTiposDocumentos: [element.tipoDocumento.idTipoDocumento],
            listaUuidsDocumentos: [element.ubicacion],
            loginSimuladoActivado: this.isLoginSimulado,
            accion: {
              idAccionDoc: mode
            },
            filename: element.nombreDocumento + ".pdf"
          }
        }

        let titulo = "Se ha procedido al envío por correo electrónico de la documentación indicada";
        this.translate.get('ENVIO_DOC_INICIADA').subscribe((res: string) => {
          titulo = res;
        });
        this.utils.mostrarMensajeSwalFire('info', titulo, '','var(--blue)', false);

        this.utils.compartirDocumento(data).subscribe(result => {
          if (!result) {
             let titulo = "Error al enviar el mensaje";
             this.translate.get('ERROR_ENVIO_MENSAJE').subscribe((res: string) => {
               titulo = res;
             });
             this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
          }else{
            //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
            if (!this.isLoginSimulado)
              this.utils.recargarTablaDatosPorAccion(element, this.dataSource.filteredData, this.spinner, true, this.idiomas, false, null, false);
          }

        }), (error => {
          if (environment.debug) console.log("Error al Enviar EMAIL - Compartir Documento");
        });
      }
    });
  }

  //Muestra el historico de acciones del documento
  verHistoricoDocumento(element) {
    const dialogConfig = new MatDialogConfig();
    this.utils.verHistoricoDocumentoComun(dialogConfig, element);
  }

}
