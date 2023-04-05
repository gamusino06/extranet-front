import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { UserService } from 'src/app/services/user.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Globals } from '../../globals';
import * as _moment from 'moment';
import {ShareDocumentComponent} from 'src/app/modales/shareDocument/shareDocument.component';
import {environment} from 'src/environments/environment';
import {PdfView} from 'src/app/modales/pdfView/pdfView.component';
import * as XLSX from 'xlsx';
import {MyCoursesService} from '../../../services/myCourses.service';
import { ModalNuevaFormacionComponent } from 'src/app/modales/modal-nueva-formacion/modal-nueva-formacion.component';
import {DeleteCourseModalComponent} from '../../my-courses/delete-course-modal/delete-course-modal.component';
import { CourseModality, CourseType } from '../../../Model/ExternalCourse';
import { ModalConfirmacionComponent } from 'src/app/modales/modal-confirmacion/modal-confirmacion.component';

const moment = _moment;
const red_color = "#F01F1F";
const yellow_color = "#FED74D";
const green_color = "#45925A";

export interface worker {
  checked: boolean;
  idTrabajador: number;
  nombreApellidos: string;
  nombre: string;
  apellidos: string;
  nif: string;
  fechaAlta: Date;
  fechaBaja: Date;
  fechaNacimiento: Date;
  empresa: any;
  centro: any;
  telefono: string;
  email: string;
  genero: string;
  puestosTrabajo: any[];
  accionesRealizadas: boolean;
  idRelacion: number;
  initials: string;
}

interface formation {
  checked: boolean;
  idDocumento: number;
  nombreDocumento: string;
  fechaFin: Date;
  fechaReciclaje: string;
  origen: string;
  tipoDocumento: string;
  idTipoDocumento: number;
  idCurso: string;
  empresaNombre: string;
  nifTrabajador: string,
  puestosTrabajo: any[];
  motivo: string;
  aptitudNombre: string;
  observaciones: string;
  protocolos?: string[];
  modalidad: string;
  tipo: string;
  horas: string;
  nombreCurso: string;
  modalidadCurso: string;
  subcategoria: string;
  tipoReciclaje: string;
  accionesRealizadas: boolean;
  ubicacion: string;
  gdprId: number;
  fechaAceptacionGdpr: Date;
  gdpr: any;
  listaHistoricoDocumentoDto: any[];
  isLastDocument?: boolean;
  centerId: string;
  datosSolicitudCita?: any;
  externalCourseMemberId?: any;
  ecdDeletedAt?: any;
}

@Component({
  selector: 'app-pt-formacion',
  templateUrl: './pt-formacion.component.html',
  styleUrls: ['./pt-formacion.component.scss']
})
export class PtFormacionComponent implements OnInit, AfterViewInit {

  @Input('workerData') workerData: worker;
  @Input('formationList') formationList: formation[];
  @Output() updateFormationList = new EventEmitter<any[]>();
  @Output() updateAptitudeReportList = new EventEmitter<any[]>();
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  dataSource: any;
  showTable: boolean = false;
  tableHeaders: string[] = [
    'checklist',
    'newList',
    'semaforo',
    'fechaFin',
    'fechaReciclaje',
    'origen',
    'nombreCurso',
    'modalidad',
    'horas',
    'specialAction'
  ];
  allCheckbox: boolean = false;
  pageSize = 10;

  isLoginSimulado: boolean = false;
  environment = environment;
  aprobDocDataDto: any;
  excelImgUrl = '../../../../assets/img/excel.svg';
  downloadForOfflineImgUrl = '../../../../assets/img/download_for_offline.svg';

  courseModalities: CourseModality[] = [];
  courseTypes: CourseType[] = [];

  constructor(
    private spinner: NgxSpinnerService,
    private userService: UserService,
    public utils: UtilsService,
    public translate: TranslateService,
    private modalRgpd: MatDialog,
    public dialog: MatDialog,
    public globals: Globals,
    private myCoursesService: MyCoursesService
    ) { }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.formationList);
    this.getFormations();
    this.getCourseModality();
    this.getCourseType();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (item, property) => {
      if (property == 'fechaFin')
        return new Date(item.fechaFin);

      if (typeof item[property] === 'string')
        return item[property].toLocaleLowerCase();

      return item[property];
    };
  }

  async getCourseModality(): Promise<CourseModality[]> {
    this.myCoursesService.getCourseModality().subscribe(data => {
      this.courseModalities = data;
    });
    return this.courseModalities;
  }

  async getCourseType(): Promise<CourseType[]> {
    this.myCoursesService.getCourseType().subscribe(data => {
      this.courseTypes = data;
    });
    return this.courseTypes;
  }

  getFormations() {
    if(this.formationList.length > 0) {
      this.showTable = true;
    } else {
      const data = this.utils.formatFormationTabDto(this.workerData);

      this.spinner.show();
      this.userService.getDocumentos(data).subscribe(documentos => {
        if(documentos !== undefined && documentos.length > 0){
          let result: formation[] = [];
          documentos.forEach((item, index) => {
            let trabajadorDto;
            var nDatoIdCurso = 0;
            var nDatoCurso = 0;
            var nDatoModalidad = 0;
            var nDatoHoras = 0;
            var nDatoAniosReciclaje = 0;
            var nDatoTipoReciclaje = 0;
            var nDatoSubcategoriaFormacion = 0;
            var nDatoTrabajador = 0;
            var nDatoOrigenCurso = 0;
            var nDatoExternalCourseMemberId = 0;
            var nDatoEcdDeletedAt = 0;
            var nDatoFechaReciclaje = 0;
            var c = 0;
            item.datos.forEach(dato => {
              if (dato.nombre === this.globals.metadato_id_curso) nDatoIdCurso = c;
              if (dato.nombre === this.globals.metadato_curso) nDatoCurso = c;
              if (dato.nombre === this.globals.metadato_modalidad) nDatoModalidad = c;
              if (dato.nombre === this.globals.metadato_horas) nDatoHoras = c;
              if (dato.nombre === this.globals.metadato_trabajador) nDatoTrabajador = c;
              if (dato.nombre === this.globals.metadato_tipo_reciclaje) nDatoTipoReciclaje = c;
              if (dato.nombre === this.globals.metadato_anios_reciclaje) nDatoAniosReciclaje = c;
              if (dato.nombre === this.globals.metadato_subcategoria_formacion) nDatoSubcategoriaFormacion = c;
              if (dato.nombre === this.globals.metadato_origen_curso) nDatoOrigenCurso = c;
              if (dato.nombre === 'external_course_member_id') nDatoExternalCourseMemberId = c;
              if (dato.nombre === 'ecd_deleted_at') nDatoEcdDeletedAt = c;
              if (dato.nombre === this.globals.metadato_fecha_reciclaje) nDatoFechaReciclaje = c;
              c++;
            });

            let num = item.datos[nDatoHoras]?.valor;
            let horas = '0';
            try
            {
              horas = parseFloat(num).toFixed(2).replace('.',',');
            }catch(err){
            }
            let recycleDate = this.isVoid(item.datos[nDatoFechaReciclaje]?.valor) ?
              (item.datos[nDatoAniosReciclaje]?.valor > 0 ?
                moment(item.fechaDocumento).add(item.datos[nDatoAniosReciclaje].valor, 'years').format('YYYY-MM-DD') : undefined) :
                item.datos[nDatoFechaReciclaje]?.valor;

            trabajadorDto = item.datos.find(obj => obj.nombre == this.globals.metadato_trabajador).valorDto;
            result.push({
              checked: false,
              idDocumento: item.idDocumento,
              nombreDocumento: item.nombre,
              fechaFin: item.fechaDocumento,
              fechaReciclaje: recycleDate,
              origen: item.datos[nDatoOrigenCurso]?.valor,
              externalCourseMemberId: item.datos[nDatoExternalCourseMemberId]?.valor,
              ecdDeletedAt: item.datos[nDatoEcdDeletedAt]?.valor,
              tipoDocumento: item.tipoDocumento.nombre,
              idTipoDocumento: item.tipoDocumento.idTipoDocumento,
              empresaNombre: item.empresa.nombre,
              puestosTrabajo: trabajadorDto?.puestoTrabajoDtoList,
              motivo: item.datos.find(obj => obj.nombre == this.globals.metadato_motivo)?.valor || '',
              aptitudNombre: item.datos.find(obj => obj.nombre == this.globals.metadato_aptitud)?.valorDto.nombre || '',
              observaciones: item.datos.find(obj => obj.nombre == this.globals.metadato_observaciones)?.valor || '',
              modalidad: item.datos[nDatoModalidad]?.valor,
              tipo: item.tipoDocumento.nombre,
              horas: horas,
              nifTrabajador: item.datos[nDatoTrabajador]?.valorDto?.nif,
              idCurso: item.datos[nDatoIdCurso]?.valor,
              nombreCurso: item.datos[nDatoCurso]?.valor,
              modalidadCurso: item.datos[nDatoModalidad]?.valor,
              subcategoria: item.datos[nDatoSubcategoriaFormacion]?.valor,
              tipoReciclaje: item.datos[nDatoTipoReciclaje]?.valor,
              accionesRealizadas: item.accionesRealizadas,
              ubicacion: item.ubicacion,
              gdprId: item.gdpr?.idGdpr,
              fechaAceptacionGdpr: item.fechaAceptacion,
              gdpr: item.gdpr,
              listaHistoricoDocumentoDto: [],
              isLastDocument: item.isLastDocument,
              centerId: item.centro.idCentro,
              datosSolicitudCita: {
                "idEmpresa": item.empresa.idEmpresa,
                "nombreTrabajador": trabajadorDto.nombre + " " + trabajadorDto.apellidos,
                "idTrabajador": trabajadorDto.idTrabajador,
                "motivo": item.datos.find(obj => obj.nombre == this.globals.metadato_motivo)?.valor,
                "idCentro": item.centro.idCentro
              }
            });
          });
          let formationResult = result.filter(obj => obj.idTipoDocumento != Number(this.globals.informes_aptitud));
          this.dataSource = new MatTableDataSource(formationResult);
          this.updateFormationList.emit(formationResult);
          this.ngAfterViewInit();
          this.showTable = true;
        } else {
          this.utils.mostrarMensajeSwalFireDocumentosNoEncontrados();
        }
        this.spinner.hide();
      }, error => {
        this.spinner.hide();
        this.utils.mostrarMensajeSwalFire('error', error.error.message, '', 'var(--blue)', false);
      });
    }
  }

  checkAllRows(checked: boolean) {
    if (this.dataSource !== undefined && this.dataSource.filteredData != undefined) {
      if(checked) {
        this.dataSource.filteredData.forEach(val => { val.checked = true });
      } else {
        this.dataSource.filteredData.forEach(val => { val.checked = false });
      }
    }
  }

  updateAllCheckbox() {
    this.allCheckbox = this.dataSource.filteredData.every(val => val.checked == true);
  }

  verHistoricoDocumento(element) {
    const dialogConfig = new MatDialogConfig();
    if(element.origen === 'EXTERNAL'){
      element.idDocumento = element.externalCourseMemberId;
    }
    this.utils.verHistoricoDocumentoComun(dialogConfig, element);
  }

  getColorSemaforo(element) {
    const now = moment()
    if(element.fechaReciclaje === undefined) {
      return green_color;
    }
    const fechaReciclaje = moment(element.fechaReciclaje)
    const diff = fechaReciclaje.diff(now, 'months')
    if(diff < 0) {
        return red_color;
    } else if(diff <= 3) {
        return yellow_color;
    } else {
        return green_color;
    }
  }

  isVoid(field){
    return field === null || field === undefined || field <= 0
  }

  getTooltip(element) {
    let subcategoriaLabel: string = '';
    this.translate.get(element.subcategoria).subscribe((res: string) => {
      subcategoriaLabel = res;
    });
    let noProcedeLabel: string = '';
    this.translate.get('NO_PROCEDE').subscribe((res: string) => {
      noProcedeLabel = res;
    });

    let subcategoriaTexto: string = element.idTipoDocumento === 48 ? '\nSubcategoría: ' + subcategoriaLabel : '';

    return 'Nombre del curso: ' + element.nombreCurso + '\nCategoría: ' + element.tipoDocumento + subcategoriaTexto +
      '\nModalidad: ' + element.modalidadCurso + '\nTipo reciclaje: ' + this.getTipoReciclajeDescripcion(element.tipoReciclaje);

  }

  getTipoReciclajeDescripcion(idTipoReciclajeParam){
    var nombreReciclaje = 'NO_PROCEDE';
    this.translate.get('NO_PROCEDE').subscribe((res: string) => {
      nombreReciclaje = res;
    });

    if(idTipoReciclajeParam === "1" ){
      this.translate.get('OBLIGATORIO').subscribe((res: string) => {
        nombreReciclaje = res;
      });
    }
    else{
      if(idTipoReciclajeParam === "2") {
        this.translate.get('RECOMENDABLE').subscribe((res: string) => {
          nombreReciclaje = res;
        });
      }
    }

    return nombreReciclaje;
  }

  previsualizar(element, tabla) {
    this.previsualizarData(element, 3, tabla);
  }

  /*previsualizar seleccion*/
  previsualizarData(element, mode, tabla) {
    this.spinner.show();
    let data = {
      listaIdsDocumentos: [element.idDocumento],
      listaIdsTiposDocumentos: [element.idTipoDocumento],
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

        const dialogRef = this.dialog.open(PdfView, dialogConfig);

        //Si se está realizando la acción con el login simulado no se guarda la acción de GDPR ni se actualiza la tabla en caliente
        if (!this.isLoginSimulado){
          this.utils.recargarTablaDatosPorAccion(element, this.dataSource.filteredData, this.spinner, false, null, false, null, false);
        }
        dialogRef.afterClosed().subscribe(result => {
        });
      }
      this.spinner.hide();

    })
  }

  //Llamada descargar desde ambas tablas
  descargar(element, tabla) {
    this.descargarData(element, 2, tabla);
  }

  /*descargar seleccion*/
  descargarData(element, mode, tabla) {
    this.spinner.show();
    let data = {
      listaIdsDocumentos: [element.idDocumento],
      listaIdsTiposDocumentos: [element.idTipoDocumento],
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
        if (!this.isLoginSimulado){
          this.utils.recargarTablaDatosPorAccion(element, this.dataSource.filteredData, this.spinner, false, null, false, null, false);
        }
      }
      this.spinner.hide();

    })
  }

  //Llamada compartir desde ambas tablas
  compartir(element, tabla) {
    this.compartirData(element, 1, tabla);
  }

  /*compartir */
  compartirData(element, mode, tabla) {
    let menuNameComponent;
    let subMenuNameComponent;
    let nombreDocumento;
    if (tabla == 1) {
      menuNameComponent = 'Vigilancia de la salud';
      this.translate.get('VIGILANCIA_SALUD').subscribe((res: string) => {
        menuNameComponent = res;
      });
      subMenuNameComponent = 'Registro de formacion';
      this.translate.get('REGISTRO_FORMACION').subscribe((res: string) => {
        subMenuNameComponent = res;
      });
      nombreDocumento = subMenuNameComponent;
    } else {
      menuNameComponent = 'Vigilancia de la salud';
      this.translate.get('VIGILANCIA_SALUD').subscribe((res: string) => {
        menuNameComponent = res;
      });
      subMenuNameComponent = 'Informes de aptitud';
      this.translate.get('INFORMES_APTITUD').subscribe((res: string) => {
        subMenuNameComponent = res;
      });
      nombreDocumento = subMenuNameComponent;
    }

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
            listaIdsTiposDocumentos: [element.idTipoDocumento],
            listaUuidsDocumentos: [element.ubicacion],
            loginSimuladoActivado: this.isLoginSimulado,
            accion: {
              idAccionDoc: mode
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
              this.utils.recargarTablaDatosPorAccion(element, this.dataSource.filteredData, this.spinner, false, null, false, null, false);
            }
        }), (error => {
          if (environment.debug) console.log("Error al Enviar EMAIL - Compartir Documento");
        });
      }
    });
  }
// External course member share certificate
  shareExternalCertificate(element) {

    let menuNameComponent = 'DIPLOMAS_CERTIFICADOS';
    this.translate.get('DIPLOMAS_CERTIFICADOS').subscribe((res: string) => {
      menuNameComponent = res;
    });
    let subMenuNameComponent = 'SEC_CURSOS_PEDIDOS';
    this.translate.get('SEC_CURSOS_PEDIDOS').subscribe((res: string) => {
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
          memberIds: [element.externalCourseMemberId],
          tipoDocs: [element.idTipoDocumento],
          accion: {
            idAccionDoc: 1
          },
          attachmentFileName: "DiplomaCertificadoExterno"
        }
        let titulo = "Se ha procedido al envío por correo electrónico de la documentación indicada";
        this.translate.get('ENVIO_DOC_INICIADA').subscribe((res: string) => {
          titulo = res;
        });
        this.utils.mostrarMensajeSwalFire('info', titulo, '','var(--blue)', false);
        this.myCoursesService.shareDocument(data).subscribe(result => {
          if (!result) {
            let titulo = "Error al enviar el mensaje";
            this.translate.get('ERROR_ENVIO_MENSAJE').subscribe((res: string) => {
              titulo = res;
            });
            this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
          }else {
            if (!this.isLoginSimulado){
              element.idDocumento = element.externalCourseMemberId;
              this.utils.recargarTablaDatosPorAccion(element, this.dataSource.filteredData, this.spinner, false, null, false, null, false);
            }
          }
        }), (error => {
          console.log("Error al Enviar EMAIL - Compartir Documento");
        });
      }
    });
  }

  // --- SECCIÓN FUNCIONES ACCIONES MASIVAS ---

  exportAsExcel(documents, headers, nombreExcel){
    // Activamos el spinner
    this.spinner.show();

    // Creamos los datos necesarios para el excel
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    let JSONWS: XLSX.WorkSheet;
    let dataJS = [];

    // Definimos las columnas que puede incluir el excel
    let columnaFechaFin = this.utils.translateText('FECHA_FIN', "Fecha Fin");
    let columnaFechaReciclaje = this.utils.translateText('FECHA_RECICLAJE', "Fecha Reciclaje");
    let columnaCategoria = this.utils.translateText('CATEGORIA', "Categoría");
    let columnaNombreCurso = this.utils.translateText('NOMBRE_CURSO', "Nombre Curso");
    let columnaOrigen = this.utils.translateText('MY_COURSE.ORIGIN', "Origen");
    let columnaSubcategoria = this.utils.translateText('SUBCATEGORIA', "Subcategoría");
    let columnaModalidad = this.utils.translateText('MODALIDAD', "Modalidad");
    let columnaTipoReciclaje = this.utils.translateText('TIPO_RECICLAJE', "Tipo Reciclaje");
    let columnaHoras = this.utils.translateText('HORAS', "Horas");
    let columnaTrabajador = this.utils.translateText('TRABAJADOR', "Trabajador");
    let columnaTrabajadorNif = this.utils.translateText('NIF_NIE', "NIF/NIE");
    let columnaPuestoTrabajo = this.utils.translateText('PUESTO_TRABAJO', );

    // Rellenamos el excel viendo los datos que tenemos que colocar
    // en función de las cabeceras
    documents.forEach(item => {
      let new_item = {};
      headers.forEach(title => {
        switch (title){
          case 'fechaFin': new_item[columnaFechaFin] = item.fechaFin; break;
          case 'fechaReciclaje': new_item[columnaFechaReciclaje] = item.fechaReciclaje; break;
          case 'tipoDocumento':
            new_item[columnaCategoria] = item.tipoDocumento;
            break;
          case 'origen':
            new_item[columnaOrigen] = this.utils.translateText(item.origen, "");
            break;
          case 'nombreCurso':
            new_item[columnaNombreCurso] = item.nombreCurso;
            new_item[columnaCategoria] = this.utils.translateText(item.tipoDocumento, columnaCategoria);
            new_item[columnaSubcategoria] = item.subcategoria === 'NO_PROCEDE' ?  '' : this.utils.translateText(item.subcategoria, columnaSubcategoria);
            new_item[columnaModalidad] = this.utils.translateText(item.modalidadCurso, columnaModalidad);
            new_item[columnaTipoReciclaje] = this.getTipoReciclajeDescripcion(item.tipoReciclaje)
            break;
          case 'trabajador':
            new_item[columnaTrabajador] = item.datosSolicitudCita.nombreTrabajador;
            new_item[columnaTrabajadorNif] = item.nifTrabajador;
            break;
          case 'puestoTrabajo':
            new_item[columnaPuestoTrabajo] = item.puestosTrabajo.map(puesto => {
              return puesto['nombre'];
            }).join(', ');
            break;
          case 'horas': new_item[columnaHoras] = item.horas; break;
          default: break;
        }
      })

      // Añadimos la fila a los datos que vamos a guardar en el excel
      dataJS.push(new_item);
    });

    // Añadimos los datos al excel
    let result = XLSX.utils.sheet_add_json(JSONWS, dataJS);
    XLSX.utils.book_append_sheet(wb, result, 'Sheet1');

    //Guardamos y descargamos el fichero
    XLSX.writeFile(wb, nombreExcel + '.xlsx');

    // Quitamos el Spinner
    this.spinner.hide();
  }

  exportarMultiple() {
    // Obtenemos los documentos seleccionados
    let listaDocumentos: any[] = this.dataSource.data ? this.dataSource.data.filter(doc => doc.checked) : [];

    // Ponemos las cabeceras de las columnas
    let headers = [
      'fechaFin',
      'fechaReciclaje',
      'nombreCurso',
      'origen',
      'horas',
      'trabajador',
      'puestoTrabajo'
    ];

    // Si no se ha seleccionado ningún documento se muestra un error
    if(listaDocumentos.length == 0){
      let titulo = this.utils.translateText('ERROR_SELECCIONA_EXPORTAR', "Debe seleccionar al menos un elemento a exportar");
      this.utils.mostrarMensajeSwalFire("error", titulo, "","var(--blue)", false);

    }

    // Si se ha seleccionado 1 o más documentos los exportamos
    else{
      let nombreExcel = this.utils.translateText('DIPLOMAS_CERTIFICADOS',"Diplomas Certificados");
      this.exportAsExcel(listaDocumentos, headers, nombreExcel);
    }
  }

  /**
   * Función que nos dispone un modal para mandar los documentos seleccionados
   * en la tabla por medio de un correo. Tran su correcto envío se actualizarán
   * los documentos que contiene la tabla si no estamos en un login simulado.
   */
  compartirMultiple() {
    // Obtenemos los documentos seleccionados
    let listaDocumentos: any[] = this.dataSource.data ? this.dataSource.data.filter(doc => doc.checked && (doc.externalCourseMemberId !== undefined || doc.ubicacion !== '')) : [];

    let listaDocumentosChecked: any[] = this.dataSource.data ? this.dataSource.data.filter(doc => doc.checked) : [];

    // Nombre que le vamos a poner al archivo .zip
    let nombreZip = this.utils.translateText('DIPLOMAS_CERTIFICADOS', 'Certificados');

    // Se intenta enviar los documentos en un correo
    let sendDocuments = this.utils.masiveActionsWithRefresh(4, this.dataSource.filteredData, listaDocumentos, nombreZip, this.isLoginSimulado, listaDocumentosChecked);

    // Si se envian los documentos correctamente y no nos encontramos en un Login simulado
    // actualizamos los datos
    if(sendDocuments && !this.isLoginSimulado){
      //Recarga los datos de nuevo para quitar nuevo documento y mostrar las acciones de los documentos
      let jsonInfoDocumentosDto: any[] = [];
      listaDocumentos.forEach(idDocumentoInfo => {
        jsonInfoDocumentosDto.push({ idDocumento: idDocumentoInfo.idDocumento });
      });

      this.utils.recargarTablaDatosMultiplePorAccion(jsonInfoDocumentosDto, this.dataSource.filteredData, this.spinner, false, null, false, null, false);
    }
  }

  /**
   * Función que recopila los diferentes documentos seleccionados y los
   * descarga en un formato .zip
   */
  descargarMultiple() {

    //Cargamos los datos que vamos a necesitar
    let listaDocumentos: any[] = this.dataSource.data.filter(doc => doc.checked && (doc.externalCourseMemberId !== undefined || doc.ubicacion !== ''));

    let listaDocumentosChecked: any[] = this.dataSource.data.filter(doc => doc.checked);

    // Nombre que le vamos a poner al archivo .zip
    let nombreZip = this.utils.translateText('DIPLOMAS_CERTIFICADOS', 'Certificados');

    // Se intenta obtener los documentos y empaquetar en un .zip
    let donwloadDocuments = this.utils.masiveActionsWithRefresh(3, this.dataSource.filteredData, listaDocumentos, nombreZip, this.isLoginSimulado, listaDocumentosChecked);
  }

  /*Descarga Historico Formacion del Trabajador(Un pdf, donde en su interior son varios pdf del mismo trabajador)*/
  descargarHistoricoFormacionTrabajador(){
    let documentosChequeados = false;
    if (this.dataSource.data) {
      //Se comprueba que no esté ningún documento de formación chequeado
      for (var i = 0; i < this.dataSource.data.length; i++) {
        if (this.dataSource.data[i].checked){
          documentosChequeados = true;
          break;
        }
      }
    }

    if(this.dataSource.data.length === 0){
      let titulo = "Debe seleccionar al menos un documento";
      this.translate.get('ERROR_SELECCIONA_DESCARGAR').subscribe((res: string) => {
        titulo = res;
      });
      this.utils.mostrarMensajeSwalFire('error', titulo, '', 'var(--blue)', false);
    }else if(!documentosChequeados){
      let tipoHistoricoFormacion: number = Number(this.globals.historico_formacion);
      this.descargarHistoricoFormacionTrabajadorData([tipoHistoricoFormacion], 2);
    }else{
      //Si alguno está chequeado se mostará el error pertinente
      let titulo = "Para realizar la descarga historico de formación de la persona trabajadora, debe deseleccionar todos elementos filtrados";
      this.translate.get('ERROR_HISTORICO_FORMACION_DESELECCIONA_ELEMENTOS').subscribe((res: string) => {
        titulo = res;
      });
      this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
    }
  }

  descargarHistoricoFormacionTrabajadorData(listaIdsTiposDocumentos, mode) {
    this.spinner.show();
    //Variables para traducción
    let filename = "Fichero Historico de Formación";
    this.translate.get('FICHEROS_HISTORICO_FORMACION').subscribe((res: string) => {
      filename = res;
    });

    let trabajadorId: number = this.workerData.idTrabajador;
    let clienteId: number = this.workerData.empresa.idEmpresa;
    let centroId: number = this.workerData.centro.idCentro;
    this.utils.getFileHistoricoFormacion({
      listaIdsTiposDocumentos,
      trabajadorId: trabajadorId,
      clienteId: clienteId,
      centroId: centroId
    }).subscribe(pdfBase64 => {
      if(pdfBase64){
        const linkSource = `data:application/pdf;base64,${pdfBase64.fichero}`;
        const downloadLink = document.createElement('a');
        downloadLink.href = linkSource;
        downloadLink.download = filename + '.pdf';
        downloadLink.click();
      }
      this.spinner.hide();
    })
  }

  hasDocument (element) {
    return (element.externalCourseMemberId !== undefined && element.externalCourseMemberId !== null && element.externalCourseMemberId !== '')
  }

  downloadExternalDocument (element) {
    this.spinner.show();
    let data = {
      memberIds: [element.externalCourseMemberId],
      tipoDocs: [element.idTipoDocumento],
      accion: {
        idAccionDoc: 2
      },
      attachmentFileName: "DiplomaCertificadoExterno"
    }
    this.myCoursesService.downloadDocumentWithHistory(data).subscribe(response => {
      if(response.file){
        const linkSource = `data:${response.contentType};base64,${response.file}`;
        const filename = response.fileName;
        const downloadLink = document.createElement('a');
        downloadLink.href = linkSource;
        downloadLink.download = filename;
        downloadLink.click();
        if (!this.isLoginSimulado){
          element.idDocumento = element.externalCourseMemberId;
          this.utils.recargarTablaDatosPorAccion(element, this.dataSource.filteredData, this.spinner, false, null, false, null, false);
        }
      }
      this.spinner.hide();
    })
  }

  previewExternalDocument (element, mode, tabla) {
    let data = {
      memberIds: [element.externalCourseMemberId],
      tipoDocs: [element.idTipoDocumento],
      accion: {
        idAccionDoc: mode
      },
      attachmentFileName: "DiplomaCertificadoExterno"
    }
    this.myCoursesService.downloadDocumentWithHistory(data).subscribe(response => {
      if(response.file){
        const byteArray = new Uint8Array(atob(response.file).split('').map(char => char.charCodeAt(0)));
        let blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = url;
        dialogConfig.width = "50%";
        dialogConfig.hasBackdrop = true;
        dialogConfig.disableClose = true;
        if (!this.isLoginSimulado){
          element.idDocumento = element.externalCourseMemberId;
          this.utils.recargarTablaDatosPorAccion(element, this.dataSource.filteredData, this.spinner, false, null, false, null, false);
        }
        const dialogRef = this.dialog.open(PdfView, dialogConfig);
      }
    })
  }

  displaynewTrainingModal(eventData?) {
    let editDocumentData;
    if (eventData != null) {
      editDocumentData = eventData;
    }

    const dialogConfig = new MatDialogConfig();

    dialogConfig.width = '550px';
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;
    dialogConfig.data = {
      courseModalities: this.courseModalities,
      courseTypes: this.courseTypes,
      mode: 0
    }

    const newTraining = this.modalRgpd.open(ModalNuevaFormacionComponent, dialogConfig);

    newTraining.afterClosed().subscribe(trainingData => {
      if(trainingData){
        trainingData.courseModality = this.courseModalities.find(x => x.id === trainingData.courseModalityId)
        trainingData.courseType = this.courseTypes.find(x => x.id === trainingData.courseTypeId)

        this.spinner.show();
        this.myCoursesService.createCourseOnWorkerTraining(this.workerData?.idTrabajador, this.workerData?.idRelacion, trainingData).subscribe(response => {
          this.formationList = []
          this.getFormations();
        }, error => {
          this.spinner.hide()
          this.utils.mostrarMensajeSwalFire('error', 'error', '', 'var(--blue)', false);
        })
      }
    })
  }

  // edit and delete course (external)
  public editExternalCourse(element) {

    const dialogConfig = new MatDialogConfig();

    dialogConfig.width = '550px';
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;
    dialogConfig.data = {
      courseModalities: this.courseModalities,
      courseTypes: this.courseTypes,
      mode: 1
    }

    this.spinner.show();
    this.myCoursesService.getWorkerTraining(element.idDocumento, this.workerData?.idTrabajador, this.workerData?.idRelacion).subscribe(response => {
      dialogConfig.data.currentTraining = response
      const editTraining = this.modalRgpd.open(ModalNuevaFormacionComponent, dialogConfig);
      this.spinner.hide();

      editTraining.afterClosed().subscribe(trainingData => {
        if(trainingData){
          trainingData.courseModality = this.courseModalities.find(x => x.id === trainingData.courseModalityId)
          trainingData.courseType = this.courseTypes.find(x => x.id === trainingData.courseTypeId)

          this.spinner.show();
          this.myCoursesService.updateCourseOnWorkerTraining(element.idDocumento, this.workerData?.idTrabajador, this.workerData?.idRelacion, trainingData).subscribe(response => {
            this.formationList = []
            this.getFormations();
          }, error => {
            this.spinner.hide()
            this.utils.mostrarMensajeSwalFire('error', 'error', '', 'var(--blue)', false);
          })
        }
      })

    }, error => {
      this.spinner.hide();
      this.utils.mostrarMensajeSwalFire('error', 'error', '', 'var(--blue)', false);
    })

  }

  public deleteExternalCourse(element) {

    let questionTitle = 'Eliminar elemento';
    this.translate.get('PLANIFICACION_PRL.DELETE_MODAL.TITLE').subscribe((res: string) => { questionTitle = res; });
    let questionText = "Vas a eliminar el elemento seleccionado, ¿deseas continuar?";
    this.translate.get('PLANIFICACION_PRL.DELETE_MODAL.DESCRIPTION').subscribe((res: string) => { questionText = res; });

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      title: questionTitle,
      text: questionText,
      showCancelButton: true,
      icon: 'warning'
    };
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;

    const deleteTraining = this.dialog.open(ModalConfirmacionComponent, dialogConfig);

    deleteTraining.afterClosed().subscribe(isAcceptButtonClicked => {
      if (isAcceptButtonClicked === true) {
        this.spinner.show();
        this.myCoursesService.deleteCourseOnWorkerTraining(element.idDocumento, this.workerData?.idTrabajador, this.workerData?.idRelacion).subscribe(response => {
          this.formationList = []
          this.getFormations();
        }, error => {
          this.spinner.hide();
          let titulo = "Error al intentar obtener los datos";
           this.translate.get('ERROR_OBTENER_DATOS').subscribe((res: string) => {
             titulo = res;
           });
          this.utils.mostrarMensajeSwalFire('error', titulo, '', 'var(--blue)', false);
        })
      }
    }, error => {
      this.spinner.hide();
      this.utils.mostrarMensajeSwalFire('error', 'error', '', 'var(--blue)', false);
    })
  }
}
