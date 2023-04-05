import { Component, Inject, ViewChild} from '@angular/core';
import {MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {DateAdapter, ErrorStateMatcher, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { UtilsService } from 'src/app/services/utils.service';
import { Globals } from 'src/app/extranet/globals';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MY_FORMATS } from 'src/config/config';
import * as _moment from 'moment';
import { ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';
import { Centro } from 'src/app/Model/Centro';
import { Empresa } from 'src/app/Model/Empresa';

const moment = _moment;


@Component({
  selector: 'seleccionEmpresasCentros',
  templateUrl: 'seleccionEmpresasCentros.component.html',
  styleUrls: ['seleccionEmpresasCentros.component.scss'],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})
export class SeleccionEmpresasCentrosComponent {
  cleanImgUrl = '../../assets/img/borrar_filtros.svg';
  searchImgUrl = '../../assets/img/search.svg';

  empresas: any[];
  mapaEmpresa = new Map();
  mapaCentroEmpresa = new Map();
  excluded:boolean = false;

  searchForm: FormGroup;
  radioButtonsActivos: Boolean = false;
  //selectedRadioEmpresas: Number = 1; //Sin uso en este componente
  selectedRadioCentros: Number = 1;

  @ViewChild('paginatorEmpresas', {static: false}) paginatorEmpresas: MatPaginator;
  @ViewChild('sortEmpresas') sortEmpresas: MatSort;
  //@ViewChild('paginatorCentros', {static: false}) paginatorCentros: MatPaginator;
  //@ViewChild('sortCentros') sortCentros: MatSort;
  paginatorCentros: MatPaginator;
  @ViewChild('paginatorCentros', {static: false}) set matPaginator(paginatorCentros: MatPaginator) {
                                                        this.paginatorCentros = paginatorCentros;
                                                        this.dataSourceCentro.paginator = this.paginatorCentros;
                                                      };
  sortCentros: MatSort;
  @ViewChild('sortCentros', {static: false}) set matSort(sortCentros: MatSort) {
                                                        this.sortCentros = sortCentros;
                                                        this.dataSourceCentro.sort = this.sortCentros;
                                                      };


  tableHeadersEmpresas: string[] = [
    'checklist',
    'nombreEmpresa',
    'ver'
  ];
  tableHeadersCentros: string[] = [
    'checklist',
    'nombreCentro'
  ];

  dataSourceEmpresa = new MatTableDataSource<Empresa>();
  dataSourceCentro = new MatTableDataSource<Centro>();

  policyText: any;
  constructor(
    public dialogRef: MatDialogRef<SeleccionEmpresasCentrosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UserService,
    private formBuilder: FormBuilder,
    public utils: UtilsService,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
    private globals: Globals,
    public translate: TranslateService,
    private router: Router,
    private cdRef:ChangeDetectorRef)
  { }

  //Evita que se produzca el ERROR Error: ExpressionChangedAfterItHasBeenCheckedError
  ngAfterViewChecked(){
    this.cdRef.detectChanges();
  }

  ngAfterViewInit() {
    //fix paginacion
    this.dataSourceEmpresa.sort = this.sortEmpresas;
    this.dataSourceEmpresa.paginator = this.paginatorEmpresas;
  }

  ngOnInit() {
    this.spinner.show();
    this.initForm();
    let bTodasEmpresaChecked = true;

    //Nos copiamos el objeto de la 1º iteración. Falta el problema de copiar los objetos del 2º nivel
    this.empresas = [];

    //Sólo realiza una copia superficial (Object.assign), se tiene que realizar una copia profunda
    //this.data.empresas.forEach(val => this.empresas.push(Object.assign({}, val)));

    //Se recorre la lista que le llega a la modal para así poder hacer una copia profunda del objeto
    this.data.empresas.forEach(empresa => {
        this.empresas.push(this.utils.deepClone(empresa));
    });

    //Se utiliza JSON para copiar el objeto entero, para evitar recorrerse aquí la lista, aunque lo haga internamente en JSON
    //this.empresas = JSON.parse(JSON.stringify(this.data.empresas));

    this.radioButtonsActivos = this.data.radioButtonsActivos;
    //Recorremos las empresas y sus centros para setear sus checked y guardarlos en sus correspondiente mapas.
    let centrosEmpresas: any[] = [];

    this.empresas.forEach(empresa => {
        //Si está activado, seteamos los centros
        if (empresa.todosCentros) {
          empresa.checked = true;
        }

        empresa.nombreEmpresa = empresa.nombre; //Creamos un nuevo atributo para la empresa

        let isPT = false;
        let isVS = false;
        if (localStorage.getItem('areaSelected')!=="undefined") {
          let seleccionArea = JSON.parse(localStorage.getItem('areaSelected'));
          if (seleccionArea.idArea === this.globals.idAreaPT) {
            isPT = true;
          }
          if (seleccionArea.idArea === this.globals.idAreaVS) {
            isVS = true;
          }
        }
        empresa.centros.forEach(centro => {
            centro.nombreCentro = centro.nombre; //Creamos un nuevo atributo para la empresa

            //Comprobamos si el centro tiene PT y VS
            this.utils.actualizacionAtributosSegunAreaisPTisVS(centro, isPT, isVS);
            this.mapaCentroEmpresa.set(centro.idCentro, empresa);
            //Si está activado, seteamos los checked de los centros
            if (empresa.todosCentros) centro.checked = true;

            centrosEmpresas.push(centro);
        });

        this.mapaEmpresa.set(empresa.idEmpresa, empresa);
        if (!empresa.checked) bTodasEmpresaChecked = false;
    });
    this.dataSourceEmpresa = new MatTableDataSource(this.empresas);
    this.dataSourceEmpresa.sort = this.sortEmpresas;
    this.dataSourceEmpresa.paginator = this.paginatorEmpresas;

    this.dataSourceEmpresa.sortingDataAccessor = (item, property) => {
      if (typeof item[property] === 'string')
        return item[property].toLocaleLowerCase();

      return item[property];
    };

    //Indicamos como debe filtrar la tabla dataSourceEmpresa
    this.dataSourceEmpresa.filterPredicate = function(data, filter: string): boolean {
      return data.nombre.toLowerCase().includes(filter);
    };

    //En el caso de que la tabla de empresas sólo esté una empresa, entonces habilitamos la tabla de centros para que el usuario pueda ver directamente sus centros
    if(this.dataSourceEmpresa.data.length === 1){
        this.filtrarPorSelectRadioCentros(this.empresas[0].centros);
        //Excluimos los centros de ser modificados, cuando sólo se tiene una empresa seleccionada con todosCentros = true al iniciarse el componente
        if (this.empresas[0].todosCentros)
        {
            this.excluded = true;
            this.empresas[0].centros.forEach(centroEmpresa => {
                centroEmpresa.excluded=true;
            });
        }
    }else{
        //Se deshabilita los formularios de los centros y setea el dataSourceCentro vacio
        let centros : Centro[] = [];
        this.actualizarCentrosTabla(centros);
    }

    if (bTodasEmpresaChecked) this.searchForm.controls['selectAllCheckBoxEmpresas'].setValue(1);
    else this.searchForm.controls['selectAllCheckBoxEmpresas'].setValue(0);

    this.spinner.hide();
  }

  initForm() {
    this.searchForm = this.formBuilder.group({
      selectAllCheckBoxEmpresas: new FormControl('0'),
      selectAllCheckBoxCentros: new FormControl('0'),
      //selectEmpresasRadioForm: new FormControl('1'), //Sin uso
      selectCentrosRadioForm: new FormControl('1'),
      centroSearchForm: new FormControl(''),
      centroSearchBtnForm: new FormControl('')
    });
    //this.searchForm.controls['selectCentrosRadioForm'].disable();
    this.searchForm.controls['centroSearchForm'].disable();
    this.searchForm.controls['centroSearchBtnForm'].disable();
  }

  onSubmit(): void {
    //this.spinner.show();
  }

  //Método que filtra los centros de las empresas al dataSourceCentro según el filtro SelectedRadioCentros
  filtradoCentrosPorSelectedRadioCentros(centros){
    let centrosFiltrados : Centro[] = [];

    centros.forEach(centro => {
        if (this.selectedRadioCentros === 0 && centro?.mostrar == true)
          centrosFiltrados.push(centro);
        else if (this.selectedRadioCentros === 1 && centro?.activo == true && centro?.mostrar == true)
          centrosFiltrados.push(centro);
        else if (this.selectedRadioCentros === 2 && centro?.activo == false && centro?.mostrar == true)
          centrosFiltrados.push(centro);
    });
    this.actualizarCentrosTabla(centrosFiltrados);
  }

  //Método que averigua la empresa de los centros
  filtrarPorSelectRadioCentros(centrosDataSource){
    let centros: Centro[] = [];
    if (centrosDataSource.length === 0) {
      let idEmpresaSelecionadaModal = +localStorage.getItem('empresaSeleccionadaModal'); // Se utiliza + para convertir el String a number
      if (idEmpresaSelecionadaModal !== undefined){
          centros = this.mapaEmpresa.get(idEmpresaSelecionadaModal).centros;
      }else{
          return centros;
      }
    }

    if (centros.length > 0){
        return this.filtradoCentrosPorSelectedRadioCentros(centros);
    }else{
      let centro: Centro = centrosDataSource[0];
      let empresa: Empresa = this.mapaCentroEmpresa.get(centro.idCentro);
      //Se guarda la empresa de los centros, para que en caso de que no tenga centros inactivos, en la siguiente llamada a activos o verTodos, pueda cargar los centros de la empresa
      localStorage.setItem('empresaSeleccionadaModal',empresa.idEmpresa.toString());
      return this.filtradoCentrosPorSelectedRadioCentros(empresa.centros);
    }
  }

  //Método que actualiza los centros de la tabla dataSourceCentro y setea dicha tabla y el paginator.
  actualizarCentrosTabla(centros){
    this.dataSourceCentro = new MatTableDataSource(centros);
    this.dataSourceCentro.paginator = this.paginatorCentros;
    this.dataSourceCentro.sort = this.sortCentros;

    this.dataSourceCentro.sortingDataAccessor = (item, property) => {
      if (typeof item[property] === 'string')
        return item[property].toLocaleLowerCase();

      return item[property];
    };

    //Indicamos como debe filtrar la tabla dataSourceCentro
    this.dataSourceCentro.filterPredicate = function(data, filter: string): boolean {
      return data.nombre.toLowerCase().includes(filter);
    };

    if (centros.length === 0){
        //this.searchForm.controls['selectCentrosRadioForm'].disable();
        this.searchForm.controls['centroSearchForm'].disable();
        this.searchForm.controls['centroSearchBtnForm'].disable();
    }else{
        //this.searchForm.controls['selectCentrosRadioForm'].enable();
        this.searchForm.controls['centroSearchForm'].enable();
        this.searchForm.controls['centroSearchBtnForm'].enable();
    }
  }

  //Método que añade la empresa si ha sido deschequeada
  addEmpresa(event, empresa){
    //Si viene a true el chequeo, entonces ahora la empresa tendrá todos sus centros modificados por el usuario
    //Se procederá a guardar dichos centros en su empresa correspondiente
    if (!event.checked){
      let emp = this.mapaEmpresa.get(empresa.idEmpresa); //Se obtiene la empresa a modificar

      //Se consigue los centros si se había pinchado en el botón de modificar los centros de la empresa
      //Y se devuelve la empresa con los centros ya modificados
      let empresaAGuardar: Empresa = this.guardarCentrosTabla();
      let centros: Centro[] = [];
      this.actualizarCentrosTabla(centros);

      if (empresaAGuardar != undefined){
        //Se verifica si justo era la empresa checked la que estaba sus centros modificandose
        if (emp.idEmpresa === empresaAGuardar.idEmpresa){
          this.mapaEmpresa.set(emp.idEmpresa, empresaAGuardar); //Volvemos a guardar la empresa con sus centros modificados
        }
      }
    }else{
        let centros: Centro[] = [];
        this.actualizarCentrosTabla(centros);
    }
  }

  //Método que consigue los centros que se encuentra en la tabla 'dataSourceCentro'
  //Averigua la empresa de dichos centros y lo modifica
  //Devuelve la empresa asociada a dichos centros.
  guardarCentrosTabla(){
    let centrosAGuardar: Centro[] = [];
    let empresaAGuardar: Empresa;

    if (this.dataSourceCentro.data.length > 0){
      //Hay centros que se han modificado de la empresa 'empresa'
      //Se recorre los centros
      let empresaEncontrada: boolean = false;
      this.dataSourceCentro.data.forEach(centro => {
          centrosAGuardar.push(centro);
          //Se obtiene del mapa de Centros, la empresa perteneciente
          if (!empresaEncontrada){
              empresaEncontrada = true;
              empresaAGuardar = this.mapaCentroEmpresa.get(centro.idCentro);
          }
      });

      //Saco los centros originales de la empresa
      let centrosOriginales: Centro[] = [];
      empresaAGuardar.centros.forEach(centro => {
          if (!centrosAGuardar.find(c => c.idCentro === centro.idCentro))
              centrosOriginales.push(centro);
      });
      centrosAGuardar.forEach(centro => {
          centrosOriginales.push(centro);
      });

      //Ahora que ya se sabe la empresa, vamos a actualizar los centros de dicha empresa con los modificados en al tabla
      empresaAGuardar.centros = centrosOriginales.slice();
    }

    return empresaAGuardar;
  }

  //Método que obtiene la empresa chequeada y la guarda con el cambio del evento
  //También llama al método de modificar el dataSourceCentro, para quitar o añadir los centros
  cambiarCentrosEmpresa(event, empresa){
    //Actualizamos selectedRadioCentros con la nueva búsqueda
    this.selectedRadioCentros = 1;
    this.searchForm.controls['selectCentrosRadioForm'].setValue('1');

    //this.spinner.show();
    //Si viene a true el chequeo, entonces ahora la empresa tendrá todos sus centros
    let emp = this.mapaEmpresa.get(empresa.idEmpresa); //Se obtiene la empresa a modificar
    let eliminarCentrosEnDataSourceCentro: boolean = false;
    if (event.checked){
        emp.checked = true;
        emp.todosCentros = true;
        this.excluded = true;
        this.searchForm.controls['selectAllCheckBoxCentros'].setValue(1);
        /*this.excluded = true;
        emp.centros.forEach(centroEmpresa => {
            centroEmpresa.excluded=true;
        });*/
    }else{
        emp.checked = false;
        emp.todosCentros = false;
        eliminarCentrosEnDataSourceCentro = true;
        this.excluded = false;
        this.searchForm.controls['selectAllCheckBoxCentros'].setValue(0);
    }

    //Se actualiza o se guarda los centros de la tabla dataSourceCentro
    this.modificarCentrosEmpresaDataSource(emp, eliminarCentrosEnDataSourceCentro, this.excluded);
  }

  //Método que obtiene la empresa chequeada
  verCentrosEmpresa(event, empresa){
    //Actualizamos selectedRadioCentros con la nueva búsqueda
    this.selectedRadioCentros = 1;
    this.searchForm.controls['selectCentrosRadioForm'].setValue('1');

    let emp = this.mapaEmpresa.get(empresa.idEmpresa); //Se obtiene la empresa a visualizar
    let eliminarCentrosEnDataSourceCentro: boolean = true;

    this.excluded = true;
    //Se actualiza o se guarda los centros de la tabla dataSourceCentro
    this.modificarCentrosEmpresaDataSource(emp, eliminarCentrosEnDataSourceCentro, true);
  }

  //Método que añade o elimina los centros de la empresa chequeada
  modificarCentrosEmpresaDataSource(empresa, eliminarCentrosEnDataSourceCentro, excluded){
    if(this.dataSourceCentro.data){
      let centros: Centro[] = [];
      if (!eliminarCentrosEnDataSourceCentro){
          //Se elimina los centros de la empresa
          this.dataSourceCentro.data.forEach(centroTabla => {
              //Si no encuentra los centros de la empresa que ahora pasa a true 'todosCentros'
              //Se añadirá a la tabla
              if (!empresa.centros.find(c => c.idCentro === centroTabla.idCentro))
                  centros.push(centroTabla);
          });
      }else{
        //Si hay datos, guardamos el listado de centros de la empresa correspondiente recorriendo dataSourceCentro
        let empresaAGuardar: Empresa = this.guardarCentrosTabla();
        if (empresaAGuardar !== undefined)
          this.mapaEmpresa.set(empresaAGuardar.idEmpresa, empresaAGuardar);

        //Se recorre la empresa seleccionada para mostrar sus centros
        empresa.centros.forEach(centroEmpresa => {
            centroEmpresa.excluded=excluded;
            centros.push(centroEmpresa);
        });
      }
      //Se actualiza el dataSourceCentro, tanto si elimino como si añado Centros
      this.filtrarPorSelectRadioCentros(centros);
    }
  }

  resetForm(): void {
    setTimeout(() => {
      //this.spinner.show();
    });
  }

  closeModal() {
    this.dialogRef.close();
  }

  //Método que recorre las empresas y guarda las empresas
  guardarRelacionEmpresasCentros() {
    let empresasModificadasAGuardar: Empresa[] = [];

    //Comprobamos el dataSourceCentro por si no se ha guardado su contenido antes de guardar las empresas
    let empresaAGuardar: Empresa = this.guardarCentrosTabla();
    if (empresaAGuardar !== undefined)
      this.mapaEmpresa.set(empresaAGuardar.idEmpresa, empresaAGuardar);

    let mostrarAvisoEmpresaSinTodosCentros: boolean = false;
    for (var [key, empresa] of this.mapaEmpresa) {
      empresasModificadasAGuardar.push(empresa);
      empresa.todosCentros = empresa.checked; //Si la empresa está desmarcada, entonces ya no afectará a todos los centros
      if (!empresa.todosCentros)
        mostrarAvisoEmpresaSinTodosCentros = true;
    }

    //Se verifica si se le muestra al usuario el aviso o no, si tiene alguna empresa desmarcada
    if (mostrarAvisoEmpresaSinTodosCentros){
      let titulo = "Recuerde que se han realizado cambios y por lo tanto, si en un futuro se añaden nuevos centros de trabajo en las empresas que NO tienen marcada la check \"Afecta a todos los Centros de Trabajo\", el usuario NO visualizará por defecto los datos de esos nuevos centros de trabajo.";
      this.translate.get('AVISO_USUARIO_EMPRESA_SIN_TODOSCENTROS').subscribe((res: string) => {
        titulo = res;
      });
      let btn_text_aceptar = "Aceptar";
      this.translate.get('ACEPTAR').subscribe((res: string) => {
        btn_text_aceptar = res;
      });
      let btn_text_cancelar = "Cancelar";
      this.translate.get('CANCELAR').subscribe((res: string) => {
        btn_text_cancelar = res;
      });

      Swal.fire({
        icon:'info',
        title: titulo,
        showCancelButton: true,
        confirmButtonColor : 'var(--blue)',
        cancelButtonColor:  'var(--gray)',
        confirmButtonText: btn_text_aceptar,
        cancelButtonText: btn_text_cancelar,
        allowOutsideClick: false
      }).then((result) => {
        if(result.isConfirmed){
          this.dialogRef.close(empresasModificadasAGuardar);
        }
      })
    }else
      this.dialogRef.close(empresasModificadasAGuardar);
  }

  checkAllEmpresas(event, afectaTodosCentros) {
    if (this.dataSourceEmpresa.data){
      if (!afectaTodosCentros)
          this.dataSourceEmpresa.data.forEach(val => { val.checked = event.checked });
      else
          this.dataSourceEmpresa.data.forEach(val => { val.checked = true });
    }
    let centros: Centro[] = [];
    this.actualizarCentrosTabla(centros);
  }

  uncheckCheckAllEmpresas(event) {
    if (!event.checked)
      this.searchForm.controls['selectAllCheckBoxEmpresas'].setValue(0);
  }

  checkAllCentros(event) {
    if (this.dataSourceCentro.data)
      this.dataSourceCentro.data.forEach(val => { val.checked = event.checked });
  }

  uncheckCheckAllCentros(event) {
    if (!event.checked)
      this.searchForm.controls['selectAllCheckBoxCentros'].setValue(0);
  }

  applyFilterEmpresa(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceEmpresa.filter = filterValue.trim().toLowerCase();
    if(this.dataSourceEmpresa.filteredData.length === 1){
        this.actualizarCentrosTabla(this.dataSourceEmpresa.filteredData[0].centros);
        if (this.dataSourceEmpresa.filteredData[0].todosCentros)
        {
            this.excluded = true;
            this.dataSourceEmpresa.filteredData[0].centros.forEach(centroEmpresa => {
                centroEmpresa.excluded=true;
            });
        }
    }else{
        //Se deshabilita los formularios de los centros y setea el dataSourceCentro vacio
        let centros : Centro[] = [];
        this.actualizarCentrosTabla(centros);
    }
  }

  applyFilterCentro(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceCentro.filter = filterValue.trim().toLowerCase();
  }

}
