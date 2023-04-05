import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {isUndefined} from 'util';
import {CustomerService} from "../../services/customer.service";
import {Observable} from "rxjs";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {NgxSpinnerService} from "ngx-spinner";
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";

@Component({
  selector: 'app-servicios-prestados',
  templateUrl: './servicios-prestados.component.html',
  styleUrls: ['./servicios-prestados.component.css']
})
export class ServiciosPrestadosComponent implements OnInit {

  serviciosForm: FormGroup;
  years: string[];
  actuaciones: any[];
  error: boolean;
  cargaPosterior = true;
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatSort) sort: MatSort;

  tableHeaders: string[] = [
    'documento',
    'fechaHora',
    'actividad'
  ];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private spinner: NgxSpinnerService,
    private customerService: CustomerService
  ) {
    this.sacarId();
  }

  ngOnInit(): void {
    this.spinner.show();
    this.error = false;
    this.initForm();
    this.getYears();
  }

  /**
   *  Inicia los componentes del formulario
   */
  initForm() {
    this.serviciosForm = this.formBuilder.group({
      year: new FormControl()
    });
  }

  /**
   * Método que llama a customerService para obtener los años
   */
  getYears() {
    this.customerService.getActionReportYears(parseInt(sessionStorage.getItem('customerId')))
      .subscribe( data => {
        this.years = data;
        this.years.sort();
        this.years.reverse();
        this.serviciosForm.controls.year.setValue(this.years[0]);
        this.getActions();
      }, error1 => {
        this.error = true;
        this.spinner.hide();
      });
  }

  /**
   * Método que llama a customerService para obtener lac acciones realizadas por año
   */
  getActions() {
    this.spinner.show();
    this.customerService.getActionsReportByFilter(parseInt(sessionStorage.getItem('customerId')), this.serviciosForm.get('year').value)
      .subscribe( data => {
        // console.table(data);
        this.actuaciones = data;
        if (this.actuaciones == null)
          this.actuaciones = [];
        this.dataSource = new MatTableDataSource(this.actuaciones);
        this.dataSource.sort = this.sort;
        this.spinner.hide();
      }), (error => {
        this.error = true;
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
