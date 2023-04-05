import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { environment } from '../../../environments/environment';
import { UserService } from 'src/app/services/user.service';
import { UtilsService } from 'src/app/services/utils.service';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { PdfView } from 'src/app/modales/pdfView/pdfView.component';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { Globals } from '../globals';
import { ShareDocumentComponent } from 'src/app/modales/shareDocument/shareDocument.component';
import { HistoricoAccionesDocumentoComponent } from 'src/app/modales/historicoAccionesDocumento/historicoAccionesDocumento.component';
import { TranslateService } from '@ngx-translate/core';
import { SubidaProteccionDatosComponent } from 'src/app/modales/subidaProteccionDatos/subidaProteccionDatos.component';
import { ChangeDetectorRef } from '@angular/core';

export interface RGPDInterface {
  idEntidad: number;
  nombre: string;
  [columnLangKey: string]: any;
}

export interface RGPDInterfaceCodigo {
  idCodigo: number;
  nombre: string;
  [columnLangKey: string]: any;
}

@Component({
  selector: 'app-tratamiento',
  templateUrl: './tratamiento.component.html',
  styleUrls: ['./tratamiento.component.css']
})
export class TratamientoComponent implements OnInit {
  environment = environment;
  excelImgUrl = '../../assets/img/excel.svg';
  mailImgUrl = '../../assets/img/mail.svg';
  downloadImgUrl = '../../assets/img/download.svg';

  dataSource: MatTableDataSource<RGPDInterface>;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('paginatorEntidades') paginatorEntidades: MatPaginator;
  @ViewChild('paginatorConducta') paginatorConducta: MatPaginator;
  @ViewChild('TABLETRATAMIENTOS') table: ElementRef;

  tableHeaders: string[] = [
    'nombre'
  ];

  dataSource2: MatTableDataSource<RGPDInterfaceCodigo>;
  @ViewChild(MatSort) sort2: MatSort;
  @ViewChild('TABLETRATAMIENTOS2') table2: ElementRef;

  idiomas: any[] = [];
  documentos: any[];
  documentosCodigoConducta: any[];
  isLoginSimulado: boolean = false;

  constructor(
    private userService: UserService,
    public utils: UtilsService,
    public dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private globals: Globals,
    private translate: TranslateService,
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
    this.dataSource2 = new MatTableDataSource();

    this.spinner.show();
    this.getIdiomas();

    //transformNecesario es el item que nos dices si ha llegado a través
    //de la barra de favoritos, si es true entonces hacemos el translateX
    let transform = JSON.parse(localStorage.getItem('transformNecesario'));
    if(transform == true){
        $(document).ready(function(){
          $('.mat-tab-list').css('transform', 'translateX(0px)');
        });
    }

    //en caso de que sea una pantalla pequeña
    if(screen.width < 1530){
      $(document).ready(function(){
        $('.mat-tab-list').css('transform', 'translateX(-430px)');
      });
    }
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
        this.getDocumentosRGPD();
      }else{
      	this.spinner.hide();
      }
    }), (error => {
    });
  }

  getDocumentosRGPD() {
    this.userService.getDocumentosRGPD().subscribe(docs => {
      if(docs){
      	this.documentos = docs;
        this.getEntidades();
        this.getCodigos();
      }else{
      	this.spinner.hide();
      }

    }), (error => {
    });
  }

  getEntidades() {
    this.userService.getEntitiesUser().subscribe(entidades => {
      if(entidades){
      	entidades.forEach(entidad => {
          this.idiomas.forEach(idioma => {
            entidad[idioma.columnName] = this.getDocumentos(idioma, entidad);
          });
        });
        this.dataSource = new MatTableDataSource(entidades);
        this.dataSource.paginator = this.paginatorEntidades;
        this.dataSource.sort = this.sort;
        this.dataSource.sortingDataAccessor = (item, property) => {
          if (typeof item[property] === 'string')
            return item[property].toLocaleLowerCase();

          if (!item[property])
            return "";

          return item[property];
        };
      }else{
      	this.spinner.hide();
      }

    }), (error => {
    });
  }

  //Códigos de conducta
  getCodigos() {
    let jsonData = {
      listaIdsTipoDocumento: [this.globals.codigo_conducta]
    };

    this.userService.getDocumentos(jsonData).subscribe(codigos => {
      if(codigos !== undefined && codigos.length > 0){
      	this.documentosCodigoConducta = codigos;
        let name = 'Código de Conducta';
        this.translate.get('CODIGO_CONDUCTA').subscribe((res: string) => {
          name = res;
        });

        codigos.forEach(codigo => {
          this.idiomas.forEach(idioma => {
            codigo[idioma.columnName] = this.getDocumentosCodigoConducta(idioma, codigos);
          });
        });
        this.documentosCodigoConducta[0].nombre = name;
        let documentosCodigoConductaAux: any[] = this.documentosCodigoConducta.slice();
        this.dataSource2 = new MatTableDataSource(documentosCodigoConductaAux.splice(0, 1));
        this.dataSource2.paginator = this.paginatorConducta;
        this.dataSource2.sort = this.sort2;
        this.dataSource2.sortingDataAccessor = (item, property) => {
          if (typeof item[property] === 'string')
            return item[property].toLocaleLowerCase();

          if (!item[property])
            return "";

          return item[property];
        };
      }
      this.spinner.hide();
    }), (error => {
    });
  }

  getDocumentos(idioma, entidad) {
    let documentos = this.documentos.find(obj => obj.id == entidad.idEntidad);
    if(documentos != undefined && documentos.listaDocumentosDto.length > 0){
      let documentoEntidadIdioma: any;
      documentos.listaDocumentosDto.forEach(element => {
        element.datos.forEach(dato => {
          if (dato.nombre === this.globals.metadato_idioma){
            if(dato.valorDto.nombre === idioma.nombre){
              documentoEntidadIdioma = element;
            }
          }
        });
      });
      return documentoEntidadIdioma;
    }
    return undefined;
  }

  getDocumentosCodigoConducta(idioma, documentos) {
    return documentos.find(obj => obj.datos[0].valorDto.nombre == idioma.nombre);
  }

  /*compartir */
  compartir(element, tabla) {
    let menuNameComponent = 'Administración';
    this.translate.get('ADMINISTRACION').subscribe((res: string) => {
      menuNameComponent = res;
    });
    let subMenuNameComponent = 'Protección de Datos';
    this.translate.get('PROTECCION_DATOS').subscribe((res: string) => {
      subMenuNameComponent = res;
    });
    let nombreDocumento;
    if (element.nombreDocumento) {
      nombreDocumento = element.nombreDocumento;
    } else {
      nombreDocumento = element.nombre;
    }
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
              idAccionDoc: '1'
            },
            filename: nombreDocumento + ".pdf"
          }
        }

        let titulo = "Se ha procedido al envío por correo electrónico de la documentación indicada";
        this.translate.get('ENVIO_DOC_INICIADA').subscribe((res: string) => {
          titulo = res;
        });

        this.utils.mostrarMensajeSwalFire('info', titulo, '', 'var(--blue)', false);

        this.utils.compartirDocumento(data).subscribe(result => {
          if (!result) {
            let titulo = "Error al enviar el mensaje";
            this.translate.get('ERROR_ENVIO_MENSAJE').subscribe((res: string) => {
              titulo = res;
            });
            this.utils.mostrarMensajeSwalFire('error', titulo, '', 'var(--blue)', false);
          }else{
            //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
            if (!this.isLoginSimulado){
              //En caso de que se haya enviado correctamente el mensaje, entonces
              //Recarga los datos de nuevo para quitar nuevo documento y mostrar las acciones de los documentos
              //this.getDocumentosRGPD(); //Reload
              if(tabla == 1){
                this.utils.recargarTablaDatosPorAccion(element, this.dataSource.filteredData, this.spinner, true, this.idiomas, false, null, false);
              }else{  //tabla = 2
                this.utils.recargarTablaDatosPorAccion(element, this.dataSource2.filteredData, this.spinner, true, this.idiomas, false, null, false);
              }
            }
          }
        }), (error => {
          if (environment.debug) console.log("Error al Enviar EMAIL - Compartir Documento");
        });
      }
    });
  }

  previsualizar(element, tabla) {
    this.spinner.show();
    this.utils.getFile({
      listaIdsDocumentos: [element.idDocumento],
      listaIdsTiposDocumentos: [element.tipoDocumento.idTipoDocumento],
      listaUuidsDocumentos: [element.ubicacion],
      loginSimuladoActivado: this.isLoginSimulado,
      accion: { idAccionDoc: "3" }
    }).subscribe(pdfBase64 => {
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
        const dialogRef = this.dialog.open(PdfView, dialogConfig);

        //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
        if (!this.isLoginSimulado){
          //Recarga los datos de nuevo para quitar nuevo documento y mostrar las acciones de los documentos
          //this.getDocumentosRGPD(); //Reload
          if(tabla == 1){
            this.utils.recargarTablaDatosPorAccion(element, this.dataSource.filteredData, this.spinner, true, this.idiomas, false, null, false);
          }else{  //tabla = 2
            this.utils.recargarTablaDatosPorAccion(element, this.dataSource2.filteredData, this.spinner, true, this.idiomas, false, null, false);
          }
        }
        dialogRef.afterClosed().subscribe(result => {

        });
      }
      this.spinner.hide();
    })
  }

  descargar(element, tabla) {
    this.spinner.show();
    this.utils.getFile({
      listaIdsDocumentos: [element.idDocumento],
      listaIdsTiposDocumentos: [element.tipoDocumento.idTipoDocumento],
      listaUuidsDocumentos: [element.ubicacion],
      loginSimuladoActivado: this.isLoginSimulado,
      accion: { idAccionDoc: "2" }
    }).subscribe(pdfBase64 => {
      if(pdfBase64){
        let downloadLink = document.createElement('a');
        downloadLink.href = `data:application/pdf;base64,${pdfBase64.fichero}`;
        const filename = pdfBase64.nombreFichero + '.pdf';
        downloadLink.download = filename;
        downloadLink.click();

        //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
        if (!this.isLoginSimulado){
          //Recarga los datos de nuevo para quitar nuevo documento y mostrar las acciones de los documentos
          //this.getDocumentosRGPD(); //Reload
          if(tabla == 1){
            this.utils.recargarTablaDatosPorAccion(element, this.dataSource.filteredData, this.spinner, true, this.idiomas, false, null, false);
          }else{  //tabla = 2
            this.utils.recargarTablaDatosPorAccion(element, this.dataSource2.filteredData, this.spinner, true, this.idiomas, false, null, false);
          }
        }
      }
      this.spinner.hide();
    })
  }

  subidaProteccionDatos() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = "";
    dialogConfig.width = "70%";
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;
    const dialogRef = this.dialog.open(SubidaProteccionDatosComponent, dialogConfig);
  }

}
