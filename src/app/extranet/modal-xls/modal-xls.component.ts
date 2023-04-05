import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import {UserService} from '../../services/user.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-modal-xls',
  templateUrl: './modal-xls.component.html',
  styleUrls: ['./modal-xls.component.css']
})
export class ModalXlsComponent implements OnInit {
  logoUrl = '../assets/logos/logo.png';
  excelImgUrl = '../../../../assets/img/excel.svg';
  pdfImgUrl = '../../../../assets/img/pdf-2.png';

  constructor(
    private userService: UserService,
    private modal: MatDialog,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  pdf() {
    localStorage.setItem('pdf', 'true');
    localStorage.setItem('excel', 'false');
    this.closeModal();
  }

  excel() {
    localStorage.setItem('excel', 'true');
    localStorage.setItem('pdf', 'false');
    this.closeModal();
  }

  closeModal() {
    this.modal.closeAll();
  }

}
