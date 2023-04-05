import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UtilsService } from './../../services/utils.service';
import { UserService } from 'src/app/services/user.service';
import { Empresa } from 'src/app/Model/Empresa';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatPaginator } from '@angular/material/paginator';
import { FormBuilder, FormControl, FormGroup} from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import * as XLSX from 'xlsx';
import { TranslateService } from '@ngx-translate/core';
import { ChangeDetectorRef } from '@angular/core';
import { SelectProvinciaComponent } from '../components/select-provincia/select-provincia.component';

/*mock data*/
export interface centrosEmpresa {
  checked: any;
  nombre: string;
  empresaCentros: any;
  contactos: any;
  direccion: any;
  provincia: string;
  numTrabajadoresPT: number;
  numTrabajadoresVS: number;
  fechaPrevencion: any;
  fechaVigilancia:any;
}

@Component({
  selector: 'app-centros-trabajo',
  templateUrl: './centros-trabajo.component.html',
  styleUrls: ['./centros-trabajo.component.css']
})
export class CentrosTrabajoComponent implements OnInit {
  cleanImgUrl = '../../assets/img/borrar_filtros.svg';
  searchImgUrl = '../../assets/img/search.svg';
  excelImgUrl = '../../assets/img/excel.svg';
  mailImgUrl = '../../assets/img/mail.svg';
  downloadImgUrl = '../../assets/img/download.svg';

  empresas: Empresa[];
  provincias:any[];
  userForm: FormGroup;
  tableHeaders: string[] = [
    'checklist',
    'empresaCentros',
    'direccion',
    'provincia',
    'numTrabajadoresPT',
    'numTrabajadoresVS',
    'fechaPrevencion',
    'fechaVigilancia',
    'verDetalles'
  ];
  dataSource: any;
  dataSourceAux = new MatTableDataSource<centrosEmpresa>();

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('TABLECENTROSTRABAJO') table: ElementRef;
  @ViewChild(SelectProvinciaComponent) hijoProvincia;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    public  utils: UtilsService,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private cdRef:ChangeDetectorRef
  ) { }

  //Evita que se produzca el ERROR Error: ExpressionChangedAfterItHasBeenCheckedError
  ngAfterViewChecked()
  {
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    this.initForm();
    this.getUserData();

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
          $('.mat-tab-list').css('transform', 'translateX(-28px)');
        });
    }

    //en caso de que sea una pantalla pequeña
    if(screen.width < 1530){
      $(document).ready(function(){
        $('.mat-tab-list').css('transform', 'translateX(-430px)');
      });
    }
  }

  getUserData(): void {
    this.spinner.show();
    this.userService.getUser().subscribe(user => {
      this.empresas = user.empresas;
      this.updateEmpresasYCentros();
      this.getProvincias();

      this.spinner.hide();
      this.getCentroEmpresa();
    });
  }

  initForm() {
    this.userForm = this.formBuilder.group({
      empresaForm: new FormControl(''),
      centroForm: new FormControl(''),
      provinciaForm: new FormControl(''),
      selectAllCheckBox: new FormControl(''),
      selectEmpresasRadioForm: new FormControl('1'),
      selectCentrosRadioForm: new FormControl('1'),
      todosCentrosForm: true
    });
  }

  setDefaultForm(): void {
    this.userForm.controls['selectEmpresasRadioForm'].setValue('1');
    this.userForm.controls['selectCentrosRadioForm'].setValue('1');
    this.userForm.controls['empresaForm'].setValue([]);
    this.userForm.controls['centroForm'].setValue([]);
    this.userForm.controls['provinciaForm'].setValue([]);
  }

  resetForm(): void {
    setTimeout(() => {
      this.setDefaultForm();
      this.updateEmpresasYCentros();
      //Indicamos al componente de provincia y localidad que debe de limpiar el texto de búsqueda
      this.hijoProvincia.setValueInputProvinciaFilter();
    });
  }

  onSubmit(): void {
    this.getCentroEmpresa();
  }

  getProvincias(){
    this.utils.getProvincias({}).subscribe(data => {
      if(data){
        this.provincias = data;
      }else{
        this.spinner.hide();
      }
    });
  }

  updateEmpresasYCentros() {
    if(this.empresas.length==1){
      this.userForm.controls.empresaForm.setValue([this.empresas[0].idEmpresa]);
      this.empresas.forEach(empresa =>{
        if(empresa.centros.length==1){
          this.userForm.controls.centroForm.setValue([empresa.centros[0].idCentro]);
        }
      })
    }
  }

  //Método que devuelve la información del nº de centros de PT o VS, dada una empresa
  conseguirNumCentrosVSPT(empresaABuscar, isPT){
    let resultNumCentros: any[]=[];
    this.empresas.forEach(empresa =>{
        if (empresa.idEmpresa === empresaABuscar.idEmpresa){
          empresa.centros.forEach(centro =>{
              if (centro.activoVS && !isPT){
                resultNumCentros.push(centro);
              }
              if (centro.activoPT && isPT){
                resultNumCentros.push(centro);
              }

          })
        }
    })
    return resultNumCentros.length;
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

  selectAllTwoDimension(formName,formControlName,values,values2,subArrayfieldName,toCompare,fieldName) {
    let result=[];
    values.forEach(item1=>{
      values2.forEach(item2=>{
        if(item1[toCompare] === item2){
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
    }else{
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
  mostrarMasElementos(element){
    let result=false;
    if(element.empresaCentros.length > 1) {
      result = true;
    }

    element.empresaCentros.centros.forEach( centro => {
          if(centro > 1){
            result = true;
          }
    });
    return result;
  }

  toggleElement(element,status){
    if(element.mostrar == false){
      element.mostrar = true;
    }else if (element.mostrar == true){
      element.mostrar = false;
    }else{
      element.mostrar=true;
    }
  }

  getCentroEmpresa() {
    let idEmpresasList: number[] = [];
    let idCentrosList: number[] = [];
    //Método que comprueba si alguno de los fitlros de Empresa y Centro está en 'activo' o en 'inactivo' y va añadiendo empresas/centros a sus respectivas listas
    this.utils.envioDatosConFiltroActivoInactivo (this.userForm.get('selectEmpresasRadioForm').value,
                                        this.userForm.get('selectCentrosRadioForm').value,
                                        this.userForm.get('empresaForm').value,
                                        this.userForm.get('centroForm').value,
                                        this.empresas,
                                        idEmpresasList,
                                        idCentrosList);

    let idsListResult: any[] = [];
        //Se comprueba si el usuario había seleccionado alguna empresa/centro en los campos 'empresaForm' y 'centroForm' para
        //alterar o no los atributos a enviar al BACK
        idsListResult = this.utils.valoraListasFinalesAEnviarConFiltro(this.userForm.get('empresaForm').value,
                                            this.userForm.get('centroForm').value,
                                            this.empresas,
                                            idEmpresasList,
                                            idCentrosList);

    let dataReq = {
      listaIdsEmpresas:idsListResult[0],
      listaIdsCentros:idsListResult[1],
      listaIdsProvincias:this.userForm.get('provinciaForm').value||[]
    };

    this.spinner.show();
    this.userService.getCentroEmpresa(dataReq).subscribe(data => {
      if(data !== undefined && data.length > 0){
      	let result:centrosEmpresa[] = [];
        data.forEach(item => {
          result.push({
            checked: item.checked,
            nombre: item.nombre,
            empresaCentros: item.empresa,
            contactos: {
              contactosExternos: item.contactosExternos,
              contactos: item.contactos,
              actividades: item.actividades
            },
            direccion: {
              calle: item.calle,
              cp: item.cp,
              localidad: item.localidad.nombre,
            },
            provincia: item.localidad.provincia.nombre,
            numTrabajadoresPT: item.numTrabajadoresPT,
            numTrabajadoresVS: item.numTrabajadoresVS,
            fechaPrevencion: item.fechaAltaPrevencion,
            fechaVigilancia: item.fechaAltaVigilancia,
          });
        });

        this.dataSource = new MatTableDataSource<centrosEmpresa>(result);
        this.dataSource.sort = this.sort;
        this.dataSource.sortingDataAccessor = (item, property) => {

          if(property == 'empresaCentros')
            return item.nombre.toLocaleLowerCase();

          if (property == 'numTrabajadoresPT')
            return Number(item[property]);

          if (property == 'numTrabajadoresVS')
            return Number(item[property]);

          if (property == 'fechaPrevencion')
            return new Date(item.fechaPrevencion);

          if (property == 'fechaVigilancia')
            return new Date(item.fechaVigilancia);

          if(property == 'direccion')
            return item[property].localidad.toLocaleLowerCase();

          if(property == 'provincia')
            return item[property].toLocaleLowerCase();

          if (typeof item[property] === 'string')
            return item[property].toLocaleLowerCase();

          return item[property];

        };
        this.dataSource.paginator = this.paginator;
      }else if(data !== undefined && data.length === 0){
        this.utils.mostrarMensajeSwalFireCentrosNoEncontrados();
      }
      this.spinner.hide();
    }),(error=>{
    });

  }

  sumItems(items, prop){
    return items.reduce( function(a, b){
        return a + b[prop];
    }, 0);
  };

  exportAsExcel() {
    this.spinner.show();
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    let JSONWS: XLSX.WorkSheet;
    let dataJS = [];
    let empresa_text = "Empresa";
    let centroTrabajo_text = "Centro de trabajo";
    let fechaAltaVigilanciaSalud_text = "Fecha de alta Vigilancia de la Salud";
    let fechaAlta_text = "Fecha de alta Prevención Técnica";
    let numTrabajadoresVS_text = "Num. Personas trabajadoras Vigilancia de la Salud";
    let numTrabajadoresPT_text = "Num. Personas trabajadoras Prevención Técnica";
    let provincia_text = "Provincia";
    let direccion_text = "Dirección";

    this.translate.get('EMPRESA_CENTRO').subscribe((res: string) => {
      empresa_text = res;
    });
    this.translate.get('FECHA_ALTA_VIGILANCIA_SALUD').subscribe((res: string) => {
      fechaAltaVigilanciaSalud_text = res;
    });
    this.translate.get('FECHA_ALTA_PREV_TEC').subscribe((res: string) => {
      fechaAlta_text = res;
    });
    this.translate.get('NUM_TRABAJADORES_VS').subscribe((res: string) => {
      numTrabajadoresVS_text = res;
    });
    this.translate.get('NUM_TRABAJADORES_PT').subscribe((res: string) => {
      numTrabajadoresPT_text = res;
    });
    this.translate.get('PROVINCIA').subscribe((res: string) => {
      provincia_text = res;
    });
    this.translate.get('DIRECCION').subscribe((res: string) => {
      direccion_text = res;
    });

    let isElementosSelect: boolean = false;

    this.dataSource._orderData(this.dataSource.data).forEach(item => {
      if (item.checked) {
        isElementosSelect = true;
        let new_item = {};
        this.tableHeaders.forEach(tableHeader => {
          //save columns with Selected Order COlumns
          switch (tableHeader) {
            case 'empresaCentros':
              if (item.nombre != undefined) {
                new_item[empresa_text] = item.empresaCentros.nombre + " - " + item.nombre;
              } else {
                new_item[empresa_text] = item.empresaCentros.nombre;
              }
              break;
            case 'direccion':
              new_item[direccion_text] = item.direccion.calle + " " + item.direccion.cp + " " + item.direccion.localidad;
              break;
            case 'provincia':
              new_item[provincia_text] = item.provincia;
              break;
            case 'numTrabajadoresPT':
              new_item[numTrabajadoresPT_text] = item.numTrabajadoresPT;
              break;
            case 'numTrabajadoresVS':
              new_item[numTrabajadoresVS_text] = item.numTrabajadoresVS;
              break;
            case 'fechaPrevencion':
              new_item[fechaAlta_text] = "";
              if (item.fechaPrevencion)
                new_item[fechaAlta_text] = (new Date(item.fechaPrevencion)).toLocaleDateString();
              break;
            case 'fechaVigilancia':
              new_item[fechaAltaVigilanciaSalud_text] = "";
              if (item.fechaVigilancia)
                new_item[fechaAltaVigilanciaSalud_text] = (new Date(item.fechaVigilancia)).toLocaleDateString();
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
      XLSX.writeFile(wb, centroTrabajo_text + '.xlsx');
    }

    this.spinner.hide();
  }

}
