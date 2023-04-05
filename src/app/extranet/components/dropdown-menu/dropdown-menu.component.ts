import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-dropdown-menu',
  templateUrl: './dropdown-menu.component.html',
  styleUrls: ['./dropdown-menu.component.scss']
})
export class DropdownMenuComponent implements OnInit {

  @Input() matIcon: string;
  @Input() menuOptions: any[];

  @Output() getAction = new EventEmitter<number>();

  ngOnInit(): void {
    
  }

  setAction(value) {
    this.getAction.emit(value)
  }
}
