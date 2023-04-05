import { startOfDay, endOfDay, subDays, addDays, endOfMonth, isSameDay, isSameMonth, addHours, subMonths, addMonths, addWeeks, subWeeks, startOfWeek, startOfMonth, endOfWeek } from 'date-fns';
import { Subject } from 'rxjs';
import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent, CalendarMonthViewDay, CalendarView } from 'angular-calendar';
import { ChangeDetectionStrategy, Component, Inject, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { UtilsService } from 'src/app/services/utils.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatPaginator } from '@angular/material/paginator';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Globals } from '../globals';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as _moment from 'moment';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MY_FORMATS } from '../../../config/config';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import localeEs from '@angular/common/locales/es';
import { CustomDateFormatter } from './custom-date-formatter.provider';
import { ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';

registerLocaleData(localeEs);
import {
  CalendarDateFormatter,
  DAYS_OF_WEEK,
} from 'angular-calendar';
import { registerLocaleData } from '@angular/common';

const moment = _moment;

/* Mock Data */
export interface CalendarioInterface {
}

const colors: any = {
  red: {
    primary: 'rgb(253, 126, 20)',
    secondary: 'rgb(100, 190, 100)',
  },
  blue: {
    primary: '#00425B',
    secondary: '#ECEFF1',
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA',
  },
  green: {
    primary: '#00425B',
    secondary: '#ECEFF1',
  },
};

type CalendarPeriod = 'day' | 'week' | 'month';

function addPeriod(period: CalendarPeriod, date: Date, amount: number): Date {
  return {
    day: addDays,
    week: addWeeks,
    month: addMonths,
  }[period](date, amount);
}

function subPeriod(period: CalendarPeriod, date: Date, amount: number): Date {
  return {
    day: subDays,
    week: subWeeks,
    month: subMonths,
  }[period](date, amount);
}

function startOfPeriod(period: CalendarPeriod, date: Date): Date {
  return {
    day: startOfDay,
    week: startOfWeek,
    month: startOfMonth,
  }[period](date);
}

function endOfPeriod(period: CalendarPeriod, date: Date): Date {
  return {
    day: endOfDay,
    week: endOfWeek,
    month: endOfMonth,
  }[period](date);
}
@Component({
  selector: 'app-citacion-web-calendario',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './citacion-web-calendario.component.html',
  styleUrls: ['./citacion-web-calendario.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    { provide: CalendarDateFormatter,
      useClass: CustomDateFormatter }
  ],
})

export class CitacionWebCalendarioComponent implements OnInit {
  cleanImgUrl = '../../assets/img/borrar_filtros.svg';
  searchImgUrl = '../../assets/img/search.svg';
  excelImgUrl = '../../assets/img/excel.svg';
  mailImgUrl = '../../assets/img/mail.svg';
  downloadImgUrl = '../../assets/img/download.svg';
  bloqueadoUps:boolean = true;

  searchForm: FormGroup;
  fechasList: any[];

  tableHeaders: string[] = [
    'fechaDocumento',
    'empresaCentroNombre',
    'specialAction'
  ];
  dataSource = new MatTableDataSource<CalendarioInterface>();

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  selectedDate: any;
  moment: any;
  locale: string = this.translate.getDefaultLang();
  workerData: any;

  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    public utilsService: UtilsService,
    public utils: UtilsService,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
    private globals: Globals,
    private translate: TranslateService,
    private router: Router,
    private cdRef:ChangeDetectorRef
  ) {
    this.dateOrViewChanged();
  }

  //Evita que se produzca el ERROR Error: ExpressionChangedAfterItHasBeenCheckedError
  ngAfterViewChecked()
  {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.getCalendarDates();
    this.initForm();
    // this.comprobarUpseling(this.utils.citaValues.idEmpresa);
    this.bloqueadoUps = this.utils.bloqueadoUpsCita;

    if (!this.utils.step1IsValid()) {
      this.router.navigate([this.globals.extranet_url + this.globals.extranet_citacion_web_provincia_url]);
    }

    this.workerData = JSON.parse(localStorage.getItem('workerData'));
    localStorage.removeItem('workerData');
  }

  initForm() {
    this.searchForm = this.formBuilder.group({
    });
    this.setDefaultForm();
  }

  setDefaultForm(): void {
  }

  onSubmit(): void {
    this.getCalendarDates();
  }

  getCalendarDates() {
    this.spinner.show();
    /*mapeo de objeto JSON a enviar*/
    let dataDto = {
      empresaDto: {
        idEmpresa: this.utils.citaValues.idEmpresa
      },
      centroMedico: {
        idCentroMedico: this.utils.citaValues.idCentroMedico
      }
    }

    this.utils.getCitasDisponibles(dataDto).subscribe(data => {
      if (data){
        this.fechasList = data;
        this.setDatesCalendar();
        this.refresh.next();
        if(data.length === 0){
          let titulo = "No se han encontrado citas";
          this.translate.get('ALERT_SIN_CITACIONES_WEB').subscribe((res: string) => {
            titulo = res;
          });
          let mensaje_1 = "Para la empresa: '";
          this.translate.get('ALERT_SIN_CITACIONES_WEB_1').subscribe((res: string) => {
            mensaje_1 = res;
          });
          let mensaje_2 = "' con el centro médico: '";
          this.translate.get('ALERT_SIN_CITACIONES_WEB_2').subscribe((res: string) => {
            mensaje_2 = res;
          });
          let mensajeFinal = mensaje_1 + this.utils.citaValues.nombreEmpresa + mensaje_2 + this.utils.citaValues.nombreCentroMedico +"'";
          this.utils.mostrarMensajeSwalFire('warning', titulo, mensajeFinal,'var(--blue)', false);
        }

      }
      this.spinner.hide();
    }, error => {
      this.spinner.hide();
      Swal.fire({
        icon: 'error',
        title: error.error.message,
        allowOutsideClick: false
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate([this.globals.extranet_url + this.globals.extranet_citacion_web_provincia_url]);
        }
      })
    })
  }

  onSelect(event) {
    //if (environment.debug) console.log(event);
    this.selectedDate = event;
  }

  previous() {
    if(this.workerData !== null) { localStorage.setItem('workerData', JSON.stringify(this.workerData)); }
    this.router.navigate([this.globals.extranet_url + this.globals.extranet_citacion_web_provincia_url]);
  }


  resetForm(): void {
    setTimeout(() => {
      this.setDefaultForm();
    });
  }

  view: CalendarView | CalendarPeriod = CalendarView.Month;

  CalendarView = CalendarView;

  viewDate: Date = new Date();

  minDate: Date = subMonths(new Date(), 0);

  maxDate: Date = addMonths(new Date(), 2);

  prevBtnDisabled: boolean = true;

  nextBtnDisabled: boolean = false;

  refresh: Subject<any> = new Subject();

  events: CalendarEvent[] = [];



  setDatesCalendar() {
    this.fechasList.forEach(item => {
      let fecha = new Date(item.fecha);//item.fecha -> UTC  ;  fecha -> UTC del cliente
      /*let minutos = fecha.getMinutes() == 0 ? "00" : fecha.getMinutes();
      let horaCita = fecha.getHours() + ":" + minutos;*/
      let horaCita = item.horaCita;
      this.events = [
        ...this.events,
        {
          title: horaCita,
          start: startOfDay(fecha),
          end: endOfDay(fecha),
          color: colors.blue,
          draggable: false,
          resizable: {
            beforeStart: true,
            afterEnd: true,
          },
        },
      ];
    });
  }

  getTitleEvents(events){
    let result = '';
    let c=0;
    events.forEach( event => {
      if (c!=0) result+="    ";
      result += event.title;
      c++;
    });
    return result;
  }

  activeDayIsOpen: boolean = false;


  increment(): void {
    this.changeDate(addPeriod(this.view, this.viewDate, 1));
  }

  decrement(): void {
    this.changeDate(subPeriod(this.view, this.viewDate, 1));
  }

  today(): void {
    this.changeDate(new Date());
  }

  changeView(view: CalendarPeriod): void {
    this.view = view;
    this.dateOrViewChanged();
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    let dateAux = new Date(date);
    let navigateEnabled: boolean = false;
    dateAux.setHours(12, 0, 0);
    if (this.fechasList.find(x => x.fechaString === dateAux.toLocaleDateString())){
        navigateEnabled = true;
    }
    let aux = {
      fecha: dateAux
    }
    this.utils.setFormValues(aux);
    if (navigateEnabled){
      if(this.workerData !== null) { localStorage.setItem('workerData', JSON.stringify(this.workerData)); }
      this.router.navigate([this.globals.extranet_url + this.globals.extranet_citacion_web_hora_url]);
    }
  }

  deleteEvent(eventToDelete: CalendarEvent) {
    this.events = this.events.filter((event) => event !== eventToDelete);
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  //Método que cuando se pase por encima del evento/día, se verifica si está dentro del periodo para poder habilitarlo
  beforeMonthViewRender({ body }: { body: CalendarMonthViewDay[] }): void {
    body.forEach((day) => {
      if (!this.dateIsValid(day.date) ||
          day.date < startOfPeriod(this.view, this.viewDate) /*||
          day.date > endOfPeriod(this.view, this.viewDate)*/){
        day.cssClass = 'cal-disabled';
      }
      if (day.date > endOfPeriod(this.view, this.viewDate)){
        //Indicamos para los días que están fuera del mes actual, como si fueran de este más, para que esté habilitado si tiene citas
        day.inMonth = true;
      }
    });
  }

  dateIsValid(date: Date): boolean {
    let dayValid: boolean = false;
      if (this.fechasList!==undefined &&
          this.fechasList.find(x => new Date(x.fecha).toDateString() === date.toDateString()) &&
          this.minDate && date <= endOfPeriod(this.view, this.maxDate)){
          dayValid = true;
      }
    return dayValid;
  }

  changeDate(date: Date): void {
    this.viewDate = date;
    this.dateOrViewChanged();
  }

  dateOrViewChanged(): void {
    this.prevBtnDisabled = this.minDate > endOfPeriod(this.view, subPeriod(this.view, this.viewDate, 1));
    this.nextBtnDisabled = this.maxDate < startOfPeriod(this.view, addPeriod(this.view, this.viewDate, 1));
    if (this.viewDate < this.minDate) {
      this.changeDate(this.minDate);
    } else if (this.viewDate > this.maxDate) {
      this.changeDate(this.maxDate);
    }
  }

  comprobarUpseling(empresa){
    this.userService.comprobarAbsentismo(empresa)
      .subscribe(data => {
        this.bloqueadoUps = data;
      }, error => {
        this.utilsService.mostrarMensajeSwalFire('error', 'Ha ocurrido un error al comprobar la petición', '', 'var(--blue)', false);
        this.bloqueadoUps = false;
      });
  }

}
