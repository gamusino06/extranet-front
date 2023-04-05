import { Component, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSelect } from "@angular/material/select"
import { MatOption } from "@angular/material/core"
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-select-provincia-wp',
  templateUrl: './select-provincia-wp.component.html',
  styleUrls: ['./select-provincia-wp.component.scss']
})
export class SelectProvinciaWpComponent {
  provinciasSelectedAll: Boolean = false;

  @Input() userForm: FormGroup;
  @Input() provinciasList: any[];
  @Output() getLocalidades: EventEmitter<null> = new EventEmitter();
  @Input() textLabel: string;
  @Input() tieneLocalidades: boolean;

  @ViewChild('selectProvincias') selectProvincia: MatSelect;
  @ViewChild('provinciaFilter') provinciaFilter: any;

  constructor(private translate: TranslateService) {
  }

  setValueInputProvinciaFilter(){
    this.provinciaFilter.nativeElement.value = '';
  }

  toggleAllSelection() {
    if (!this.tieneLocalidades)
    {
      if (!this.provinciasSelectedAll)
        this.selectProvincia.options.forEach( (item : MatOption) => item.select());
      else
        this.selectProvincia.options.forEach( (item : MatOption) => item.deselect());

      this.provinciasSelectedAll =! this.provinciasSelectedAll;
      //this.getLocalidades.emit(); //No se va a hacer nunca cuando seleccione todas las localidades
    }
  }

}
