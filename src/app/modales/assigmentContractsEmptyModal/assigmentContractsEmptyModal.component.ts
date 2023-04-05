import {Component, EventEmitter, Inject, OnInit, Output} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {AssigmentContractService} from '../../services/assigmentContract.service';
import {AssigmentContractFormModalComponent} from '../assigmentContractFormModal/assigmentContractFormModal.component';

@Component({
  selector: 'app-assigment-contract-empty-modal',
  templateUrl: './assigmentContractsEmptyModal.component.html',
  styleUrls: ['./assigmentContractsEmptyModal.component.scss']
})

export class AssigmentContractsEmptyModalComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private modal: MatDialog,
    public assigmentContractsService: AssigmentContractService
  ) {
  }

  ngOnInit(): void {
  }

  accept() {
    /* Abrir modal con la llamada al formulario*/
    this.openForm();
    this.modal.closeAll();
  }

  closeModal() {
    this.modal.closeAll();
  }

  cancel() {
    this.modal.closeAll();
  }

  openForm() {
    this.assigmentContractsService.getAssigmentContractFormUri(this.data.clientId).subscribe(data => {
      if (data !== null) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = {
          url: {data}
        };
        dialogConfig.width = '90%';
        const dialogRef = this.modal.open(AssigmentContractFormModalComponent, dialogConfig);
      } else {
        this.modal.closeAll();
      }
    });

  }
}
