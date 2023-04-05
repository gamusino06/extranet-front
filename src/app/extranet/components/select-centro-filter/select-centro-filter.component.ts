import { Component, ViewChild, Input, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatSelect } from "@angular/material/select"
import { MatOption } from "@angular/material/core"
import { Globals } from '../../globals';
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { Empresa } from 'src/app/Model/Empresa';
import { Centro } from 'src/app/Model/Centro';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-select-centro-filter',
  templateUrl: './select-centro-filter.component.html',
  styleUrls: ['./select-centro-filter.component.css']

})

export class SelectCentroFilterComponent {
  centrosSelectedAll: Boolean = false;
  selectedRadio: Number = 1;

  @Input() userForm: FormGroup;
  @Input() empresasList: any[];
  @Input() radioButtonsActivos: any;
  @Input() required: any;
  @Input() multiple: Boolean = true;
  @Input() disabled: Boolean = false;
  @ViewChild('selectCentros') selectCentros: MatSelect;

  public centroFilter: FormControl = new FormControl();
  public filteredCentrosMulti: ReplaySubject<Centro[]> = new ReplaySubject<Centro[]>(1);
  protected _onDestroy = new Subject<void>();

  constructor(public utils: UtilsService,
              private globals: Globals) {}

  ngOnInit(){
    //console.log("¡ERROR CONTROLADO! (Cannot read property 'slice' of undefined) - No se controla que no salga en consola porque es necesario que se cargue el componente.")
    if (this.empresasList !== undefined)
      this.filteredCentrosMulti.next(this.empresasList.slice());

    // listen for search field value changes
    this.centroFilter.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterCentrosMulti();
      });
  }

  ngAfterViewInit() {
    this.setInitialValue();
  }


  /**
   * Sets the initial value after the filteredBanks are loaded initially
   */
  protected setInitialValue() {
    this.filteredCentrosMulti
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        // setting the compareWith property to a comparison function
        // triggers initializing the selection according to the initial value of
        // the form control (i.e. _initializeSelection())
        // this needs to be done after the filteredEmpresas are loaded initially
        // and after the mat-option elements are available
        this.selectCentros.compareWith = (a: Centro, b: Centro) => a && b && a.idCentro === b.idCentro;
      });
  }

  protected filterCentrosMulti() {
    if (!this.empresasList) {
      return;
    }
    // get the search keyword
    let search = this.centroFilter.value;
    if (!search) {
      this.filteredCentrosMulti.next(this.empresasList.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the empresas
    this.filteredCentrosMulti.next(
      this.empresasList.filter(empresa => empresa?.nombre?.toLowerCase().indexOf(search) > -1)
    );
  }

  ngOnChanges(){
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
        empresa.centros.forEach (centro => {
          //Comprobamos si el centro tiene PT y VS
          this.utils.actualizacionAtributosSegunAreaisPTisVS(centro, isPT, isVS);
        });
      });
    }
  }

  toggleSelectAll(selectAllValue: boolean) {
    if (selectAllValue)
      this.selectCentros.options.forEach( (item : MatOption) => item.select());
    else
      this.selectCentros.options.forEach( (item : MatOption) => item.deselect());
  }

  vaciarFilter(){
    this.selectCentros.options.forEach( (item : MatOption) => item.deselect());
  }

  /**
   * Metodo para obtener el nombre del centro seleccionada
   */
  centroSeleccionado(){
    let centroSeleccionado: String = '';
    let itemSel: MatOption;
    if(this.selectCentros != undefined){
      this.selectCentros.options.forEach( (item : MatOption) => {
        if(item.selected)
          itemSel = item;
      });
      if(itemSel != undefined){
        for(let empresa of this.empresasList){
          for(let centro of empresa.centros) {
            if (centro.idCentro == itemSel.value) {
              centroSeleccionado = centro.nombre;
            }
          }
        }
      }
    }
    return centroSeleccionado;
  }

}
