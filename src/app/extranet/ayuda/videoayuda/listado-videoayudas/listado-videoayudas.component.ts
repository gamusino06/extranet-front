import { Component, ElementRef, OnInit, ViewChild, EventEmitter, Output } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { FormBuilder, FormControl, FormGroup, NgModel, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Rol } from 'src/app/Model/Rol';
import { User } from 'src/app/Model/User';
import { Idioma } from 'src/app/Model/Idioma';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { MatTableExporterDirective } from 'mat-table-exporter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import * as _moment from 'moment';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {MY_FORMATS} from '../../../../../config/config';
import { TranslateService } from '@ngx-translate/core';
import { UtilsService } from 'src/app/services/utils.service';
import {MatSelect} from "@angular/material/select"
import {MatOption} from "@angular/material/core"
import { ChangeDetectorRef } from '@angular/core';
import { Globals } from '../../../globals';

const moment =  _moment;

/*mock data*/
export interface ListadoVideoAyudaInterface {
  checked: any;
  idVideoAyuda: number;
  nombre: string;
  categorias: any[];
  idioma: Idioma;
  rol: string;
  fechaBaja: string;
  activo: boolean;
  embedded_code: string;
}

@Component({
  selector: 'app-listado-videoayudas',
  templateUrl: './listado-videoayudas.component.html',
  styleUrls: ['./listado-videoayudas.component.css'],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})
export class ListadoVideoAyudasComponent implements OnInit {
  environment = environment;
  tableHeaders: string[] = ['checklist','nombre', 'descripcion', 'categorias', 'idioma', 'rol', 'activo', 'fechaBaja', 'star', 'clear'];
  dataSource: any;

  cleanImgUrl = '../../../../assets/img/borrar_filtros.svg';
  searchImgUrl = '../../../../assets/img/search.svg';
  excelImgUrl = '../../../../assets/img/excel.svg';
  mailImgUrl = '../../../../assets/img/mail.svg';
  downloadImgUrl = '../../../../assets/img/download.svg';

  rolesList: Rol[];
  userList: User[];
  idiomasList: Idioma[];

  idIdiomasList: number[];
  idRolesList: number[];
  categoriasList: any[];
  mostrarModificacion: boolean;
  mostrarTabla: boolean;
  mostrarEsteElemento: boolean;
  videoAyudaSelected: any;
  userForm: FormGroup;
  user: string;
  userDataLogged: any;
  isSuperAdmin: boolean;

  today = new Date().getDate();

  matTableExperterDirective: MatTableExporterDirective;

  //formularioEvent = new EventEmitter();
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('TABLE') table: ElementRef;
  @ViewChild('TABLE') exportTableDirective: ElementRef;
  sortBy: any;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
    public utils: UtilsService,
    private translate: TranslateService,
    private cdRef:ChangeDetectorRef,
    public globals: Globals
  ) { }

  //Evita que se produzca el ERROR Error: ExpressionChangedAfterItHasBeenCheckedError
  ngAfterViewChecked(){
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.spinner.show();
    this.initForm();
    this.idRolesList = [];
    this.idIdiomasList = [];

    //Restore table cols order
    if (localStorage.getItem('tableColsOrder')) {
      let localStorageObj: object;
      localStorageObj = JSON.parse(localStorage.getItem('tableColsOrder'));

      if (localStorageObj[this.constructor.name] &&
        Array.isArray(localStorageObj[this.constructor.name]) &&
        localStorageObj[this.constructor.name].length == this.tableHeaders.length)
        this.tableHeaders = localStorageObj[this.constructor.name];
    }

    this.categoriasList = [];
    this.getCategoriasAyuda();
    this.getIdiomas();
    this.spinner.hide();
    this.getUserData();

  }

  ngAfterViewInit() {

  }

  onSubmit(): void {
    this.getListadoVideoAyuda()
  }

  initForm(){
    /*inicializacion de formulario*/
    this.userForm = this.formBuilder.group({
      nombreForm: new FormControl(''),
      descripcionForm: new FormControl(''),
      categoriaForm: new FormControl(''),
      selectAllcategoriaForm: new FormControl(''),
      afectaForm: new FormControl(''),
      selectAllafectaForm: new FormControl(''),
      idiomaForm: new FormControl(''),
      selectAllidiomaForm: new FormControl(''),
      activoForm: new FormControl(1),
      selectAllCheckBox: new FormControl('')
    });
    this.setDefaultForm();
    this.getRoles();
  };

  setDefaultForm(): void {
    this.userForm.controls['nombreForm'].setValue('');
    this.userForm.controls['descripcionForm'].setValue('');
    this.userForm.get('categoriaForm').setValue([]);
    this.userForm.get('selectAllcategoriaForm').setValue(false);
    this.userForm.get('afectaForm').setValue([]);
    this.userForm.get('selectAllafectaForm').setValue(false);
    this.userForm.get('idiomaForm').setValue([]);
    this.userForm.get('selectAllidiomaForm').setValue(false);
    this.userForm.controls['activoForm'].setValue(1);

    /*
    this.userForm.get("afectaForm").statusChanges.subscribe(x => {
      console.log('afectaForm status changes')
    });*/
  }

  resetForm(): void {
    setTimeout(() => { //setTimeout needed on form reset
      this.setDefaultForm();
      this.idRolesList = [];
      this.idIdiomasList = [];
      //this.getUserData(); //NOTA IMPORTANTE: No se vuelve a obtener los documentos cuando se limpie el filtro por petición de Preving (23/09/2021)
    });
  }

  //Método que recibe la lista de roles del usuario logeado (el cual es enviado desde el listado de VideoAyudas)
  getRoles() {
    //this.rolesList = this.userDataLogged.permisosRoles;
    this.userService.getRoles().subscribe(data => {
      if(data){
        this.rolesList = data;
        this.rolesList.shift();  //Eliminamos el 1º elemento de la lista de Roles (Rol SuperAdmin)
        if (environment.debug) console.log("Succes");
      }else{
        this.spinner.hide();
      }
    }), (error => {
      if (environment.debug) console.log("Error");
    })
  }

  getUserData(): void {
    this.spinner.show();
    this.userService.getUser().subscribe(user => {
      if(user){
      	//this.rolesList = user.permisosRoles;
        this.isSuperAdmin = false;
        user.permisosRoles.forEach(rol => {
          this.idRolesList.push(rol.idRol);
          if (rol.idRol==1)
            this.isSuperAdmin = true;
        });
        this.userDataLogged = user;

        this.userForm.controls.idiomaForm.setValue([user.idioma.idIdioma]);
        /*primera carga*/
        this.getListadoVideoAyuda();
      }else{
      	this.spinner.hide();
      }
    });
  }

  //Método que recibe las categorias visibles
  getCategoriasAyuda() {
    this.userService.getCategoriasAyuda().subscribe(data => {
      if(data){
        this.categoriasList = data;
      }else{
        this.spinner.hide();
      }
    });
  }

  getIdiomas() {
    this.userService.getIdiomas().subscribe(data => {
      if(data){
        this.idiomasList = data;
        this.idiomasList.forEach(idioma => {
          this.idIdiomasList.push(idioma.idIdioma);
        });

        if (environment.debug) console.log("Succes");
      }else{
        this.spinner.hide();
      }
    }), (error => {
      if (environment.debug) console.log("Error");
    })
  }

  getListadoVideoAyuda() {
    this.spinner.show();
    let listaIdRoles: number[] = [];
    if(this.userForm.get('afectaForm').value.length > 0){
      listaIdRoles = this.userForm.get('afectaForm').value;
    }else{
      listaIdRoles = this.idRolesList;
    }

    let listaIdIdiomas: number[] = [];
    if(this.userForm.get('idiomaForm').value.length > 0){
      listaIdIdiomas = this.userForm.get('idiomaForm').value;
    }else{
      listaIdIdiomas = this.idIdiomasList;
    }

    let dataReq = {
      nombre: this.userForm.get('nombreForm').value,
      descripcion: this.userForm.get('descripcionForm').value,
      listaIdCategorias: this.userForm.get('categoriaForm').value,
      listaIdRoles: listaIdRoles,
      listaIdIdiomas: listaIdIdiomas,
      activo: this.userForm.get('activoForm').value
    }

    this.userService.getVideoayudas(dataReq).subscribe((results: ListadoVideoAyudaInterface[]) => {
      if(results){
      	this.dataSource = new MatTableDataSource(results);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        //Fix sort problem: sort mayúsculas y minúsculas
        this.dataSource.sortingDataAccessor = (item, property) => {
          if (!item[property])
            return "";

          if (property == 'fecha')
            return new Date(item.fechaBaja);

          if (property == 'idioma')
            return item[property].nombre;

          if (typeof item[property] === 'string')
            return item[property].toLocaleLowerCase();

          return item[property];
        };

        this.mostrarTabla = true;
        if (environment.debug) console.log("Succes");
      }
      this.spinner.hide();
    }), (error => {
      if (environment.debug) console.log("Error");
    })
  }

  modificarVideoAyuda(videoAyudaSelected) {
    this.videoAyudaSelected = videoAyudaSelected;
    this.mostrarModificacion = true;
  }

  deleteVideoAyuda(videoAyudaSelected) {
    let data = {
      idVideoayuda: videoAyudaSelected.idVideoayuda
    };

    let title_text = "Se va a proceder a la eliminación de la videoayuda:";
    let title_verificacion = "¿Desea continuar?";
    let btn_text = "Si";
    let btn_text_cancelar = "No";
    let response_success = "Videoayuda eliminada con exito";
    let response_error = "Se ha producido un error";

    this.translate.get('BAJA_VIDEOAYUDA').subscribe((res: string) => {
      title_text = res;
    });
    this.translate.get('BAJA_VIDEOAYUDA_VERIFICACION').subscribe((res: string) => {
      title_verificacion = res;
    });
    this.translate.get('SI').subscribe((res: string) => {
      btn_text = res;
    });
    this.translate.get('NO').subscribe((res: string) => {
      btn_text_cancelar = res;
    });
    this.translate.get('BAJA_VIDEOAYUDA_SUCCESS').subscribe((res: string) => {
      response_success = res;
    });
    this.translate.get('ERROR').subscribe((res: string) => {
      response_error = res;
    });

    Swal.fire({
      titleText: title_text +' '+ videoAyudaSelected.nombre,
      text: title_verificacion,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--blue)',
      confirmButtonText: btn_text,
      cancelButtonText: btn_text_cancelar,
      allowOutsideClick: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteVideoayuda(data).subscribe(data => {
          if (data) {
            Swal.fire({
              icon: 'success',
              title: response_success,
              confirmButtonColor: 'var(--blue)',
              allowOutsideClick: false
            }).then((result) => {
              if (result.isConfirmed) {
                //location.reload();
                this.getListadoVideoAyuda();  //Se recarga la tabla
              }
            })
          } else {
            this.spinner.hide();
            Swal.fire({
              icon: 'error',
              title: response_error,
              confirmButtonColor: 'var(--blue)',
              allowOutsideClick: false
            }).then((result) => {
                if (result.isConfirmed) {
                  location.reload();
                }
              })
          }

        }), (error => {
          Swal.fire({
            icon: 'error',
            title: response_error,
            confirmButtonColor: 'var(--blue)',
            allowOutsideClick: false
          })
        })
      }
    })
  }

  /*master Toggle para Combos*/
  equals(objOne, objTwo) {
    if (typeof objOne !== 'undefined' && typeof objTwo !== 'undefined') {
      return objOne.id === objTwo.id;
    }
  }

  altaVideoAyuda() {
    this.router.navigate([this.globals.extranetBarra + this.globals.ayuda + this.globals.altaVideoayudas]);
  }

  selectAll(formName, formControlName, values, fieldName) {
    /*console.log("en selectAll");
    console.log("values.length = " + values.length);
    console.log("this["+formName+"].controls["+formControlName+"].value.length = " + this[formName].controls[formControlName].value.length);
    console.log("this["+formName+"].controls[selectAll"+formControlName+"].checked = " + this[formName].controls["selectAll"+formControlName].checked);*/
    let result = [];
    if (this[formName]?.controls[formControlName]?.value?.length === 0) {
        values.forEach(item => {
        result.push(item[fieldName]);
      })
    }
    this[formName].controls[formControlName].setValue(result, {emitEvent: true});
    this[formName].controls[formControlName].emit(result);
  }

  isIndeterminate(formName, formControlName, values): boolean {
      let returnValue = false;
      if (this[formName]?.controls[formControlName]?.value?.length === 0) returnValue = false;
      else returnValue = this[formName]?.controls[formControlName]?.value?.length < values?.length;

      //console.log("isIndeterminate - return: "+returnValue+" -> this[formName].controls[formControlName].value.length:"+this[formName].controls[formControlName].value.length+" values.length:"+values.length);

      return returnValue;
  }

  isChecked(formName, formControlName, values): boolean {
    let returnValue = this[formName]?.controls[formControlName]?.value?.length === values?.length;
    //console.log("isChecked  - return: "+returnValue);//+" ->  this[formName].controls[formControlName].value.length:"+this[formName].controls[formControlName].value.length+" values.length:"+values.length);
    return returnValue ;
  }

 toggleAllSelection(operator, control) {
    if(!this[operator]) {
      this[control].options.forEach( (item : MatOption) => item.select());
    } else {
      this[control].options.forEach( (item : MatOption) => item.deselect());
    }
    this[operator] =! this[operator];
 }

  videoAyudaModFlow() {
    this.mostrarModificacion = !this.mostrarModificacion;
    this.getListadoVideoAyuda();
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

  exportAsExcel() {
    this.spinner.show();
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    let JSONWS: XLSX.WorkSheet;
    let dataJS = [];

    let nombre_text = "Nombre";
    let descripcion_text = "Descripción";
    let categorias_text = "Categoria";
    let idioma_text = "Idioma";
    let rol_text = "Rol";
    let activo_text = "Activo";
    let fechaBaja_text = "Fecha baja";
    let listadoVideoAyudas_text = "Listado VideoAyudas";

    this.translate.get('NOMBRE').subscribe((res: string) => {
      nombre_text = res;
    });
    this.translate.get('DESCRIPCION').subscribe((res: string) => {
      descripcion_text = res;
    });
    this.translate.get('CATEGORIA').subscribe((res: string) => {
      categorias_text = res;
    });
    this.translate.get('IDIOMA').subscribe((res: string) => {
      idioma_text = res;
    });
    this.translate.get('ROL').subscribe((res: string) => {
      rol_text = res;
    });
    this.translate.get('ACTIVO').subscribe((res: string) => {
      activo_text = res;
    });
    this.translate.get('FECHA_BAJA').subscribe((res: string) => {
      fechaBaja_text = res;
    });
    this.translate.get('LISTADO_VIDEOAYUDAS').subscribe((res: string) => {
      listadoVideoAyudas_text = res;
    });

    let isElementosSelec: boolean = false;

    this.dataSource.data.forEach(item => {
      if (item.checked) {
        isElementosSelec = true;
        let new_item = {};
        this.tableHeaders.forEach(tableHeader => {

          switch (tableHeader) {
            case 'nombre':
              new_item[nombre_text] = item['nombre'];
              break;

            case 'descripcion':
              new_item[descripcion_text] = item['descripcion'];
              break;

            case 'categorias':
              new_item[categorias_text] = "";
              if (item['categorias']) {
                new_item[categorias_text] = item['categorias'].map(function (categoria) {
                  return categoria.nombre;
                }).join(', ');
              }
              break;

            case 'idioma':
              new_item[idioma_text] = item.idioma.nombre;
              break;

            case 'rol':
              new_item[rol_text] = "";
              if (item['roles']) {
                new_item[rol_text] = item['roles'].map(function (role) {
                  return role.nombre;
                }).join(', ');
              }
              break;

            case 'activo':
              new_item[activo_text] = item['activo'] ? 'si' : 'no';
              break;

            case 'fechaBaja':
              new_item[fechaBaja_text] = "";
              if (item.fechaBaja) {
                new_item[fechaBaja_text] = (new Date(item.fechaBaja)).toLocaleString();
              }
              break;

            default:
              break;
          }

        });


        dataJS.push(new_item);
      }

    });

    if (isElementosSelec == false) {
      let titulo = "Debe seleccionar al menos un elemento a exportar";
      this.translate.get('ERROR_SELECCIONA_EXPORTAR').subscribe((res: string) => {
        titulo = res;
      });
      this.utils.mostrarMensajeSwalFire('error', titulo, '', 'var(--blue)', false);
    } else {
      let result = XLSX.utils.sheet_add_json(JSONWS, dataJS);

      XLSX.utils.book_append_sheet(wb, result, 'Sheet1');

      /* save to file */
      XLSX.writeFile(wb, listadoVideoAyudas_text + '.xlsx');
    }

    //this.dataSource.paginator._changePageSize(paginacion);

    this.spinner.hide();

  }

  checkAllRows() {
    if (this.dataSource.filteredData != undefined) {
      if (this.dataSource !== undefined && this.dataSource !== {}) {
        if (this.dataSource.filteredData.every(val => val.checked == true))
          this.dataSource.filteredData.forEach(val => { val.checked = false });
        else
          this.dataSource.filteredData.forEach(val => { val.checked = true });
      }
    } else {
      if (this.dataSource !== undefined && this.dataSource !== {}) {
        if (this.dataSource.every(val => val.checked == true))
          this.dataSource.forEach(val => { val.checked = false });
        else
          this.dataSource.forEach(val => { val.checked = true });
      }
    }
  }

}
