import { UtilsService } from './../../services/utils.service';
import { environment } from '../../../environments/environment';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgModel, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Empresa } from 'src/app/Model/Empresa';
import { UserDto } from 'src/app/Model/UserDto';

import { UserService } from 'src/app/services/user.service';
import * as XLSX from 'xlsx';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { TranslateService } from '@ngx-translate/core';
import {MatSelect} from "@angular/material/select"
import { Globals } from '../globals';
import { ChangeDetectorRef } from '@angular/core';
import { SelectProvinciaComponent } from '../components/select-provincia/select-provincia.component';
import { SelectLocalidadComponent } from '../components/select-localidad/select-localidad.component';

export interface DatosContacto {
  tlfMovil: string;
  tlfFijo: string;
  emailContacto: string;
}
export interface Delegacion {
  tlfDelegacion: string;
  horarios: string;
  ubicacion: string;
  email: string;
  telefono: string;
  nombre: string;
  calle: string;
  cp: string;
  localidad: { nombre: string; };
}

export interface TipoContactoInterface {
  idTipoContacto: number,
  nombre: string;
}
/*mock data*/
export interface ContactoItemInferace {
  empresasCentros: any[];
  //tipoContacto: TipoContactoInterface;
  personaContacto: string;
  datosContacto: DatosContacto;
  delegacion: Delegacion;
}

@Component({
  selector: 'app-contacto',
  templateUrl: './contacto.component.html',
  styleUrls: ['./contacto.component.css']
})
export class ContactoComponent implements OnInit {
  environment = environment;
  cleanImgUrl = '../../assets/img/borrar_filtros.svg';
  searchImgUrl = '../../assets/img/search.svg';
  excelImgUrl = '../../assets/img/excel.svg';
  mailImgUrl = '../../assets/img/mail.svg';
  downloadImgUrl = '../../assets/img/download.svg';

  empresasList: any[];
  productosList: any[];
  provinciasList: any[];
  localidadList: any[];
  tipoContactoList: any[];
  userForm: FormGroup;
  user: string;
  resultado: ContactoItemInferace[];
  userDataDto: UserDto;

  tableHeaders: string[] = ['checklist', 'empresasCentros', 'tipoContacto', 'personaContacto', 'datosContacto', 'delegacion'];

  dataSource: any;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('TABLEFACTURAS') table: ElementRef;
  @ViewChild(SelectProvinciaComponent) hijoProvincia;
  @ViewChild(SelectLocalidadComponent) hijoLocalidad;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService,
    public utilsService: UtilsService,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    public globals: Globals,
    private cdRef:ChangeDetectorRef
  ) { }

  //Evita que se produzca el ERROR Error: ExpressionChangedAfterItHasBeenCheckedError
  ngAfterViewChecked()
  {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    /*inicializacion de formulario*/
    this.initForm();
    this.getUserData();
    this.getTiposcontacto();
    this.getProvincias();
    this.getLocalidades();
    //this.getContactos();

    /*datos de tabla*/
    //////this.dataSource.sort = this.sort;
    //////this.dataSource.paginator = this.paginator;


    //Restore table cols order
    if (localStorage.getItem('tableColsOrder')) {
      let localStorageObj: object;
      localStorageObj = JSON.parse(localStorage.getItem('tableColsOrder'));

      if (localStorageObj[this.constructor.name] &&
        Array.isArray(localStorageObj[this.constructor.name]) &&
        localStorageObj[this.constructor.name].length == this.tableHeaders.length)
        this.tableHeaders = localStorageObj[this.constructor.name];
    }

    //transformNecesario es el item que nos dices si ha llegado a través
    //de la barra de favoritos, si es true entonces hacemos el translateX
    let transform = JSON.parse(localStorage.getItem('transformNecesario'));
    if(transform == true){
        $(document).ready(function(){
          $('.mat-tab-list').css('transform', 'translateX(0px)');
        });
    }

    //en caso de que sea una pantalla pequeña
    if(screen.width < 1530){
      $(document).ready(function(){
        $('.mat-tab-list').css('transform', 'translateX(-430px)');
      });
    }
  }

  ngAfterViewInit() {
    /*fix paginacion*/
    //////this.dataSource.paginator = this.paginator;
  }

  initForm() {
    this.userForm = this.formBuilder.group({
      empresaForm: new FormControl(''),
      centroForm: new FormControl(''),
      nombreForm: new FormControl(''),
      apellidosForm: new FormControl(''),
      tipoContactoForm: new FormControl(''),
      provinciaForm: new FormControl(''),
      localidadForm: new FormControl(''),
      selectAllCheckBox: new FormControl(''),
      selectEmpresasRadioForm: new FormControl('1'),
      selectCentrosRadioForm: new FormControl('1'),
      todosCentrosForm: true
    });
  }

  onSubmit(): void {
    this.getContactos();
  }

  getUserData(): void {
    this.userService.getUser().subscribe(user => {
      this.empresasList = user.empresas;
      this.updateEmpresasYCentros();
      this.getContactos();
    });

  }

  getContactos() {
    let idEmpresasList: number[] = [];
    let idCentrosList: number[] = [];
    //Método que comprueba si alguno de los fitlros de Empresa y Centro está en 'activo' o en 'inactivo' y va añadiendo empresas/centros a sus respectivas listas
    this.utilsService.envioDatosConFiltroActivoInactivo (this.userForm.get('selectEmpresasRadioForm').value,
                                        this.userForm.get('selectCentrosRadioForm').value,
                                        this.userForm.get('empresaForm').value,
                                        this.userForm.get('centroForm').value,
                                        this.empresasList,
                                        idEmpresasList,
                                        idCentrosList);

    let idsListResult: any[] = [];
    //Se comprueba si el usuario había seleccionado alguna empresa/centro en los campos 'empresaForm' y 'centroForm' para
    //alterar o no los atributos a enviar al BACK
    idsListResult = this.utilsService.valoraListasFinalesAEnviarConFiltro(this.userForm.get('empresaForm').value,
                                        this.userForm.get('centroForm').value,
                                        this.empresasList,
                                        idEmpresasList,
                                        idCentrosList);

    let dataReq = {
      listaIdEmpresas: idsListResult[0],
      listaIdCentros: idsListResult[1],
      nombre: this.userForm.get('nombreForm').value,
      apellidos: this.userForm.get('apellidosForm').value,
      listaIdsTiposContacto: this.userForm.get('tipoContactoForm').value || [],
      listaIdsLocalidades: this.userForm.get('localidadForm').value || [],
      listaIdsProvincias: this.userForm.get('provinciaForm').value || []
    };


    this.spinner.show();
    this.userService.getContactos(dataReq).subscribe(data => {
      let result: ContactoItemInferace[];
      result = [];
      if (data !== undefined && data.length > 0){
        data.forEach(item => {
          let aux: ContactoItemInferace;
          //let empresasListDto=this.transformEmpresas(item.empresaContactoDtos);
          aux = {
            delegacion: item.delegacionDto,
            //tipoContacto: item.tipoContactoDto,
            datosContacto: {
              emailContacto: item.email,
              tlfFijo: item.telefono,
              tlfMovil: item.movil
            },
            empresasCentros: item.empresaContactoDtos,
            personaContacto: item.nombre + ' ' + item.apellidos
          }
          result.push(aux);
        })

        this.dataSource = new MatTableDataSource<ContactoItemInferace>(result);
        this.dataSource.sort = this.sort;
        this.dataSource.sortingDataAccessor = (item, property) => {
          if (property == 'tipoContacto'){
            //NOTA IMPORTANTE: El dato se coge de 'empresasCentros' y no de 'tipoContactoDto'.
            //Puede llegarse el caso de que haya varias empresas con distintos tipos de contactos,
            //por tanto, se va a recoger siempre el contacto de la primera empresa en la posicion 0.
            return item['empresasCentros'][0].tipoContactoDto.nombre.toLocaleLowerCase();
          }

          //NOTA IMPORTANTE: El dato se coge de 'empresasCentros'
          //si hay centros y empresas entonces retornamos el nombre de
          //ambos 'empresa - centro', en caso de solo haber empresa
          //retornamos solo el nombre de la misma
          if(property == 'empresasCentros'){
            if(item['empresasCentros'][0].centros != undefined){
              return item['empresasCentros'][0].nombre;
            }else{
              let nombreEmpresa: string = item['empresasCentros'][0].nombre;
              let nombreCentro: string = "";
              let nombreEmpresaCentro= "";
              if(item['empresasCentros'][0].centros != undefined && item['empresasCentros'][0].centros.length > 0){
                nombreCentro= item['empresasCentros'][0].centros[0].nombre;
                nombreEmpresaCentro= nombreEmpresa+" - "+nombreCentro;
              }else{
                nombreEmpresaCentro= nombreEmpresa;
              }
              return nombreEmpresaCentro.toLocaleLowerCase();
            }
          }

          if (typeof item[property] === 'string')
            return item[property].toLocaleLowerCase();
        };
        this.dataSource.paginator = this.paginator;
      }else{
        this.utilsService.mostrarMensajeSwalFirePersonasContactoNoEncontradas();
      }
      this.spinner.hide();
    }), (error => {
    });
  }

  getTiposcontacto() {
    this.userService.getTiposContacto().subscribe(data => {
      if(data){
        this.tipoContactoList = data;
      }else{
        this.spinner.hide();
      }
    })
  }

  getTiposDelegaciones() {
    this.userService.getTiposDelegaciones().subscribe(data => {

    })
  }

  getProvincias() {
    this.utilsService.getProvincias({}).subscribe(data => {
      if(data){
        this.provinciasList = data;
      }else{
        this.spinner.hide();
      }
    })
  }

  getLocalidades() {
    this.localidadList = [];
    this.userForm.controls['localidadForm'].setValue('');
    /*mapeo de objeto JSON a enviar*/
    let maxProvinciasSelected = this.globals.maxProvinciasSelected;
    let dataReq = {
      listaIdsProvincia: this.userForm.value.provinciaForm || []
    };
    if (dataReq.listaIdsProvincia.length>0 && dataReq.listaIdsProvincia.length<maxProvinciasSelected+1)
    {
      this.utilsService.getLocalidades(dataReq).subscribe(data => {
        if(data){
          this.localidadList = data;
        }else{
          this.spinner.hide();
        }
      });
    }else if (dataReq.listaIdsProvincia.length==0 || dataReq.listaIdsProvincia.length>maxProvinciasSelected)
    {
      this.localidadList = [];
      if (dataReq.listaIdsProvincia.length>maxProvinciasSelected)
      {
              let titulo = "Seleccione un máximo de "+maxProvinciasSelected+" provincias para filtrar por Localidad";
              this.translate.get('ALERT_PROVINCIAS').subscribe((res: string) => {
                  titulo = res;
              });
              this.utilsService.mostrarMensajeSwalFire('warning', titulo, '','var(--blue)', false);
      }
    }
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

  resetForm(): void {
    setTimeout(() => {
      this.userForm.controls['selectEmpresasRadioForm'].setValue('1');
      this.userForm.controls['selectCentrosRadioForm'].setValue('1');
      this.userForm.controls['centroForm'].setValue('');
      this.userForm.controls['empresaForm'].setValue('');
      this.userForm.controls['tipoContactoForm'].setValue('');

      this.userForm.controls['provinciaForm'].setValue('');
      this.localidadList = [];
      this.userForm.controls['localidadForm'].setValue('');
      this.updateEmpresasYCentros();
      //Indicamos al componente de provincia y localidad que debe de limpiar el texto de búsqueda
      this.hijoProvincia.setValueInputProvinciaFilter();
      this.hijoLocalidad.setValueInputLocalidadFilter();
    });
  }


  selectAll(formName, formControlName, values, fieldName) {
    /*si viene 1 elemento en los controls es que estamos marcando el selectAll...
    si hay mas de uno deseleccionamos*/
    if (this[formName].controls[formControlName].value.length != 1 || (this[formName].controls[formControlName].value[0] && this[formName].controls[formControlName].value[0] != '0' )) {
      this[formName].controls[formControlName].setValue([]);
    } else {
      this[formName].controls[formControlName]
        .patchValue(["0",...values.map(item => item[fieldName])]);
    }
    //En caso de que este haciendo el selectAll de Provincias debe actualizar localidades
    if (formControlName=='provinciaForm'){
      this.getLocalidades();
    }

  }

  /*selectAllTwoDimension('userForm','centroForm',empresasList,userForm.value.empresaForm,'idEmpresa','idCentro')*/
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

  /*Sort Data*/
  mostrarMasElementos(element) {
    let result = false;
    if (element.empresasCentros.length > 1) {
      result = true;
    }

    element.empresasCentros.forEach(empresa => {
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

    let contacto_text = "Contacto";
    this.translate.get('CONTACTO').subscribe((res: string) => {
      contacto_text = res;
    });

    let empresaCentro_text = "Empresa - Centro";
    let tipoContacto_text = "Tipo contacto";
    let personaContacto_text = "Persona contacto";
    let datosContacto_text = "Datos de contacto";
    let telefonoFijo_text = "Telefono fijo";
    let movil_text = "Movil";

    let delegacion_text = "Delegación";
    let telefonoDelegacion_text = "Telefono delegación";
    let emailDelegacion_text = "Email delegación";
    let calleDelegacion_text = "Calle delegación";
    let localidadDelegacion_text = "Localidad delegación";

    this.translate.get('DELEGACION').subscribe((res: string) => {
      delegacion_text = res;
    });
    this.translate.get('TELEFONO_DELEGACION').subscribe((res: string) => {
      telefonoDelegacion_text = res;
    });
    this.translate.get('EMAIL_DELEGACION').subscribe((res: string) => {
      emailDelegacion_text = res;
    });
    this.translate.get('CALLE_DELEGACION').subscribe((res: string) => {
      calleDelegacion_text = res;
    });
    this.translate.get('LOCALIDAD_DELEGACION').subscribe((res: string) => {
      localidadDelegacion_text = res;
    });
    this.translate.get('EMPRESA_CENTRO').subscribe((res: string) => {
      empresaCentro_text = res;
    });
    this.translate.get('TIPO_CONTACTO').subscribe((res: string) => {
      tipoContacto_text = res;
    });
    this.translate.get('PERSONA_CONTACTO').subscribe((res: string) => {
      personaContacto_text = res;
    });
    this.translate.get('DATOS_CONTACTO').subscribe((res: string) => {
      datosContacto_text = res;
    });
    this.translate.get('TELEFONO_FIJO').subscribe((res: string) => {
      telefonoFijo_text = res;
    });
    this.translate.get('MOVIL').subscribe((res: string) => {
      movil_text = res;
    });

    let isElementosSelect: boolean = false;

    this.dataSource._orderData(this.dataSource.data).forEach(item => {
      if (item.checked) {
        isElementosSelect = true;
        let new_item = {};
        let temp_tipoContactos: string[] = [];
        this.tableHeaders.forEach(tableHeader => {
          switch (tableHeader) {
            case 'empresasCentros':
              if (item['empresasCentros'] && Array.isArray(item['empresasCentros'])) {
                let temp_empresas: string[] = [];

                item['empresasCentros'].forEach(empresa => {
                  if (empresa.centros != undefined) {
                    empresa.centros?.forEach(centro => {
                      temp_empresas.push(empresa.nombre + " - " + centro.nombre);
                    });
                    temp_tipoContactos.push(empresa.tipoContactoDto.nombre);
                  } else {
                    temp_empresas.push(empresa.nombre);
                    temp_tipoContactos.push(empresa.tipoContactoDto.nombre);
                  }
                });
                new_item[empresaCentro_text] = temp_empresas.join(', ');
              }
              break;
            case 'tipoContacto':
              //new_item[tipoContacto_text] = item['tipoContacto'].nombre;
              new_item[tipoContacto_text] = temp_tipoContactos.join(', ');
              break;
            case 'personaContacto':
              new_item[personaContacto_text] = item['personaContacto'];
              break;
            case 'datosContacto':
              new_item[datosContacto_text] = item['datosContacto'].emailContacto;
              new_item[telefonoFijo_text] = item['datosContacto'].tlfFijo;
              new_item[movil_text] = item['datosContacto'].tlfMovil;
              break;
            case 'delegacion':
              new_item[delegacion_text] = item['delegacion'].nombre;
              new_item[telefonoDelegacion_text] = item['delegacion'].telefono;
              new_item[emailDelegacion_text] = item['delegacion'].email;
              new_item[calleDelegacion_text] = item['delegacion'].calle;
              new_item[localidadDelegacion_text] = item['delegacion'].cp + ' - ' + item['delegacion'].localidad?.nombre;
              break;
          }
        })

        dataJS.push(new_item);
      }

    });

    if (isElementosSelect == false) {
      let titulo = "Debe seleccionar al menos un elemento a exportar";
      this.translate.get('ERROR_SELECCIONA_EXPORTAR').subscribe((res: string) => {
        titulo = res;
      });
      this.utilsService.mostrarMensajeSwalFire('error', titulo, '', 'var(--blue)', false);
    } else {
      let result = XLSX.utils.sheet_add_json(JSONWS, dataJS);

      XLSX.utils.book_append_sheet(wb, result, 'Sheet1');

      /* save to file */
      XLSX.writeFile(wb, contacto_text + '.xlsx');
    }
    this.spinner.hide();
  }

}
