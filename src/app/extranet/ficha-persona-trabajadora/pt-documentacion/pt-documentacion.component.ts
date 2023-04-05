import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {ModalDocumentacionComponent} from "../../../modales/modal-documentacion/modal-documentacion.component";
import {WorkerDocument} from "../../../Model/WorkerCard/WorkerDocument";
import {WorkersCardService} from "../../../services/workers-card.service";
import {UtilsService} from "../../../services/utils.service";
import {BasicEntity} from "../../../Model/BasicEntity";
import {PuestoTrabajo} from "../../../Model/PuestoTrabajo";
import {NgxSpinnerService} from "ngx-spinner";
import {MatTableDataSource} from "@angular/material/table";

@Component({
  selector: 'app-pt-documentacion',
  templateUrl: './pt-documentacion.component.html',
  styleUrls: ['./pt-documentacion.component.scss']
})
export class PtDocumentacionComponent implements OnInit {


  @Input('workerData') @Output('workerData') workerData: any;
  documentTypesList: DocumentType;
  centersList: BasicEntity;
  documentList;

  public triggerTableReload = 0;

  constructor(
    public workerUtils : WorkersCardService,
    private modalRgpd: MatDialog,
    public utils: UtilsService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {

    this.spinner.show();

    // Relleno datos selectores de "+ Nuevo Documento"
    this.workerUtils.getCenters(this.workerData.idTrabajador).subscribe(
      data => { this.centersList = data; },
      error => { console.error(error); }
    );
    this.workerUtils.getAllDocumentsTypes().subscribe(
      data => { this.documentTypesList = data; },
      error => { console.error(error); }
    );
  }

  displayNewDocumentModal(eventData?) {
      let editDocumentData;
      if (eventData != null) {
        editDocumentData = eventData;
      }

      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = {
        workerData: this.workerData,
        documentTypesList: this.documentTypesList,
        centersList: this.centersList,
        editDocumentData: editDocumentData
      };
      dialogConfig.hasBackdrop = true;
      dialogConfig.disableClose = true;

      const newDocument = this.modalRgpd.open(ModalDocumentacionComponent, dialogConfig);

      newDocument.afterClosed().subscribe(workerDocument => {
        if(workerDocument){

          let titulo = "";
          this.spinner.show();
          this.workerUtils.saveDocuments(workerDocument).subscribe(
            () =>{
              titulo = this.utils.translateText('PERSONA_TRABAJADORA.DOCUMENT_SAVED', 'Documento guardado');
              this.utils.mostrarMensajeSwalFire('info', titulo, '','var(--blue)', false);
              this.triggerTableReload = this.triggerTableReload + 1;
            },
            error => {
              console.error(error);
              titulo = this.utils.translateText('ERROR', "Se ha producido un error");
              this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
            },
            () =>{
              this.spinner.hide();
            }
          )

        }
      })
  }

}
