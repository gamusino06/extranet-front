import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../environments/environment';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PdfView } from 'src/app/modales/pdfView/pdfView.component';
import { Empresa } from 'src/app/Model/Empresa';
import { Centro } from 'src/app/Model/Centro';
import Swal from 'sweetalert2';
import { UserService } from 'src/app/services/user.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Globals } from '../globals';
import * as XLSX from 'xlsx';
import { AcceptGdprDocumentComponent } from '../../modales/acceptGdprDocument/acceptGdprDocument.component';
import { ShareDocumentComponent } from 'src/app/modales/shareDocument/shareDocument.component';
import { HistoricoAccionesDocumentoComponent } from 'src/app/modales/historicoAccionesDocumento/historicoAccionesDocumento.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as _moment from 'moment';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MY_FORMATS } from '../../../config/config';
import { TranslateService } from '@ngx-translate/core';
import { ChangeDetectorRef } from '@angular/core';
import { DocIcpt } from "../../Model/DocIcpt";
import { SafeHtml } from '@angular/platform-browser';

const moment = _moment;

export interface PrevencionDocumentosPersonasTrabajadorasInterface {
  idDocumento: number;
  empresa: string;
  idEmpresa: number;
  centro: string;
  idCentro: number;
  idTipoDocumento: number;
  documentoNombre: string;
  sensibilidades: string;
  puesto_id: string;
  accionesRealizadas: boolean;
  gdprId: number;
  fechaAceptacionGdpr: Date;
  gdpr: any;
  ubicacion: string;
}

@Component({
  selector: 'app-prevencion-documentos-personas-trabajadoras',
  templateUrl: './prevencion-documentos-personas-trabajadoras.component.html',
  styleUrls: ['./prevencion-documentos-personas-trabajadoras.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class PrevencionDocumentosPersonasTrabajadorasComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    public utils: UtilsService,
    private router: Router,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
    public globals: Globals,
    private modalRgpd: MatDialog,
    public translate: TranslateService,
    private cdRef:ChangeDetectorRef
  ) { }
  environment = environment;
  documentationForm: FormGroup;
  empresasList: Empresa[];
  centroList: Centro[];
  aprobDocDataDto: any;
  mostrarTabla: boolean;
  mensajeExplicativo: SafeHtml;
  isLoginSimulado: boolean = false;
  compartirIcpt: boolean = false;

  closeImgUrl = '../../assets/img/close.svg';
  searchImgUrl = '../../assets/img/search.svg';
  cleanImgUrl = '../../assets/img/borrar_filtros.svg';
  excelImgUrl = '../../assets/img/excel.svg';
  mailImgUrl = '../../assets/img/mail.svg';
  downloadImgUrl = '../../assets/img/download.svg';
  downloadForOfflineImgUrl = '../../assets/img/download_for_offline.svg';
  maxDate: Date;
  minDate: Date;
  tableHeaders: string[] = [
    'checklist',
    'nombrePuesto',
    'sensibilidades'
  ];

  idCompaniesSelectedList = [];
  idCentrosSelectedList = [];
  tipoDocumentoId: any;
  infDocPersonasTrabajadorasDto: any;
  dataSource: any;
  dataSourceAux = new MatTableDataSource<PrevencionDocumentosPersonasTrabajadorasInterface>();
  idCompaniesListResult: any;
  idCentrosListResult: any;

  tienePuestosTrabajo = false;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('TABLEDOCUMENTSINFORMATIONWORKERS') table: ElementRef;
  @ViewChild('TABLEDOCUMENTSINFORMATIONWORKERS') exportTableDirective: ElementRef;


  //Evita que se produzca el ERROR Error: ExpressionChangedAfterItHasBeenCheckedError
  ngAfterViewChecked(): void{
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    let titulo = "<p>* <font COLOR=\"orange\">MT</font> = Maternidad <font COLOR=\"lightblue\">LAC</font> = Lactancia <font COLOR=\"purple\">DIS</font> = Discapacidad- <font COLOR=\"pink\">ME</font> = Menor de Edad <font COLOR=\"brown\">OT</font> = Otras</p>";
    this.translate.get('MENSAJE_EXPLICATIVO_INFORMACION_PERSONAS_TRABAJADORAS').subscribe((res: string) => {
      titulo = res;
    });
    this.mensajeExplicativo = titulo;

    //En el caso de que se esté realizando un loginSimulado, no tendrá que guardarse
    let loginSimulado = localStorage.getItem("loginSimulado");
    if (loginSimulado !== null && loginSimulado === "true")
      this.isLoginSimulado = true;

    this.mostrarTabla = false;
    //Se inicializa el formulario
    this.initForm();
    this.getUserData();
  }

  initForm() {
    this.documentationForm = this.formBuilder.group({
      empresaForm: new FormControl('', [Validators.required]),
      centroForm: new FormControl('', [Validators.required]),
      selectEmpresasRadioForm: new FormControl('1'),
      selectCentrosRadioForm: new FormControl('1')
    });

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
        $('.mat-tab-list').css('transform', 'translateX(0px)');
      });
    }
  }

  getUserData(): void {
    this.userService.getUser().subscribe(user => {
      this.empresasList = user.empresas;
      this.updateEmpresasYCentros();
      //this.getFilteredDocuments();//NOTA IMPORTANTE: Por petición de PREVING (13/01/2022) a partir de ahora las pantallas con descarga de documentos, se omite la 1º llamada.
    });
  }

  updateEmpresasYCentros() {
    if (this.empresasList.length == 1) {
      this.documentationForm.controls.empresaForm.setValue([this.empresasList[0].idEmpresa]);
      this.empresasList.forEach(empresa => {
        if (empresa.centros.length == 1) {
          this.documentationForm.controls.centroForm.setValue([empresa.centros[0].idCentro]);
        }
      })
    }
  }

  resetForm(): void {
    setTimeout(() => { //setTimeout needed on form reset
      this.setDefaultForm();
      //this.getUserData(); //NOTA IMPORTANTE: No se vuelve a obtener los documentos cuando se limpie el filtro por petición de Preving (23/09/2021)
      this.updateEmpresasYCentros();
      this.initColsOrder();
    });
  }

  //Seteo de formularios
  setDefaultForm(): void {
    this.documentationForm.controls['selectEmpresasRadioForm'].setValue('1');
    this.documentationForm.controls['selectCentrosRadioForm'].setValue('1');
    this.documentationForm.controls['empresaForm'].setValue('');
    this.documentationForm.controls['centroForm'].setValue('');
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


  onSubmit() {
    this.getFilteredDocuments();
  }

  getEmpresaCentro() {
    if ((this.documentationForm.get('empresaForm').value === "") || (this.documentationForm.get('empresaForm').value && this.documentationForm.get('empresaForm').value.length == 0)) {
      this.idCompaniesSelectedList = [];
      this.idCompaniesListResult = this.idCompaniesSelectedList;
    } else {
      this.idCompaniesListResult = this.documentationForm.get('empresaForm').value;
    }

    if ((this.documentationForm.get('centroForm').value === "") || (this.documentationForm.get('centroForm').value && this.documentationForm.get('centroForm').value.length == 0)) {
      this.idCentrosSelectedList = [];
      this.idCentrosListResult = this.idCentrosSelectedList;
    } else {
      this.idCentrosListResult = this.documentationForm.get('centroForm').value;
    }
  }

  getFilteredDocuments() {
    this.spinner.show();
    this.getEmpresaCentro();
    //Se guarda el id de Tipo de documento.
    //Por defecto es el que corresponde a la pantalla. En este caso Información Puestos Trabajo.
    this.tipoDocumentoId = [this.globals.puesto_trabajo];//52

    let validacionEmpresaCentro: boolean = this.comprobacionSeleccionEmpresaYCentro(this.documentationForm.get('empresaForm').value, this.documentationForm.get('centroForm').value);

    if(validacionEmpresaCentro){
      let idEmpresasList: number[] = [];
      let idCentrosList: number[] = [];
      //Método que comprueba si alguno de los fitlros de Empresa y Centro está en 'activo' o en 'inactivo' y va añadiendo empresas/centros a sus respectivas listas
      this.utils.envioDatosConFiltroActivoInactivo (this.documentationForm.get('selectEmpresasRadioForm').value,
                                          this.documentationForm.get('selectCentrosRadioForm').value,
                                          this.documentationForm.get('empresaForm').value,
                                          this.documentationForm.get('centroForm').value,
                                          this.empresasList,
                                          idEmpresasList,
                                          idCentrosList);

      //Se comprueba si el usuario había seleccionado alguna empresa en el campo 'empresaForm' para
      //alterar o no los atributos a enviar al BACK
      let idsEmpresas: any[] = [];
      let idsCentros: any[] = [];

      if (this.documentationForm.get('centroForm').value.length === 0) {
        this.idCentrosListResult = [idCentrosList];
      } else if (this.documentationForm.get('centroForm').value.length > 0 && this.idCentrosListResult.length === 0){
        this.documentationForm.get('centroForm').value.forEach(idCentro => {
          this.idCentrosListResult.push(idCentro);
        });
      }


      if (this.documentationForm.get('empresaForm').value.length === 0) {
        this.idCompaniesListResult = [idEmpresasList];
      } else if (this.documentationForm.get('empresaForm').value.length > 0 && this.idCompaniesListResult.length === 0){
        this.documentationForm.get('empresaForm').value.forEach(idEmpresa => {
          this.idCompaniesListResult.push(idEmpresa);
        });
      }
      idsEmpresas = [this.idCompaniesListResult];
      idsCentros = [this.idCentrosListResult];

      this.infDocPersonasTrabajadorasDto = {
        listaIdsTipoDocumento: this.tipoDocumentoId,
        listaIdsEmpresas: idsEmpresas,
        listaIdsCentros:  idsCentros,
        nombreDocumento: "",
        listaFiltroMetadatosDto: [
           {
             nombreMetadato: "observaciones",
             listaIdsValoresDato: []
           }
        ]
      }

      this.userService.getMedicalDocuments(this.infDocPersonasTrabajadorasDto).subscribe(results => {
        this.tienePuestosTrabajo = false;
        let result: PrevencionDocumentosPersonasTrabajadorasInterface[] = [];
        if (results != undefined && results.length > 0) {
          results.forEach(item => {
            var nDatoSensibilidades = 0;
            var nPuesto = 0;
            var c = 0;
            if (item.tipoDocumento?.idTipoDocumento == this.globals.puesto_trabajo) {
              this.tienePuestosTrabajo = true;  //Si tengo algun documento del tipo "Información de Puestos de Trabajo" muestro el botón de Descarga de 'Unificados'.
            }
            item.datos.forEach(dato => {
              if (dato.nombre === this.globals.metadato_sensibilidades) nDatoSensibilidades = c;
              if (dato.nombre === this.globals.metadato_puesto_trabajo) nPuesto = c;
              c++;
            })
            result.push({
              idDocumento: item.idDocumento,
              empresa: item.empresa?.nombre,
              idEmpresa: item.empresa?.idEmpresa,
              centro: item.centro?.nombre,
              idCentro: item.centro?.idCentro,
              idTipoDocumento: item.tipoDocumento?.idTipoDocumento,
              documentoNombre: item.nombre,
              sensibilidades: item.datos[nDatoSensibilidades]?.valor,
              puesto_id: item.datos[nPuesto].valor,
              accionesRealizadas: item.accionesRealizadas,
              gdprId: item.gdpr?.idGdpr,
              fechaAceptacionGdpr: item.fechaAceptacion,
              gdpr: item.gdpr,
              ubicacion: item.ubicacion,
            });
          });

          this.dataSource = new MatTableDataSource(result);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          //Fix sort problem: sort mayúsculas y minúsculas
          this.dataSource.sortingDataAccessor = (item, property) => {
            if (!item[property])
              return "";

            if (typeof item[property] === 'string')
              return item[property].toLocaleLowerCase();

            return item[property];

          };

          //variable auxiliar
          this.dataSourceAux = new MatTableDataSource(results);
          this.dataSourceAux.sort = this.sort;
          this.dataSourceAux.paginator = this.paginator;

          this.dataSourceAux.sortingDataAccessor = (item, property) => {
            if (!item[property])
              return "";

            if (typeof item[property] === 'string')
              return item[property].toLocaleLowerCase();
            return item[property];
          };

          this.mostrarTabla = true;
          if (environment.debug) console.log("Succes");
        }else if(results.length === 0){
          this.utils.mostrarMensajeSwalFireDocumentosNoEncontrados();
        }
        this.spinner.hide();

      }), (error => {
        if (environment.debug) console.log("Error");
      })
    }else{
      //En caso de que no se haya validado Empresa o Centro, se oculta el spinner
      this.spinner.hide();
    }
  }

  comprobacionSeleccionEmpresaYCentro(empresaList, centroList): boolean{
    let validacionEmpresa: boolean = true;
    let validacionCentro: boolean = true;

    if (this.idCompaniesListResult.length === 0) {
      validacionEmpresa = false;
    } else {
      if (this.idCompaniesListResult.length > 1)
        validacionEmpresa = false;
    }

    if (this.idCentrosListResult.length === 0) {
      validacionCentro = false;
    } else {
      if (this.idCentrosListResult.length > 1)
        validacionCentro = false;
    }

    if(validacionEmpresa && validacionCentro)
      return true;
    else{
      let titulo = "Debe seleccionar una única empresa y un único centro de dicha empresa para proceder con la búsqueda";
      this.translate.get('SELECCION_UNICA_EMPRESA_Y_UNICO_CENTRO').subscribe((res: string) => {
        titulo = res;
      });
      //Se muestra mensaje al usuario
      this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
      return false;
    }
  }

  checkAllRows(event) {
    if (this.dataSource.data)
      this.dataSource.data.forEach(val => {
        val.checked = event.checked;
      });
  }

  checkShareDoc(event) {
    this.compartirIcpt = event.checked;
  }

  /*descarga multiple*/
  descargarIcpt(modoDescarga: number) {
    let titulo = '';
    const docsIcpt: Array<DocIcpt> = new Array<DocIcpt>();
    if (this.dataSource.data) {
      this.dataSource.data.forEach(documento => {
        if (documento.checked) {
          let icpt: DocIcpt = new DocIcpt();
          icpt.idCentro = Number(documento.idCentro);
          icpt.idEmpresa = Number(documento.idEmpresa);
          icpt.idTipoDoc = Number(documento.idTipoDocumento);
          icpt.idPuesto = Number(documento.puesto_id);

          docsIcpt.push(icpt);
          icpt = new DocIcpt();
        }
      });
      if (docsIcpt.length > 0 && docsIcpt.length <= this.globals.extranet_maximo_documentos_multiple) {
        if (!this.compartirIcpt) {
          titulo = 'Esta descarga puede tardar unos minutos...';
          this.translate.get('INFO_DESCARGA_PUEDE_TARDAR_MINUTOS').subscribe((res: string) => {
            titulo = res;
          });
          Swal.fire({
            icon: 'info',
            title: titulo,
            confirmButtonColor: 'var(--blue)',
            allowOutsideClick: false
          }).then((result) => {
            if (result.isConfirmed) {
              //NOTA: Sólo se realizará la acción de descarga, una vez el usuario haya entendido de que puede tardar en descargarse
              this.spinner.show();
              if (modoDescarga === this.globals.DESCARGA_UNIFICADA) {
                this.utils.getDocumentosIcpt(docsIcpt, this.globals.DESCARGA_UNIFICADA).subscribe(pdfBase64 => {
                  if (pdfBase64) {
                    const linkSource = `data:application/pdf;base64,${pdfBase64.fichero}`;
                    const filename = pdfBase64.nombreFichero + '.pdf';
                    const downloadLink = document.createElement('a');
                    downloadLink.href = linkSource;
                    downloadLink.download = filename;
                    downloadLink.click();
                  }
                  this.spinner.hide();
                });
              } else if (modoDescarga === this.globals.DESCARGA_SEPARADA) {
                this.utils.getDocumentosIcpt(docsIcpt, this.globals.DESCARGA_SEPARADA).subscribe(zipBase64 => {
                  if (zipBase64) {
                    let downloadLink = document.createElement('a');
                    //Puede darse el caso de realizar una descarga separada de un sólo documento, por tanto se devuelve un PDF
                    if(docsIcpt.length === 1){
                      downloadLink.href = `data:application/pdf;base64,${zipBase64.fichero}`;
                      downloadLink.download = zipBase64.nombreFichero + '.pdf';
                    }else{
                      downloadLink.href = `data:application/zip;base64,${zipBase64.fichero}`;
                      downloadLink.download = 'icpt' + '.zip';
                    }
                    downloadLink.click();
                  }
                  this.spinner.hide();
                });
              }
            }
          });
        } else { // OPCION COMPARTIR DOCUMENTO
          this.compartirICPT(docsIcpt, modoDescarga);
        }
      }else if (docsIcpt.length > this.globals.extranet_maximo_documentos_multiple){
      	this.utils.mostrarMensajeSwalFireSobrepasadoLimiteDescargaMultiple(docsIcpt.length);
      }else{
        titulo = "Debe seleccionar al menos un documento";
        this.translate.get('ERROR_SELECCIONA_DESCARGAR').subscribe((res: string) => {
          titulo = res;
        });
        this.utils.mostrarMensajeSwalFire('error', titulo, '', 'var(--blue)', false);
      }
    }
  }

  /*compartir selección*/
  compartirICPT(documentos, modoDescarga) {
    let menuNameComponent = 'Prevención tecnica';
    this.translate.get('PREVENCION_TECNICA').subscribe((res: string) => {
      menuNameComponent = res;
    });
    let subMenuNameComponent = 'Documentos tecnicos';
    this.translate.get('INFORMACION_PERSONAS_TRABAJADORAS').subscribe((res: string) => {
      subMenuNameComponent = res;
    });

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      menuName: menuNameComponent,
      subMenuName: subMenuNameComponent
    };
    dialogConfig.width = '50%';
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;

    const dialogRef = this.dialog.open(ShareDocumentComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {

      if (result !== undefined) {
        const data = {
          to: result.emailFormControl,
          cc: result.ccFormControl,
          cco: result.ccoFormControl,
          subject: result.subjectFormControl,
          body: result.bodyFormControl,
          docIcptList: documentos
        };
        let titulo = 'Se ha procedido al envío por correo electrónico de la documentación indicada';
        this.translate.get('ENVIO_DOC_INICIADA').subscribe((res: string) => {
          titulo = res;
        });
        this.utils.mostrarMensajeSwalFire('info', titulo, '', 'var(--blue)', false);
        this.utils.compartirDocumentoIcpt(data, modoDescarga).subscribe(result => {
          if (!result) {
            let titulo = 'Error al enviar el mensaje';
            this.translate.get('ERROR_ENVIO_MENSAJE').subscribe((res: string) => {
              titulo = res;
            });
            this.utils.mostrarMensajeSwalFire('error', titulo, '', 'var(--blue)', false);
          }
        });
      }
    });
  }

}
