import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ui-search-buttons',
  templateUrl: './search-buttons.component.html',
  styleUrls: ['./search-buttons.component.scss']
})
export class SearchButtonsComponent implements OnInit {
  @Input() clearLabel = 'LIMPIAR';
  @Input() searchLabel = 'BUSCAR';
  @Input() disabledButton2 = false;
  @Output() onClearClick = new EventEmitter<void>();
  @Output() onSearchClick = new EventEmitter<void>();

  cleanImgUrl = "../../../assets/img/borrar_filtros.svg";
  searchImgUrl = "../../../assets/img/search.svg";

  constructor() { }

  ngOnInit(): void {
  }

}
