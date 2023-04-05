import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {isUndefined} from 'util';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {NgxSpinnerService} from 'ngx-spinner';
import {UtilsService} from '../../services/utils.service';
import {TranslateService} from '@ngx-translate/core';
import {Globals} from '../globals';
import {CustomerService} from '../../services/customer.service';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {Documentos} from '../documentacion-juridica/documentacion-juridica.component';
import {ConsultaGeneralComponent} from '../../modales/consultaGeneral/consultaGeneral.component';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {NuevaConsultaComponent} from './nueva-consulta/nueva-consulta.component';
import {MatPaginator} from '@angular/material/paginator';
import {saveAs} from 'file-saver';
import {QueryLineByAttachments} from '../../Model/QueryLineByAttachments';
import {DescargaArchivoComponent} from './descarga-archivo/descarga-archivo.component';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-consultas-prl',
  templateUrl: './consultas-prl.component.html',
  styleUrls: ['./consultas-prl.component.css']
})
export class ConsultasPrlComponent implements OnInit {

  numeroCustomers  = sessionStorage.getItem('customerQuantities');
  listaTipos: any[] = [];
  querys: any[] = [];
  querySeleccionada: number = 0;
  dataSource: MatTableDataSource<Documentos>;
  queryVista: any = null;
  querysForm: FormGroup;
  cargaPosterior = true;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  tableHeaders: string[] = [
    'id',
    'fechaHora',
    'contacto',
    'titulo',
    'estado'
  ];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private spinner: NgxSpinnerService,
    private cdRef:ChangeDetectorRef,
    public utils: UtilsService,
    public translate: TranslateService,
    public globals: Globals,
    public dialog: MatDialog,
    private customerService: CustomerService
  ) {
    this.sacarId();
  }

  ngOnInit(): void {
    this.initForm();
    this.getAllQueryStatus();
    this.filtrar();
  }

  /**
   * Metodo para sacar la pantalla de nueva consulta
   */
  nuevaConsulta(){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {};
    dialogConfig.width = "40%";
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;

    const dialogRef = this.dialog.open(NuevaConsultaComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(data => {
      this.filtrar();
    })
  }

  initForm() {
    this.querysForm = this.formBuilder.group({
      filter_type: new FormControl()
    });
  }

  /**
   * Metodo para obtener el ID de la empresa.
   */
  sacarId(){
    if(!sessionStorage.getItem('customerId') || isUndefined(sessionStorage.getItem('customerId')))
      this.router.navigate(['extranet/juridico']);
  }

  /**
   * Metodo para obtener la lista de status de queries
   */
  getAllQueryStatus(){
    this.customerService.getAllQueryStatus(this.translate.getDefaultLang()).subscribe(data => {
      this.listaTipos = data;
    })
  }

  /**
   * Metodo para convertir string ('EJEMPLO' -> 'Ejemplo')
   */
  conversor(elemento: String) {
    if (elemento != undefined){
      let convertido = elemento.substring(0, 1);
      convertido += elemento.substring(1, elemento.length).toLowerCase();
      return convertido;
    }
    return null;
  }

  /**
   * Metodo para obtener la información de una query segun su ID
   * @param idQuery
   */
  verQuery(idQuery: number){
    this.querySeleccionada = idQuery;
    this.spinner.show();

    this.customerService.findQueriesByQueryId(idQuery, this.translate.getDefaultLang(), Number(sessionStorage.getItem('customerId'))).subscribe(data => {
      this.queryVista = data[0];
      this.spinner.hide();
    }, error => {
      this.utils.mostrarMensajeSwalFire('error', "Ha ocurrido un error al intentar obtener la información solicitada", '','var(--blue)', false);
      this.spinner.hide();
    })
  }

  /**
   * Metodo para abrir el modal de archivos adjuntos
   */
  descargarAtachment(){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = this.queryVista;
    dialogConfig.width = "40%";
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;

    const dialogRef = this.dialog.open(DescargaArchivoComponent, dialogConfig);
  }

  tieneAdjuntos(): boolean{
    for (let line of this.queryVista.lines){
      if(line.queryLineByAttachments.length != 0)
        return true;
    }
    return false;
  }

  /**
   * Metodo para filtrar consultas segun su tipo
   */
  filtrar(){
    let status;
    this.spinner.show();

    if(this.querysForm.get('filter_type').value) {
      status = this.querysForm.get('filter_type').value;
    } else
      status = 0;

    this.customerService.findAllByStatus(Number(sessionStorage.getItem('customerId')), status, this.translate.getDefaultLang())
      .subscribe(data => {
        this.querys = data;

        const querys: any[] = [];
        for(let documento of this.querys){
          querys.push({
            id: documento.id,
            fechaHora: documento.created,
            contacto: documento.worker,
            titulo: documento.title,
            estado: documento.queryStatus.denominationExtranet
          })
        }

        this.dataSource = new MatTableDataSource(querys);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        this.spinner.hide();
      }, error => {
        this.utils.mostrarMensajeSwalFire('error', "Ha ocurrido un error al intentar obtener la información solicitada", '','var(--blue)', false);
        this.spinner.hide();
      })
  }

  drop(event: CdkDragDrop<string[]>) {

    moveItemInArray(this.tableHeaders, event.previousIndex, event.currentIndex);
    let objToSave: object = {};

    if (localStorage.getItem('tableColsOrder')) {
      objToSave = JSON.parse(localStorage.getItem('tableColsOrder'));
    }
    objToSave[this.constructor.name + 'IA'] = this.tableHeaders;
    localStorage.setItem('tableColsOrder', JSON.stringify(objToSave));

  }
}
