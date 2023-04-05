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

export interface HistoricoAccionesGdprUsuarioInterface {
  fecha: string;
  nombreUsuario: string;
  apellidosUsuario: string;
  emailUsuario: string;
  gdpr: any;
}

@Component({
  selector: 'app-historicoAccionesGdprUsuario',
  templateUrl: './historicoAccionesGdprUsuario.component.html',
  styleUrls: ['./historicoAccionesGdprUsuario.component.scss']
})

export class HistoricoAccionesGdprUsuarioComponent implements OnInit {
  historicoAccionesGdprUsuarioGroup: FormGroup;
  matcher = new MyErrorStateMatcher();

  tableHeaders: string[] = [
    'fecha',
    'usuario',
    'version_gdpr',
    'specialAction'];

  dataSource = new MatTableDataSource<HistoricoAccionesGdprUsuarioInterface>();

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('TABLEDOCUMENTS') table: ElementRef;
  @ViewChild('TABLEDOCUMENTS') exportTableDirective: ElementRef;


  @ViewChild('textoCompleto') textoCompleto: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<HistoricoAccionesGdprUsuarioComponent>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog) {
  }

  ngOnInit() {
  }

  disableAnimation = true;
  ngAfterViewInit(): void {
    setTimeout(() => this.disableAnimation = false);


    let result: HistoricoAccionesGdprUsuarioInterface[] = [];
    this.data.element.listaHistoricoGdprUsuarioDto.forEach(elementGdpr => {
      result.push({

        fecha: elementGdpr.fechaAceptacion,
        nombreUsuario: elementGdpr.usuario.nombre,
        apellidosUsuario: elementGdpr.usuario.apellidos,
        emailUsuario: elementGdpr.usuario.email,
        gdpr: elementGdpr.gdpr
      });
    });
    this.dataSource = new MatTableDataSource(result);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  onNoClick(): void {
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
