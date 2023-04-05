import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmationModal } from 'src/app/Model/ConfirmationModal';

@Component({
  selector: 'app-generic-confirmation-modal',
  templateUrl: './modal-confirmacion.component.html',
  styleUrls: ['./modal-confirmacion.component.scss']
})
export class ModalConfirmacionComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ModalConfirmacionComponent>,
    @Inject(MAT_DIALOG_DATA) public configurationObj: ConfirmationModal,
    ) { }

  ngOnInit(): void {
  }

  onAccept(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

}
