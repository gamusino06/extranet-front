import {ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {environment} from '../../../environments/environment';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {Router} from '@angular/router';
import {NgxSpinnerService} from 'ngx-spinner';
import {Empresa} from 'src/app/Model/Empresa';
import {UserDto} from 'src/app/Model/UserDto';
import {PdfView} from 'src/app/modales/pdfView/pdfView.component';
import {UserService} from 'src/app/services/user.service';
import * as XLSX from 'xlsx';
import {ShareDocumentComponent} from 'src/app/modales/shareDocument/shareDocument.component';
import {TranslateService} from '@ngx-translate/core';
import {faFileExcel} from '@fortawesome/free-solid-svg-icons';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {UtilsService} from 'src/app/services/utils.service';
import {Globals} from '../globals';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import * as _moment from 'moment';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {MY_FORMATS} from '../../../config/config';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {AssigmentContractService} from '../../services/assigmentContract.service';
import {AssigmentContract} from '../../Model/AssigmentContract';
import {AssigmentContractEditComponent} from '../../modales/AssigmentContractEdit/assigmentContractEdit.component';
import {AssigmentContractsEmptyModalComponent} from '../../modales/assigmentContractsEmptyModal/assigmentContractsEmptyModal.component';
import {AssigmentContractFormModalComponent} from '../../modales/assigmentContractFormModal/assigmentContractFormModal.component';

const moment = _moment;

export interface AssignmentContractsInterface {
  checked: boolean;
  idDocumento: number;
  idTipoDocumento: number;
  fechaDocumento: string;
  nombreEntidad: string;
  nombreEstado: string;
  accionesRealizadas: boolean;
  ubicacion: string;
  listaHistoricoDocumentoDto: any[];
}

@Component({
  selector: 'app-assignment-contracts',
  templateUrl: './assignment-contracts.component.html',
  styleUrls: ['./assignment-contracts.component.css'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})
export class AssignmentContractsComponent implements OnInit {
  environment = environment;
  cleanImgUrl = '../../assets/img/borrar_filtros.svg';
  closeImgUrl = '../../assets/img/close.svg';
  searchImgUrl = '../../assets/img/search.svg';
  filterImgUrl = '../../assets/img/filter.svg';
  excelImgUrl = '../../assets/img/excel.svg';
  mailImgUrl = '../../assets/img/mail.svg';
  downloadImgUrl = '../../assets/img/download.svg';

  protected _onDestroy = new Subject<void>();

  /*font awesome*/
  faFileExcel = faFileExcel;

  empresasList: Empresa[];
  serviceTypeList: any[];
  empresa: string;

  userForm: FormGroup;
  user: string;

  resultado: any;
  userDataDto: UserDto;

  counter: number = 0;

  val: number;

  empresasAux: any;
  idCompaniesSelectedList = [];
  idServiceTypeSelectedList = [];
  assignmentContractsDataDto: any;

  regrexPattern: string; //Patron para los importes

  maxDate: Date;
  minDate: Date;
  mostrarTabla: boolean;
  showCardInformation: boolean;
  showInfo = true;
  showButton = true;
  showAdvice = true;
  isLoginSimulado = false;

  newAssigmentContract: AssigmentContract = new AssigmentContract();

  tableHeaders: string[] = [
    'checklist',
    'newList',
    'fechaDocumento',
    'nombreEntidad',
    'nombreEstado',
    'specialAction',
  ];
  panelOpenState = false;
  dataSource: MatTableDataSource<AssignmentContractsInterface>;

  configurationObj = {
    title: '',
    text: '',
    showCancelButton: true,
    icon: 'question',
    modalSize: '',
  };
  showMoreInfoModal = false;
  selectedItemInfo: any = {};
  modalFinalConfirmationStep = false;

  asideVisible: boolean;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('TABLEASSIGNMENTCONTRACTS') table: ElementRef;
  @ViewChild('TABLEASSIGNMENTCONTRACTS') exportTableDirective: ElementRef;
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
    private cdRef: ChangeDetectorRef,
    private assigmentContractService: AssigmentContractService
  ) {
  }

  // Evita que se produzca el ERROR Error: ExpressionChangedAfterItHasBeenCheckedError
  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    // En el caso de que se esté realizando un loginSimulado, no tendrá que guardarse
    const loginSimulado = localStorage.getItem('loginSimulado');
    if (loginSimulado !== null && loginSimulado === 'true') {
      this.isLoginSimulado = true;
    }

    this.spinner.show();
    this.mostrarTabla = false;
    this.showCardInformation = false;
    /*inicializacion de formulario*/
    this.initForm();
    this.getUserData();
    // Restore table cols order
    if (localStorage.getItem('tableColsOrder')) {
      let localStorageObj: object;
      localStorageObj = JSON.parse(localStorage.getItem('tableColsOrder'));

      if (
        localStorageObj[this.constructor.name] &&
        Array.isArray(localStorageObj[this.constructor.name]) &&
        localStorageObj[this.constructor.name].length ==
        this.tableHeaders.length
      ) {
        this.tableHeaders = localStorageObj[this.constructor.name];
      }
    }

    // transformNecesario es el item que nos dices si ha llegado a través
    // de la barra de favoritos, si es true entonces hacemos el translateX
    const transform = JSON.parse(localStorage.getItem('transformNecesario'));
    if (transform === true) {
      $(document).ready(function() {
        $('.mat-tab-list').css('transform', 'translateX(0px)');
      });
    }

    // en caso de que sea una pantalla pequeña
    if (screen.width < 1530) {
      $(document).ready(function() {
        $('.mat-tab-list').css('transform', 'translateX(-430px)');
      });
    }

    // listen for enterprises select value changes
    this.userForm.controls.empresaForm.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.onSubmit();
      });

    if (this.empresasList.length === 1) {
      this.onSubmit();
    } else {
      this.showAdvice = false;
      this.spinner.hide();
    }

  }

  initForm() {
    // Soporta cadena vacia '', números en negativo o en valor positivo hasta X digitos y con decimales
    this.regrexPattern = '^[-]{0,1}[0-9]+([.][0-9]{1,2}){0,1}$';

    this.userForm = this.formBuilder.group(
      {
        empresaForm: new FormControl(''),
        selectEmpresasRadioForm: new FormControl(''),
        todosCentrosForm: true,
        selectAllCheckBox: new FormControl(''),
      },
      {}
    );
    this.setDefaultForm();
  }

  setDefaultForm(): void {
    this.userForm.controls.selectEmpresasRadioForm.setValue('1');
    this.userForm.controls.empresaForm.setValue([]);
  }

  resetForm(): void {
    setTimeout(() => {
      // setTimeout needed on form reset
      this.setDefaultForm();
      this.updateEmpresasYCentros();
    });
  }

  onSubmit(): void {
    this.showInfo = true;
    this.getFilteredAssignmentContracts();
  }

  getUserData(): void {
    this.userService.getUser().subscribe((user) => {
      this.empresasList = user.empresas;
      this.empresasAux = user.empresas;
      this.updateEmpresasYCentros();
    });
  }

  updateEmpresasYCentros() {
    if (this.empresasList.length === 1) {
      this.userForm.controls.empresaForm.setValue(this.empresasList[0].idEmpresa);
    }
  }

  getAssigmentContract(id) {
    this.newAssigmentContract = new AssigmentContract();
    this.assigmentContractService.getAssigmentContract(id).subscribe((data) => {
      if (data) {
        this.newAssigmentContract = data;
        this.showCardInformation = Object.keys(this.newAssigmentContract).length !== 0;

        if (environment.debug) {
          console.log('Succes');
        }
      } else {
        this.showCardInformation = false;
        this.spinner.hide();
      }
    });
  }

  getEmpresasUser() {
    this.userService.getEmpresasUser().subscribe((data) => {
      if (data) {
        this.empresasList = data;
        if (environment.debug) {
          console.log('Succes');
        }
      } /*EN CASO DE FALLO*/ else {
        this.spinner.hide();
      }
    });
  }

  getFilteredAssignmentContracts() {
    let idCompaniesListResult: number[] = [];

    if (!this.userForm.get('empresaForm').value ||
      this.userForm.get('empresaForm').value === '') {
      this.idCompaniesSelectedList = [];
      idCompaniesListResult = this.idCompaniesSelectedList;
    } else {
      idCompaniesListResult.push(this.userForm.get('empresaForm').value);
    }
    this.assignmentContractsDataDto = {
      listaIdsTipoDocumento: [this.globals.assignment_contracts],
      listaIdsEmpresas: idCompaniesListResult
    };

    let counter = 0;
    let counterNoInactivos = 0;
    this.spinner.show();
    this.userService
      .getFilteredAssignmentContracts(this.assignmentContractsDataDto)
      .subscribe((results) => {

        if (results !== undefined && results.length > 0) {
          this.getAssigmentContract(this.userForm.get('empresaForm').value);
          const result: AssignmentContractsInterface[] = [];
          results.forEach((item) => {
            let nDatoNombreEntidad = 0;
            let nDatoNombreEstado = 0;
            let c = 0;
            item.datos.forEach((dato) => {
              if (dato.nombre === this.globals.metadato_entidad_nombre) {
                nDatoNombreEntidad = c;
              }
              if (dato.nombre === this.globals.metadato_estado_nombre) {
                nDatoNombreEstado = c;
              }
              c++;
            });
            if (!item.accionesRealizadas) {
              counter += 1;
            }
            if (item.datos[nDatoNombreEstado].valor!=='ESTADO_ENCOMIENDA_INACTIVO'){
              counterNoInactivos += 1;
            }
            result.push({
              checked: false,
              idDocumento: item.idDocumento,
              idTipoDocumento: item.tipoDocumento.idTipoDocumento,
              fechaDocumento: item.fechaDocumento,
              nombreEntidad: item.datos[nDatoNombreEntidad].valor,
              nombreEstado: item.datos[nDatoNombreEstado].valor,
              accionesRealizadas: item.accionesRealizadas,
              ubicacion: item.ubicacion,
              listaHistoricoDocumentoDto: [],
            });
          });
          if(counterNoInactivos > 0) {
            this.counter = counter;
            console.log('this counter', counter);
            this.dataSource = new MatTableDataSource(result);
            console.log(this.dataSource.data);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            // Fix sort problem: sort mayúsculas y minúsculas
            this.dataSource.sortingDataAccessor = (item, property) => {
              if (property == 'fechaDocumento') {
                return new Date(item.fechaDocumento);
              }

              if (typeof item[property] === 'string') {
                return item[property].toLocaleLowerCase();
              }

              return item[property];
            };

            this.showInfo = false;
            this.showAdvice = true;
            this.showButton = true;
            if (environment.debug) {
              console.log('Succes');
            }
          }
          else{
            this.emptyAssigmentContract();
          }
        } else if (results !== undefined && results.length === 0) {
          // this.utils.mostrarMensajeSwalFireDocumentosNoEncontrados();

          this.emptyAssigmentContract();
        }
        this.spinner.hide();
      }), (error) => {
      if (environment.debug) {
        console.log('Error');
      }

    };
  }

  /*acciones especiales*/

  previsualizar(element) {
    this.spinner.show();
    this.assignmentContractsDataDto = {
      listaIdsDocumentos: [element.idDocumento],
      listaIdsTiposDocumentos: [element.idTipoDocumento],
      listaUuidsDocumentos: [element.ubicacion],
      loginSimuladoActivado: this.isLoginSimulado,
      accion: {idAccionDoc: '3'},
    };
    this.spinner.show();
    this.utils.getFile(this.assignmentContractsDataDto).subscribe((pdfBase64) => {
      if (pdfBase64) {
        const byteArray = new Uint8Array(
          atob(pdfBase64.fichero)
            .split('')
            .map((char) => char.charCodeAt(0))
        );
        const blob = new Blob([byteArray], {type: 'application/pdf'});
        // Here is your URL you can use
        const url = window.URL.createObjectURL(blob);
        // i.e. display the PDF content via iframe
        const dialogRef = this.dialog.open(PdfView, {
          width: '50%',
          data: url,
        });

        // Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
        if (!this.isLoginSimulado) {
          // Recarga los datos de nuevo para quitar nuevo documento y mostrar las acciones de los documentos
          // this.recargarTablaDatosPorAccion(element);
          this.utils.recargarTablaDatosPorAccion(
            element,
            this.dataSource.filteredData,
            this.spinner,
            false,
            null,
            false,
            null,
            false
          );
        }

        dialogRef.afterClosed().subscribe((result) => {
        });
      }

      this.spinner.hide();
    });
  }

  /*descargar seleccion*/
  descargar(element) {
    this.spinner.show();
    this.assignmentContractsDataDto = {
      listaIdsDocumentos: [element.idDocumento],
      listaIdsTiposDocumentos: [element.idTipoDocumento],
      listaUuidsDocumentos: [element.ubicacion],
      loginSimuladoActivado: this.isLoginSimulado,
      accion: {idAccionDoc: '2'},
    };
    this.spinner.show();
    this.utils.getFile(this.assignmentContractsDataDto).subscribe((pdfBase64) => {
      if (pdfBase64) {
        const linkSource = `data:application/pdf;base64,${pdfBase64.fichero}`;
        const filename = pdfBase64.nombreFichero + '.pdf';
        const downloadLink = document.createElement('a');
        downloadLink.href = linkSource;
        downloadLink.download = filename;
        downloadLink.click();

        // Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
        if (!this.isLoginSimulado) {
          // Recarga los datos de nuevo para quitar nuevo documento y mostrar las acciones de los documentos
          // this.recargarTablaDatosPorAccion(element);
          this.utils.recargarTablaDatosPorAccion(
            element,
            this.dataSource.filteredData,
            this.spinner,
            false,
            null,
            false,
            null,
            false
          );
        }
      }

      this.spinner.hide();
    });
  }

  descargarMultiple() {
    this.spinner.show();
    const listaIdsDocumentos: number[] = [];
    const listaIdsTiposDocumentos: number[] = [];
    const listaUuidsDocumentos: string[] = [];
    let documentosConAcciones = false;

    if (this.dataSource.data) {
      this.dataSource.data.forEach((factura) => {
        if (factura.checked) {
          listaIdsDocumentos.push(factura.idDocumento);
          listaIdsTiposDocumentos.push(factura.idTipoDocumento);
          listaUuidsDocumentos.push(factura.ubicacion);
          if (factura.accionesRealizadas) {
            documentosConAcciones = true;
          }
        }
      });

      if (
        listaIdsDocumentos.length > 0 &&
        listaIdsDocumentos.length <=
        this.globals.extranet_maximo_documentos_multiple
      ) {
        this.spinner.show();
        this.utils
          .getZipFile({
            listaIdsDocumentos,
            listaIdsTiposDocumentos,
            listaUuidsDocumentos,
            loginSimuladoActivado: this.isLoginSimulado,
            accion: {idAccionDoc: '2'},
          })
          .subscribe((zipBase64) => {
            if (zipBase64) {
              // Variables para traducción
              let nombreZip = '';
              this.translate.get('FICHERO_ENCOMIENDA').subscribe((res: string) => {
                nombreZip = res;
              });
              const downloadLink = document.createElement('a');
              downloadLink.href = `data:application/zip;base64,${zipBase64.fichero}`;
              downloadLink.download = nombreZip + '.zip';
              downloadLink.click();

              // Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
              if (!this.isLoginSimulado) {
                // JSON que sirve para recargar los datos de nuevo para quitar nuevo documento o no y mostrar las acciones de los documentos
                const jsonInfoDocumentosDto: any[] = [];
                listaIdsDocumentos.forEach((idDocumentoInfo) => {
                  const jsonInfoDocumentoDto = {
                    idDocumento: idDocumentoInfo,
                  };
                  jsonInfoDocumentosDto.push(jsonInfoDocumentoDto);
                });

                // this.recargarTablaDatosMultiplePorAccion(jsonInfoDocumentosDto);
                this.utils.recargarTablaDatosMultiplePorAccion(
                  jsonInfoDocumentosDto,
                  this.dataSource.filteredData,
                  this.spinner,
                  false,
                  null,
                  false,
                  null,
                  false
                );
              }
            }

            this.spinner.hide();
          });
      } else if (
        listaIdsDocumentos.length >
        this.globals.extranet_maximo_documentos_multiple
      ) {
        this.spinner.hide();
        this.utils.mostrarMensajeSwalFireSobrepasadoLimiteDescargaMultiple(
          listaIdsDocumentos.length
        );
      } else {
        this.spinner.hide();
        let titulo = 'Debe seleccionar al menos un elemento a descargar';
        this.translate
          .get('ERROR_SELECCIONA_DESCARGAR')
          .subscribe((res: string) => {
            titulo = res;
          });
        this.utils.mostrarMensajeSwalFire(
          'error',
          titulo,
          '',
          'var(--blue)',
          false
        );
      }
    }
  }

  /*empty assigment-contract*/
  emptyAssigmentContract() {
    this.showAdvice = false;
    this.showButton = false;
  }

  openFormModalButton() {
    let dialogRef;
    this.assigmentContractService.getAssigmentContractFormUri(this.userForm.get('empresaForm').value).subscribe(data => {
      if (data !== null) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = {
          url: {data}
        };
        dialogConfig.width = '90%';
        dialogRef = this.dialog.open(AssigmentContractFormModalComponent, dialogConfig);
      }
      dialogRef.afterClosed().subscribe(() => this.onSubmit());

    });

  }

  /*editar*/
  edit(element) {
    const dialogRef = this.dialog.open(AssigmentContractEditComponent, {
      width: '30%',
      data: {
        element
      },
    });

  }


  /*compartir */
  compartir(element) {
    let menuNameComponent = 'Formación';
    this.translate.get('FORMACION').subscribe((res: string) => {
      menuNameComponent = res;
    });
    let subMenuNameComponent = 'Bonifícate';
    this.translate.get('SEC_BONIFICATE').subscribe((res: string) => {
      subMenuNameComponent = res;
    });

    const dialogRef = this.dialog.open(ShareDocumentComponent, {
      width: '50%',
      data: {
        element,
        menuName: menuNameComponent,
        subMenuName: subMenuNameComponent,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {
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
              idAccionDoc: '1',
            },
            filename: element.nombreFactura + '.pdf',
          },
        };

        let titulo =
          'Se ha procedido al envío por correo electrónico de la documentación indicada';
        this.translate.get('ENVIO_DOC_INICIADA').subscribe((res: string) => {
          titulo = res;
        });
        this.utils.mostrarMensajeSwalFire(
          'info',
          titulo,
          '',
          'var(--blue)',
          false
        );

        this.utils.compartirDocumento(data).subscribe((result) => {
          if (!result) {
            let titulo = 'Error al enviar el mensaje';
            this.translate
              .get('ERROR_ENVIO_MENSAJE')
              .subscribe((res: string) => {
                titulo = res;
              });
            this.utils.mostrarMensajeSwalFire(
              'error',
              titulo,
              '',
              'var(--blue)',
              false
            );
          } else {
            // Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
            if (!this.isLoginSimulado) {
              // Recarga los datos de nuevo para quitar nuevo documento y mostrar las acciones de los documentos
              // this.recargarTablaDatosPorAccion(element);
              this.utils.recargarTablaDatosPorAccion(
                element,
                this.dataSource.filteredData,
                this.spinner,
                false,
                null,
                false,
                null,
                false
              );
            }
          }
        }),
          (error) => {
            if (environment.debug) {
              console.log('Error al Enviar EMAIL - Compartir Documento');
            }
          };
      }

    });
  }

  /*compartir Múltiple */
  compartirMultiple() {
    const listaIdsDocumentos: number[] = [];
    const listaIdsTiposDocumentos: number[] = [];
    const listaUuidsDocumentos: string[] = [];
    const listaDocumentos: any[] = [];
    let documentosConAcciones = false;

    if (this.dataSource.data) {
      this.dataSource.data.forEach((documento) => {
        if (documento.checked) {
          listaDocumentos.push(documento);
          listaIdsDocumentos.push(documento.idDocumento);
          listaIdsTiposDocumentos.push(documento.idTipoDocumento);
          listaUuidsDocumentos.push(documento.ubicacion);
          if (documento.accionesRealizadas) {
            documentosConAcciones = true;
          }
        }
      });
    }

    if (listaIdsDocumentos != null && listaIdsDocumentos.length === 0) {
      let titulo = 'Debe seleccionar al menos un elemento a compartir';
      this.translate
        .get('ERROR_SELECCIONA_COMPARTIR')
        .subscribe((res: string) => {
          titulo = res;
        });
      this.utils.mostrarMensajeSwalFire(
        'error',
        titulo,
        '',
        'var(--blue)',
        false
      );
    } else if (
      listaIdsDocumentos.length >
      this.globals.extranet_maximo_documentos_multiple
    ) {
      this.utils.mostrarMensajeSwalFireSobrepasadoLimiteDescargaMultiple(
        listaIdsDocumentos.length
      );
    } else {
      let menuNameComponent = 'Formación';
      this.translate.get('FORMACION').subscribe((res: string) => {
        menuNameComponent = res;
      });
      let subMenuNameComponent = 'Bonifícate';
      this.translate.get('BONIFICATE').subscribe((res: string) => {
        subMenuNameComponent = res;
      });
      const filenameComponent = subMenuNameComponent;

      const dialogRef = this.dialog.open(ShareDocumentComponent, {
        width: '50%',
        data: {
          element: listaDocumentos,
          menuName: menuNameComponent,
          subMenuName: subMenuNameComponent,
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result !== undefined) {
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
                idAccionDoc: '1',
              },
              filename: filenameComponent + '.zip',
            },
          };

          let titulo =
            'Se ha procedido al envío por correo electrónico de la documentación indicada';
          this.translate.get('ENVIO_DOC_INICIADA').subscribe((res: string) => {
            titulo = res;
          });
          this.utils.mostrarMensajeSwalFire(
            'info',
            titulo,
            '',
            'var(--blue)',
            false
          );

          this.utils.compartirDocumentoZip(data).subscribe((result) => {
            if (!result) {
              let titulo = 'Error al enviar el mensaje';
              this.translate
                .get('ERROR_ENVIO_MENSAJE')
                .subscribe((res: string) => {
                  titulo = res;
                });
              this.utils.mostrarMensajeSwalFire(
                'error',
                titulo,
                '',
                'var(--blue)',
                false
              );
            } else {
              // Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
              if (!this.isLoginSimulado) {
                // JSON que sirve para recargar los datos de nuevo para quitar nuevo documento o no y mostrar las acciones de los documentos
                const jsonInfoDocumentosDto: any[] = [];
                listaIdsDocumentos.forEach((idDocumentoInfo) => {
                  const jsonInfoDocumentoDto = {
                    idDocumento: idDocumentoInfo,
                  };
                  jsonInfoDocumentosDto.push(jsonInfoDocumentoDto);
                });

                // this.recargarTablaDatosMultiplePorAccion(jsonInfoDocumentosDto);
                this.utils.recargarTablaDatosMultiplePorAccion(
                  jsonInfoDocumentosDto,
                  this.dataSource.filteredData,
                  this.spinner,
                  false,
                  null,
                  false,
                  null,
                  false
                );
              }
            }
          }),
            (error) => {
              if (environment.debug) {
                console.log('Error al Enviar EMAIL - Compartir Documento');
              }
            };
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
      const result = [];
      values.forEach((item) => {
        result.push(item[fieldName]);
      });
      this[formName].controls[formControlName].setValue(result);
    }
  }

  selectAllTwoDimension(
    formName,
    formControlName,
    values,
    values2,
    subArrayfieldName,
    toCompare,
    fieldName
  ) {
    const result = [];
    values.forEach((item1) => {
      values2.forEach((item2) => {
        if (item1[toCompare] === item2) {
          item1[subArrayfieldName].forEach((subItems) => {
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

  downloadSelectedAsExcel() {
    this.spinner.show();
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    let JSONWS: XLSX.WorkSheet;
    const dataJS = [];

    // Variables para traducción
    let nombreExcel = 'Datos del crédito formativo';
    this.translate.get('SEC_BONIFICATE_DATOS_CREDITO').subscribe((res: string) => {
      nombreExcel = res;
    });
    let columnaFecha = 'Fecha';
    this.translate.get('FECHA').subscribe((res: string) => {
      columnaFecha = res;
    });
    let columnaNombreContratoEncomienda = 'Contrato de encomienda';
    this.translate.get('CONTRATO_ENCOMIENDA').subscribe((res: string) => {
      columnaNombreContratoEncomienda = res;
    });

    let columnaNombreEntidad = 'Entidad';
    this.translate.get('ENTIDAD').subscribe((res: string) => {
      columnaNombreEntidad = res;
    });

    let columnaEstado = 'Estado';
    this.translate.get('ESTADO').subscribe((res: string) => {
      columnaEstado = res;
    });

    this.dataSource.filteredData.forEach((item) => {
      if (item.checked == true) {
        const new_item = {};

        new_item[columnaFecha] = new Date(
          item.fechaDocumento
        ).toLocaleString();
        new_item[columnaNombreEntidad] = item.nombreEntidad;
        new_item[columnaEstado] = item.nombreEstado;

        dataJS.push(new_item);
      }
    });

    const result = XLSX.utils.sheet_add_json(JSONWS, dataJS);

    XLSX.utils.book_append_sheet(wb, result, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, nombreExcel + '.xlsx');
    // this.dataSource.paginator._changePageSize(paginacion);

    this.spinner.hide();

  }

  askMoreInformation(element): void {
    this.selectedItemInfo = element;
    this.configurationObj.title = '';
    this.configurationObj.text = 'ASK_INFORMATION_QUESTION';
    this.showMoreInfoModal = true;

    // second part
    this.assignmentContractsDataDto = {
      listaIdsDocumentos: [element.idDocumento],
      listaIdsTiposDocumentos: [element.idTipoDocumento],
      listaUuidsDocumentos: [element.ubicacion],
      loginSimuladoActivado: this.isLoginSimulado,
      accion: {idAccionDoc: '6'},
    };
    this.utils.getFile(this.assignmentContractsDataDto).subscribe((pdfBase64) => {
      if (pdfBase64) {
        // Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
        if (!this.isLoginSimulado) {
          // Recarga los datos de nuevo para quitar nuevo documento y mostrar las acciones de los documentos
          // this.recargarTablaDatosPorAccion(element);
          this.utils.recargarTablaDatosPorAccion(
            element,
            this.dataSource.filteredData,
            this.spinner,
            false,
            null,
            false,
            null,
            false
          );
        }
      }

    });
  }

  acceptAskInformation(): void {
    if (this.modalFinalConfirmationStep === false) {
      this.showMoreInfoModal = false;
      this.acceptAskInformationConfirmation();
      this.modalFinalConfirmationStep = true;
      // TODO: funcionalidad que realiza la petición de información
    } else {
      this.closeModal();
      this.modalFinalConfirmationStep = false;
    }
  }

  acceptAskInformationConfirmation(): void {
    this.configurationObj.title = 'ASK_INFORMATION_CONFIRMATION_TITLE';
    this.configurationObj.text = 'ASK_INFORMATION_CONFIRMATION_TEXT';
    this.configurationObj.showCancelButton = false;
    this.configurationObj.icon = 'success';
    this.showMoreInfoModal = true;

  }

  closeModal(): void {
    this.showMoreInfoModal = false;
  }

  exportAsExcel() {
    this.spinner.show();
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    let JSONWS: XLSX.WorkSheet;
    const dataJS = [];

    // Variables para traducción
    let nombreExcel = 'Datos del crédito formativo';
    this.translate.get('SEC_BONIFICATE_DATOS_CREDITO').subscribe((res: string) => {
      nombreExcel = res;
    });
    let columnaFecha = 'Fecha';
    this.translate.get('FECHA').subscribe((res: string) => {
      columnaFecha = res;
    });
    let columnaNombreContratoEncomienda = 'Contrato de encomienda';
    this.translate.get('CONTRATO_ENCOMIENDA').subscribe((res: string) => {
      columnaNombreContratoEncomienda = res;
    });

    let columnaNombreEntidad = 'Entidad';
    this.translate.get('ENTIDAD').subscribe((res: string) => {
      columnaNombreEntidad = res;
    });

    let columnaEstado = 'Estado';
    this.translate.get('ESTADO').subscribe((res: string) => {
      columnaEstado = res;
    });

    let isElementosSelect = false;

    this.dataSource._orderData(this.dataSource.data).forEach((item) => {
      if (item.checked) {
        isElementosSelect = true;
        const new_item = {};
        this.tableHeaders.forEach((tableHeader) => {
          switch (tableHeader) {
            case 'fechaDocumento':
              new_item[columnaFecha] = new Date(
                item.fechaDocumento
              ).toLocaleDateString();
              break;
            case 'nombreEntidad':
              new_item[columnaNombreEntidad] = item.nombreEntidad;
              break;
            case 'nombreEstado':
              new_item[columnaEstado] = item.nombreEstado;
              break;
          }
        });

        dataJS.push(new_item);
      }
    });

    if (isElementosSelect == false) {
      let titulo = 'Debe seleccionar al menos un elemento a exportar';
      this.translate
        .get('ERROR_SELECCIONA_EXPORTAR')
        .subscribe((res: string) => {
          titulo = res;
        });
      this.utils.mostrarMensajeSwalFire(
        'error',
        titulo,
        '',
        'var(--blue)',
        false
      );
    } else {
      const result = XLSX.utils.sheet_add_json(JSONWS, dataJS);

      XLSX.utils.book_append_sheet(wb, result, 'Sheet1');

      /* save to file */
      XLSX.writeFile(wb, nombreExcel + '.xlsx');
    }
    // this.dataSource.paginator._changePageSize(paginacion);

    this.spinner.hide();
  }

  // Muestra el historico de acciones del documento
  verHistoricoDocumento(element) {
    const dialogConfig = new MatDialogConfig();
    this.utils.verHistoricoDocumentoComun(dialogConfig, element);
  }

  checkAllRows(event) {
    if (this.dataSource.data) {
      this.dataSource.data.forEach((val) => {
        val.checked = event.checked;
      });
    }
  }

  esValorNegativo(importe): boolean {
    return importe.indexOf('-') !== -1 ? true : false;
  }

  formatearImporte(any) {
    console.log(any.toString());
    any.replace('.', ',');
    const decimales = any.substring(any.indexOf('.') + 1, any.length);
    let entero = any.substring(0, any.indexOf('.'));
    entero = entero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return entero + ',' + decimales;
  }

  openButton(value) {
    console.log('VALUE -> ' + value);
  }


}
