import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import {UserService} from '../../services/user.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-assigment-contract-edit-modal',
  templateUrl: './assigmentContractEdit.component.html',
  styleUrls: ['./assigmentContractEdit.component.scss']
})

export class AssigmentContractEditComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UserService,
    private modal: MatDialog,
    private router: Router,
  ) { }
  ngOnInit(): void {
  }

  accept() {
    this.closeModal();
  }

  closeModal() {
    this.modal.closeAll();
  }

}
