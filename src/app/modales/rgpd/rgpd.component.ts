import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-rgpd',
  templateUrl: './rgpd.component.html',
  styleUrls: ['./rgpd.component.scss']
})
export class RgpdComponent implements OnInit {
  logoUrl = '../assets/logos/logo.png';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private modal: MatDialog,
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
