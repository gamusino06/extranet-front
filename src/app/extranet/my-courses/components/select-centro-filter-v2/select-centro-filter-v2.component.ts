import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {MatSelect} from '@angular/material/select';
import {MatOption} from '@angular/material/core';
import {Globals} from '../../../globals';
import {ReplaySubject, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {Centro} from 'src/app/Model/Centro';
import {UtilsService} from 'src/app/services/utils.service';

@Component({
  selector: 'app-select-centro-filter-v2',
  templateUrl: './select-centro-filter-v2.component.html',
  styleUrls: ['./select-centro-filter-v2.component.css']

})

export class SelectCentroFilterV2Component implements OnInit {
  centrosSelectedAll = false;
  selectedRadio = 1;

  @Input() userForm: FormGroup;
  @Input() empresasList: any[];
  @Input() radioButtonsActivos: any;
  @Input() required: any;
  @Input() multiple = true;
  @Input() disabled = false;
  @ViewChild('selectCentros') selectCentros: MatSelect;

  public centroFilter: FormControl = new FormControl();
  public filteredCentrosMulti: ReplaySubject<Centro[]> = new ReplaySubject<Centro[]>(1);
  // tslint:disable-next-line:variable-name
  protected _onDestroy = new Subject<void>();

  constructor(public utils: UtilsService,
              private globals: Globals) {
  }

  ngOnInit() {
    if (this.empresasList !== undefined) {
      this.filteredCentrosMulti.next(this.empresasList.slice());
    }

    // listen for search field value changes
    this.centroFilter.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterCentrosMulti();
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

  ngOnChanges() {
    if (this.empresasList !== undefined) {
      let isPT = false;
      let isVS = false;

      if (localStorage.getItem('areaSelected') !== 'undefined') {
        let seleccionArea = JSON.parse(localStorage.getItem('areaSelected'));
        if (seleccionArea.idArea === this.globals.idAreaPT) {
          isPT = true;
        }
        if (seleccionArea.idArea === this.globals.idAreaVS) {
          isVS = true;
        }
      }
      this.empresasList.forEach(empresa => {
        empresa.centros.forEach(centro => {
          this.utils.actualizacionAtributosSegunAreaisPTisVS(centro, isPT, isVS);
        });
      });
    }
  }

  toggleSelectAll(selectAllValue: boolean) {
    if (selectAllValue) {
      this.selectCentros.options.forEach((item: MatOption) => item.select());
    } else {
      this.selectCentros.options.forEach((item: MatOption) => item.deselect());
    }
  }

  vaciarFilter() {
    this.selectCentros.options.forEach((item: MatOption) => item.deselect());
  }

  /**
   * Metodo para obtener el nombre del centro seleccionada
   */
  centroSeleccionado() {
    let centroSeleccionado = '';
    let itemSel: MatOption;
    if (this.selectCentros !== undefined) {
      this.selectCentros.options.forEach((item: MatOption) => {
        if (item.selected) {
          itemSel = item;
        }
      });
      if (itemSel != undefined) {
        for (let empresa of this.empresasList) {
          for (let centro of empresa.centros) {
            if (centro.idCentro === itemSel.value) {
              centroSeleccionado = centro.nombre;
            }
          }
        }
      }
    }
    return centroSeleccionado;
  }

}
