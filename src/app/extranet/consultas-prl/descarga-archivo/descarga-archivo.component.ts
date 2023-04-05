import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {QueryLineByAttachments} from '../../../Model/QueryLineByAttachments';
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder} from '@angular/forms';
import {Router} from '@angular/router';
import {NgxSpinnerService} from 'ngx-spinner';
import {UtilsService} from '../../../services/utils.service';
import {TranslateService} from '@ngx-translate/core';
import {Globals} from '../../globals';
import {CustomerService} from '../../../services/customer.service';
import {saveAs} from 'file-saver';

@Component({
  selector: 'app-descarga-archivo',
  templateUrl: './descarga-archivo.component.html',
  styleUrls: ['./descarga-archivo.component.css']
})
export class DescargaArchivoComponent implements OnInit {

  constructor
  (
    public dialogRef: MatDialogRef<DescargaArchivoComponent>,
    private formBuilder: FormBuilder,
    private router: Router,
    private spinner: NgxSpinnerService,
    private cdRef:ChangeDetectorRef,
    public utils: UtilsService,
    public translate: TranslateService,
    public globals: Globals,
    public dialog: MatDialog,
    private customerService: CustomerService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {

  }

  onNoClick(): void {
    this.dialogRef.close();
  }


  descargarAtachment(Attachment: QueryLineByAttachments){
    this.spinner.show();
    let blob = null;
    this.customerService.getAttachmentsByQueryline(Attachment.id, Number(sessionStorage.getItem('customerId'))).subscribe(r => {
      blob = new Blob([r], { type: Attachment.attachmentContentType});
      const fileURL = URL.createObjectURL(blob);
      saveAs(blob, Attachment.attachmentName);
      this.spinner.hide();
    }, error1 => {
      this.utils.mostrarMensajeSwalFire('error', "Ha ocurrido un error al intentar obtener la información solicitada", '','var(--blue)', false);
      this.spinner.hide();
    });
  }
}
