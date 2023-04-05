import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ConfirmationModal} from '../../../../../Model/ConfirmationModal';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.css']
})
export class ConfirmationModalComponent implements OnInit {
  @Input() configurationObj: ConfirmationModal;
  @Input() isLoading: boolean;
  @Output() onAcceptEvent = new EventEmitter<boolean>();
  @Output() onCancelEvent = new EventEmitter<boolean>();

  iconClass(): string {
    return `swal2-${this.configurationObj.icon}`;
  }

  constructor() { }

  ngOnInit(): void {
  }

  onAccept(): void {
    this.onAcceptEvent.emit(true);
  }

  onCancel(): void {
    this.onCancelEvent.emit(true);
  }

  getClassOf(): String {
    return this.isLoading ? 'button swal2-styled swal2-confirm button--loading disabled' : 'swal2-styled swal2-confirm';
  }
}
