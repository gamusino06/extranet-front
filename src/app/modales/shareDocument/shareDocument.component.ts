import { ElementRef, Inject, Input, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { MyErrorStateMatcher } from '../modalModifyBillsMail/modalModifyBillsMail.component';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { TranslateService } from '@ngx-translate/core';
import { Globals } from '../../extranet/globals';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-shareDocument',
  templateUrl: './shareDocument.component.html',
  styleUrls: ['./shareDocument.component.scss']
})

export class ShareDocumentComponent implements OnInit {
  shareDocumentGroup: FormGroup;
  matcher = new MyErrorStateMatcher();
  public Editor = DecoupledEditor;
  environment = environment;

  editorConfig = {
    toolbar: {
	    plugins: [ 'Essentials','Alignment','Autoformat','BlockQuote','List','Paragraph' ],
      items: [ 'heading', '|',
      'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|',
      'bold', 'italic', '|' ,
      'bulletedList', 'numberedList', '|' ,
      'blockQuote', 'insertTable', '|',
      'undo', 'redo', '|',
     ]
    }
  };

  @ViewChild('textoCompleto') textoCompleto: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<ShareDocumentComponent>,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    public globals: Globals,
    @Inject(MAT_DIALOG_DATA) public data: any) {

    DecoupledEditor
    .create( document.querySelector( '#Editor' ), {
        removePlugins: [ 'exportPdf', 'Link' ],
        toolbar: [ 'bold', 'italic', 'bulletedList', 'numberedList', 'blockQuote' ]
    } )
    .catch( error => {
        if (environment.debug) console.log( error );
    } );
  }

  ngOnInit() {
    this.shareDocumentGroup = this.formBuilder.group({
      emailFormControl: new FormControl('', [
        Validators.required,
        Validators.pattern(this.globals.emailPattern)
      ]),
      ccFormControl: new FormControl('', [
        Validators.pattern(this.globals.emailPattern)
      ]),
      ccoFormControl: new FormControl('', [
        Validators.pattern(this.globals.emailPattern)
      ]),
      subjectFormControl: new FormControl('', [
        Validators.required
      ]),
      bodyFormControl: new FormControl('', [
      ])
    });
    this.shareDocumentGroup.controls['subjectFormControl'].setValue("Envío de documentos. " + this.data.menuName + " / " + this.data.subMenuName);

  }

  disableAnimation = true;
  ngAfterViewInit(): void {
    setTimeout(() => this.disableAnimation = false);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onReady( editor ) {
    editor.ui.getEditableElement().parentElement.insertBefore(
        editor.ui.view.toolbar.element,
        editor.ui.getEditableElement()
    );
  }

}
