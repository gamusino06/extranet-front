import { Component, ViewChild, Input, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatSelect } from "@angular/material/select";
import { MatOption } from "@angular/material/core";
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { Globals } from '../../globals';
import { Empresa } from 'src/app/Model/Empresa';
import { NgxSpinnerService } from 'ngx-spinner';
import { TranslateService } from '@ngx-translate/core';
import { UtilsService } from 'src/app/services/utils.service';
import { SeleccionEmpresasCentrosComponent } from 'src/app/modales/seleccionEmpresasCentros/seleccionEmpresasCentros.component';

@Component({
  selector: 'app-select-empresa-filter',
  templateUrl: './select-empresa-filter.component.html',
  styleUrls: ['./select-empresa-filter.component.css']

})

export class SelectEmpresaFilterComponent {
  empresasSelectedAll: Boolean = false;
  @Input() selectedRadio: Number = 1;
  //numbers: any[];

  @Input() userForm: FormGroup;
  @Input() empresasList: Empresa[];
  @Input() mapaEmpresa = new Map();

  @Input() radioButtonsActivos: any;
  @Input() infoCentros: any;
  @Input() required: any;
  @Input() multiple: Boolean = true;
  @ViewChild('selectEmpresas') selectEmpresas: MatSelect;

  public empresaFilter: FormControl = new FormControl();
  /** list of empresas filtered by search keyword */
  public filteredEmpresasMulti: ReplaySubject<Empresa[]> = new ReplaySubject<Empresa[]>(1);
  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();

  constructor(public dialog: MatDialog,
              private globals: Globals,
              public utils: UtilsService,
              public translate: TranslateService,
              private spinner: NgxSpinnerService) {

    //this.numbers = Array(10000).fill(0,1,10000);
  }

  ngOnInit(){
    //console.log("¡ERROR CONTROLADO! (Cannot read property 'slice' of undefined) - No se controla que no salga en consola porque es necesario que se cargue el componente.")
    if (this.empresasList !== undefined)
      this.filteredEmpresasMulti.next(this.empresasList.slice());

    // listen for search field value changes
    this.empresaFilter.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterEmpresasMulti();
      });
  }

  protected filterEmpresasMulti() {
    //NOTA IMPORTANTE: Para el caso de la pantalla de Información de puestos de Personas Trabajadoras, cuando se vuelva a seleccionar una empresa, se setea el formulario de centros
    if (this.required && !this.multiple)
      this.userForm.controls['centroForm'].setValue('');

    if (!this.empresasList) {
      return;
    }
    // get the search keyword
    let search = this.empresaFilter.value;
    if (!search) {
      this.filteredEmpresasMulti.next(this.empresasList.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the empresas
    this.filteredEmpresasMulti.next(
      this.empresasList.filter(empresa => empresa?.nombre?.toLowerCase().indexOf(search) > -1)
    );
  }

  ngOnChanges() {
    if (this.empresasList!==undefined){
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

      this.empresasList.forEach (empresa => {
        if (!empresa.todosCentros){
          if (this.userForm.controls.todosCentrosForm != undefined){
            this.userForm.controls.todosCentrosForm.setValue(false);
          }
        }
        //Comprobamos si la empresa tiene PT y VS
        this.utils.actualizacionAtributosSegunAreaisPTisVS(empresa, isPT, isVS);
        this.mapaEmpresa.set(empresa.idEmpresa, empresa);
      });
    }
  }

  toggleSelectAll(selectAllValue: boolean) {
    if (selectAllValue)
      this.selectEmpresas.options.forEach( (item : MatOption) => item.select());
    else
      this.selectEmpresas.options.forEach((item: MatOption) => item.deselect());

    this.selectEmpresas.options.toArray()[0].deselect;
  }

  vaciarFilter() {
    this.selectEmpresas.options.forEach((item: MatOption) => item.deselect());

    this.selectEmpresas.options.toArray()[0].deselect;
  }


  openModalSelectEmpresaCentro(){
    const dialogConfig = new MatDialogConfig();
    //Se envía las empresas seleccionadas
    dialogConfig.data = {
        empresas: this.empresasSeleccionadas(),
        radioButtonsActivos:true
    };
    //dialogConfig.width = "70%";
    dialogConfig.height ="90%";
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;
    const dialogRef = this.dialog.open(SeleccionEmpresasCentrosComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(empresas => {
        //Se nos devuelve las empresas relacionadas y modificadas con sus centros y
        //se actualiza con la lista 'empresasList' ya existente
        if (empresas !== undefined){
            this.spinner.show();

            //En caso de que vuelva a entrar a la modal, teniendo desactivado 'todosCentrosForm' en alta-usuario
            //Se setea a true y en caso de que alguna empresa no esté chequeada al recorrelas, se pondrá a false
            this.userForm.controls.todosCentrosForm.setValue(true);
            empresas.forEach(empresaActualizada => {
                this.mapaEmpresa.set(empresaActualizada.idEmpresa, empresaActualizada);

                //Si alguna empresa no está chequeada, entonces seteamos el formulario todosCentrosForm
                if (!empresaActualizada.checked)
                  this.userForm.controls.todosCentrosForm.setValue(false);
            });

            //Inicializamos la lista a vacio y se recorre el mapa para poder a rellenar la lista
            //con las empresas actualizadas
            this.empresasList = [];
            for (var [key, empresa] of this.mapaEmpresa) {
              this.empresasList.push(empresa);
            }
            this.spinner.hide();
        }
    });
  }

  //Metodo que devuelve las empresas seleccionadas antes de enviarlas a la modales
  //para modificar los centros
  empresasSeleccionadas(){
    let empresasSeleccionadas: Empresa[] = [];

    this.selectEmpresas.options.forEach( (item : MatOption) => {
        if(item.value !== "0"){ //Obviamos el CheckAll
          if (item.selected){ //Si está seleccionada la empresa se guarda
            let empresa = this.mapaEmpresa.get(item.value);
            empresasSeleccionadas.push(empresa);
          }
        }
    });
    return empresasSeleccionadas;
  }

  /**
   * Metodo para obtener el nombre de la empresa seleccionada
   */
  empresaSeleccionada(){
    let empresaSeleccionada: String = '';
    let itemSel: MatOption;
    if(this.selectEmpresas != undefined){
      this.selectEmpresas.options.forEach( (item : MatOption) => {
        if(item.selected)
          itemSel = item;
      });
      if(itemSel != undefined){
        for(let empresa of this.empresasList){
          if(empresa.idEmpresa == itemSel.value){
            empresaSeleccionada = empresa.nombre;
          }
        }
      }
    }
    return empresaSeleccionada;
  }
}
