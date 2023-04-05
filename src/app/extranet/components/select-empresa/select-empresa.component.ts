import { Component, ViewChild, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSelect } from "@angular/material/select"
import { MatOption } from "@angular/material/core"
import { Globals } from '../../globals';

@Component({
  selector: 'app-select-empresa',
  templateUrl: './select-empresa.component.html',
  styleUrls: ['./select-empresa.component.css']

})

export class SelectEmpresaComponent {
  empresasSelectedAll: Boolean = false;
  selectedRadio: Number = 1;
  //numbers: any[];

  @Input() userForm: FormGroup;
  @Input() empresasList: any[];
  @Input() radioButtonsActivos: any;
  @Input() multiple: Boolean = true;
  @ViewChild('selectEmpresas') selectEmpresas: MatSelect;


  constructor(private globals: Globals) {

    //this.numbers = Array(10000).fill(0,1,10000);
  }


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
        empresa.activo = false;
        empresa.mostrar = false;
        if (!isPT && !isVS){
          if(empresa.activoPT || empresa.activoVS){
            empresa.activo = true;
          }
          if (empresa.tienePT || empresa.tieneVS){
            empresa.mostrar = true;
          }
        }else if (isPT) {
          if (empresa.activoPT){
            empresa.activo = true;
          }
          if (empresa.tienePT){
            empresa.mostrar = true;
          }
        }else if (isVS) {
          if (empresa.activoVS){
            empresa.activo = true;
          }
          if (empresa.tieneVS){
            empresa.mostrar = true;
          }
        }
      });
    }
  }

  toggleAllSelection() {
    if (!this.empresasSelectedAll)
      this.selectEmpresas.options.forEach( (item : MatOption) => item.select());
    else
      this.selectEmpresas.options.forEach( (item : MatOption) => item.deselect());

    this.empresasSelectedAll =! this.empresasSelectedAll;
  }
}
