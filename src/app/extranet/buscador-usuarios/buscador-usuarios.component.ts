import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../environments/environment';
import { FormBuilder, FormControl, FormGroup, NgModel, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Rol } from 'src/app/Model/Rol';
import { User } from 'src/app/Model/User';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { CustomExporter } from './custom-exporter';
import { MatTableExporterDirective } from 'mat-table-exporter';
import { HistoricoAccionesGdprUsuarioComponent } from 'src/app/modales/historicoAccionesGdprUsuario/historicoAccionesGdprUsuario.component';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import * as _moment from 'moment';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {MY_FORMATS} from '../../../config/config';
import { TranslateService } from '@ngx-translate/core';
import { UtilsService } from 'src/app/services/utils.service';
import {MatSelect} from "@angular/material/select"
import {MatOption} from "@angular/material/core"
import { ChangeDetectorRef } from '@angular/core';
import { Globals } from '../globals';

const moment =  _moment;

/*mock data*/
export interface BuscadorUsuarioInterface {
  gdpr: any;
  email: string;
  nombre: string;
  apellidos: string;
  centro: string;
  rol: string;
  fechaCreacion: string;
  fechaBaja: string;
  activo: boolean;
}

@Component({
  selector: 'app-buscador-usuarios',
  templateUrl: './buscador-usuarios.component.html',
  styleUrls: ['./buscador-usuarios.component.css'],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})
export class BuscadorUsuariosComponent implements OnInit {
  environment = environment;
  //tableHeaders: string[] = ['gdprHistorico', 'email', 'nombre', 'apellidos', 'centro', 'rol', 'activo', 'fechaBaja', 'buttons'];
  tableHeaders: string[] = ['checklist','gdprHistorico', 'email', 'nombre', 'apellidos', 'activo', 'fechaBaja', 'buttons'];
  dataSource: any;
  //dataSource: MatTableDataSource<BuscadorUsuarioInterface>;

  cleanImgUrl = '../../assets/img/borrar_filtros.svg';
  searchImgUrl = '../../assets/img/search.svg';
  excelImgUrl = '../../assets/img/excel.svg';
  mailImgUrl = '../../assets/img/mail.svg';
  downloadImgUrl = '../../assets/img/download.svg';

  empresasList: any[];
  mapaEmpresa = new Map();
  centroList: any[] = [];
  mapaCentro = new Map();
  rolesList: Rol[];
  userList: User[];
  idEmpresasUserList = [];
  empresasSelectedAll: Boolean = false;
  centrosSelectedAll: Boolean = false;

  //Tenemos que crear un DTO de empresa, con los centros correspondientes en su interior
  empresasDto: any[] = [];

  userForm: FormGroup;
  user: string;
  userDataLogged: any;

  mostrarModificacion: boolean;
  userSelected: any;
  mostrarTabla: boolean;
  today = new Date().getDate();
  mostrarEsteElemento: boolean;

  customExporter: CustomExporter;
  matTableExperterDirective: MatTableExporterDirective;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('TABLE') table: ElementRef;
  @ViewChild('TABLE') exportTableDirective: ElementRef;
  @ViewChild('selectEmpresas') selectEmpresas: MatSelect;
  @ViewChild('selectCentros') selectCentros: MatSelect;
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
  //validators
  validNameSurname = this.globals.workerPattern;

  //Evita que se produzca el ERROR Error: ExpressionChangedAfterItHasBeenCheckedError
  ngAfterViewChecked()
  {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.spinner.show();
    this.mostrarModificacion = false;
    this.mostrarTabla = false;

    /*inicializacion de formulario*/
    this.userForm = this.formBuilder.group({
      empresaForm: new FormControl(''),
      empresaFilter: new FormControl(''),
      centroForm: new FormControl(''),
      centrosFilter: new FormControl(''),
      mailUsuarioForm: new FormControl(''),
      activoForm: new FormControl(1),
      accesoForm: new FormControl(''),
      nombreForm: new FormControl(''),
      selectAllCheckBox: new FormControl(''),
      apellidosForm: new FormControl(''),
      selectEmpresasRadioForm: new FormControl('1'),
      selectCentrosRadioForm: new FormControl('1')
    });

    //Restore table cols order
    if (localStorage.getItem('tableColsOrder')) {
      let localStorageObj: object;
      localStorageObj = JSON.parse(localStorage.getItem('tableColsOrder'));

      if (localStorageObj[this.constructor.name] &&
        Array.isArray(localStorageObj[this.constructor.name]) &&
        localStorageObj[this.constructor.name].length == this.tableHeaders.length)
        this.tableHeaders = localStorageObj[this.constructor.name];
    }
    this.getUserData();
    //transformNecesario es el item que nos dices si ha llegado a través
    //de la barra de favoritos, si es true entonces hacemos el translateX
    let transform = JSON.parse(localStorage.getItem('transformNecesario'));
    if(transform == true){
        $(document).ready(function(){
          $('.mat-tab-list').css('transform', 'translateX(-28px)');
        });
    }

    //en caso de que sea una pantalla pequeña
    if(screen.width < 1530){
      $(document).ready(function(){
        $('.mat-tab-list').css('transform', 'translateX(-450px)');
      });
    }

  }

  ngAfterViewInit() {
    this.customExporter = new CustomExporter(); // YOU CAN BENEFIT FROM DI TOO.
  }

  onSubmit(): void {
    this.getUsers()
  }

  resetForm(): void {
    setTimeout(() => {
      this.setDefaultForm();
    });
  }

  setDefaultForm(): void {
    this.userForm.controls['empresaForm'].setValue('');
    this.userForm.controls['empresaFilter'].setValue('');
    this.userForm.controls['centroForm'].setValue('');
    this.userForm.controls['centrosFilter'].setValue('');
    this.userForm.controls['mailUsuarioForm'].setValue('');
    this.userForm.controls['activoForm'].setValue(1);
    this.userForm.controls['accesoForm'].setValue('');
    this.userForm.controls['nombreForm'].setValue('');
    this.userForm.controls['apellidosForm'].setValue('');
    this.userForm.controls['selectEmpresasRadioForm'].setValue('1');
    this.userForm.controls['selectCentrosRadioForm'].setValue('1');

  }

  getUserData(): void {
    this.spinner.show();
    this.userService.getUser().subscribe(user => {
      this.rolesList = user.permisosRoles;
      this.userDataLogged = user;
      this.empresasList = user.empresas;
      this.empresasList.forEach(empresa => {
        this.mapaEmpresa.set(empresa.idEmpresa, empresa); //Rellenamos las empresas en su mapa correspondiente
        empresa.centros.forEach(centro => {
          this.centroList.push(centro);
          this.mapaCentro.set(centro.idCentro, centro); //Rellenamos las empresas en su mapa correspondiente
        });
      })
      this.updateEmpresasYCentros();
      /*primera carga*/
      //this.getUsers();
      this.spinner.hide();
    });
  }

  getUsers() {
    this.spinner.show();
    this.empresasDto = [];//Inicializamos el dto para que las próximas llamadas al getUsers tenga el array vacío
    let idEmpresasList: number[] = [];
    let idCentrosList: number[] = [];
    //Método que comprueba si alguno de los fitlros de Empresa y Centro está en 'activo' o en 'inactivo' y va añadiendo empresas/centros a sus respectivas listas

    this.utils.envioDatosConFiltroActivoInactivo (this.userForm.get('selectEmpresasRadioForm').value,
                                        this.userForm.get('selectCentrosRadioForm').value,
                                        this.userForm.get('empresaForm').value,
                                        this.userForm.get('centroForm').value,
                                        this.empresasList,
                                        idEmpresasList,
                                        idCentrosList);

    let idsListResult: any[] = [];
    //Se comprueba si el usuario había seleccionado alguna empresa/centro en los campos 'empresaForm' y 'centroForm' para
    //alterar o no los atributos a enviar al BACK
    idsListResult = this.utils.valoraListasFinalesAEnviarConFiltro(this.userForm.get('empresaForm').value,
                                        this.userForm.get('centroForm').value,
                                        this.empresasList,
                                        idEmpresasList,
                                        idCentrosList);

    //Se utilizará la lista de empresas 'idsListResult[0]' y la lista de Centros 'idsListResult[1]'
    //Nos recorremos las empresas selecionadas para sacar la empresaDto
    idsListResult[0].forEach(idEmpresa => {
        let empresaMapaDto = this.mapaEmpresa.get(idEmpresa);

        //Se realiza una copia profunda del objeto 'empresa' para que cuando se modifique los centros de esta no se modifique el objeto del mapa y a su vez la lista 'empresasList'
        let empresaDto = JSON.parse(JSON.stringify(empresaMapaDto));

        let centrosDto: any[] = [];
        //Se verifica ahora, que los centros que tiene empresaDto, se encuentre en los centros seleccionados idsListResult[1]
        empresaDto.centros.forEach(centro => {
            //Si se encuentra en los centros seleccionados, el centro, se incluye en la lista
            if (idsListResult[1].find(id => id == centro.idCentro)){
              centrosDto.push(centro);
            }
        });

        //Seteamos los centros seleccionados de la empresa
        empresaDto.centros = centrosDto;
        this.empresasDto.push(empresaDto);
    });

    let dataReq = {
      empresasDtos: this.empresasDto,
      user: this.userForm.get('mailUsuarioForm').value,
      activo: this.userForm.get('activoForm').value,
      idRoles: this.userForm.get('accesoForm').value || [],
      nombre: this.userForm.get('nombreForm').value,
      apellidos: this.userForm.get('apellidosForm').value,
    }

    this.userService.getUsers(dataReq).subscribe((results: BuscadorUsuarioInterface[]) => {
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

  updateEmpresasYCentros() {
    if (this.empresasList.length == 1) {
      this.userForm.controls.empresaForm.setValue([this.empresasList[0].idEmpresa]);
      this.empresasList.forEach(empresa => {
        if (empresa.centros.length == 1) {
          this.userForm.controls.centroForm.setValue([empresa.centros[0].idCentro]);
        }
      })
    }
  }

  getEmpresasUser() {
    this.userService.getEmpresasUser().subscribe(data => {
      if(data){
        this.empresasList = data;
        if (environment.debug) console.log("Succes");
      }else{
        this.spinner.hide();
      }
    }), (error => {
      if (environment.debug) console.log("Error");
    })
  }

  getRoles() {
    this.rolesList = this.userDataLogged.permisosRoles;
    /*this.userService.getRoles().subscribe(data => {
      this.rolesList = data;
      if (environment.debug) console.log("Succes");
    }), (error => {
      if (environment.debug) console.log("Error");
    })*/
  }

  modificarUsuario(userSelected) {

    this.userSelected = userSelected;
    this.mostrarModificacion = true;

    //NOTA IMPORTANTE: No hace falta obtener la información de nuevo, ya se encuentra toda la información en el elemento seleccionado 'userSelected', se comenta lo siguiente
    /*
    //Al pinchar para modificar el usuario, obtenemos la información completa de ese usuario para trasladarla al componente de modificar
    this.spinner.show();
    let dataReq = {
      empresasDtos: this.empresasDto,
      user: userSelected.email,
    }

    this.empresasDto = [];//Inicializamos el dto para que las próximas llamadas al getUsers tenga el array vacío

    this.userService.getUsers(dataReq).subscribe((results: BuscadorUsuarioInterface[]) => {
      if(results){
      	this.userSelected = results[0]; //Siempre va a devolver un único registro, al buscar información por el usuario 'userSelected.email'
        this.mostrarModificacion = true;
      }
      this.spinner.hide();
    }), (error => {
          this.spinner.hide();
          if (environment.debug) console.log("Error");
    })*/
  }

  deleteUser(userSelected) {
    let rolesSelectedResult = [];
    userSelected.roles.forEach(rolSelected => {
      rolesSelectedResult.push(rolSelected.idRol);
    });
    let data = {
      user: userSelected.email,
      userId: userSelected.idUsuario,
      idRoles: rolesSelectedResult
    };

    let title_text = "Se va a proceder a la eliminación del usuario:";
    let title_verificacion = "¿Desea continuar?";
    let btn_text = "Si";
    let btn_text_cancelar = "No";
    let response_success = "Usuario eliminado con exito";
    let response_error = "Se ha producido un error";

    this.translate.get('BAJA_USUARIO').subscribe((res: string) => {
      title_text = res;
    });
    this.translate.get('BAJA_USUARIO_VERIFICACION').subscribe((res: string) => {
      title_verificacion = res;
    });
    this.translate.get('SI').subscribe((res: string) => {
      btn_text = res;
    });
    this.translate.get('NO').subscribe((res: string) => {
      btn_text_cancelar = res;
    });
    this.translate.get('BAJA_USUARIO_SUCCESS').subscribe((res: string) => {
      response_success = res;
    });
    this.translate.get('ERROR').subscribe((res: string) => {
      response_error = res;
    });

    Swal.fire({
      titleText: title_text +' '+ data.user,
      text: title_verificacion,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--blue)',
      confirmButtonText: btn_text,
      cancelButtonText: btn_text_cancelar,
      allowOutsideClick: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(data).subscribe(data => {
          if (data) {
            Swal.fire({
              icon: 'success',
              title: response_success,
              confirmButtonColor: 'var(--blue)',
              allowOutsideClick: false
            }).then((result) => {
              //Si ha ido todo correcto al eliminar el usuario, lo que tendría que realizar es volver a cargar los datos de la tabla, no un reload.
              if (result.isConfirmed) {
                //NOTA IMPORTANTE: Tampoco vamos a realizar un getUsers(), ya que como el administrador tenga que eliminar varios usuarios, en cada eliminación
                // getUser tardará tiempo en cada recarga. Por tanto, eliminamos el registro del dataSource
                this.eliminacionUsuarioListaFiltrada(userSelected);
                //this.getUsers();
                //location.reload();
              }
            })
          } else {
            this.spinner.hide();
             if (data?.message != null) {
               response_error = data.message;
               Swal.fire({
                 icon: 'error',
                 title: response_error,
                 confirmButtonColor: 'var(--blue)',
                 allowOutsideClick: false
               }).then((result) => {
                   //Si hubo un error al eliminar el usuario, que no realice el reload, no tiene sentido
                   if (result.isConfirmed) {
                     //location.reload();
                   }
               })
             }
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

  /**
   * Método que elimina el usuario de la lista de la tabla obtenida con el filtro.
   * Se llamará a este método ya sea por eliminación del usuario como por modificación,
   * esta última, por modificación de la fecha de baja(si el valor activo corresponde
   * al activo buscado en filtro, no será llamado a este método).
   * @param  {string}
   * @return  {boolean}
   */
  eliminacionUsuarioListaFiltrada(userSelected){
    let indice = -1;
    this.dataSource.filteredData.forEach(usuario => {
      //Si se encuentra el usuario, se guarda el indice en el que se encuentra en el array
      if(usuario.email === userSelected.email)
        indice = this.dataSource.filteredData.indexOf(usuario);
    });
    if (indice !== -1){
      this.dataSource.filteredData.splice(indice, 1);//Se elimina a ese usuario eliminado
      this.dataSource = new MatTableDataSource(this.dataSource.filteredData);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  altaUser() {
    this.router.navigate([this.globals.extranetBarra + this.globals.altaUsuario]);
  }

  selectAll(formName, formControlName, values, fieldName) {
    /*si viene 1 elemento en los controls es que estamos marcando el selectAll...
    si hay mas de uno deseleccionamos*/
    if (this[formName].controls[formControlName].value.length != 1) {
      this[formName].controls[formControlName].setValue([]);
    } else {
      let result = [];
      values.forEach(item => {
        result.push(item[fieldName]);
      })
      this[formName].controls[formControlName].setValue(result);
    }
  }

   toggleAllSelection(operator, control) {
    if(!this[operator]) {
      this[control].options.forEach( (item : MatOption) => item.select());
    } else {
      this[control].options.forEach( (item : MatOption) => item.deselect());
    }
    this[operator] =! this[operator];
  }

  usuarioModFlow(userSelected) {
    this.mostrarModificacion = !this.mostrarModificacion; //Se oculta la pantalla de modificar
    //this.getUsers();  //Se comenta ya que se ha implementado pasar la información desde la pantalla a modificar-usuario y así evitar realizar el getUsers()

    //Se verifica el usuario para ver si es activo o no correspondiente con la búsqueda del listado actual
    let valorActivoFiltro:number = this.userForm.get('activoForm').value
    let valorActivoUsuarioModificado: boolean = userSelected.activo;
    let eliminarUsuarioModificadoListaFiltrada: boolean = false;
    if (valorActivoUsuarioModificado){
      //Se comprueba como se realizó la búsqueda prevía a la modificación, si se ha realizado con 0 (Activos e Inactivos) o 1 (Activos), se mantiene al usuario en la lista
      if(valorActivoFiltro === 2){
        //Se ha realizado la búsqueda para usuarios inactivos, por tanto se elimina el usuario de la lista de la tabla
        eliminarUsuarioModificadoListaFiltrada = true;
      }
    }else{
      //Si el usuario modificado no es activo y la búsqueda prevía a la modificación se realizó para activos, se elimina el usuario de la lista de la tabla
      if(valorActivoFiltro === 1){
        eliminarUsuarioModificadoListaFiltrada = true;
      }
    }

    if(eliminarUsuarioModificadoListaFiltrada){
      this.eliminacionUsuarioListaFiltrada(userSelected);
    }

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
  /*Sort Data*/
  mostrarMasElementos(element) {
    let result = false;
    if (element.empresas.length > 1) {
      result = true;
    }

    element.empresas.forEach(empresa => {
      if (empresa.centros.length > 1) {
        result = true;
      }
    });

    return result;
  }

  exportAsExcel() {
    this.spinner.show();
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    let JSONWS: XLSX.WorkSheet;
    let dataJS = [];

    let usuario_text = "Usuario";
    let nombre_text = "Nombre";
    let apellidos_text = "Apellidos";
    let empresa_text = "Empresa";
    let centroTrabajo_text = "Centro de trabajo";
    let rolesUsuario_text = "Roles Usuario";
    let activo_text = "Activo";
    let fechaBaja_text = "Fecha baja";
    let buscadorUsuarios_text = "Buscador Usuarios";

    this.translate.get('USUARIO').subscribe((res: string) => {
      usuario_text = res;
    });
    this.translate.get('NOMBRE').subscribe((res: string) => {
      nombre_text = res;
    });
    this.translate.get('APELLIDOS').subscribe((res: string) => {
      apellidos_text = res;
    });
    this.translate.get('EMPRESA_CENTRO').subscribe((res: string) => {
      empresa_text = res;
    });
    this.translate.get('ROLES_USUARIO').subscribe((res: string) => {
      rolesUsuario_text = res;
    });
    this.translate.get('ACTIVO').subscribe((res: string) => {
      activo_text = res;
    });
    this.translate.get('FECHA_BAJA').subscribe((res: string) => {
      fechaBaja_text = res;
    });
    this.translate.get('BUSCADOR_USUARIOS').subscribe((res: string) => {
      buscadorUsuarios_text = res;
    });

    let isElementosSelect: boolean = false;

    this.dataSource.data.forEach(item => {
      if (item.checked) {
        isElementosSelect = true;
        let new_item = {};
        this.tableHeaders.forEach(tableHeader => {

          switch (tableHeader) {
            case 'email':
              new_item[usuario_text] = item['email'];
              break;

            case 'nombre':
              new_item[nombre_text] = item['nombre'];
              break;

            case 'apellidos':
              new_item[apellidos_text] = item['apellidos'];
              break;

            case 'centro':
              if (item['empresas'] && Array.isArray(item['empresas'])) {
                let temp_empresas: string[] = [];

                item['empresas'].forEach(empresa => {
                  empresa.centros.forEach(centro => {
                    if (centro != undefined) {
                      temp_empresas.push(empresa.nombre + " - " + centro.nombre);
                    } else {
                      temp_empresas.push(empresa.nombre);
                    }
                  });

                });
                new_item[empresa_text] = temp_empresas.join(', ');
              }
              break;

            case 'rol':
              new_item[rolesUsuario_text] = "";
              if (item['roles']) {
                new_item[rolesUsuario_text] = item['roles'].map(function (role) {
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

    if (isElementosSelect == false) {
      let titulo = "Debe seleccionar al menos un elemento a exportar";
      this.translate.get('ERROR_SELECCIONA_EXPORTAR').subscribe((res: string) => {
        titulo = res;
      });
      this.utils.mostrarMensajeSwalFire('error', titulo, '', 'var(--blue)', false);
    } else {
      let result = XLSX.utils.sheet_add_json(JSONWS, dataJS);

      XLSX.utils.book_append_sheet(wb, result, 'Sheet1');

      /* save to file */
      XLSX.writeFile(wb, buscadorUsuarios_text + '.xlsx');
    }

    //this.dataSource.paginator._changePageSize(paginacion);

    this.spinner.hide();

  }
  verHistoricoUsuario(element) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      element: element
    };
    dialogConfig.width = "70%";
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;

    const dialogRef = this.dialog.open(HistoricoAccionesGdprUsuarioComponent, dialogConfig);
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
