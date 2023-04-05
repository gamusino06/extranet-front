import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ui-creation-buttons',
  templateUrl: './creation-buttons.component.html',
  styleUrls: ['./creation-buttons.component.scss']
})
export class CreationButtonsComponent implements OnInit {
  @Input() createLabel = 'CREAR';
  @Input() massiveLabel = 'ALTA_MASIVA';
  @Output() onCreateClick = new EventEmitter<void>();
  @Output() onMassiveClick = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
  }

}
