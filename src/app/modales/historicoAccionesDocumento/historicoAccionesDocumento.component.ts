import { ElementRef, Inject, Input, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MyErrorStateMatcher } from '../modalModifyBillsMail/modalModifyBillsMail.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import Swal from 'sweetalert2';
import { ShowGdprComponent } from '../showGdpr/showGdpr.component';

export interface HistoricoAccionesDocumentoInterface {
  fecha: string;
  usuario: any;
  accion: string;
  gdpr: any;
}

@Component({
  selector: 'app-historico-acciones-documento',
  templateUrl: './historicoAccionesDocumento.component.html',
  styleUrls: ['./historicoAccionesDocumento.component.scss']
})

export class HistoricoAccionesDocumentoComponent implements OnInit {
  historicoAccionesDocumentoGroup: FormGroup;
  matcher = new MyErrorStateMatcher();

  tableHeaders: string[] = [
    'fecha',
    'usuario',
    'accion',
    'specialAction'];

  dataSource = new MatTableDataSource<HistoricoAccionesDocumentoInterface>();

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('TABLEDOCUMENTS') table: ElementRef;
  @ViewChild('TABLEDOCUMENTS') exportTableDirective: ElementRef;


  @ViewChild('textoCompleto') textoCompleto: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<HistoricoAccionesDocumentoComponent>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog) {
  }

  ngOnInit() {
  }

  disableAnimation = true;
  ngAfterViewInit(): void {
    setTimeout(() => this.disableAnimation = false);


    let result: HistoricoAccionesDocumentoInterface[] = [];
    this.data.element.listaHistoricoDocumentoDto.forEach(element => {
      result.push({
        fecha: element.fechaAccion,
        accion: element.accion.valorAccion,
        usuario: element.usuario,
        gdpr: element.gdpr
      });
    });
    this.dataSource = new MatTableDataSource(result);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  onNoClick(): void {
    this.closeModal();
  }

  closeModal() {
    this.dialogRef.close();
  }

  mostrarTextoGDPR(gdprActividad) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      element: gdprActividad
    };
    dialogConfig.width = "90%";
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;

    const dialogRef = this.dialog.open(ShowGdprComponent, dialogConfig);
}

}
