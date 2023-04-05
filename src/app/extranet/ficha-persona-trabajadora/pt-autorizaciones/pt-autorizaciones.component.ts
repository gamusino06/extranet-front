import { Component, OnInit, AfterViewInit, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import {ConfirmationModal} from '../../../Model/ConfirmationModal';
import {NgxSpinnerService} from 'ngx-spinner';
import {UserService} from '../../../services/user.service';
import {UtilsService} from '../../../services/utils.service';
import {TranslateService} from '@ngx-translate/core';
import {Globals} from '../../globals';
import { MatTableDataSource } from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import {formatDate} from '@angular/common';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {ShareDocumentComponent} from '../../../modales/shareDocument/shareDocument.component';
import {environment} from '../../../../environments/environment';
import {AddAuthorizationDocumentComponent} from '../../../modales/addAuthorizationDocument/addAuthorizationDocument.component';
import {ModalDocumentacionComponent} from '../../../modales/modal-documentacion/modal-documentacion.component';
import {BasicEntity} from '../../../Model/BasicEntity';
import {WorkersCardService} from '../../../services/workers-card.service';
import {AutorizacionTrabajadorTipo} from '../../../Model/Autorizacion/AutorizacionTrabajadorTipo';

@Component({
  selector: 'app-pt-autorizaciones',
  templateUrl: './pt-autorizaciones.component.html',
  styleUrls: ['./pt-autorizaciones.component.scss']
})
export class PtAutorizacionesComponent implements OnInit {
  @Input('workerData') @Output('workerData') workerData: any;
  authorizationTypesList: AutorizacionTrabajadorTipo;

  public triggerTableReload = 0;

  constructor(
    public workerUtils: WorkersCardService,
    private dialog: MatDialog,
    public utils: UtilsService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {

    this.spinner.show();

    // Relleno datos selectores de "+ Añadir autorizacion"
    this.workerUtils.getAllTiposAutorizaciones().subscribe(
      data => { this.authorizationTypesList = data; },
      error => { console.error(error); }
    );
  }

  openModalAddAuthorization(eventData?) {
    let editAuthData: any;

    if (eventData != null) {
      editAuthData = eventData;
    }

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      workerData: this.workerData,
      authorizationTypesList: this.authorizationTypesList,
      editAuthData: editAuthData
    };
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;

    const newAutho = this.dialog.open(AddAuthorizationDocumentComponent, dialogConfig);

    newAutho.afterClosed().subscribe(workerAutho => {
      /*if (workerAutho) {

        let titulo = '';
        this.spinner.show();
        this.workerUtils.saveDocumentsAut(workerAutho).subscribe(  /// SAVE DE AUTORIZACION
          () => {
            titulo = this.utils.translateText('PERSONA_TRABAJADORA.ATHORIZATION_SAVED', 'Autorización guardada');
            this.utils.mostrarMensajeSwalFire('info', titulo, '', 'var(--blue)', false);
            this.triggerTableReload = this.triggerTableReload + 1;
          },
          error => {
            console.error(error);
            titulo = this.utils.translateText('ERROR', 'Se ha producido un error');
            this.utils.mostrarMensajeSwalFire('error', titulo, '', 'var(--blue)', false);
          },
          () => {
            this.spinner.hide();
          }
        );
      }*/
    });
  }

}
