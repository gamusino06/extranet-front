import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder} from '@angular/forms';
import {Router} from '@angular/router';
import {NgxSpinnerService} from 'ngx-spinner';
import {UtilsService} from '../../../services/utils.service';
import {TranslateService} from '@ngx-translate/core';
import {Globals} from '../../globals';
import {CustomerService} from '../../../services/customer.service';
import {saveAs} from 'file-saver';

@Component({
  selector: 'app-descarga-doc',
  templateUrl: './descarga-doc.component.html',
  styleUrls: ['./descarga-doc.component.css']
})
export class DescargaDocComponent implements OnInit {

  constructor
  (
    public dialogRef: MatDialogRef<DescargaDocComponent>,
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


  descargarAtachment(id: number, attachedName: string, documentId: number){
    this.spinner.show();
    let blob = null;
    this.customerService.downloadDocument(id, Number(sessionStorage.getItem('customerId'))).subscribe(r => {
      blob = new Blob([r], {type: 'application/*'});
      const fileURL = URL.createObjectURL(blob);
      saveAs(blob, attachedName);
      this.spinner.hide();
    }, error1 => {
      this.utils.mostrarMensajeSwalFire('error', "Ha ocurrido un error al intentar obtener la información solicitada", '','var(--blue)', false);
      this.spinner.hide();
    });
  }
}
