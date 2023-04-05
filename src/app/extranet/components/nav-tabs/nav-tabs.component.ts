import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-nav-tabs',
  templateUrl: './nav-tabs.component.html',
  styleUrls: ['./nav-tabs.component.scss']
})
export class NavTabsComponent implements OnInit {

  @Input() data: any = [];
  @Input() classes: string = '';
  @Output() getSelectedItem = new EventEmitter<any>();
  @Output() getItems = new EventEmitter<any>();

  constructor() { }

  selectTab (tab: any, index: number):void {
    this.getSelectedItem.emit({tab:tab, index:index})
  }

  ngOnInit(): void {
  }

}
