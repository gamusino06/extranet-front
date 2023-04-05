import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-cookies',
  templateUrl: './cookies.component.html',
  styleUrls: ['./cookies.component.css']
})
export class CookiesComponent implements OnInit {
  logoUrl = '../assets/img/logo.svg';

  constructor(
    private modal: MatDialog
  ) { }

  ngOnInit() {
  }

  disableAnimation = true;
  ngAfterViewInit(): void {
    setTimeout(() => this.disableAnimation = false);    
  }

  closeModal(){
    this.modal.closeAll();
  }

}
