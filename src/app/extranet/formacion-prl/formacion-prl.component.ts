import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import { environment } from '../../../environments/environment';
import {ActivatedRoute, Router} from '@angular/router';
import {isUndefined} from 'util';
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {MatTableDataSource} from "@angular/material/table";
import {CustomerService} from "../../services/customer.service";
import {Observable} from "rxjs";
import {NgxSpinnerService} from "ngx-spinner";
import { ReproductorVideoComponent } from 'src/app/modales/reproductorVideo/reproductorVideo.component';
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {BreakpointObserver} from "@angular/cdk/layout";
import {PillsViewComponent} from "../../modales/pills-view/pills-view.component";
import { map } from 'rxjs/operators';
import {MatSort} from "@angular/material/sort";
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {MY_FORMATS} from '../../../config/config';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

export interface Actividades {
  id: number;
  fechaInicio: string;
  fechaFin: string;
  nombreActividad: string;
  tipo: string;
  aforo: number;
  aforoEmpresa: number,
  inscritos: number,
  inscritosEmpresa: number,
  pillUrl: string;
}

@Component({
  selector: 'app-formacion-prl',
  templateUrl: './formacion-prl.component.html',
  styleUrls: ['./formacion-prl.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class FormacionPrlComponent implements OnInit {
  environment = environment;
  cleanImgUrl = '../../assets/img/borrar_filtros.svg';
  searchImgUrl = '../../assets/img/search.svg';
  excelImgUrl = '../../assets/img/excel.svg';
  mailImgUrl = '../../assets/img/mail.svg';
  downloadImgUrl = '../../assets/img/download.svg';

  formacionForm: FormGroup;
  actividades: Actividades[];
  dataSource: MatTableDataSource<Actividades>;
  @ViewChild(MatSort) sort: MatSort;
  error: boolean;

  selected = false;
  selectedId: number;
  activitySelected: Actividades;

  tableHeaders: string[] = [
    'documento',
    'fechaInicio',
    'fechaFin',
    'nombreActividad',
    'tipo',
    'aforo',
    'inscritos',
    'empresa'
  ];

  constructor(
              public dialog: MatDialog,
              private router: Router,
              private route: ActivatedRoute,
              private customerService: CustomerService,
              private spinner: NgxSpinnerService,
              private formBuilder: FormBuilder,
              private breakpointObserver: BreakpointObserver) {
    this.sacarId();
  }

  ngOnInit(): void {
    this.error = false;
    this.initForm();
    this.getActividadesFormativas();
  }

  /**
   * Inicia los campos del formulario
   */
  initForm() {
    this.formacionForm = this.formBuilder.group({
      name: new FormControl(),
      from: new FormControl(),
      to: new FormControl(),
      inscriptions: new FormControl('2')
    });
  }

  /**
   * Reestablece los valores por defecto del formulario
   */
  resetForm() {
    this.formacionForm.reset({
      inscriptions: '2'
    });
  }

  /**
   * Obtiene los resultados según los filtros
   */
  getActividadesFormativas() {
    this.spinner.show();
    this.customerService.getCustomerActivities(parseInt(sessionStorage.getItem('customerId')), this.getFilters())
      .subscribe( data => {
        // console.table(data);
        this.actividades = [];
        if (data)
          for (const activities in data[0])
            data[0][activities].map( activity => {
              const act = {
                id: activity.id,
                fechaInicio: activity.visibleSince,
                fechaFin: activity.visibleUntil,
                nombreActividad: activity.name,
                tipo: activity.activityType.denomination,
                aforo: activity.inscriptions,
                aforoEmpresa: activity.companyInscriptions == null ? 0 : activity.companyInscriptions,
                inscritos: activity.totalInscriptions,
                inscritosEmpresa: activity.currentInscriptions,
                pillUrl: activity.pillUrl
              };
              this.actividades.push(act);
            });
        this.spinner.hide();
        this.route.paramMap
          .pipe( map( () => window.history.state))
          .subscribe( state => {
            if (this.actividades.length <= 0 || !this.actividades.some(actividad => actividad.id === state.id))
              return false;
            this.selected = state.selected;
            this.selectedId = state.id;
            if (this.selected)
              this.selectActivity(this.selectedId);
          });
        this.dataSource = new MatTableDataSource(this.actividades);
        this.dataSource.sort = this.sort;
      }), (error => {
      console.error(error);
      this.error = true;
      this.spinner.hide();
    });
  }

  /**
   * Obtiene los filtros realizados por el usuario
   */
  getFilters(){

    return {
      "name": this.formacionForm.get('name').value,
      "startDate": this.formacionForm.get('from').value == null ? "" : this.formacionForm.get('from').value.toISOString().substr(0, 10),
      "endDate": this.formacionForm.get('to').value == null ? "" : this.formacionForm.get('to').value.toISOString().substr(0, 10),
      "typeId": 0,
      "cancel": 0,
      "inscriptions": this.formacionForm.get('inscriptions').value
    }

  }

  /**
   * Selecciona una actividad para acceder a su vista detallada
   */
  selectActivity(id: number) {
    this.selected = true;
    this.actividades.map( activity => {
      if(activity.id == id)
        this.activitySelected = activity;
    });
  }

  /**
   * Vuelve al listado de actividades
   */
  returnToActivities() {
    this.selected = false;
    this.activitySelected = undefined;
  }

  /**
   * Abre un modal para visualizar el vídeo
   */
  abrirReproductorVideo(){
    this.spinner.show();
    const isSmallScreen = this.breakpointObserver.isMatched('(max-width: 900px)');
    const isLandscapeScreen = this.breakpointObserver.observe(['(orientation: landscape)']);
    const dialogConfig = new MatDialogConfig();

    dialogConfig.data = {
      tituloVideo: `Cuso SAJP - ${this.activitySelected.nombreActividad}`,
      url: this.activitySelected.pillUrl
    }
    if (isSmallScreen && !isLandscapeScreen){
      dialogConfig.width = "120%";
    }else {
      dialogConfig.width = "50%";
    }

    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;
    this.customerService.watchPill(this.activitySelected.id, parseInt(sessionStorage.getItem('customerId')), JSON.parse(localStorage.userDataFromUsuario).idUsuario)
      .subscribe( data => {
        this.spinner.hide();
        const dialogRef = this.dialog.open(PillsViewComponent, dialogConfig);
        dialogRef.afterClosed()
          .subscribe(video => {
          });
      }, error => {
        console.log(error);
        this.spinner.hide();
      });

  }

  sacarId(){
    if(!sessionStorage.getItem('customerId') || isUndefined(sessionStorage.getItem('customerId')))
      this.router.navigate(['extranet/juridico']);
  }

  get numeroCustomers(){
    return sessionStorage.getItem('customerQuantities');
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
