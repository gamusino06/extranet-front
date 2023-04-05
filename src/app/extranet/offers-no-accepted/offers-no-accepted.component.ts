import { Component, ElementRef, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
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
import { any } from 'codelyzer/util/function';
import { OffersService } from 'src/app/services/offers.service';
import { threadId } from 'worker_threads';

const moment = _moment;
export interface OffersNoAcceptedInterface {
  checked: boolean;
  idDocumento: number;
  idTipoDocumento: number;
  fechaDocumento: string;
  nombreEmpresa: string;
  nombreEntidad: string;
  serviceType: string;
  descripcion: string;
  importe: number;
  accionesRealizadas: boolean;
  ubicacion: string;
  listaHistoricoDocumentoDto: any[];
}

@Component({
  selector: "app-offers-no-accepted",
  templateUrl: "./offers-no-accepted.component.html",
  styleUrls: ["./offers-no-accepted.component.css"],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class OffersNoAcceptedComponent implements OnInit {
  environment = environment;
  cleanImgUrl = "../../assets/img/borrar_filtros.svg";
  closeImgUrl = "../../assets/img/close.svg";
  searchImgUrl = "../../assets/img/search.svg";
  filterImgUrl = "../../assets/img/filter.svg";
  excelImgUrl = "../../assets/img/excel.svg";
  mailImgUrl = "../../assets/img/mail.svg";
  downloadImgUrl = "../../assets/img/download.svg";

  /*font awesome*/
  faFileExcel = faFileExcel;

  empresasList: Empresa[];
  serviceTypeList: any[];
  empresa: string;

  askInfoElement: any = null;

  userForm: FormGroup;
  user: string;

  resultado: any;
  userDataDto: UserDto;

  counter: number = 0;

  offersCheck: boolean = false;

  isLoading: boolean = false;

  val: number;

  empresasAux: any;
  idCompaniesSelectedList = [];
  idServiceTypeSelectedList = [];
  offersNoAcceptedDataDto: any;

  regrexPattern: string; //Patron para los importes

  maxDate: Date;
  minDate: Date;
  mostrarTabla: boolean;
  isLoginSimulado: boolean = false;

  tableHeaders: string[] = [
    "checklist",
    "newList",
    "fechaDocumento",
    "nombreEmpresa",
    "nombreEntidad",
    "serviceType",
    "descripcion",
    "importe",
    "specialAction",
  ];
  panelOpenState = false;
  dataSource: MatTableDataSource<OffersNoAcceptedInterface>;

  configurationObj = {
    title: "",
    text: "",
    showCancelButton: true,
    icon: "question",
    modalSize: "",
  };
  showMoreInfoModal = false;
  selectedItemInfo: any = {};
  modalFinalConfirmationStep = false;

  asideVisible: boolean;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild("TABLEOFERTASPENDIENTES") table: ElementRef;
  @ViewChild("TABLEOFERTASPENDIENTES") exportTableDirective: ElementRef;
  sortBy: any;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private offersService: OffersService,
    private router: Router,
    private spinner: NgxSpinnerService,
    public utils: UtilsService,
    public dialog: MatDialog,
    private globals: Globals,
    public translate: TranslateService,
    private cdRef: ChangeDetectorRef
  ) {}

  //Evita que se produzca el ERROR Error: ExpressionChangedAfterItHasBeenCheckedError
  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  testFunction(val) {
    this.offersService.setValue(this.val + 1);
  }

  ngOnInit() {
    console.log('test')
    this.offersService.getValue().subscribe((value) => {
      this.val = value
      console.log(value);
    });
    //En el caso de que se esté realizando un loginSimulado, no tendrá que guardarse
    let loginSimulado = localStorage.getItem("loginSimulado");
    if (loginSimulado !== null && loginSimulado === "true")
      this.isLoginSimulado = true;

    this.spinner.show();
    this.mostrarTabla = false;
    /*inicializacion de formulario*/
    this.initForm();
    this.getUserData();
    this.getServiceTypes();

    //Restore table cols order
    if (localStorage.getItem("tableColsOrder")) {
      let localStorageObj: object;
      localStorageObj = JSON.parse(localStorage.getItem("tableColsOrder"));

      if (
        localStorageObj[this.constructor.name] &&
        Array.isArray(localStorageObj[this.constructor.name]) &&
        localStorageObj[this.constructor.name].length ==
          this.tableHeaders.length
      )
        this.tableHeaders = localStorageObj[this.constructor.name];
    }

    //transformNecesario es el item que nos dices si ha llegado a través
    //de la barra de favoritos, si es true entonces hacemos el translateX
    let transform = JSON.parse(localStorage.getItem("transformNecesario"));
    if (transform == true) {
      $(document).ready(function () {
        $(".mat-tab-list").css("transform", "translateX(0px)");
      });
    }

    //en caso de que sea una pantalla pequeña
    if (screen.width < 1530) {
      $(document).ready(function () {
        $(".mat-tab-list").css("transform", "translateX(-430px)");
      });
    }
  }

  initForm() {
    //Soporta cadena vacia '', números en negativo o en valor positivo hasta X digitos y con decimales
    this.regrexPattern = "^[-]{0,1}[0-9]+([.][0-9]{1,2}){0,1}$";

    this.userForm = this.formBuilder.group(
      {
        empresaForm: new FormControl(""),
        serviceTypeForm: new FormControl(""),
        fechaDesdeForm: new FormControl(moment()),
        fechaHastaForm: new FormControl(moment()),
        selectEmpresasRadioForm: new FormControl("1"),
        selectAllCheckBox: new FormControl(""),
        todosCentrosForm: true,
      },
      {}
    );
    this.setDefaultForm();
  }

  setDefaultForm(): void {
    var now = new Date();
    now.setHours(23, 59, 59);
    this.maxDate = now;
    var nYearsAgo = new Date();
    nYearsAgo.setDate(
      nYearsAgo.getDate() - 365 * this.globals.extranet_intervalo_fechas_filtro
    );
    nYearsAgo.setHours(0, 0, 0);
    this.minDate = nYearsAgo;
    this.userForm.controls["selectEmpresasRadioForm"].setValue("1");
    this.userForm.controls["fechaDesdeForm"].setValue(nYearsAgo);
    this.userForm.controls["fechaHastaForm"].setValue(now);
    this.userForm.controls["empresaForm"].setValue([]);
    this.userForm.controls["serviceTypeForm"].setValue([]);
  }

  resetForm(): void {
    setTimeout(() => {
      //setTimeout needed on form reset
      this.setDefaultForm();
      this.updateEmpresasYCentros();
    });
  }
  onSubmit(): void {
    this.getFilteredOffersNoAccepted();
  }

  getUserData(): void {
    this.userService.getUser().subscribe((user) => {
      this.empresasList = user.empresas;
      this.empresasAux = user.empresas;
      this.updateEmpresasYCentros();
    });
  }

  updateEmpresasYCentros() {
    if (this.empresasList.length == 1) {
      this.userForm.controls.empresaForm.setValue([
        this.empresasList[0].idEmpresa,
      ]);
    }
  }

  getEmpresasUser() {
    this.userService.getEmpresasUser().subscribe((data) => {
      if (data) {
        this.empresasList = data;
        if (environment.debug) console.log("Succes");
      } /*EN CASO DE FALLO*/ else {
        this.spinner.hide();
      }
    });
  }

  getServiceTypes() {
    this.userService.getServiceTypes().subscribe(
      (result) => {
        if (result) {
          this.serviceTypeList = result;
        }
        this.spinner.hide();
      },
      (error) => {
        if (environment.debug)
          console.log("Error al cargar los tipos de servicio: " + error);
      }
    );
  }

  getFilteredOffersNoAccepted() {
    let idCompaniesListResult: number[] = [];

    if (
      this.userForm.get("empresaForm").value === "" ||
      (this.userForm.get("empresaForm").value &&
        this.userForm.get("empresaForm").value.length == 0)
    ) {
      this.idCompaniesSelectedList = [];
      idCompaniesListResult = this.idCompaniesSelectedList;
    } else {
      idCompaniesListResult = this.userForm.get("empresaForm").value;
    }

    let fechaFin;
    if (this.userForm.get("fechaHastaForm").value !== null) {
      fechaFin = new Date(this.userForm.get("fechaHastaForm").value);
      fechaFin.setHours(23, 59, 59);
    }

    let fechaInicio;
    if (this.userForm.get("fechaDesdeForm").value !== null) {
      fechaInicio = new Date(this.userForm.get("fechaDesdeForm").value);
      fechaInicio.setHours(0, 0, 0);
    }

    let idEmpresasList: number[] = [];
    let idCentrosList: number[] = [];
    //Método que comprueba si alguno de los fitlros de Empresa y Centro está en 'activo' o en 'inactivo' y va añadiendo empresas/centros a sus respectivas listas
    this.utils.envioDatosConFiltroActivoInactivo(
      this.userForm.get("selectEmpresasRadioForm").value,
      0,
      this.userForm.get("empresaForm").value,
      "",
      this.empresasList,
      idEmpresasList,
      idCentrosList
    );

    //Se comprueba si el usuario había seleccionado alguna empresa/centro en los campos 'empresaForm' y 'centroForm' para
    //alterar o no los atributos a enviar al BACK
    if (this.userForm.get("empresaForm").value.length === 0) {
      idCompaniesListResult = idEmpresasList;
    } else if (
      this.userForm.get("empresaForm").value.length > 0 &&
      idCompaniesListResult.length === 0
    ) {
      this.userForm.get("empresaForm").value.forEach((idEmpresa) => {
        idCompaniesListResult.push(idEmpresa);
      });
    }

    this.offersNoAcceptedDataDto = {
      listaIdsTipoDocumento: [this.globals.offers_no_accepted],
      listaIdsEmpresas: idCompaniesListResult,
      listaIdsServiceTypes: this.userForm.get("serviceTypeForm").value || [],
      fechaInicio: fechaInicio || "",
      fechaFin: fechaFin || "",
    };

    let counter = 0;
    this.spinner.show();
    this.userService
      .getFilteredOffersNoAccepted(this.offersNoAcceptedDataDto)
      .subscribe((results) => {
        if (results !== undefined && results.length > 0) {
          let result: OffersNoAcceptedInterface[] = [];
          results.forEach((item) => {
            var nDatoEntidad = 0;
            var nDatoServiceType = 0;
            var nDatoDescripcion = 0;
            var nDatoImporte = 0;
            var c = 0;
            item.datos.forEach((dato) => {
              if (dato.nombre === this.globals.metadato_entidad)
                nDatoEntidad = c;
              if (dato.nombre === this.globals.metadato_service_type)
                nDatoServiceType = c;
              if (dato.nombre === this.globals.metadato_descripcion)
                nDatoDescripcion = c;
              if (dato.nombre === this.globals.metadato_importe)
                nDatoImporte = c;
              c++;
            });
            if (!item.accionesRealizadas) counter += 1;
            result.push({
              checked: false,
              idDocumento: item.idDocumento,
              idTipoDocumento: item.tipoDocumento.idTipoDocumento,
              fechaDocumento: item.fechaDocumento,
              nombreEmpresa: item.empresa.nombre,
              nombreEntidad: item.datos[nDatoEntidad].valor,
              serviceType: item.datos[nDatoServiceType].valor,
              descripcion: item.datos[nDatoDescripcion].valor,
              importe: item.datos[nDatoImporte].valor,
              accionesRealizadas: item.accionesRealizadas,
              ubicacion: item.ubicacion,
              listaHistoricoDocumentoDto: [],
            });
          });
          this.counter = counter;
          console.log('this counter', counter)
          this.dataSource = new MatTableDataSource(result);
          this.offersCheck = false;
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.dataSource.filterPredicate = (data, filter: string) => {
            return !filter || data.accionesRealizadas.toString() !== filter;
          }
          //Fix sort problem: sort mayúsculas y minúsculas
          this.dataSource.sortingDataAccessor = (item, property) => {
            if (property == "fechaDocumento")
              return new Date(item.fechaDocumento);

            if (property == "importe") return Number(item[property]);

            if (typeof item[property] === "string")
              return item[property].toLocaleLowerCase();

            return item[property];
          };

          this.mostrarTabla = true;
          if (environment.debug) console.log("Succes");
        } else if (results !== undefined && results.length === 0) {
          this.utils.mostrarMensajeSwalFireDocumentosNoEncontrados();
        }
        this.spinner.hide();
      }),
      (error) => {
        if (environment.debug) console.log("Error");
      };
  }

  /*acciones especiales*/

  previsualizar(element) {
    this.spinner.show();
    this.offersNoAcceptedDataDto = {
      listaIdsDocumentos: [element.idDocumento],
      listaIdsTiposDocumentos: [element.idTipoDocumento],
      listaUuidsDocumentos: [element.ubicacion],
      loginSimuladoActivado: this.isLoginSimulado,
      accion: { idAccionDoc: "3" },
    };
    this.spinner.show();
    this.utils.getFile(this.offersNoAcceptedDataDto).subscribe((pdfBase64) => {
      if (pdfBase64) {
        const byteArray = new Uint8Array(
          atob(pdfBase64.fichero)
            .split("")
            .map((char) => char.charCodeAt(0))
        );
        let blob = new Blob([byteArray], { type: "application/pdf" });
        // Here is your URL you can use
        const url = window.URL.createObjectURL(blob);
        // i.e. display the PDF content via iframe
        const dialogRef = this.dialog.open(PdfView, {
          width: "50%",
          data: url,
        });

        //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
        if (!this.isLoginSimulado) {
          //Recarga los datos de nuevo para quitar nuevo documento y mostrar las acciones de los documentos
          //this.recargarTablaDatosPorAccion(element);
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

        dialogRef.afterClosed().subscribe((result) => {});
      }
      this.getCountNotAcceptedOffers();
      this.spinner.hide();
    });
  }

  /*descargar seleccion*/
  descargar(element) {
    this.spinner.show();
    this.offersNoAcceptedDataDto = {
      listaIdsDocumentos: [element.idDocumento],
      listaIdsTiposDocumentos: [element.idTipoDocumento],
      listaUuidsDocumentos: [element.ubicacion],
      loginSimuladoActivado: this.isLoginSimulado,
      accion: { idAccionDoc: "2" },
    };
    this.spinner.show();
    this.utils.getFile(this.offersNoAcceptedDataDto).subscribe((pdfBase64) => {
      if (pdfBase64) {
        const linkSource = `data:application/pdf;base64,${pdfBase64.fichero}`;
        const filename = pdfBase64.nombreFichero + ".pdf";
        const downloadLink = document.createElement("a");
        downloadLink.href = linkSource;
        downloadLink.download = filename;
        downloadLink.click();

        //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
        if (!this.isLoginSimulado) {
          //Recarga los datos de nuevo para quitar nuevo documento y mostrar las acciones de los documentos
          //this.recargarTablaDatosPorAccion(element);
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
      this.getCountNotAcceptedOffers();
      this.spinner.hide();
    });
  }

  descargarMultiple() {
    this.spinner.show();
    let listaIdsDocumentos: number[] = [];
    let listaIdsTiposDocumentos: number[] = [];
    let listaUuidsDocumentos: string[] = [];
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
            accion: { idAccionDoc: "2" },
          })
          .subscribe((zipBase64) => {
            if (zipBase64) {
              //Variables para traducción
              var nombreZip = "Facturas";
              this.translate.get("FACTURAS").subscribe((res: string) => {
                nombreZip = res;
              });
              let downloadLink = document.createElement("a");
              downloadLink.href = `data:application/zip;base64,${zipBase64.fichero}`;
              downloadLink.download = nombreZip + ".zip";
              downloadLink.click();

              //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
              if (!this.isLoginSimulado) {
                //JSON que sirve para recargar los datos de nuevo para quitar nuevo documento o no y mostrar las acciones de los documentos
                let jsonInfoDocumentosDto: any[] = [];
                listaIdsDocumentos.forEach((idDocumentoInfo) => {
                  let jsonInfoDocumentoDto = {
                    idDocumento: idDocumentoInfo,
                  };
                  jsonInfoDocumentosDto.push(jsonInfoDocumentoDto);
                });

                //this.recargarTablaDatosMultiplePorAccion(jsonInfoDocumentosDto);
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
            this.getCountNotAcceptedOffers();
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
        let titulo = "Debe seleccionar al menos un elemento a descargar";
        this.translate
          .get("ERROR_SELECCIONA_DESCARGAR")
          .subscribe((res: string) => {
            titulo = res;
          });
        this.utils.mostrarMensajeSwalFire(
          "error",
          titulo,
          "",
          "var(--blue)",
          false
        );
      }
    }
  }

  /*compartir */
  compartir(element) {
    let menuNameComponent = "Administración";
    this.translate.get("ADMINISTRACION").subscribe((res: string) => {
      menuNameComponent = res;
    });
    let subMenuNameComponent = "Facturas";
    this.translate.get("FACTURAS").subscribe((res: string) => {
      subMenuNameComponent = res;
    });

    const dialogRef = this.dialog.open(ShareDocumentComponent, {
      width: "50%",
      data: {
        element: element,
        menuName: menuNameComponent,
        subMenuName: subMenuNameComponent,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
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
              idAccionDoc: "1",
            },
            filename: element.nombreFactura + ".pdf",
          },
        };

        let titulo =
          "Se ha procedido al envío por correo electrónico de la documentación indicada";
        this.translate.get("ENVIO_DOC_INICIADA").subscribe((res: string) => {
          titulo = res;
        });
        this.utils.mostrarMensajeSwalFire(
          "info",
          titulo,
          "",
          "var(--blue)",
          false
        );

        this.utils.compartirDocumento(data).subscribe((result) => {
          if (!result) {
            let titulo = "Error al enviar el mensaje";
            this.translate
              .get("ERROR_ENVIO_MENSAJE")
              .subscribe((res: string) => {
                titulo = res;
              });
            this.utils.mostrarMensajeSwalFire(
              "error",
              titulo,
              "",
              "var(--blue)",
              false
            );
          } else {
            //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
            if (!this.isLoginSimulado) {
              //Recarga los datos de nuevo para quitar nuevo documento y mostrar las acciones de los documentos
              //this.recargarTablaDatosPorAccion(element);
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
            if (environment.debug)
              console.log("Error al Enviar EMAIL - Compartir Documento");
          };
      }
      this.getCountNotAcceptedOffers();
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
      this.dataSource.data.forEach((documento) => {
        if (documento.checked) {
          listaDocumentos.push(documento);
          listaIdsDocumentos.push(documento.idDocumento);
          listaIdsTiposDocumentos.push(documento.idTipoDocumento);
          listaUuidsDocumentos.push(documento.ubicacion);
          if (documento.accionesRealizadas) documentosConAcciones = true;
        }
      });
    }

    if (listaIdsDocumentos != null && listaIdsDocumentos.length === 0) {
      let titulo = "Debe seleccionar al menos un elemento a compartir";
      this.translate
        .get("ERROR_SELECCIONA_COMPARTIR")
        .subscribe((res: string) => {
          titulo = res;
        });
      this.utils.mostrarMensajeSwalFire(
        "error",
        titulo,
        "",
        "var(--blue)",
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
      let menuNameComponent = "Administración";
      this.translate.get("ADMINISTRACION").subscribe((res: string) => {
        menuNameComponent = res;
      });
      let subMenuNameComponent = "Facturas";
      this.translate.get("FACTURAS").subscribe((res: string) => {
        subMenuNameComponent = res;
      });
      let filenameComponent = subMenuNameComponent;

      const dialogRef = this.dialog.open(ShareDocumentComponent, {
        width: "50%",
        data: {
          element: listaDocumentos,
          menuName: menuNameComponent,
          subMenuName: subMenuNameComponent,
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
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
                idAccionDoc: "1",
              },
              filename: filenameComponent + ".zip",
            },
          };

          let titulo =
            "Se ha procedido al envío por correo electrónico de la documentación indicada";
          this.translate.get("ENVIO_DOC_INICIADA").subscribe((res: string) => {
            titulo = res;
          });
          this.utils.mostrarMensajeSwalFire(
            "info",
            titulo,
            "",
            "var(--blue)",
            false
          );

          this.utils.compartirDocumentoZip(data).subscribe((result) => {
            if (!result) {
              let titulo = "Error al enviar el mensaje";
              this.translate
                .get("ERROR_ENVIO_MENSAJE")
                .subscribe((res: string) => {
                  titulo = res;
                });
              this.utils.mostrarMensajeSwalFire(
                "error",
                titulo,
                "",
                "var(--blue)",
                false
              );
            } else {
              //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
              if (!this.isLoginSimulado) {
                //JSON que sirve para recargar los datos de nuevo para quitar nuevo documento o no y mostrar las acciones de los documentos
                let jsonInfoDocumentosDto: any[] = [];
                listaIdsDocumentos.forEach((idDocumentoInfo) => {
                  let jsonInfoDocumentoDto = {
                    idDocumento: idDocumentoInfo,
                  };
                  jsonInfoDocumentosDto.push(jsonInfoDocumentoDto);
                });

                //this.recargarTablaDatosMultiplePorAccion(jsonInfoDocumentosDto);
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
              if (environment.debug)
                console.log("Error al Enviar EMAIL - Compartir Documento");
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
      let result = [];
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
    let result = [];
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
    let dataJS = [];

    //Variables para traducción
    var nombreExcel = "Ofertas Pendientes";
    this.translate.get("SEC_OFERTAS_PENDIENTES").subscribe((res: string) => {
      nombreExcel = res;
    });
    var columnaFecha = "Fecha";
    this.translate.get("FECHA").subscribe((res: string) => {
      columnaFecha = res;
    });
    var columnaNombreEmpresa = "Empresa";
    this.translate.get("EMPRESA").subscribe((res: string) => {
      columnaNombreEmpresa = res;
    });

    var columnaNombreEntidad = "Entidad";
    this.translate.get("ENTIDAD").subscribe((res: string) => {
      columnaNombreEntidad = res;
    });

    var columnaTipoServicio = "Tipo de Servicio";
    this.translate.get("TIPO_SERVICIO").subscribe((res: string) => {
      columnaTipoServicio = res;
    });

    var columnaDescripcion = "Descripción";
    this.translate.get("DESCRIPCION").subscribe((res: string) => {
      columnaDescripcion = res;
    });

    var columnaImporte = "Importe";
    this.translate.get("IMPORTE").subscribe((res: string) => {
      columnaImporte = res;
    });

    this.dataSource.filteredData.forEach((item) => {
      if (item.checked == true) {
        let new_item = {};

        new_item[columnaFecha] = new Date(
          item["fechaDocumento"]
        ).toLocaleString();
        new_item[columnaNombreEmpresa] = item.nombreEmpresa;
        new_item[columnaNombreEntidad] = item.nombreEntidad;
        new_item[columnaTipoServicio] = item.serviceType;
        new_item[columnaDescripcion] = item.descripcion;
        new_item[columnaImporte] = item.importe + "€";

        dataJS.push(new_item);
      }
    });

    let result = XLSX.utils.sheet_add_json(JSONWS, dataJS);

    XLSX.utils.book_append_sheet(wb, result, "Sheet1");

    /* save to file */
    XLSX.writeFile(wb, nombreExcel + ".xlsx");
    //this.dataSource.paginator._changePageSize(paginacion);

    this.spinner.hide();
    this.getCountNotAcceptedOffers();
  }

  askMoreInformation(element): void {
    this.selectedItemInfo = element;
    this.configurationObj.title = "";
    this.configurationObj.text = 'ASK_INFORMATION_QUESTION';
    this.configurationObj.icon = 'question';
    this.configurationObj.showCancelButton = true;
    this.showMoreInfoModal = true;

    this.askInfoElement = element;
  }

  showDescription(element) {
      this.spinner.show();
      let tipo = 3;
      if (element.serviceType === 'FORMACION') {
        tipo = 2;
      } else if (element.serviceType === 'SERVICIO_PREVENCION_AJENO') {
        tipo = 1;
      }
      this.offersService.getDescriptionByOffer(element.idDocumento, tipo).subscribe(
        (result) => {
          this.spinner.hide();
          if (result[0].descripcion === null || result[0].descripcion === '') {
            this.utils.mostrarMensajeSwalFireDescripcionNoEncontrada();
          } else {
            let btn_text_aceptar = "Aceptar";
            this.translate.get('ACEPTAR').subscribe((res: string) => {
              btn_text_aceptar = res;
            });

            Swal.fire({
              icon: 'info',
              title: 'A continuación se muestran los servicios incluidos en la oferta: ',
              html: '<p align="left">' + result[0].descripcion + '</p>',
              showCancelButton: false,
              confirmButtonColor : 'var(--blue)',
              cancelButtonColor:  'var(--gray)',
              confirmButtonText: btn_text_aceptar,
              cancelButtonText: '',
              allowOutsideClick: false
            }).then((result) => {
              if (result.isConfirmed) {
                // No va a hacer nada
              }
            });
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  acceptAskInformation():void {
    if (this.modalFinalConfirmationStep === false) {
      this.isLoading = true;
      this.getMoreInfo();
      // TODO: funcionalidad que realiza la petición de información
    } else {
      this.closeModal();
      this.modalFinalConfirmationStep = false;
    }
  }

  acceptAskInformationConfirmation(): void {
    this.configurationObj.title = "ASK_INFORMATION_CONFIRMATION_TITLE";
    this.configurationObj.text = "ASK_INFORMATION_CONFIRMATION_TEXT";
    this.configurationObj.showCancelButton = false;
    this.configurationObj.icon = "success";
    this.showMoreInfoModal = true;
  }

  getMoreInfo() {
    const element = this.askInfoElement
    console.log(element)
    // second part
    this.offersNoAcceptedDataDto = {
      listaIdsDocumentos: [element.idDocumento],
      listaIdsTiposDocumentos: [element.idTipoDocumento],
      listaUuidsDocumentos: [element.ubicacion],
      loginSimuladoActivado: this.isLoginSimulado,
      accion: { idAccionDoc: "6" },
    };
    this.offersService.getMoreInfo(element.idDocumento).subscribe((response) => {
      console.log(response)
      this.getFile(element);
      this.getCountNotAcceptedOffers();
      this.isLoading = false
      this.showMoreInfoModal = false;
      this.acceptAskInformationConfirmation();
      this.modalFinalConfirmationStep = true;
    },
    (err) => {
      console.log(err)
    })
  }

  getClassOf(value): String {
    return value ? '--disabled' : '';
  }

  getFile(element) {
    this.utils.getFile(this.offersNoAcceptedDataDto).subscribe((pdfBase64) => {
      if (pdfBase64) {
        //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
        if (!this.isLoginSimulado) {
          //Recarga los datos de nuevo para quitar nuevo documento y mostrar las acciones de los documentos
          //this.recargarTablaDatosPorAccion(element);
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
    })
  }

  closeModal():void {
    this.showMoreInfoModal = false;
  }

  exportAsExcel() {
    this.spinner.show();
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    let JSONWS: XLSX.WorkSheet;
    let dataJS = [];

    //Variables para traducción
    var nombreExcel = "Ofertas Pendientes";
    this.translate.get("SEC_OFERTAS_PENDIENTES").subscribe((res: string) => {
      nombreExcel = res;
    });
    var columnaFecha = "Fecha";
    this.translate.get("FECHA").subscribe((res: string) => {
      columnaFecha = res;
    });
    var columnaNombreEmpresa = "Empresa";
    this.translate.get("EMPRESA").subscribe((res: string) => {
      columnaNombreEmpresa = res;
    });

    var columnaNombreEntidad = "Entidad";
    this.translate.get("ENTIDAD").subscribe((res: string) => {
      columnaNombreEntidad = res;
    });

    var columnaTipoServicio = "Tipo de Servicio";
    this.translate.get("TIPO_SERVICIO").subscribe((res: string) => {
      columnaTipoServicio = res;
    });

    var columnaDescripcion = "Descripción";
    this.translate.get("DESCRIPCION").subscribe((res: string) => {
      columnaDescripcion = res;
    });

    var columnaImporte = "Importe";
    this.translate.get("IMPORTE").subscribe((res: string) => {
      columnaImporte = res;
    });

    let isElementosSelect: boolean = false;

    this.dataSource._orderData(this.dataSource.data).forEach((item) => {
      if (item.checked) {
        isElementosSelect = true;
        let new_item = {};
        this.tableHeaders.forEach((tableHeader) => {
          switch (tableHeader) {
            case "fechaDocumento":
              new_item[columnaFecha] = new Date(
                item["fechaDocumento"]
              ).toLocaleDateString();
              break;
            case "nombreEmpresa":
              new_item[columnaNombreEmpresa] = item.nombreEmpresa;
              break;
            case "nombreEntidad":
              new_item[columnaNombreEntidad] = item.nombreEntidad;
              break;
            case "serviceType":
              new_item[columnaTipoServicio] = item.serviceType;
              break;
            case "descripcion":
              new_item[columnaDescripcion] = item.descripcion;
              break;
            case "importe":
              new_item[columnaImporte] = item.importe + "€";
              break;
          }
        });

        dataJS.push(new_item);
      }
    });

    if (isElementosSelect == false) {
      let titulo = "Debe seleccionar al menos un elemento a exportar";
      this.translate
        .get("ERROR_SELECCIONA_EXPORTAR")
        .subscribe((res: string) => {
          titulo = res;
        });
      this.utils.mostrarMensajeSwalFire(
        "error",
        titulo,
        "",
        "var(--blue)",
        false
      );
    } else {
      let result = XLSX.utils.sheet_add_json(JSONWS, dataJS);

      XLSX.utils.book_append_sheet(wb, result, "Sheet1");

      /* save to file */
      XLSX.writeFile(wb, nombreExcel + ".xlsx");
    }
    //this.dataSource.paginator._changePageSize(paginacion);
    this.getCountNotAcceptedOffers();
    this.spinner.hide();
  }

  //Muestra el historico de acciones del documento
  verHistoricoDocumento(element) {
    const dialogConfig = new MatDialogConfig();
    this.utils.verHistoricoDocumentoComun(dialogConfig, element);
  }

  checkAllRows(event) {
    if (this.dataSource.data)
      this.dataSource.data.forEach((val) => {
        val.checked = event.checked;
      });
  }

  filterByPendingOffers(event) {
    this.dataSource.data.forEach((element) => {
      element.checked = false
    })
    console.log(event.checked)
    const filter = event.checked ? event.checked.toString() : null
    this.dataSource.filter = filter;
    console.log(this.dataSource.data)
  }

  pendingModelChecked(value) {
    const filter = value ? value.toString() : null
    this.dataSource.filter = filter;
  }

  esValorNegativo(importe): boolean {
    return importe.indexOf("-") !== -1 ? true : false;
  }

  formatearImporte(any) {
    any.replace(".", ",");
    var decimales = any.substring(any.indexOf(".") + 1, any.length);
    var entero = any.substring(0, any.indexOf("."));
    entero = entero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return entero + "," + decimales;
  }

  getCountNotAcceptedOffers () {
    this.offersService.getCountNotAcceptedOffers().subscribe((val) => {
      this.offersService.setValue(val)
    })
  }

}
