import { Component, ViewChild, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSelect } from "@angular/material/select"
import { MatOption } from "@angular/material/core"
import { Globals } from '../../globals';

@Component({
  selector: 'app-select-centro',
  templateUrl: './select-centro.component.html',
  styleUrls: ['./select-centro.component.css']

})

export class SelectCentroComponent {
  centrosSelectedAll: Boolean = false;
  selectedRadio: Number = 1;

  @Input() userForm: FormGroup;
  @Input() empresasList: any[];
  @Input() radioButtonsActivos: any;
  @ViewChild('selectCentros') selectCentros: MatSelect;

  constructor(private globals: Globals) {}

  ngOnChanges(){
    if (this.empresasList!==undefined)
    {
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
          centro.activo = false;
          centro.mostrar = false;
          if (!isPT && !isVS){
            if(centro.activoPT || centro.activoVS){
              centro.activo = true;
            }
            if (centro.tienePT || centro.tieneVS){
              centro.mostrar = true;
            }
          }else if (isPT) {
            if (centro.activoPT){
              centro.activo = true;
            }
            if (centro.tienePT){
              centro.mostrar = true;
            }
          }else if (isVS) {
            if (centro.activoVS){
              centro.activo = true;
            }
            if (centro.tieneVS){
              centro.mostrar = true;
            }
          }
        });
      });
    }
  }

  toggleAllSelection() {
    if (!this.centrosSelectedAll)
      this.selectCentros.options.forEach( (item : MatOption) => item.select());
    else
      this.selectCentros.options.forEach( (item : MatOption) => item.deselect());

    this.centrosSelectedAll =! this.centrosSelectedAll;
  }
}
