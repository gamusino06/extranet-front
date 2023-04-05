import { Component, ViewChild, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSelect } from "@angular/material/select"
import { MatOption } from "@angular/material/core"

@Component({
  selector: 'app-select-localidad-wp',
  templateUrl: './select-localidad-wp.component.html',
  styleUrls: ['./select-localidad-wp.component.scss']
})
export class SelectLocalidadWpComponent {
  localidadSelectedAll: Boolean = false;
  @Input() userForm: FormGroup;
  @Input() localidadList: any[];

  @ViewChild('selectLocalidad') selectLocalidad: MatSelect;
  @ViewChild('localidadFilter') localidadFilter: any;

  constructor() {}

  setValueInputLocalidadFilter(){
      this.localidadFilter.nativeElement.value = '';
  }

  toggleAllSelection() {
    if (!this.localidadSelectedAll)
      this.selectLocalidad.options.forEach( (item : MatOption) => item.select());
    else
      this.selectLocalidad.options.forEach( (item : MatOption) => item.deselect());

    this.localidadSelectedAll =! this.localidadSelectedAll;
  }

}
