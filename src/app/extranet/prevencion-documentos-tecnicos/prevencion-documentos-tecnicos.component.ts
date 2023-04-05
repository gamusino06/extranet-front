import {ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {environment} from '../../../environments/environment';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {PdfView} from 'src/app/modales/pdfView/pdfView.component';
import {Empresa} from 'src/app/Model/Empresa';
import {Centro} from 'src/app/Model/Centro';
import Swal from 'sweetalert2';
import {UserService} from 'src/app/services/user.service';
import {UtilsService} from 'src/app/services/utils.service';
import {Router} from '@angular/router';
import {NgxSpinnerService} from 'ngx-spinner';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {Globals} from '../globals';
import * as XLSX from 'xlsx';
import {AcceptGdprDocumentComponent} from '../../modales/acceptGdprDocument/acceptGdprDocument.component';
import {ShareDocumentComponent} from 'src/app/modales/shareDocument/shareDocument.component';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import * as _moment from 'moment';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {MY_FORMATS} from '../../../config/config';
import {TranslateService} from '@ngx-translate/core';
import {ModalXlsComponent} from '../modal-xls/modal-xls.component';
import {ModalNuevoInformePtComponent} from './components/add-new-inform/modal-nuevo-informe-pt.component';
import {ReportsService} from "../../services/reports.service";
import {ModalEditarInformePtComponent} from "./components/edit-inform/modal-editar-informe-pt.component";

const moment = _moment;

export interface PrevencionDocumentosTecnicosInterface {
  idDocumento: number;
  fecha: string;
  empresa: string;
  idEmpresa: number;
  centro: string;
  empresaCentroNombre: string;
  idCentro: number;
  idTipoDocumento: number;
  tipoDocumento: string;
  subtipoDocumento: string;
  documento: string;
  documentosHijos: any[];
  tecnico: string;
  observaciones: string;
  accionesRealizadas: boolean;
  gdprId: number;
  fechaAceptacionGdpr: Date;
  gdpr: any;
  ubicacion: string;
  mostrarSegmentos: boolean;
  listaHistoricoDocumentoDto: any[];
  origen: string;
  idSubtipoDocumento: number;
}

export interface DocumentosUuid {
  idDocumento: number;
  documento: string;
  ubicacion: string;
}

export enum ORIGIN_TYPE {
  INTERNAL,
  EXTERNAL
}

@Component({
  selector: 'app-prevencion-documentos-tecnicos',
  templateUrl: './prevencion-documentos-tecnicos.component.html',
  styleUrls: ['./prevencion-documentos-tecnicos.component.css'],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})
export class PrevencionDocumentosTecnicosComponent implements OnInit {
  // legalText = "Grupo Preving/Cualtis/Vítaly, y sus empresas, no se hacen responsables ni avalan ninguno de los documentos de cualquier índole, tipo de formato y archivo (ni de su veracidad, ni de su idoneidad ni suficiencia a ninguna normativa, etc.) que el cliente/usuario o cualquier otra persona haya podido subir a los servicios web (sistemas, plataformas, etc.) de Grupo Preving/Cualtis/Vítaly o de sus empresas, siendo el cliente/usuario o cualquier otra persona que los haya subido su único responsable y garante, declarando disponer de todos los derechos de propiedad intelectual de los contenidos publicados y/o alojados, y sin que el repositorio documental puesto a disposición tenga ningún valor probatorio ni suponga ningún tipo de garantía. Igualmente el cliente/usuario declara conocer las obligaciones y responsabilidades que le impone la normativa en Prevención de Riesgos Laborales y cualquier otra, y reconoce que no le exime de ellas el poder subir documentos a los servicios web de las mencionadas empresas. Asimismo el cliente/usuario manifiesta contar con el consentimiento de las personas cuyas imágenes, protegidas por la Ley 1/1982 de 5 de mayo, de Protección Civil del Derecho al Honor, a la Intimidad Personal y Familiar y a la Propia Imagen, se puedan publicar o alojar en los referidos servicios web";
  legalText = '';
  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    public utils: UtilsService,
    private router: Router,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
    public globals: Globals,
    private modalRgpd: MatDialog,
    private modalNuevoInformePT: MatDialog,
    public translate: TranslateService,
    private cdRef: ChangeDetectorRef,
    public reportsService: ReportsService
  ) {
  }

  environment = environment;
  documentationForm: FormGroup;
  empresasList: Empresa[];
  centroList: Centro[];
  tipoDocumentoList: any;
  subTipoDocumentoList: any;
  productosList: any;
  subcarpetaList: any;
  aprobDocDataDto: any;
  mostrarTabla: boolean;
  isLoginSimulado = false;

  // validators
  validObserva = this.globals.observePattern;
  validDocument = this.globals.documentPattern;

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
    'newList',
    'fecha',
    //'empresa',
    'tipoDocumento',
    'documento',
    'tecnico',
    'origen',
    'observaciones',
    'specialAction'];

  idCompaniesSelectedList = [];
  idCentrosSelectedList = [];
  tipoDocumentoId: any;
  medDocDataDto: any;
  dataSource: any;
  dataSourceAux = new MatTableDataSource<PrevencionDocumentosTecnicosInterface>();
  idCompaniesListResult: any;
  idCentrosListResult: any;

  showSubtipo = false;
  showProducto = false;
  showSubcarpeta = false;
  tienePuestosTrabajo = false;
  listadoDocumentos: DocumentosUuid[] = [];

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('TABLEMEDICALDOCUMENTS') table: ElementRef;
  @ViewChild('TABLEMEDICALDOCUMENTS') exportTableDirective: ElementRef;


  // Evita que se produzca el ERROR Error: ExpressionChangedAfterItHasBeenCheckedError
  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    // En el caso de que se esté realizando un loginSimulado, no tendrá que guardarse
    const loginSimulado = localStorage.getItem('loginSimulado');
    if (loginSimulado !== null && loginSimulado === 'true') {
      this.isLoginSimulado = true;
    }

    this.mostrarTabla = false;
    /*inicializacion de formulario*/
    this.initForm();
    this.getUserData();
    this.getTipoDocumento();
    this.getProductos();
    this.getSubcarpetas();
    this.initColsOrder();
  }


  initColsOrder() {
    if (localStorage.getItem('tableColsOrder')) {
      let localStorageObj: object;
      localStorageObj = JSON.parse(localStorage.getItem('tableColsOrder'));
      if (localStorageObj[this.constructor.name] &&
        Array.isArray(localStorageObj[this.constructor.name]) &&
        localStorageObj[this.constructor.name].length == this.tableHeaders.length) {
        this.tableHeaders = localStorageObj[this.constructor.name];
      }
    }
  }

  initForm() {
    this.documentationForm = this.formBuilder.group({
      empresaForm: new FormControl('', [Validators.required]),
      centroForm: new FormControl('', [Validators.required]),
      nombreDocForm: new FormControl(''),
      tipoDocForm: new FormControl(''),
      subTipoDocForm: new FormControl(''),
      subcarpetaForm: new FormControl(''),
      productoForm: new FormControl(''),
      fechaDesdeForm: new FormControl(moment()),
      fechaHastaForm: new FormControl(moment()),
      observacionesForm: new FormControl(''),
      selectEmpresasRadioForm: new FormControl('1'),
      selectCentrosRadioForm: new FormControl('1'),
      todosCentrosForm: true,
      origen: new FormControl(''),
      idSubTipoDocumento: new FormControl('')
    });

    this.setInitDates();

    // transformNecesario es el item que nos dices si ha llegado a través
    // de la barra de favoritos, si es true entonces hacemos el translateX
    const transform = JSON.parse(localStorage.getItem('transformNecesario'));
    if (transform == true) {
      $(document).ready(function () {
        $('.mat-tab-list').css('transform', 'translateX(0px)');
      });
    }

    // en caso de que sea una pantalla pequeña
    if (screen.width < 1530) {
      $(document).ready(function () {
        $('.mat-tab-list').css('transform', 'translateX(0px)');
      });
    }
  }

  setInitDates() {
    const now = new Date();
    now.setHours(23, 59, 59);
    this.maxDate = now;
    const nYearsAgo = new Date();
    nYearsAgo.setDate(nYearsAgo.getDate() - (365 * this.globals.extranet_intervalo_fechas_filtro));
    nYearsAgo.setHours(0, 0, 0);
    this.minDate = nYearsAgo;
    this.documentationForm.controls.fechaDesdeForm.setValue(nYearsAgo);
    this.documentationForm.controls.fechaHastaForm.setValue(now);
  }

  setDefaultForm(): void {
    // SET DATE INI AND END
    this.setInitDates();

    // Se setean los atributos relaciones con los formularios
    this.showSubtipo = false;
    this.showProducto = false;
    this.showSubcarpeta = false;

    // Set de formularios
    this.documentationForm.controls.selectEmpresasRadioForm.setValue('1');
    this.documentationForm.controls.selectCentrosRadioForm.setValue('1');
    this.documentationForm.controls.empresaForm.setValue([]);
    this.documentationForm.controls.centroForm.setValue([]);
    this.documentationForm.controls.nombreDocForm.setValue('');
    this.documentationForm.controls.tipoDocForm.setValue([]);
    this.documentationForm.controls.subTipoDocForm.setValue([]);
    this.documentationForm.controls.subcarpetaForm.setValue([]);
    this.documentationForm.controls.productoForm.setValue([]);
    this.documentationForm.controls.observacionesForm.setValue('');
    this.documentationForm.controls.origen.setValue('');
  }

  resetForm(): void {
    setTimeout(() => { // setTimeout needed on form reset
      this.setDefaultForm();
      // this.getUserData(); //NOTA IMPORTANTE: No se vuelve a obtener los documentos cuando se limpie el filtro por petición de Preving (23/09/2021)
      this.updateEmpresasYCentros();
      this.initColsOrder();
    });
  }

  getUserData(): void {
    this.userService.getUser().subscribe(user => {
      this.empresasList = user.empresas;
      this.updateEmpresasYCentros();
      // this.getFilteredDocuments();//NOTA IMPORTANTE: Por petición de PREVING (13/01/2022) a partir de ahora las pantallas con descarga de documentos, se omite la 1º llamada.
    });
  }

  updateEmpresasYCentros() {
    if (this.empresasList.length == 1) {
      this.documentationForm.controls.empresaForm.setValue(this.empresasList[0].idEmpresa);
      this.empresasList.forEach(empresa => {
        if (empresa.centros.length == 1) {
          this.documentationForm.controls.centroForm.setValue(empresa.centros[0].idCentro);
        }
      });
    }
  }

  getDataEmpresa() {
    this.getSubcarpetas();
    this.getProductos();
  }

  getDataCentro() {
    this.getSubcarpetas();
  }

  getTipoDocumento() {
    this.userService.getSubtiposDocumento([this.globals.informes_tecnicos]).subscribe(result => {
      if (result) {
        this.tipoDocumentoList = result;
      } else {
        this.spinner.hide();
      }
    }, (error => {
      if (environment.debug) {
        console.log('Error al cargar los tipos de documento: ' + error);
      }
    }));
  }

  getSubTipoDocumento() {
    if (this.documentationForm.get('tipoDocForm').value.includes(parseInt(this.globals.producto_prl))) {
      this.showProducto = true;
    } else {
      this.showProducto = false;
      this.documentationForm.controls.productoForm.setValue([]);
    }

    if (this.documentationForm.get('tipoDocForm').value.includes(parseInt(this.globals.otros_documentos))) {
      this.showSubcarpeta = true;
    } else {
      this.showSubcarpeta = false;
      this.documentationForm.controls.subcarpetaForm.setValue([]);
    }

    if (this.documentationForm.get('tipoDocForm').value.includes(parseInt(this.globals.documentos_vigor)) ||
      this.documentationForm.get('tipoDocForm').value.includes(parseInt(this.globals.documentacion_propia_pt))) {
      this.showSubtipo = true;
    } else {
      this.showSubtipo = false;
      this.documentationForm.controls.subTipoDocForm.setValue([]);
    }

    if (this.documentationForm.get('tipoDocForm').value[0] !== undefined) {
      this.userService.getSubtiposDocumento(this.documentationForm.get('tipoDocForm').value).subscribe(result => {
        if (result) {
          this.subTipoDocumentoList = result;
        } else {
          this.spinner.hide();
        }
      }, (error => {
        if (environment.debug) {
          console.log('Error al cargar los subtipos de documento: ' + error);
        }
      }));
    }
  }

  getProductos() {
    this.getEmpresaCentro();
    const filtered = this.idCompaniesListResult.filter(function (el) {
      return el != null;
    });

    this.medDocDataDto = {
      listaIdsEmpresas: filtered || []
    };

    this.userService.getProductosPRL(this.medDocDataDto).subscribe(result => {
      if (result) {
        this.productosList = result;
      } else {
        this.spinner.hide();
      }
    }, (error => {
      if (environment.debug) {
        console.log('Error al cargar los productos: ' + error);
      }
    }));
  }

  getSubcarpetas() {
    this.getEmpresaCentro();

    const filteredCompanies = this.idCompaniesListResult.filter(function (el) {
      return el != null;
    });
    const filteredCentro = this.idCentrosListResult.filter(function (el) {
      return el != null;
    });
    this.medDocDataDto = {
      listaIdsEmpresas: filteredCompanies || [],
      listaIdsCentros: filteredCentro || []
    };
    this.userService.getSubcarpetas(this.medDocDataDto).subscribe(result => {
      if (result) {
        this.subcarpetaList = result;
      } else {
        this.spinner.hide();
      }
    }, (error => {
      if (environment.debug) {
        console.log('Error al cargar las subcarpetas: ' + error);
      }
    }));
  }

  onSubmit() {
    this.getFilteredDocuments();
  }

  getEmpresaCentro() {
    if ((this.documentationForm.get('empresaForm').value === '') || (this.documentationForm.get('empresaForm').value && this.documentationForm.get('empresaForm').value.length == 0)) {
      this.idCompaniesSelectedList = [];
      this.idCompaniesListResult = this.idCompaniesSelectedList;
    } else {
      this.idCompaniesListResult = this.documentationForm.get('empresaForm').value;
    }

    if ((this.documentationForm.get('centroForm').value === '') || (this.documentationForm.get('centroForm').value && this.documentationForm.get('centroForm').value.length == 0)) {
      this.idCentrosSelectedList = [];
      this.idCentrosListResult = this.idCentrosSelectedList;
    } else {
      this.idCentrosListResult = this.documentationForm.get('centroForm').value;
    }
  }

  getFilteredDocuments() {
    this.spinner.show();
    this.getEmpresaCentro();
    // Guardamos el id de Tipo de documento.
    // Por defecto es el que corresponde a la pantalla. En este caso Informes Tecnicos.
    this.tipoDocumentoId = [this.globals.informes_tecnicos];

    const validacionEmpresaCentro: boolean = this.comprobacionSeleccionEmpresaYCentro(this.documentationForm.get('empresaForm').value, this.documentationForm.get('centroForm').value);

    if (validacionEmpresaCentro) {
      // Si tenemos algo seleccionado en el desplegable se lo ponemos al id de tipo de documento.
      if (this.documentationForm.get('tipoDocForm').value != '' && this.documentationForm.get('tipoDocForm').value.length != 0 && this.documentationForm.get('tipoDocForm').value != '0') {
        this.tipoDocumentoId = this.documentationForm.get('tipoDocForm').value;
      }
      // Si hay un subtipo seleccionado entonces el id es el del subtipo.
      if (this.documentationForm.get('subTipoDocForm').value !== '' && this.documentationForm.get('subTipoDocForm').value !== '0' && this.documentationForm.get('subTipoDocForm').value.length != 0) {
        // NOTA IMPORTANTE: En el caso de haya valor en el formulario de subcategoria, quiere decir que hay que quitar el padre anteriormente agregado
        // en este caso, sólo el tipo documental "Documentos en Vigor" será el único que tenga subcategorias, por tanto sólo habrá que quitar dicho
        // valor del padre y agregar los seleccionados en la subcategorias
        const auxList = this.tipoDocumentoId.filter(idTipoDocumento => idTipoDocumento.toString() !== this.globals.documentos_vigor && idTipoDocumento.toString() !== this.globals.documentacion_propia_pt);

        const listaSinPadreDeLaSubCategoria = [];
        // Se recorre la lista de subcategorias para ir agregando los ids de tipos a una lista
        this.documentationForm.get('subTipoDocForm').value.forEach(idSubcategoria => {
          listaSinPadreDeLaSubCategoria.push(idSubcategoria);
        });

        // Se recorre la lista ya filtrada sin el documento padre
        auxList.forEach(idCategoria => {
          listaSinPadreDeLaSubCategoria.push(idCategoria);
        });
        this.tipoDocumentoId = listaSinPadreDeLaSubCategoria;
      }

      let fechaFin;
      if (this.documentationForm.get('fechaHastaForm').value !== null) {
        fechaFin = new Date(this.documentationForm.get('fechaHastaForm').value);
        fechaFin.setHours(23, 59, 59);
      }

      let fechaInicio;
      if (this.documentationForm.get('fechaDesdeForm').value !== null) {
        fechaInicio = new Date(this.documentationForm.get('fechaDesdeForm').value);
        fechaInicio.setHours(0, 0, 0);
      }

      const idEmpresasList: number[] = [];
      const idCentrosList: number[] = [];


      // PRV se crea un array para evitar problemas a la hora de tratar los datos a enviar al back
      const empresaLista: number[] = [];
      const centroLista: number[] = [];

      empresaLista.push(this.documentationForm.get('empresaForm').value);
      centroLista.push(this.documentationForm.get('centroForm').value);

      // Método que comprueba si alguno de los fitlros de Empresa y Centro está en 'activo' o en 'inactivo' y va añadiendo empresas/centros a sus respectivas listas
      this.utils.envioDatosConFiltroActivoInactivo(this.documentationForm.get('selectEmpresasRadioForm').value,
        this.documentationForm.get('selectCentrosRadioForm').value,
        empresaLista,
        centroLista,
        this.empresasList,
        idEmpresasList,
        idCentrosList);

      let idsListResult: any[] = [];


      // Se comprueba si el usuario había seleccionado alguna empresa/centro en los campos 'empresaForm' y 'centroForm' para
      // alterar o no los atributos a enviar al BACK
      idsListResult = this.utils.valoraListasFinalesAEnviarConFiltro(empresaLista,
        centroLista,
        this.empresasList,
        idEmpresasList,
        idCentrosList);

      this.idCompaniesListResult = idsListResult[0];
      this.idCentrosListResult = idsListResult[1];

      let origen = [];
      origen = this.documentationForm.get('origen').value;

      if (origen.length !== 0) {
        origen = origen.filter(item => item !== 2);
      }

      this.medDocDataDto = {
        listaIdsTipoDocumento: this.tipoDocumentoId,
        listaIdsEmpresas: this.idCompaniesListResult,
        listaIdsCentros: this.idCentrosListResult,
        nombreDocumento: this.documentationForm.get('nombreDocForm').value,
        fechaInicio: fechaInicio || '',
        fechaFin: fechaFin || '',
        origen: origen === null || origen.length === 0 || origen.length === 2 ? [] : origen,
        listaFiltroMetadatosDto: [
          {
            nombreMetadato: 'observaciones',
            listaIdsValoresDato: this.documentationForm.get('observacionesForm').value ? [this.documentationForm.get('observacionesForm').value] : []
          },
          {
            nombreMetadato: this.globals.metadato_producto_prl,
            listaIdsValoresDato: this.documentationForm.get('productoForm').value || []
          },
          {
            nombreMetadato: this.globals.metadato_subcarpeta,
            listaIdsValoresDato: this.documentationForm.get('subcarpetaForm').value || []
          }
        ]
      };

      this.userService.getMedicalDocuments(this.medDocDataDto).subscribe(results => {
        this.tienePuestosTrabajo = false;
        const result: PrevencionDocumentosTecnicosInterface[] = [];
        const listadoUuid: DocumentosUuid[] = [];

        if (results != undefined) {
          results.forEach(item => {
            let nDatoObservaciones = 0;
            let nDatoTecnico = 0;
            let c = 0;
            if (item.tipoDocumento?.idTipoDocumento == this.globals.puesto_trabajo) {
              this.tienePuestosTrabajo = true;  // Si tengo algun documento del tipo "Información de Puestos de Trabajo" muestro el botón de Descarga de 'Unificados'.
            }
            item.datos.forEach(dato => {
              if (dato.nombre === this.globals.metadato_observaciones) {
                nDatoObservaciones = c;
              }
              if (dato.nombre === this.globals.metadato_tecnico) {
                nDatoTecnico = c;
              }
              c++;
            });

            // Voy a recorrerme los hijos del tipo de documento 78 (this.globals.erl_puestos_trabajo) para poner a true sus checked
            // Para que así puedan salir todos en Front seleccionados al darle al ojito y ver los segmentos (docHijo) del padre (item)
            if (item.tipoDocumento?.idTipoDocumento == this.globals.erl_puestos_trabajo) {
              item?.documentosHijos.forEach(docHijo => {
                docHijo.checked = true;
              });
            }
            let auxEmpresaCentroNombre;
            if (item.centro != undefined && item.centro != null) {
              auxEmpresaCentroNombre = item.empresa.nombre + ' - ' + item.centro?.nombre;
            } else {
              auxEmpresaCentroNombre = item.empresa.nombre;
            }
            result.push({
              idDocumento: item.idDocumento,
              fecha: item.fechaDocumento,
              empresa: item.empresa?.nombre,
              idEmpresa: item.empresa?.idEmpresa,
              centro: item.centro?.nombre,
              empresaCentroNombre: auxEmpresaCentroNombre,
              idCentro: item.centro?.idCentro,
              tipoDocumento: item.tipoDocumento?.nombre,
              idTipoDocumento: item.tipoDocumento?.idTipoDocumento,
              subtipoDocumento: item.subtipoDocumento?.nombre,
              documento: item.nombre,
              documentosHijos: item?.documentosHijos,
              tecnico: item.datos[nDatoTecnico]?.valorDto?.nombre,
              observaciones: item.datos[nDatoObservaciones]?.valor,
              accionesRealizadas: item.accionesRealizadas,
              gdprId: item.gdpr?.idGdpr,
              fechaAceptacionGdpr: item.fechaAceptacion,
              gdpr: item.gdpr,
              ubicacion: item.ubicacion,
              mostrarSegmentos: item.mostrarSegmentos,
              listaHistoricoDocumentoDto: [],
              origen: item.origen,
              idSubtipoDocumento: item.idSubtipoDocumento
              // listaHistoricoDocumentoDto: item?.listaHistoricoDocumentoDto || [] //Se comenta ya que ahora el Back sólo va a devolver si tiene acciones realizadas o no
            });
            listadoUuid.push({
              idDocumento: item.idDocumento,
              documento: item.nombre,
              ubicacion: item.ubicacion
            });
          });

          this.listadoDocumentos = listadoUuid;
          this.dataSource = new MatTableDataSource(result);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          // Fix sort problem: sort mayúsculas y minúsculas
          this.dataSource.sortingDataAccessor = (item, property) => {
            if (!item[property]) {
              return '';
            }

            if (property == 'fecha') {
              return new Date(item.fecha);
            }

            if (typeof item[property] === 'string') {
              return item[property].toLocaleLowerCase();
            }

            return item[property];

          };

          // variable auxiliar
          this.dataSourceAux = new MatTableDataSource(results);
          this.dataSourceAux.sort = this.sort;
          this.dataSourceAux.paginator = this.paginator;

          this.dataSourceAux.sortingDataAccessor = (item, property) => {
            if (!item[property]) {
              return '';
            }

            if (property == 'fecha') {
              return new Date(item.fecha);
            }

            if (typeof item[property] === 'string') {
              return item[property].toLocaleLowerCase();
            }
            return item[property];
          };

          this.mostrarTabla = true;
          if (environment.debug) {
            console.log('Succes');
          }
        }
        this.spinner.hide();

      }), (error => {
        if (environment.debug) {
          console.log('Error');
        }
      });
    } else {
      this.spinner.hide();
    }
  }

  checkAllRows(event) {

    if (this.dataSource.data) {
      this.dataSource.data.forEach(val => {
        val.checked = event.checked;
        /*val.documentosHijos.forEach(val => { val.checked = event.checked });*/
      });
    }
  }

  checkAllRowsHijos(event, element) {
    if (this.dataSource.data) {
      element.documentosHijos.forEach(doc => {
        doc.checked = event.checked;
      });
    }
  }

  previsualizar(element) {
    // TODO:EN CUALQUIER ACCION HAY QUE ENVIAR EL ID DEL DOCUMENTO, TIPO Y UUID DEL PADRE PARA GUARDAR LA ACCION, GDPR...
    // Si el documento tiene segmentos y está expandido para ver los segmentos
    if (element.mostrarSegmentos && element.expandedVisible) {
      // NOTA:La logica con los segmentos la realizamos en el método 'previsualizarData'
      // NOTA: Para los segmentos no hay que aceptar la RGPD, se acepta sobre el 'padre' (GDPR)
      // Se crea un atributo para indicar que el elemento tendrá el uuid(ubicacion) del segmento para la posterior descarga
      element.posibleAccionSobreSegmentos = true;
    }
    this.openModalAcceptRgpd(element, 3, null, null, false);
  }

  /**
   * Metodo para redireccionar descarga normal o para documentos xls / pdf
   * @param element
   */
  diferenciarTipos(element) {
    if (element.idTipoDocumento == 89) {
      this.abrirModalDescarga(element);
    } else {
      this.descargar(element);
    }
  }

  /**
   * Metodo para editar modal
   * @param element
   */
  editar(element) {
    console.log("editar " + element);
  }

  /**
   * Metodo para editar modal
   * @param element
   */
  borrar(element) {

    this.spinner.show();
    const data = {
      fkEmpresa: element.idEmpresa,
      fkCentro: element.idCentro,
      idDocumento: element.idDocumento
    };

    this.reportsService.deleteNewReport(data).subscribe(
      () => {
        const titulo = this.utils.translateText('DOCUMENTACION_PROPIA.DOCUMENTO_BORRADO', 'Documento borrado con éxito');
        this.utils.mostrarMensajeSwalFire('check_circle', titulo, '', 'var(--green)', false);
        // this.triggerTableReload = this.triggerTableReload + 1;
        this.getFilteredDocuments();
      },
      error => {
        console.error(error);
        const titulo = this.utils.translateText('ERROR', "Se ha producido un error");
        this.utils.mostrarMensajeSwalFire('error', titulo, '', 'var(--blue)', false);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  /**
   * Metodo para abrir modal para botones xls / pdf
   * @param element
   */
  abrirModalDescarga(element) {
    for (const documento of this.listadoDocumentos) {
      if (documento.idDocumento == element.idDocumento) {
        element.ubicacion = documento.ubicacion;
        element.documento = documento.documento;
      }
    }

    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '40%';
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;
    const dialogRef = this.modalRgpd.open(ModalXlsComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (localStorage.getItem('pdf') === 'true') {
        this.descargar(element);
      } else if (localStorage.getItem('excel') === 'true') {
        const idDocumento: String = element.idDocumento.toString();
        const elemento = element;
        this.utils.getFileUUID(idDocumento.substring(2, idDocumento.length)).subscribe(data => {
          data = JSON.parse(data);
          elemento.ubicacion = data.uuid;
          elemento.documento = data.nombre;
          this.descargar(elemento);
        }, error => {
          this.utils.mostrarMensajeSwalFire('error', 'Ha ocurrido un error al intentar descargar el archivo', '', 'var(--blue)', false);
        });
      }
    });
  }

  /*descargar seleccion*/
  descargar(element) {
    /*Verificamos si el documento tiene atributo 'mostart' */
    if (element.mostrarSegmentos && element.expandedVisible) {
      // NOTA:La logica con los segmentos la realizamos en el método 'descargaData'
      // NOTA: Para los segmentos no hay que aceptar la RGPD, se acepta sobre el 'padre' (GDPR)
      // Se crea un atributo para indicar que el elemento tendrá el uuid(ubicacion) del segmento para la posterior descarga
      element.posibleAccionSobreSegmentos = true;
    }
    this.openModalAcceptRgpd(element, 2, null, null, false);
  }

  /*compartir */
  compartir(element) {
    this.openModalAcceptRgpd(element, 1, null, null, false);
  }

  /*compartir selección*/
  compartirData(element, mode) {
    let menuNameComponent = 'Prevención tecnica';
    this.translate.get('PREVENCION_TECNICA').subscribe((res: string) => {
      menuNameComponent = res;
    });
    let subMenuNameComponent = 'Documentos tecnicos';
    this.translate.get('DOCUMENTOS_TECNICOS').subscribe((res: string) => {
      subMenuNameComponent = res;
    });

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      element,
      menuName: menuNameComponent,
      subMenuName: subMenuNameComponent
    };
    dialogConfig.width = '50%';
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;

    const dialogRef = this.dialog.open(ShareDocumentComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {

      if (result != undefined) {
        const data = {
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
              idAccionDoc: mode
            },
            filename: element.nombreDocumento + '.pdf'
          }
        };
        let titulo = 'Se ha procedido al envío por correo electrónico de la documentación indicada';
        this.translate.get('ENVIO_DOC_INICIADA').subscribe((res: string) => {
          titulo = res;
        });
        this.utils.mostrarMensajeSwalFire('info', titulo, '', 'var(--blue)', false);
        this.utils.compartirDocumento(data).subscribe(result => {
          if (!result) {
            let titulo = 'Error al enviar el mensaje';
            this.translate.get('ERROR_ENVIO_MENSAJE').subscribe((res: string) => {
              titulo = res;
            });
            this.utils.mostrarMensajeSwalFire('error', titulo, '', 'var(--blue)', false);
          }
          // Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
          if (!this.isLoginSimulado) {
            this.gdprMethod([element], mode);
          } // GDPR && Reload Info Document

        }), (error => {
          if (environment.debug) {
            console.log('Error al Enviar EMAIL - Compartir Documento');
          }
        });
      }
    });
  }

  /*descarga multiple*/
  descargarMultiple() {
    const listaIdsDocumentos: number[] = [];
    const listaDocumentos: any[] = [];
    let haySegmentosDesplegados = false;
    if (this.dataSource.data) {
      this.dataSource.data.forEach(documento => {
        if (documento.checked) {
          listaDocumentos.push(documento);
          listaIdsDocumentos.push(documento.idDocumento);
        }

        // Se comprueba si algún documento (sólo serán de tipo 'Documento en Vigor') tiene desplegados los segmentos, para mostrar un aviso por pantalla
        if (documento.expandedVisible) {
          haySegmentosDesplegados = true;
        }
      });
    }
    if (listaIdsDocumentos.length > 0 && listaIdsDocumentos.length <= this.globals.extranet_maximo_documentos_multiple) {
      // Si no hay segmentos desplegados, se procede a la descarga múltiple. Si los hubiese, se le mostará un mensaje al usuario
      if (!haySegmentosDesplegados) {
        this.openModalAcceptRgpd(null, 2, listaDocumentos, listaIdsDocumentos, false);
      } else {
        let mensajeAviso = 'Recuerde que si selecciona descarga múltiple de varios documentos, se descargarán las versiones completas de los mismos, ¿desea continuar?';
        this.translate.get('MENSAJE_AVISO_DESCARGA_MULTIPLE').subscribe((res: string) => {
          mensajeAviso = res;
        });
        let botonSi = 'Si';
        this.translate.get('SI').subscribe((res: string) => {
          botonSi = res;
        });
        let botonNo = 'No';
        this.translate.get('NO').subscribe((res: string) => {
          botonNo = res;
        });
        Swal.fire({
          title: mensajeAviso,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: botonSi,
          cancelButtonText: botonNo
        }).then((result) => {
          if (result.value) {
            this.openModalAcceptRgpd(null, 2, listaDocumentos, listaIdsDocumentos, false);
          }
        });
      }
    } else if (listaIdsDocumentos.length > this.globals.extranet_maximo_documentos_multiple) {
      this.utils.mostrarMensajeSwalFireSobrepasadoLimiteDescargaMultiple(listaIdsDocumentos.length);
    } else {
      let titulo = 'Debe seleccionar al menos un elemento a descargar';
      this.translate.get('ERROR_SELECCIONA_DESCARGAR').subscribe((res: string) => {
        titulo = res;
      });
      this.utils.mostrarMensajeSwalFire('error', titulo, '', 'var(--blue)', false);
    }
  }

  /*compartir múltiple*/
  compartirMultipleData(listaIdsDocumentos, mode, listaDocumentos) {
    let menuNameComponent = 'Prevención tecnica';
    this.translate.get('PREVENCION_TECNICA').subscribe((res: string) => {
      menuNameComponent = res;
    });
    let subMenuNameComponent = 'Documentos tecnicos';
    this.translate.get('DOCUMENTOS_TECNICOS').subscribe((res: string) => {
      subMenuNameComponent = res;
    });
    const filenameComponent = subMenuNameComponent;

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      element: listaDocumentos,
      menuName: menuNameComponent,
      subMenuName: subMenuNameComponent
    };
    dialogConfig.width = '50%';
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;

    const dialogRef = this.dialog.open(ShareDocumentComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined) {
        const listaIdsTiposDocumentos: number[] = [];
        const listaUuidsDocumentos: string[] = [];

        listaDocumentos.forEach(documento => {
          listaIdsTiposDocumentos.push(documento.idTipoDocumento);
          listaUuidsDocumentos.push(documento.ubicacion);
        });
        const data = {
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
              idAccionDoc: mode
            },
            filename: filenameComponent + '.zip'
          }
        };
        let titulo = 'Se ha procedido al envío por correo electrónico de la documentación indicada';
        this.translate.get('ENVIO_DOC_INICIADA').subscribe((res: string) => {
          titulo = res;
        });
        this.utils.mostrarMensajeSwalFire('info', titulo, '', 'var(--blue)', false);

        this.utils.compartirDocumentoZip(data).subscribe(result => {
          if (!result) {
            let titulo = 'Error al enviar el mensaje';
            this.translate.get('ERROR_ENVIO_MENSAJE').subscribe((res: string) => {
              titulo = res;
            });
            this.utils.mostrarMensajeSwalFire('error', titulo, '', 'var(--blue)', false);
          }

          // Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
          if (!this.isLoginSimulado) {
            this.gdprMethod(listaDocumentos, mode);
          } // GDPR && Reload Info Document

        }), (error => {
          if (environment.debug) {
            console.log('Error al Enviar EMAIL - Compartir Documento');
          }
        });
      }
    });
  }

  /*Descarga unificado(Un pdf, donde en su interior son varios pdf)*/
  descargarUnificado() {
    const listaIdsDocumentos: number[] = [];
    const listaDocumentos: any[] = [];
    let esTipoInformacionPuesto = true;
    let idEmpresaDocumento = 0;
    let idCentroDocumento = 0;
    if (this.dataSource.data) {
      this.dataSource.data.forEach(documento => {
        if (documento.checked) {
          listaDocumentos.push(documento);
          listaIdsDocumentos.push(documento.idDocumento);
          if (idEmpresaDocumento == 0 && idCentroDocumento == 0) {
            idEmpresaDocumento = documento.idEmpresa;
            idCentroDocumento = documento.idCentro;
          } else {
            if (idEmpresaDocumento != documento.idEmpresa) {
              esTipoInformacionPuesto = false;
            }
            if (idCentroDocumento != documento.idCentro) {
              esTipoInformacionPuesto = false;
            }
          }

          if (documento.idTipoDocumento != this.globals.puesto_trabajo) {
            esTipoInformacionPuesto = false;  // En cuanto un documento no sea del tipo 52, no lanzamos la descarga unificada
          }
        }
      });
    }

    if (!esTipoInformacionPuesto) {
      let titulo = 'Debe seleccionar únicamente \'Tipos de documento = Información de Puestos de Trabajo\' de la misma empresa y centro de trabajo, para poder utilizar la opción de generar un único documento PDF unificado';
      this.translate.get('DOCUMENTOS_TECNICOS_ERROR').subscribe((res: string) => {
        titulo = res;
      });
      this.utils.mostrarMensajeSwalFire('error', titulo, '', 'var(--blue)', false);
    } else {
      if (listaIdsDocumentos != null && listaIdsDocumentos.length > 0) {
        this.openModalAcceptRgpd(null, 2, listaDocumentos, listaIdsDocumentos, esTipoInformacionPuesto);
      } else {
        let titulo = 'Debe seleccionar al menos un elemento a descargar';
        this.translate.get('ERROR_SELECCIONA_DESCARGAR').subscribe((res: string) => {
          titulo = res;
        });
        this.utils.mostrarMensajeSwalFire('error', titulo, '', 'var(--blue)', false);
      }
    }
  }

  /*Metodo que abre la modal y redirecciona a los metodos*/
  openModalAcceptRgpd(element, mode, listaDocumentos, listaIdsDocumentos, esTipoInformacionPuesto) {
    let flag = false;
    if (listaDocumentos != null) {
      listaDocumentos.forEach(documento => {
        if (documento.fechaAceptacionGdpr === undefined) {
          element = documento;
          flag = true;
        }
      });
    }

    if (flag || (element != null && element.fechaAceptacionGdpr === undefined && element.origen === "0")) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = element;
      dialogConfig.height = '80%';
      dialogConfig.hasBackdrop = true;
      dialogConfig.disableClose = true;
      const dialogRef = this.modalRgpd.open(AcceptGdprDocumentComponent, dialogConfig);
      dialogRef.afterClosed().subscribe(result => {
        if (localStorage.getItem('acceptModal') === 'true') {
          switch (mode) {
            case 1:
              if (listaIdsDocumentos != null && listaIdsDocumentos.length > 0) {
                this.compartirMultipleData(listaIdsDocumentos, mode, listaDocumentos);
              } else {
                this.compartirData(element, mode);
              }
              break;
            case 2:
              if (listaIdsDocumentos != null && listaIdsDocumentos.length > 0) {
                this.descargarMultipleData(listaIdsDocumentos, mode, listaDocumentos, esTipoInformacionPuesto);
              } else {
                this.descargaData(element, mode);
              }
              break;
            case 3:
              this.previsualizarData(element, mode);
              break;
          }
          // Seteamos a false la variable globlal 'acceptModal'
          localStorage.setItem('acceptModal', 'false');
        }

      });
    } else {
      switch (mode) {
        case 1:
          if (listaIdsDocumentos != null && listaIdsDocumentos.length > 0) {
            this.compartirMultipleData(listaIdsDocumentos, mode, listaDocumentos);
          } else {
            this.compartirData(element, mode);
          }
          break;
        case 2:
          if (listaIdsDocumentos != null && listaIdsDocumentos.length > 0) {
            this.descargarMultipleData(listaIdsDocumentos, mode, listaDocumentos, esTipoInformacionPuesto);
          } else {
            this.descargaData(element, mode);
          }
          break;
        case 3:
          this.previsualizarData(element, mode);
          break;
      }
    }
  }

  previsualizarData(element, mode) {
    this.spinner.show();
    const listaUuidsDocSegmentos: number[] = [];
    // Si se tiene acciones sobre los segmentos del documento 'padre', sacamos los uuids de dichos segmentos
    if (element.posibleAccionSobreSegmentos) {
      // Nos recorremos los hijos de los documentos de dicho tipo,
      // para comprobar si se ha seleccionado algun segmento(hijo)
      element.documentosHijos.forEach(segmento => {
        if (segmento.checked) {
          listaUuidsDocSegmentos.push(segmento.uuid);
          mode = 5; // Se indica que el modo de acción sobre el documento es sobre sus segmentos
        }
      });

      // Se setea a false, para proximas previsualizaciones/descargas si no tiene expandido los detalles de los segmentos
      element.posibleAccionSobreSegmentos = false;
    }

    this.medDocDataDto = {
      listaIdsDocumentos: [element.idDocumento],
      listaIdsTiposDocumentos: [element.idTipoDocumento],
      listaUuidsDocumentos: [element.ubicacion],
      listaUuidsSegmentos: listaUuidsDocSegmentos,
      loginSimuladoActivado: this.isLoginSimulado,
      accion: {idAccionDoc: mode}
    };
    this.utils.getFile(this.medDocDataDto).subscribe(pdfBase64 => {
      if (pdfBase64) {
        const byteArray = new Uint8Array(atob(pdfBase64.fichero).split('').map(char => char.charCodeAt(0)));
        const blob = new Blob([byteArray], {type: 'application/pdf'});
        // Here is your URL you can use
        const url = window.URL.createObjectURL(blob);
        // i.e. display the PDF content via iframe
        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = url;
        dialogConfig.width = '50%';
        dialogConfig.hasBackdrop = true;
        dialogConfig.disableClose = true;

        const dialogRef = this.dialog.open(PdfView, dialogConfig);

        // Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
        if (!this.isLoginSimulado) {
          this.gdprMethod([element], mode); // GDPR && Reload Info Document
        } else {
          this.spinner.hide(); // En caso de que se estuviera simulando, se oculta el spinner que sólo se oculta cuando se recarga la tabla de datos
        }
      } else {
        this.spinner.hide();
      }
    });
  }

  descargaData(element, mode) {
    this.spinner.show();
    const listaUuidsDocSegmentos: number[] = [];
    // Si se tiene acciones sobre los segmentos del documento 'padre', sacamos los uuids de dichos segmentos
    if (element.posibleAccionSobreSegmentos) {
      // Nos recorremos los hijos de los documentos de dicho tipo,
      // para comprobar si se ha seleccionado algun segmento(hijo)
      element.documentosHijos.forEach(segmento => {
        if (segmento.checked) {
          listaUuidsDocSegmentos.push(segmento.uuid);
          mode = 5; // Se indica que el modo de acción sobre el documento es sobre sus segmentos
        }
      });

      // Se setea a false, para proximas previsualizaciones/descargas si no tiene expandido los detalles de los segmentos
      element.posibleAccionSobreSegmentos = false;
    }

    this.medDocDataDto = {
      listaIdsDocumentos: [element.idDocumento],
      listaIdsTiposDocumentos: [element.idTipoDocumento],
      listaUuidsDocumentos: [element.ubicacion],
      listaUuidsSegmentos: listaUuidsDocSegmentos,
      loginSimuladoActivado: this.isLoginSimulado,
      accion: {idAccionDoc: mode}
    };
    this.utils.getFile(this.medDocDataDto).subscribe(pdfBase64 => {
      if (pdfBase64) {
        if (pdfBase64.mimeType == 'pdf') {
          const linkSource = `data:application/pdf;base64,${pdfBase64.fichero}`;
          const filename = pdfBase64.nombreFichero + '.pdf';
          const downloadLink = document.createElement('a');
          downloadLink.href = linkSource;
          downloadLink.download = filename;
          downloadLink.click();

          // Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
          if (!this.isLoginSimulado) {
            this.gdprMethod([element], mode); // GDPR && Reload Info Document
          } else {
            this.spinner.hide(); // En caso de que se estuviera simulando, se oculta el spinner que sólo se oculta cuando se recarga la tabla de datos
          }
        } else if (pdfBase64.mimeType == 'xls') {
          const linkSource = `data:application/vnd.ms-excel;base64,${pdfBase64.fichero}`;
          const filename = pdfBase64.nombreFichero;
          const downloadLink = document.createElement('a');
          downloadLink.href = linkSource;
          downloadLink.download = filename;
          downloadLink.click();

          // Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
          if (!this.isLoginSimulado) {
            this.gdprMethod([element], mode); // GDPR && Reload Info Document
          } else {
            this.spinner.hide(); // En caso de que se estuviera simulando, se oculta el spinner que sólo se oculta cuando se recarga la tabla de datos
          }
        }

      } else {
        this.spinner.hide();
      }
    });
  }

  descargarMultipleData(listaIdsDocumentos, mode, listaDocumentos, esTipoInformacionPuesto) {
    this.spinner.show();
    if (listaIdsDocumentos.length > 0) {
      const listaIdsTiposDocumentos: number[] = [];
      const listaUuidsDocumentos: string[] = [];

      listaDocumentos.forEach(doc => {
        listaIdsTiposDocumentos.push(doc.idTipoDocumento);
        listaUuidsDocumentos.push(doc.ubicacion);
      });

      if (esTipoInformacionPuesto) {
        const filename = 'FicherosUnificados.pdf';
        this.utils.getFilesUnificado({
          listaIdsDocumentos,
          listaIdsTiposDocumentos,
          listaUuidsDocumentos,
          loginSimuladoActivado: this.isLoginSimulado,
          accion: {idAccionDoc: mode}
        }).subscribe(pdfBase64 => {
          if (pdfBase64) {
            const linkSource = `data:application/pdf;base64,${pdfBase64.fichero}`;
            const downloadLink = document.createElement('a');
            downloadLink.href = linkSource;
            downloadLink.download = filename;
            downloadLink.click();

            // Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
            if (!this.isLoginSimulado) {
              // NOTA: No lo sacamos en común debido a que sólo aparece en el historico el movimiento de gdpr y no el historico documento
              this.gdprMethod(listaDocumentos, mode); // GDPR && Reload Info Document
            } else {
              this.spinner.hide(); // En caso de que se estuviera simulando, se oculta el spinner que sólo se oculta cuando se recarga la tabla de datos
            }
          } else {
            this.spinner.hide();
          }

        });
      } else {
        this.utils.getZipFile({
          listaIdsDocumentos,
          listaIdsTiposDocumentos,
          listaUuidsDocumentos,
          loginSimuladoActivado: this.isLoginSimulado,
          accion: {idAccionDoc: mode}
        }).subscribe(zipBase64 => {
          if (zipBase64) {
            // Variables para traducción
            let nombreZip = 'Documentación Prevención Técnica';
            this.translate.get('DOCUMENTOS_TECNICOS').subscribe((res: string) => {
              nombreZip = res;
            });

            const downloadLink = document.createElement('a');
            downloadLink.href = `data:application/zip;base64,${zipBase64.fichero}`;
            downloadLink.download = nombreZip + '.zip';
            downloadLink.click();

            // Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
            if (!this.isLoginSimulado) {
              // NOTA: No lo sacamos en común debido a que sólo aparece en el historico el movimiento de gdpr y no el historico documento
              this.gdprMethod(listaDocumentos, mode); // GDPR && Reload Info Document
            } else {
              this.spinner.hide(); // En caso de que se estuviera simulando, se oculta el spinner que sólo se oculta cuando se recarga la tabla de datos
            }
          } else {
            this.spinner.hide();
          }
        });
      }
    } else {
      let titulo = 'Debe seleccionar al menos un elemento a descargar';
      this.translate.get('ERROR_SELECCIONA_DESCARGAR').subscribe((res: string) => {
        titulo = res;
      });
      this.utils.mostrarMensajeSwalFire('error', titulo, '', 'var(--blue)', false);
    }
  }

  /*compartir Múltiple */
  compartirMultiple() {
    const listaIdsDocumentos: number[] = [];
    const listaDocumentos: any[] = [];
    if (this.dataSource.data) {
      this.dataSource.data.forEach(documento => {
        if (documento.checked) {
          listaDocumentos.push(documento);
          listaIdsDocumentos.push(documento.idDocumento);
        }
      });
    }
    if (listaIdsDocumentos.length > 0 && listaIdsDocumentos.length <= this.globals.extranet_maximo_documentos_multiple) {
      this.openModalAcceptRgpd(null, 1, listaDocumentos, listaIdsDocumentos, false);
    } else if (listaIdsDocumentos.length > this.globals.extranet_maximo_documentos_multiple) {
      this.utils.mostrarMensajeSwalFireSobrepasadoLimiteDescargaMultiple(listaIdsDocumentos.length);
    } else {
      let titulo = 'Debe seleccionar al menos un elemento a compartir';
      this.translate.get('ERROR_SELECCIONA_COMPARTIR').subscribe((res: string) => {
        titulo = res;
      });
      this.utils.mostrarMensajeSwalFire('error', titulo, '', 'var(--blue)', false);
    }
  }

  /*Método que obtiene los segmentos de un documento con el atributo "mostrarSegmentos == true" */
  obtenerHijosSegmentos(element) {
    // Se comprueba si se está expandiendo o no el elemento, sólo se obtienes los hijos si se expande para obtener el detalle
    if (!element.expandedVisible) {
      this.spinner.show();
      // Si este documento ya previamente ha descargado sus segmentos, no volvemos a descarglos
      // volvemos a chequearlos todos de nuevo
      if (element.documentosHijos.length > 0) {
        element.documentosHijos.forEach(segmento => {
          segmento.checked = true;
        });
        this.spinner.hide();
      }

      if (element.documentosHijos.length === 0) {
        this.utils.getSegmentosDocumento(element.ubicacion).subscribe(segmentos => {
          this.spinner.hide();
          if (segmentos !== undefined && segmentos.length > 0) {
            // Si tiene segmentos el documento, se recorre la lista de documentos para insertar sus hijos al documento
            this.dataSource.filteredData.forEach(item => {
              if (item.idDocumento === element.idDocumento) {
                item.documentosHijos = segmentos;

                // Se va a recorrer los hijos segmentos para poner a true sus checked para que así puedan salir todos
                // en Front seleccionados al darle al ojito y ver los segmentos (docHijo) del padre (item)
                item.documentosHijos.forEach(segmento => {
                  segmento.checked = true;
                });
              }
            });
          } else {
            let titulo = 'No se han encontrado puestos de trabajo para este documento';
            this.translate.get('SIN_SEGMENTOS_PUESTOS_DE_TRABAJO').subscribe((res: string) => {
              titulo = res;
            });
            this.utils.mostrarMensajeSwalFire('error', titulo, '', 'var(--blue)', false);
          }
        });
      }
    }
  }

  /*Se buscan segmentos desplegados de otros documentos 'padres' y se contraen para que sólo esté visible uno unicamente*/
  contraerPosiblesSegmentosDesplegados(element) {
    this.dataSource.filteredData.forEach(doc => {
      if (doc.idDocumento !== element.idDocumento) {
        if (doc.expandedVisible != undefined && doc.expandedVisible) {
          doc.expandedVisible = false;
        }
      }
    });
  }

  gdprMethod(elements, accionDocumento) {
    const listaIdsDocuments: any[] = [];
    const listaIdsTiposDocuments: number[] = [];
    let flag = false;

    elements.forEach(element => {
      listaIdsDocuments.push(element.idDocumento);
      listaIdsTiposDocuments.push(element.idTipoDocumento);
      if (element.fechaAceptacionGdpr === undefined) {
        flag = true;
      }

      /*Realizamos comprobación cuando se descargue documentos de tipo erl_puestos_trabajo*/

    });

    // JSON que sirve para recargar los datos de nuevo para quitar nuevo documento o no y mostrar las acciones de los documentos
    const jsonInfoDocumentosDto: any[] = [];
    listaIdsDocuments.forEach(idDocumentoInfo => {
      const jsonInfoDocumentoDto = {
        idDocumento: idDocumentoInfo
      };
      jsonInfoDocumentosDto.push(jsonInfoDocumentoDto);
    });

    this.aprobDocDataDto = {
      listaIdsDocumentos: listaIdsDocuments,
      listaIdsTiposDocumentos: listaIdsTiposDocuments,
      loginSimuladoActivado: this.isLoginSimulado,
      accion: {idAccionDoc: accionDocumento}
    };

    // Si se está realizando la acción con el login simulado no se actualiza la tabla en caliente
    if (!this.isLoginSimulado) {
      if (flag) {
        this.userService.setFechaAprobacionDocumentoGdpr(this.aprobDocDataDto).subscribe(aprobPolitica => {
          if (!aprobPolitica) {
            this.spinner.hide();
            let titulo = 'Se ha producido un error al guardar la política de aceptación de terminos del documento';
            this.translate.get('ERROR_GUARDAR_POLITICA').subscribe((res: string) => {
              titulo = res;
            });
            this.utils.mostrarMensajeSwalFire('error', titulo, '', 'var(--blue)', false);
          } else {
            // Si no hubo errores, se actualiza la información de los documentos con acciones realizadas
            // this.getFilteredDocuments();
            this.utils.recargarTablaDatosMultiplePorAccion(jsonInfoDocumentosDto, this.dataSource.filteredData, this.spinner, false, null, false, null, true);
          }
        });
      } else {
        // Si los documentos tienen aceptada la gdpr, entonces se actualiza la información de los documentos con acciones realizadas
        // this.getFilteredDocuments();
        this.utils.recargarTablaDatosMultiplePorAccion(jsonInfoDocumentosDto, this.dataSource.filteredData, this.spinner, false, null, false, null, true);
      }
    } else {
      this.spinner.hide();
    }
  }


  verHistoricoDocumento(element) {
    if (element.origen === "0") {
      const dialogConfig = new MatDialogConfig();
      this.utils.verHistoricoDocumentoComun(dialogConfig, element);
    }
  }

  exportAsExcel() {
    this.spinner.show();
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    let JSONWS: XLSX.WorkSheet;
    const dataJS = [];

    let nombreArchivo = 'Documentación Prevención Técnica';
    this.translate.get('DOCUMENTOS_TECNICOS').subscribe((res: string) => {
      nombreArchivo = res;
    });

    let empresa_text = 'Empresa - Centro';
    this.translate.get('EMPRESA_CENTRO').subscribe((res: string) => {
      empresa_text = res;
    });

    let columnaFecha = 'Fecha';
    this.translate.get('FECHA').subscribe((res: string) => {
      columnaFecha = res;
    });
    let columnaTipoDocumento = 'Tipo Documento';
    this.translate.get('TIPO_DOCUMENTO').subscribe((res: string) => {
      columnaTipoDocumento = res;
    });
    let columnaDocumento = 'Nombre documento';
    this.translate.get('DOCUMENTO_NOMBRE').subscribe((res: string) => {
      columnaDocumento = res;
    });
    let columnaTecnico = 'Personal Técnico';
    this.translate.get('TECNICO').subscribe((res: string) => {
      columnaTecnico = res;
    });
    let columnaObservaciones = 'Observaciones';
    this.translate.get('OBSERVACIONES').subscribe((res: string) => {
      columnaObservaciones = res;
    });

    let isElementosSelect = false;

    this.dataSource._orderData(this.dataSource.data).forEach(item => {
      if (item.checked) {
        isElementosSelect = true;
        const new_item = {};
        this.tableHeaders.forEach(tableHeader => {
          switch (tableHeader) {
            case 'fecha':
              new_item[columnaFecha] = (new Date(item.fecha)).toLocaleDateString();
              break;
            case 'empresa':
              if (item.centro != undefined) {
                new_item[empresa_text] = item.empresa + '-' + item.centro;
              } else {
                new_item[empresa_text] = item.empresa;
              }
              break;
            case 'tipoDocumento':
              new_item[columnaTipoDocumento] = item.documento;
              break;
            case 'documento':
              new_item[columnaDocumento] = item.tipoDocumento;
              break;
            case 'tecnico':
              new_item[columnaTecnico] = item.tecnico;
            case 'observaciones':
              new_item[columnaObservaciones] = item.observaciones;
              break;
            case 'origen':
              this.translate.get('ORIGEN').subscribe((res: string) => {
                if (item.origen === 0) {
                  this.translate.get('INTERNAL').subscribe((res2: string) => {
                    new_item[res] = res2;
                  });
                } else if (item.origen === 1) {
                  this.translate.get('EXTERNAL').subscribe((res2: string) => {
                    new_item [res] = res2;
                  });
                }
              });
              break;
          }

        });

        dataJS.push(new_item);
      }

    });

    if (isElementosSelect == false) {
      let titulo = 'Debe seleccionar al menos un elemento a exportar';
      this.translate.get('ERROR_SELECCIONA_EXPORTAR').subscribe((res: string) => {
        titulo = res;
      });
      this.utils.mostrarMensajeSwalFire('error', titulo, '', 'var(--blue)', false);
    } else {
      const result = XLSX.utils.sheet_add_json(JSONWS, dataJS);
      XLSX.utils.book_append_sheet(wb, result, 'Sheet1');
      /* save to file */
      XLSX.writeFile(wb, nombreArchivo + '.xlsx');
    }

    this.spinner.hide();

  }

  selectAll(formName, formControlName, values, fieldName) {
    /*si viene 1 elemento en los controls es que estamos marcando el selectAll...
    si hay mas de uno deseleccionamos*/
    if (this[formName].controls[formControlName].value.length != 1) {
      this[formName].controls[formControlName].setValue([]);
    } else {
      const result = [];
      values.forEach(item => {
        result.push(item[fieldName]);
      });
      this[formName].controls[formControlName].setValue(result);
    }
    if (fieldName == 'idTipoDocumento') {
      if (this[formName].controls[formControlName].value.length > 0) {
        this.getSubTipoDocumento();
      } else {
        if (formControlName == 'tipoDocForm') {
          this.subTipoDocumentoList = [];

          // Se resetean todos los formularios que dependen de 'tipoDocForm'
          this.showSubtipo = false;
          this.showSubcarpeta = false;
          this.showProducto = false;

          this.documentationForm.controls.subTipoDocForm.setValue([]);
          this.documentationForm.controls.subcarpetaForm.setValue([]);
          this.documentationForm.controls.productoForm.setValue([]);

        }
      }
    }

  }

  selectAllTwoDimension(formName, formControlName, values, values2, subArrayfieldName, toCompare, fieldName) {
    const result = [];
    values.forEach(item1 => {
      values2.forEach(item2 => {
        if (item1[toCompare] === item2) {
          item1[subArrayfieldName].forEach(subItems => {
            result.push(subItems[fieldName]);
          });

        }
      });
    });

    /*si viene 1 elemento en los controls es que estamos marcando el selectAll...
    si hay mas de uno deseleccionamos*/
    if (this[formName].controls[formControlName].value.length != 1) {
      this[formName].controls[formControlName].setValue([]);
    } else {
      this[formName].controls[formControlName].setValue(result);
    }
  }

  // Metodo que consigue el valor para dicho metadato
  getMetadato(objItem, nombre) {
    return objItem.find(obj => obj.nombre == nombre);
  }

  // Metodo que consigue, para el curso, el valor para dicho metadato
  getMetadatoCurso(objItem, nombre) {
    return objItem.datos.find(obj => obj.nombre == nombre);
  }

  getOriginType(origin) {
    return ORIGIN_TYPE[origin];
  }

  selectAllOrigin(formName, formControlName, values, fieldName) {
    if (this[formName].controls[formControlName].value.length !== 1) {
      this[formName].controls[formControlName].setValue([]);
    } else {
      const result = [];
      values.forEach(item => {
        result.push(item);
      });
      result.push(2);
      this[formName].controls[formControlName].setValue(result);
    }
  }

  comprobacionSeleccionEmpresaYCentro(empresaList, centroList): boolean {

    let validacionEmpresa = true;
    let validacionCentro = true;

    if (this.idCompaniesListResult.length === 0) {
      validacionEmpresa = false;
    } else {
      if (this.idCompaniesListResult.length > 1) {
        validacionEmpresa = false;
      }
    }

    if (this.idCentrosListResult.length === 0) {
      validacionCentro = false;
    } else {
      if (this.idCentrosListResult.length > 1) {
        validacionCentro = false;
      }
    }

    if (validacionEmpresa && validacionCentro) {
      return true;
    } else {
      let titulo = 'Debe seleccionar una única empresa y un único centro de dicha empresa para proceder con la búsqueda';
      this.translate.get('SELECCION_UNICA_EMPRESA_Y_UNICO_CENTRO').subscribe((res: string) => {
        titulo = res;
      });
      // Se muestra mensaje al usuario
      this.utils.mostrarMensajeSwalFire('error', titulo, '', 'var(--blue)', false);
      return false;
    }
  }

  openModalNuevoInformePT() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '40%';
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;
    const dialogRef = this.modalNuevoInformePT.open(ModalNuevoInformePtComponent, dialogConfig);

    dialogRef.componentInstance.idEmpresa = this.documentationForm.controls.empresaForm.value;
    dialogRef.componentInstance.idCentro = this.documentationForm.controls.centroForm.value;

    dialogRef.afterClosed().subscribe( result => {
      if (result) {
        this.onSubmit();
      }
    });
  }

  openModalEditarInformePT(element) {
    // debugger;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '40%';
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;
    const dialogRef = this.modalNuevoInformePT.open(ModalEditarInformePtComponent, dialogConfig);

    dialogRef.componentInstance.idEmpresa = this.documentationForm.controls.empresaForm.value;
    dialogRef.componentInstance.idCentro = this.documentationForm.controls.centroForm.value;



    dialogRef.componentInstance.dataToEdit = element;

    dialogRef.afterClosed().subscribe( result => {
      if (result) {
        this.onSubmit();
      }
    });
  }
}
