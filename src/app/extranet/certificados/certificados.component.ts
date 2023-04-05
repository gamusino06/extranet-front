import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { environment } from '../../../environments/environment';
import { UserService } from 'src/app/services/user.service';
import { UtilsService } from 'src/app/services/utils.service';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import * as XLSX from 'xlsx';
import { Globals } from '../globals';
import { PdfView } from 'src/app/modales/pdfView/pdfView.component';
import { Empresa } from 'src/app/Model/Empresa';
import { Documento } from 'src/app/Model/Documento';
import Swal from 'sweetalert2';
import { ShareDocumentComponent } from 'src/app/modales/shareDocument/shareDocument.component';
import { HistoricoAccionesDocumentoComponent } from 'src/app/modales/historicoAccionesDocumento/historicoAccionesDocumento.component';
import { TranslateService } from '@ngx-translate/core';
import { ChangeDetectorRef } from '@angular/core';

/*mock data*/
export interface empresas {
  checked: boolean;
  idEmpresa: number;
  nombre: string;
  certificadoContratacion: any;
  certificadoPago: any;
  documentos: Documento[];
}
@Component({
  selector: 'app-certificados',
  templateUrl: './certificados.component.html',
  styleUrls: ['./certificados.component.css']
})
export class CertificadosComponent implements OnInit {
  environment = environment;
  excelImgUrl = '../../assets/img/excel.svg';
  mailImgUrl = '../../assets/img/mail.svg';
  downloadImgUrl = '../../assets/img/download.svg';

  result: any;
  //documentos: any[];
  dataSource: MatTableDataSource<empresas>;
  certificadoDataDto: any;
  empresas:any;
  isLoginSimulado: boolean = false;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('TABLECONTRACS') table: ElementRef;

  tableHeaders: string[] = [
    'checklist',
    'nombre',
    'certificadoContratacion',
    'certificadoPago'
  ];
  constructor(
    private userService: UserService,
    public utils: UtilsService,
    public dialog: MatDialog,
    private globals: Globals,
    private spinner: NgxSpinnerService,
    public translate: TranslateService,
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

    this.spinner.show();
    this.getCertificadosEmpresasUser();
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

  getCertificadosEmpresasUser(){
      this.userService.getCertificadosEmpresasUser().subscribe(empresas => {
        this.empresas = empresas;
        this.dataSource = new MatTableDataSource(empresas);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.spinner.hide();
      }), (error => {
      });
  }


  /*compartir */
  compartir(element, idEmpresa) {
    let menuNameComponent = 'Administración';
    this.translate.get('ADMINISTRACION').subscribe((res: string) => {
      menuNameComponent = res;
    });
    let subMenuNameComponent = 'Certificados';
    this.translate.get('CERTIFICADOS').subscribe((res: string) => {
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
    }
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
        this.utils.mostrarMensajeSwalFire('info', titulo, '','var(--blue)', false);

        this.utils.compartirDocumento(data).subscribe(result => {
          if (!result) {
           let titulo = "Error al enviar el mensaje";
           this.translate.get('ERROR_ENVIO_MENSAJE').subscribe((res: string) => {
             titulo = res;
           });
           this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
          }

          //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
          if (!this.isLoginSimulado){
            //Recarga los datos de nuevo para quitar nuevo documento y mostrar las acciones de los documentos
            //this.getCertificadosEmpresasUser();
            let posicionDeLaEmpresaEnLaTabla: number = 0;
            let contador: number = 0;
            this.dataSource.filteredData.forEach(empresa => {
              if(empresa.idEmpresa === idEmpresa){
                posicionDeLaEmpresaEnLaTabla = contador;
              }
              contador++;
            });
            let documentosEmpresa = this.dataSource.filteredData[posicionDeLaEmpresaEnLaTabla].documentos;
            this.utils.recargarTablaDatosPorAccion(element, documentosEmpresa, this.spinner, false, null, false, null, false);
            this.dataSource.filteredData[posicionDeLaEmpresaEnLaTabla].documentos = documentosEmpresa;//Actualizamos de nuevo la tabla con la info modificada
          }
        }), (error => {
          if (environment.debug) console.log("Error al Enviar EMAIL - Compartir Documento");
        });
      }

    });
  }

  /*compartir Múltiple */
  compartirMultiple() {
    let listaIdsDocumentos: number[] = [];
    let listaIdsEmpresas: number[] = [];
    let listaDocumentos: any[] = [];
    let listaIdsTiposDocumentos: number[] = [];
    let listaUuidsDocumentos: string[] = [];

    if (this.dataSource.data) {
      this.dataSource.data.forEach(empresa => {
        if (empresa.checked) {
          listaIdsEmpresas.push(empresa.idEmpresa);
          empresa.documentos.forEach(documento => {
            listaDocumentos.push(documento);
            listaIdsDocumentos.push(documento.idDocumento);
            listaIdsTiposDocumentos.push(documento.tipoDocumento.idTipoDocumento);
            listaUuidsDocumentos.push(documento.ubicacion);
          });
        }
      });
    }

    if (listaIdsDocumentos != null && listaIdsDocumentos.length === 0) {
      let titulo = "Debe seleccionar al menos un elemento a compartir";
      this.translate.get('ERROR_SELECCIONA_COMPARTIR').subscribe((res: string) => {
        titulo = res;
      });
      this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
    }else if (listaIdsDocumentos.length > this.globals.extranet_maximo_documentos_multiple){
      this.utils.mostrarMensajeSwalFireSobrepasadoLimiteDescargaMultiple(listaIdsDocumentos.length);
    }else{
      let menuNameComponent = 'Administración';
      this.translate.get('ADMINISTRACION').subscribe((res: string) => {
        menuNameComponent = res;
      });
      let subMenuNameComponent = 'Certificados';
      this.translate.get('CERTIFICADOS').subscribe((res: string) => {
        subMenuNameComponent = res;
      });
      let filenameComponent = subMenuNameComponent;
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = {
        element: listaDocumentos,
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
              listaIdsDocumentos,
              listaIdsTiposDocumentos,
              listaUuidsDocumentos,
              loginSimuladoActivado: this.isLoginSimulado,
              accion: {
                idAccionDoc: '1'
              },
              filename: filenameComponent + ".zip"
            }
          }

          let titulo = "Se ha procedido al envío por correo electrónico de la documentación indicada";
          this.translate.get('ENVIO_DOC_INICIADA').subscribe((res: string) => {
            titulo = res;
          });
          this.utils.mostrarMensajeSwalFire('info', titulo, '','var(--blue)', false);
          this.utils.compartirDocumentoZip(data).subscribe(result => {
            if (!result) {
              let titulo = "Error al enviar el mensaje";
              this.translate.get('ERROR_ENVIO_MENSAJE').subscribe((res: string) => {
                titulo = res;
              });
              this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
            }else{
               //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
               if (!this.isLoginSimulado){
                 //Recarga los datos de nuevo para quitar nuevo documento y mostrar las acciones de los documentos
                 let jsonInfoDocumentosDto: any[] = [];
                 listaIdsDocumentos.forEach(idDocumentoInfo => {
                     let jsonInfoDocumentoDto = {
                       idDocumento: idDocumentoInfo
                     };
                     jsonInfoDocumentosDto.push(jsonInfoDocumentoDto);
                 });

                 //Recarga los datos de nuevo para quitar nuevo documento y mostrar las acciones de los documentos
                 //this.getCertificadosEmpresasUser();
                 let posicionDeLaEmpresaEnLaTabla: number[] = [];
                 let contador: number = 0;
                 this.dataSource.filteredData.forEach(empresa => {
                   let idEmpresa = listaIdsEmpresas.find(idEmpresa => empresa.idEmpresa === idEmpresa);
                   if(idEmpresa != undefined){
                     posicionDeLaEmpresaEnLaTabla.push(contador);
                   }
                   contador++;
                 });
                 //Teniendo ya las posiciones de las empresas, las cuales alguno de sus documentos se han realizado la acción
                 this.utils.recargarTablaDatosMultiplePorAccion(jsonInfoDocumentosDto, this.dataSource.filteredData, this.spinner, false, null, true, posicionDeLaEmpresaEnLaTabla, false);
               }
            }

          }), (error => {
            if (environment.debug) console.log("Error al Enviar EMAIL - Compartir Documento");
          });
        }
      });
    }
  }

  previsualizar(element, idEmpresa) {
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
          //this.getCertificadosEmpresasUser();
          let posicionDeLaEmpresaEnLaTabla: number = 0;
          let contador: number = 0;
          this.dataSource.filteredData.forEach(empresa => {
            if(empresa.idEmpresa === idEmpresa){
              posicionDeLaEmpresaEnLaTabla = contador;
            }
            contador++;
          });
          let documentosEmpresa = this.dataSource.filteredData[posicionDeLaEmpresaEnLaTabla].documentos;
          this.utils.recargarTablaDatosPorAccion(element, documentosEmpresa, this.spinner, false, null, false, null, false);
          this.dataSource.filteredData[posicionDeLaEmpresaEnLaTabla].documentos = documentosEmpresa;//Actualizamos de nuevo la tabla con la info modificada
        }
        dialogRef.afterClosed().subscribe(result => {
        });
      }
      this.spinner.hide();
    })
  }

  descargar(element, idEmpresa) {
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
           //this.getCertificadosEmpresasUser();
           let posicionDeLaEmpresaEnLaTabla: number = 0;
           let contador: number = 0;
           this.dataSource.filteredData.forEach(empresa => {
             if(empresa.idEmpresa === idEmpresa){
               posicionDeLaEmpresaEnLaTabla = contador;
             }
             contador++;
           });
           let documentosEmpresa = this.dataSource.filteredData[posicionDeLaEmpresaEnLaTabla].documentos;
           this.utils.recargarTablaDatosPorAccion(element, documentosEmpresa, this.spinner, false, null, false, null, false);
           this.dataSource.filteredData[posicionDeLaEmpresaEnLaTabla].documentos = documentosEmpresa;//Actualizamos de nuevo la tabla con la info modificada
         }
      }
      this.spinner.hide();
    })
  }

  descargarMultiple() {
    let listaIdsDocumentos: number[] = [];
    let listaIdsTiposDocumentos: number[] = [];
    let listaUuidsDocumentos: string[] = [];
    let listaIdsEmpresas: number[] = [];

    if (this.dataSource.data) {
      this.dataSource.data.forEach(empresa => {
        if (empresa.checked) {
          listaIdsEmpresas.push(empresa.idEmpresa);
          listaIdsDocumentos.push(empresa.documentos[0].idDocumento);
          listaIdsDocumentos.push(empresa.documentos[1].idDocumento);
          listaIdsTiposDocumentos.push(empresa.documentos[0].tipoDocumento.idTipoDocumento);
          listaIdsTiposDocumentos.push(empresa.documentos[1].tipoDocumento.idTipoDocumento);
          listaUuidsDocumentos.push(empresa.documentos[0].ubicacion);
          listaUuidsDocumentos.push(empresa.documentos[1].ubicacion);
        }
      });

      this.spinner.show();
      if (listaIdsDocumentos.length > 0 && listaIdsDocumentos.length <= this.globals.extranet_maximo_documentos_multiple) {
        this.utils.getZipFile({
          listaIdsDocumentos,
          listaIdsTiposDocumentos,
          listaUuidsDocumentos,
          loginSimuladoActivado: this.isLoginSimulado,
          accion: { idAccionDoc: "2" }
        }).subscribe(zipBase64 => {
          if(zipBase64){
            //Variables para traducción
            var nombreZip = "Certificados";
            this.translate.get('CERTIFICADOS').subscribe((res: string) => {
              nombreZip = res;
            });
            let downloadLink = document.createElement('a');
            downloadLink.href = `data:application/zip;base64,${zipBase64.fichero}`;
            downloadLink.download = nombreZip + '.zip';
            downloadLink.click();

            //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
            if (!this.isLoginSimulado){
              //Recarga los datos de nuevo para quitar nuevo documento y mostrar las acciones de los documentos
              //this.getCertificadosEmpresasUser();
              let jsonInfoDocumentosDto: any[] = [];
              listaIdsDocumentos.forEach(idDocumentoInfo => {
                  let jsonInfoDocumentoDto = {
                    idDocumento: idDocumentoInfo
                  };
                  jsonInfoDocumentosDto.push(jsonInfoDocumentoDto);
              });

              let posicionDeLaEmpresaEnLaTabla: number[] = [];
              let contador: number = 0;
              this.dataSource.filteredData.forEach(empresa => {
                let idEmpresa = listaIdsEmpresas.find(idEmpresa => empresa.idEmpresa === idEmpresa);
                if(idEmpresa != undefined){
                  posicionDeLaEmpresaEnLaTabla.push(contador);
                }
                contador++;
              });
              //Teniendo ya las posiciones de las empresas, las cuales alguno de sus documentos se han realizado la acción
              this.utils.recargarTablaDatosMultiplePorAccion(jsonInfoDocumentosDto, this.dataSource.filteredData, this.spinner, false, null, true, posicionDeLaEmpresaEnLaTabla, false);
            }else{
              this.spinner.hide();//En caso de que se estuviera simulando, se oculta el spinner que sólo se oculta cuando se recarga la tabla de datos
            }
          }else{
            this.spinner.hide();
          }
        })
      }else if (listaIdsDocumentos.length > this.globals.extranet_maximo_documentos_multiple){
      	this.spinner.hide();
      	this.utils.mostrarMensajeSwalFireSobrepasadoLimiteDescargaMultiple(listaIdsDocumentos.length);
      }else{
        this.spinner.hide();
        let titulo = "Debe seleccionar al menos un elemento a descargar";
        this.translate.get('ERROR_SELECCIONA_DESCARGAR').subscribe((res: string) => {
          titulo = res;
        });
        this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
      }
    }
  }

  checkAllRows(event) {
    if (this.dataSource.data)
      this.dataSource.data.forEach(val => { val.checked = event.checked });
  }

  verHistoricoDocumento(element) {
    const dialogConfig = new MatDialogConfig();
    this.utils.verHistoricoDocumentoComun(dialogConfig, element);
  }
}

