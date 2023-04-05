import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../environments/environment';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Empresa } from 'src/app/Model/Empresa';
import { UserDto } from 'src/app/Model/UserDto';
import { PdfView } from 'src/app/modales/pdfView/pdfView.component';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { ShareDocumentComponent } from 'src/app/modales/shareDocument/shareDocument.component';
import { TranslateService } from '@ngx-translate/core';
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ModalModifyBillsMail } from 'src/app/modales/modalModifyBillsMail/modalModifyBillsMail.component';
import { ModalEmailBillsPoliticts } from 'src/app/modales/modalEmailBillsPoliticts/modalEmailBillsPoliticts.component';
import { UtilsService } from 'src/app/services/utils.service';
import { Globals } from '../globals'
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as _moment from 'moment';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MY_FORMATS } from '../../../config/config';
import { ChangeDetectorRef } from '@angular/core';

const moment = _moment;

export interface BillsInterface {
  checked: boolean;
  idDocumento: number;
  idTipoDocumento: number;
  fechaDocumento: string;
  nombreEmpresa: string;
  numeroFactura: string;
  nombreFactura: string;
  nombreEntidad: string;
  importe: number;
  accionesRealizadas: boolean;
  ubicacion: string;
  listaHistoricoDocumentoDto: any[];
}

@Component({
  selector: 'app-preving-bills',
  templateUrl: './preving-bills.component.html',
  styleUrls: ['./preving-bills.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class PrevingBillsComponent implements OnInit {
  environment = environment;
  cleanImgUrl = '../../assets/img/borrar_filtros.svg';
  closeImgUrl = '../../assets/img/close.svg';
  searchImgUrl = '../../assets/img/search.svg';
  filterImgUrl = '../../assets/img/filter.svg';
  excelImgUrl = '../../assets/img/excel.svg';
  mailImgUrl = '../../assets/img/mail.svg';
  downloadImgUrl = '../../assets/img/download.svg';

  /*font awesome*/
  faFileExcel = faFileExcel;

  empresasList: Empresa[];
  empresa: string;
  entidadList: any[];

  userForm: FormGroup;
  user: string;

  resultado: any;
  userDataDto: UserDto;

  empresasAux: any;
  idCompaniesSelectedList = [];
  idEntitiesSelectedList = [];
  billsDataDto: any;

  regrexPattern:string; //Patron para los importes

  maxDate: Date;
  minDate: Date;
  mostrarTabla: boolean;
  isLoginSimulado: boolean = false;

  tableHeaders: string[] = [
    'checklist',
    'newList',
    'fechaDocumento',
    'nombreEmpresa',
    'numeroFactura',
    'nombreEntidad',
    'importe',
    'specialAction'
  ];
  panelOpenState = false;
  dataSource: MatTableDataSource<BillsInterface>;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('TABLEFACTURAS') table: ElementRef;
  @ViewChild('TABLEFACTURAS') exportTableDirective: ElementRef;
  sortBy: any;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private spinner: NgxSpinnerService,
    public utils: UtilsService,
    public dialog: MatDialog,
    private globals: Globals,
    public translate: TranslateService,
    private cdRef:ChangeDetectorRef
  ) { }

  //Evita que se produzca el ERROR Error: ExpressionChangedAfterItHasBeenCheckedError
  ngAfterViewChecked()
  {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    //En el caso de que se esté realizando un loginSimulado, no tendrá que guardarse
    let loginSimulado = localStorage.getItem("loginSimulado");
    if (loginSimulado !== null && loginSimulado === "true")
      this.isLoginSimulado = true;

    this.spinner.show();
    this.mostrarTabla = false;
    /*inicializacion de formulario*/
    this.initForm();
    this.getUserData();
    this.getAllEntitiesUser();

    //Restore table cols order
    if (localStorage.getItem('tableColsOrder')) {
      let localStorageObj: object;
      localStorageObj = JSON.parse(localStorage.getItem('tableColsOrder'));

      if (localStorageObj[this.constructor.name] &&
        Array.isArray(localStorageObj[this.constructor.name]) &&
        localStorageObj[this.constructor.name].length == this.tableHeaders.length)
        this.tableHeaders = localStorageObj[this.constructor.name];
    }

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

  initForm() {
    //Soporta cadena vacia '', números en negativo o en valor positivo hasta X digitos y con decimales
    this.regrexPattern = "^[-]{0,1}[0-9]+([.][0-9]{1,2}){0,1}$";

    this.userForm = this.formBuilder.group({
      empresaForm: new FormControl(''),
      entidadForm: new FormControl(''),
      importeDesdeForm: ['', [Validators.required, Validators.pattern(this.regrexPattern)]],
      importeHastaForm: ['', [Validators.required, Validators.pattern(this.regrexPattern)]],
      fechaDesdeForm: new FormControl(moment()),
      fechaHastaForm: new FormControl(moment()),
      selectEmpresasRadioForm: new FormControl('1'),
      selectAllCheckBox: new FormControl(''),
      todosCentrosForm: true
    },{
      validator: this.formValidator('importeDesdeForm', 'importeHastaForm')
    });
    this.setDefaultForm();
  }

  setDefaultForm(): void {
    var now = new Date();
    now.setHours(23, 59, 59);
    this.maxDate = now;
    var nYearsAgo = new Date();
    nYearsAgo.setDate(nYearsAgo.getDate() - (365 * this.globals.extranet_intervalo_fechas_filtro));
    nYearsAgo.setHours(0, 0, 0);
    this.minDate = nYearsAgo;
    this.userForm.controls['selectEmpresasRadioForm'].setValue('1');
    this.userForm.controls['fechaDesdeForm'].setValue(nYearsAgo);
    this.userForm.controls['fechaHastaForm'].setValue(now);
    this.userForm.controls['empresaForm'].setValue([]);
    this.userForm.controls['entidadForm'].setValue([]);
    this.userForm.controls['importeDesdeForm'].setValue('');
    this.userForm.controls['importeHastaForm'].setValue('');
  }

  resetForm(): void {
    setTimeout(() => { //setTimeout needed on form reset
      this.setDefaultForm();
      this.updateEmpresasYCentros();
      //this.getFilteredBills();  //NOTA IMPORTANTE: No se vuelve a obtener los documentos cuando se limpie el filtro por petición de Preving (23/09/2021)
    });
  }
  onSubmit(): void {
    this.getFilteredBills();
  }

  getUserData(): void {
    this.userService.getUser().subscribe(user => {
      this.empresasList = user.empresas;
      this.empresasAux = user.empresas;
      this.updateEmpresasYCentros();
      //this.getFilteredBills();//NOTA IMPORTANTE: Por petición de PREVING (13/01/2022) a partir de ahora las pantallas con descarga de documentos, se omite la 1º llamada.
    });

  }

  getAllEntitiesUser() {
    this.userService.getAllEntitiesUser().subscribe(entities => {
      if (entities)
        this.entidadList = entities;

      this.spinner.hide();
    });
  }

  updateEmpresasYCentros() {
    if (this.empresasList.length == 1) {
      this.userForm.controls.empresaForm.setValue([this.empresasList[0].idEmpresa]);
    }
  }


  getEmpresasUser() {
    this.userService.getEmpresasUser().subscribe(data => {
      if (data) {
        this.empresasList = data;
        if (environment.debug) console.log("Succes");
      }/*EN CASO DE FALLO*/
      else {
        this.spinner.hide();
      }
    })
  }

  getFilteredBills() {
    let idCompaniesListResult: number[] = [];
    let idEntitiesListResult;

    if ((this.userForm.get('empresaForm').value === "") || (this.userForm.get('empresaForm').value && this.userForm.get('empresaForm').value.length == 0)) {
      this.idCompaniesSelectedList = [];
      /*this.empresasList.forEach(empresa => {
        this.idCompaniesSelectedList.push(empresa.idEmpresa);
      });*/
      idCompaniesListResult = this.idCompaniesSelectedList;
    } else {
      idCompaniesListResult = this.userForm.get('empresaForm').value;
    }

    if ((this.userForm.get('entidadForm').value === "") || (this.userForm.get('entidadForm').value && this.userForm.get('entidadForm').value.length == 0)) {
      this.idEntitiesSelectedList = [];
      /*this.empresasList.forEach(entity => {
        this.idEntitiesSelectedList.push(entity.idEmpresa);
      });*/
      idEntitiesListResult = this.idEntitiesSelectedList;
    } else {
      idEntitiesListResult = this.userForm.get('entidadForm').value;
    }

    let fechaFin;
    if (this.userForm.get('fechaHastaForm').value!==null)
    {
      fechaFin = new Date(this.userForm.get('fechaHastaForm').value);
      fechaFin.setHours(23, 59, 59);
    }

    let fechaInicio;
    if (this.userForm.get('fechaDesdeForm').value!==null)
    {
      fechaInicio = new Date(this.userForm.get('fechaDesdeForm').value);
      fechaInicio.setHours(0, 0, 0);
    }

    let idEmpresasList: number[] = [];
    let idCentrosList: number[] = [];
    //Método que comprueba si alguno de los fitlros de Empresa y Centro está en 'activo' o en 'inactivo' y va añadiendo empresas/centros a sus respectivas listas
    this.utils.envioDatosConFiltroActivoInactivo (this.userForm.get('selectEmpresasRadioForm').value,
                                        0,
                                        this.userForm.get('empresaForm').value,
                                        "",
                                        this.empresasList,
                                        idEmpresasList,
                                        idCentrosList);

    //Se comprueba si el usuario había seleccionado alguna empresa/centro en los campos 'empresaForm' y 'centroForm' para
    //alterar o no los atributos a enviar al BACK
    if (this.userForm.get('empresaForm').value.length === 0) {
        idCompaniesListResult = idEmpresasList;
    } else if (this.userForm.get('empresaForm').value.length > 0 && idCompaniesListResult.length === 0){
        this.userForm.get('empresaForm').value.forEach(idEmpresa => {
            idCompaniesListResult.push(idEmpresa);
        });
    }

    this.billsDataDto = {
      listaIdsTipoDocumento: [this.globals.facturas],
      listaIdsEmpresas: idCompaniesListResult,
      fechaInicio: fechaInicio || '',
      fechaFin: fechaFin || '',
      listaFiltroMetadatosDto: [
        {
          nombreMetadato: "entidad",
          listaIdsValoresDato: this.userForm.get('entidadForm').value || []
        },
        {
          nombreMetadato: "importe",
          rangoIni: this.userForm.get('importeDesdeForm').value || '',
          rangoFin: this.userForm.get('importeHastaForm').value || ''
        }
      ]
    }

    this.spinner.show();
    this.userService.getFilteredBills(this.billsDataDto).subscribe(results => {
      if(results !== undefined && results.length > 0){
      	let result: BillsInterface[] = [];
        results.forEach(item => {
          var nDatoImporte = 0;
          var nDatoNumFactura = 0;
          var nDatoEntidad = 0;
          var c = 0;
          item.datos.forEach(dato => {
            if (dato.nombre === this.globals.metadato_importe) nDatoImporte = c;
            if (dato.nombre === this.globals.metadato_numero_factura) nDatoNumFactura = c;
            if (dato.nombre === this.globals.metadato_entidad) nDatoEntidad = c;
            c++;
          })
          result.push({
            checked: false,
            idDocumento: item.idDocumento,
            idTipoDocumento: item.tipoDocumento.idTipoDocumento,
            fechaDocumento: item.fechaDocumento,
            nombreEmpresa: item.empresa.nombre,
            nombreFactura: item.nombre,
            numeroFactura: item.datos[nDatoNumFactura].valor,
            nombreEntidad: item.datos[nDatoEntidad].valorDto.nombre,
            importe: item.datos[nDatoImporte].valor,
            accionesRealizadas: item.accionesRealizadas,
            ubicacion: item.ubicacion,
            listaHistoricoDocumentoDto: []
            //listaHistoricoDocumentoDto: item?.listaHistoricoDocumentoDto || [] //Se comenta ya que ahora el Back sólo va a devolver si tiene acciones realizadas o no
          });
        });
        this.dataSource = new MatTableDataSource(result);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        //Fix sort problem: sort mayúsculas y minúsculas
        this.dataSource.sortingDataAccessor = (item, property) => {
          if (property == 'fechaDocumento')
            return new Date(item.fechaDocumento);

          if (property == 'importe')
            return Number(item[property]);

          if (typeof item[property] === 'string')
            return item[property].toLocaleLowerCase();

          return item[property];

        };

        this.mostrarTabla = true;
        if (environment.debug) console.log("Succes");
      }else if(results !== undefined && results.length === 0){
        this.utils.mostrarMensajeSwalFireDocumentosNoEncontrados();
      }
      this.spinner.hide();


    }), (error => {
      if (environment.debug) console.log("Error");
    })
  }

  /*acciones especiales*/

  previsualizar(element) {
    this.spinner.show();
    this.billsDataDto = {
      listaIdsDocumentos: [element.idDocumento],
      listaIdsTiposDocumentos: [element.idTipoDocumento],
      listaUuidsDocumentos: [element.ubicacion],
      loginSimuladoActivado: this.isLoginSimulado,
      accion: { idAccionDoc: "3" }
    }
    this.spinner.show();
    this.utils.getFile(this.billsDataDto).subscribe(pdfBase64 => {
      if(pdfBase64){
        const byteArray = new Uint8Array(atob(pdfBase64.fichero).split('').map(char => char.charCodeAt(0)));
        let blob = new Blob([byteArray], { type: 'application/pdf' });
        // Here is your URL you can use
        const url = window.URL.createObjectURL(blob);
        // i.e. display the PDF content via iframe
        const dialogRef = this.dialog.open(PdfView, {
          width: '50%',
          data: url
        });

        //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
        if (!this.isLoginSimulado){
          //Recarga los datos de nuevo para quitar nuevo documento y mostrar las acciones de los documentos
          //this.recargarTablaDatosPorAccion(element);
          this.utils.recargarTablaDatosPorAccion(element, this.dataSource.filteredData, this.spinner, false, null, false, null, false);
        }

        dialogRef.afterClosed().subscribe(result => {
        });
      }
      this.spinner.hide();
    })
  }

  /*descargar seleccion*/
  descargar(element) {
    this.spinner.show();
    this.billsDataDto = {
      listaIdsDocumentos: [element.idDocumento],
      listaIdsTiposDocumentos: [element.idTipoDocumento],
      listaUuidsDocumentos: [element.ubicacion],
      loginSimuladoActivado: this.isLoginSimulado,
      accion: { idAccionDoc: "2" }
    }
    this.spinner.show();
    this.utils.getFile(this.billsDataDto).subscribe(pdfBase64 => {
      if(pdfBase64){
        const linkSource = `data:application/pdf;base64,${pdfBase64.fichero}`;
        const filename = pdfBase64.nombreFichero + '.pdf';
        const downloadLink = document.createElement('a');
        downloadLink.href = linkSource;
        downloadLink.download = filename;
        downloadLink.click();

        //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
        if (!this.isLoginSimulado){
          //Recarga los datos de nuevo para quitar nuevo documento y mostrar las acciones de los documentos
          //this.recargarTablaDatosPorAccion(element);
          this.utils.recargarTablaDatosPorAccion(element, this.dataSource.filteredData, this.spinner, false, null, false, null, false);
        }
      }
      this.spinner.hide();

    })
  }

  descargarMultiple() {
    this.spinner.show();
    let listaIdsDocumentos: number[] = [];
    let listaIdsTiposDocumentos: number[] = [];
    let listaUuidsDocumentos: string[] = [];
    let documentosConAcciones = false;

    if (this.dataSource.data) {
      this.dataSource.data.forEach(factura => {
        if (factura.checked) {
          listaIdsDocumentos.push(factura.idDocumento);
          listaIdsTiposDocumentos.push(factura.idTipoDocumento);
          listaUuidsDocumentos.push(factura.ubicacion);
          if (factura.accionesRealizadas) {
            documentosConAcciones = true;
          }
        }
      });

      if (listaIdsDocumentos.length > 0 && listaIdsDocumentos.length <= this.globals.extranet_maximo_documentos_multiple){
        this.spinner.show();
        this.utils.getZipFile({
          listaIdsDocumentos,
          listaIdsTiposDocumentos,
          listaUuidsDocumentos,
          loginSimuladoActivado: this.isLoginSimulado,
          accion: { idAccionDoc: "2" }
        }).subscribe(zipBase64 => {
          if(zipBase64){
            //Variables para traducción
            var nombreZip = "Facturas";
            this.translate.get('FACTURAS').subscribe((res: string) => {
              nombreZip = res;
            });
            let downloadLink = document.createElement('a');
            downloadLink.href = `data:application/zip;base64,${zipBase64.fichero}`;
            downloadLink.download = nombreZip + '.zip';
            downloadLink.click();

            //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
            if (!this.isLoginSimulado){
              //JSON que sirve para recargar los datos de nuevo para quitar nuevo documento o no y mostrar las acciones de los documentos
              let jsonInfoDocumentosDto: any[] = [];
              listaIdsDocumentos.forEach(idDocumentoInfo => {
                  let jsonInfoDocumentoDto = {
                    idDocumento: idDocumentoInfo
                  };
                  jsonInfoDocumentosDto.push(jsonInfoDocumentoDto);
              });

              //this.recargarTablaDatosMultiplePorAccion(jsonInfoDocumentosDto);
              this.utils.recargarTablaDatosMultiplePorAccion(jsonInfoDocumentosDto, this.dataSource.filteredData, this.spinner, false, null, false, null, false);
            }
          }
          this.spinner.hide();

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
        this.utils.mostrarMensajeSwalFire('error', titulo, '', 'var(--blue)', false);
      }
    }
  }

  /*compartir */
  compartir(element) {
    let menuNameComponent = 'Administración';
    this.translate.get('ADMINISTRACION').subscribe((res: string) => {
      menuNameComponent = res;
    });
    let subMenuNameComponent = 'Facturas';
    this.translate.get('FACTURAS').subscribe((res: string) => {
      subMenuNameComponent = res;
    });

    const dialogRef = this.dialog.open(ShareDocumentComponent, {
      width: '50%',
      data: {
        element: element,
        menuName: menuNameComponent,
        subMenuName: subMenuNameComponent
      }
    });

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
            listaIdsTiposDocumentos: [element.idTipoDocumento],
            listaUuidsDocumentos: [element.ubicacion],
            loginSimuladoActivado: this.isLoginSimulado,
            accion: {
              idAccionDoc: '1'
            },
            filename: element.nombreFactura + ".pdf"
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
          } else {
            //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
            if (!this.isLoginSimulado){
              //Recarga los datos de nuevo para quitar nuevo documento y mostrar las acciones de los documentos
              //this.recargarTablaDatosPorAccion(element);
              this.utils.recargarTablaDatosPorAccion(element, this.dataSource.filteredData, this.spinner, false, null, false, null, false);
            }
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
    let listaIdsTiposDocumentos: number[] = [];
    let listaUuidsDocumentos: string[] = [];
    let listaDocumentos: any[] = [];
    let documentosConAcciones = false;

    if (this.dataSource.data) {
      this.dataSource.data.forEach(documento => {
        if (documento.checked) {
          listaDocumentos.push(documento);
          listaIdsDocumentos.push(documento.idDocumento);
          listaIdsTiposDocumentos.push(documento.idTipoDocumento);
          listaUuidsDocumentos.push(documento.ubicacion);
          if (documento.accionesRealizadas)
            documentosConAcciones = true;
        }
      });
    }

    if (listaIdsDocumentos != null && listaIdsDocumentos.length === 0) {
      let titulo = "Debe seleccionar al menos un elemento a compartir";
      this.translate.get('ERROR_SELECCIONA_COMPARTIR').subscribe((res: string) => {
        titulo = res;
      });
      this.utils.mostrarMensajeSwalFire('error', titulo, '', 'var(--blue)', false);
    }else if (listaIdsDocumentos.length > this.globals.extranet_maximo_documentos_multiple){
    	this.utils.mostrarMensajeSwalFireSobrepasadoLimiteDescargaMultiple(listaIdsDocumentos.length);
    }else{
      let menuNameComponent = 'Administración';
      this.translate.get('ADMINISTRACION').subscribe((res: string) => {
        menuNameComponent = res;
      });
      let subMenuNameComponent = 'Facturas';
      this.translate.get('FACTURAS').subscribe((res: string) => {
        subMenuNameComponent = res;
      });
      let filenameComponent = subMenuNameComponent;

      const dialogRef = this.dialog.open(ShareDocumentComponent, {
        width: '50%',
        data: {
          element: listaDocumentos,
          menuName: menuNameComponent,
          subMenuName: subMenuNameComponent
        }
      });

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
          this.utils.mostrarMensajeSwalFire('info', titulo, '', 'var(--blue)', false);

          this.utils.compartirDocumentoZip(data).subscribe(result => {
            if (!result) {
              let titulo = "Error al enviar el mensaje";
              this.translate.get('ERROR_ENVIO_MENSAJE').subscribe((res: string) => {
                titulo = res;
              });
              this.utils.mostrarMensajeSwalFire('error', titulo, '', 'var(--blue)', false);

            } else {
              //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
              if (!this.isLoginSimulado){
                //JSON que sirve para recargar los datos de nuevo para quitar nuevo documento o no y mostrar las acciones de los documentos
                let jsonInfoDocumentosDto: any[] = [];
                listaIdsDocumentos.forEach(idDocumentoInfo => {
                    let jsonInfoDocumentoDto = {
                      idDocumento: idDocumentoInfo
                    };
                    jsonInfoDocumentosDto.push(jsonInfoDocumentoDto);
                });

                //this.recargarTablaDatosMultiplePorAccion(jsonInfoDocumentosDto);
                this.utils.recargarTablaDatosMultiplePorAccion(jsonInfoDocumentosDto, this.dataSource.filteredData, this.spinner, false, null, false, null, false);
              }
            }
          }), (error => {
            if (environment.debug) console.log("Error al Enviar EMAIL - Compartir Documento");
          });
        }
      });
    }
  }

  selectAll(formName, formControlName, values, fieldName) {
    /*si viene 1 elemento en los controls es que estamos marcando el selectAll...
    si hay mas de uno deseleccionamos*/
    if (this[formName].controls[formControlName].value.length != 1) {
      this[formName].controls[formControlName].setValue([]);
    } else {
      let result = [];
      values.forEach(item => {
        result.push(item[fieldName]);
      })
      this[formName].controls[formControlName].setValue(result);
    }
  }


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

    /*si viene 1 elemento en los controls es que estamos marcando el selectAll...
    si hay mas de uno deseleccionamos*/
    if (this[formName].controls[formControlName].value.length != 1) {
      this[formName].controls[formControlName].setValue([]);
    } else {
      this[formName].controls[formControlName].setValue(result);
    }
  }

  downloadSelectedAsExcel() {
    this.spinner.show();
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    let JSONWS: XLSX.WorkSheet;
    let dataJS = [];

    //Variables para traducción
    var nombreExcel = "Facturas";
    this.translate.get('FACTURAS').subscribe((res: string) => {
      nombreExcel = res;
    });
    var columnaFecha = "Fecha";
    this.translate.get('FECHA').subscribe((res: string) => {
      columnaFecha = res;
    });
    var columnaNombreEmpresa = "Empresa";
    this.translate.get('EMPRESA').subscribe((res: string) => {
      columnaNombreEmpresa = res;
    });
    var columnaNumeroFactura = "Nº factura";
    this.translate.get('N_FACTURA').subscribe((res: string) => {
      columnaNumeroFactura = res;
    });
    var columnaNombreEntidad = "Entidad";
    this.translate.get('ENTIDAD_FACTURA').subscribe((res: string) => {
      columnaNombreEntidad = res;
    });
    var columnaImporte = "Importe";
    this.translate.get('IMPORTE').subscribe((res: string) => {
      columnaImporte = res;
    });

    this.dataSource.filteredData.forEach(item => {
      if (item.checked == true) {
        let new_item = {};

        new_item[columnaFecha] = (new Date(item['fechaDocumento'])).toLocaleString();
        new_item[columnaNombreEmpresa] = item.nombreEmpresa;
        new_item[columnaNumeroFactura] = item.numeroFactura;
        new_item[columnaNombreEntidad] = item.nombreEntidad;
        new_item[columnaImporte] = item.importe + '€';

        dataJS.push(new_item);
      }
    });

    let result = XLSX.utils.sheet_add_json(JSONWS, dataJS);

    XLSX.utils.book_append_sheet(wb, result, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, nombreExcel + '.xlsx');
    //this.dataSource.paginator._changePageSize(paginacion);

    this.spinner.hide();
  }

  exportAsExcel() {
    this.spinner.show();
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    let JSONWS: XLSX.WorkSheet;
    let dataJS = [];

    //Variables para traducción
    var nombreExcel = "Facturas";
    this.translate.get('FACTURAS').subscribe((res: string) => {
      nombreExcel = res;
    });
    var columnaFecha = "Fecha";
    this.translate.get('FECHA').subscribe((res: string) => {
      columnaFecha = res;
    });
    var columnaNombreEmpresa = "Empresa";
    this.translate.get('EMPRESA').subscribe((res: string) => {
      columnaNombreEmpresa = res;
    });
    var columnaNumeroFactura = "Nº factura";
    this.translate.get('N_FACTURA').subscribe((res: string) => {
      columnaNumeroFactura = res;
    });
    var columnaNombreEntidad = "Entidad";
    this.translate.get('ENTIDAD_FACTURA').subscribe((res: string) => {
      columnaNombreEntidad = res;
    });
    var columnaImporte = "Importe";
    this.translate.get('IMPORTE').subscribe((res: string) => {
      columnaImporte = res;
    });

    let isElementosSelect: boolean = false;

    this.dataSource._orderData(this.dataSource.data).forEach(item => {
      if (item.checked) {
        isElementosSelect = true;
        let new_item = {};
        this.tableHeaders.forEach(tableHeader => {
          switch (tableHeader) {
            case 'fechaDocumento':
              new_item[columnaFecha] = (new Date(item['fechaDocumento'])).toLocaleDateString();
              break;
            case 'nombreEmpresa':
              new_item[columnaNombreEmpresa] = item.nombreEmpresa;
              break;
            case 'numeroFactura':
              new_item[columnaNumeroFactura] = item.numeroFactura;
              break;
            case 'nombreEntidad':
              new_item[columnaNombreEntidad] = item.nombreEntidad;
              break;
            case 'importe':
              new_item[columnaImporte] = item.importe + '€';
              break;
          }

        })

        dataJS.push(new_item);
      }

    });

    if (isElementosSelect == false) {
      let titulo = "Debe seleccionar al menos un elemento a exportar";
      this.translate.get('ERROR_SELECCIONA_EXPORTAR').subscribe((res: string) => {
        titulo = res;
      });
      this.utils.mostrarMensajeSwalFire('error', titulo, '', 'var(--blue)', false);
    } else {
      let result = XLSX.utils.sheet_add_json(JSONWS, dataJS);

      XLSX.utils.book_append_sheet(wb, result, 'Sheet1');

      /* save to file */
      XLSX.writeFile(wb, nombreExcel + '.xlsx');
    }
    //this.dataSource.paginator._changePageSize(paginacion);

    this.spinner.hide();
  }

  openDialog(idEmpresa?, emailFactura?): void {
    if (idEmpresa !== "" && emailFactura !== "") {
      const dialogRef = this.dialog.open(ModalModifyBillsMail, {
        width: '50%',
        data: { idEmpresa, emailFactura }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result !== undefined && result !== emailFactura) {
          this.modifyEmailBillsByCompany(idEmpresa, result);
        }
      });
    }
  }

  //Metodo que modifica el email de la empresa
  modifyEmailBillsByCompany(idEmpresa:number, result:string) {
    let mailActualizado:string = result;
    let empresaDto: any = {
      idEmpresa: idEmpresa,
      emailFactura: result
    }

    this.userService.modifyEmailFacturacionEmpresa(empresaDto).subscribe(data => {
      if (data) {
        let titulo = "Email modificado correctamente";
        this.translate.get('EMAIL_MODIFICADO_CORRECTAMENTE').subscribe((res: string) => {
          titulo = res;
        });

        Swal.fire({
          icon: 'success',
          title: titulo,
          confirmButtonColor: 'var(--blue)',
          allowOutsideClick: false
        }).then((result) => {
          if (result.isConfirmed) {
            //Se actualiza la información de la empresa para mostrar el mail actualizado
            //Se tiene que setear ese nuevo valor en el localStorage
            this.actualizarInfoEmpresa(idEmpresa, mailActualizado);
          }
        })
      }
    });
  }

  //Metodo que actualiza en el Front el mail de facturación de la empresa
  actualizarInfoEmpresa(idEmpresa, mailActualizado){
    //Se recoge la información de LocalStorage para actualizarla
    let userData = JSON.parse(localStorage.getItem('userDataFromUsuario'));
    userData.empresas.forEach(empresa => {
      //Se encuentra la empresa y se actualiza el email de facturación
      if (empresa.idEmpresa === idEmpresa){
        empresa.emailFactura = mailActualizado;
        return;
      }
    });

    //Se setea esta nuevo userDataFromUsuario
    localStorage.setItem('userDataFromUsuario', JSON.stringify(userData));

    //NOTA IMPORTANTE: Se actualiza la lista de donde se obtiene la información para mostrarla por pantalla,
    //ya que la vista tarda en actualizarse de 10seg a 15seg
    this.empresasAux.forEach(empresa => {
      //Se encuentra la empresa y se actualiza el email de facturación
      if (empresa.idEmpresa === idEmpresa){
        empresa.emailFactura = mailActualizado;
        return;
      }
    });
  }

  //Muestra el historico de acciones del documento
  verHistoricoDocumento(element) {
    const dialogConfig = new MatDialogConfig();
    this.utils.verHistoricoDocumentoComun(dialogConfig, element);
  }

  checkAllRows(event) {
    if (this.dataSource.data)
      this.dataSource.data.forEach(val => { val.checked = event.checked });
  }

  openDialogEfactura(idEmpresa) {
    const dialogRef = this.dialog.open(ModalEmailBillsPoliticts, {
      width: '50%',
      data: { idEmpresa }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.modifyEmailBillsByCompany(idEmpresa, result);
      }
    });
  }

  formValidator(importeDesdeForm: string, importeHastaForm: string) {
    return (userForm: FormGroup) => {
      const importeDesde = userForm.controls[importeDesdeForm];
      const importeHasta = userForm.controls[importeHastaForm];

      if (importeDesde.value == "" || (importeDesde.value == null && importeDesde.status === "VALID")){
        importeDesde.setErrors(null);
      }
      if (importeHasta.value == "" || importeHasta.value == null){
        importeHasta.setErrors(null);
      }

      if(Number(importeHasta.value) >= Number(importeDesde.value)){
        importeHasta.setErrors(null);
        importeDesde.setErrors(null);
      }else{
        if(importeHasta.value == null || importeHasta.value == "" || importeDesde.value == null || importeDesde.value == ""){
          importeHasta.setErrors(null);
          importeDesde.setErrors(null);
        }else{
          importeHasta.setErrors({ esMayor: true });
        }
      }

      /*if ( (importeDesde.errors && !importeDesde.errors.mustMatch)
          && (importeHasta.errors && !importeHasta.errors.mustMatch) ){
        return;
      }*/
    };
  }

  esValorNegativo(importe): boolean{
    return importe.indexOf('-') !== -1 ? true : false;
  }

  formatearImporte(any) {
    any.replace(".", ",");
    var decimales = any.substring(any.indexOf('.') + 1, any.length);
    var entero = any.substring(0, any.indexOf('.'));
    entero = entero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return entero + "," + decimales;
  }

  onEnterInputFrom() {
    let element: HTMLElement = document.getElementsByClassName('importeHasta')[0] as HTMLElement;
    element.focus();
  }

  onEnterInputTo() {
    let element: HTMLElement = document.getElementsByClassName('search-span')[0] as HTMLElement;
    element.click();
  }
}
