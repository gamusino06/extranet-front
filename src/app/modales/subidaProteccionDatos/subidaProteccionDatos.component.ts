import { ElementRef, Inject, Input, ViewChild } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { MyErrorStateMatcher } from '../modalModifyBillsMail/modalModifyBillsMail.component';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { TranslateService } from '@ngx-translate/core';
import { Globals } from 'src/app/extranet/globals';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-subidaProteccionDatos',
  templateUrl: './subidaProteccionDatos.component.html',
  styleUrls: ['./subidaProteccionDatos.component.scss']
})

export class SubidaProteccionDatosComponent implements OnInit {
  environment = environment;
  shareDocumentGroup: FormGroup;
  matcher = new MyErrorStateMatcher();
  public Editor = DecoupledEditor;
  files: File[];
  file: File;

  editorConfig = {
    toolbar: {
	    plugins: [ 'Essentials','Alignment','Autoformat','BlockQuote','List','Paragraph' ],
      items: [ 'heading', '|',
      'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|',
      'bold', 'italic', 'font', '|' ,
      'bulletedList', 'numberedList', '|' ,
      'blockQuote', 'insertTable', '|',
      'undo', 'redo', '|',
     ]
    }
  };


  @ViewChild('textoCompleto') textoCompleto: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<SubidaProteccionDatosComponent>,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    public globals: Globals,
    public utils: UtilsService,
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
      emailFormControl: new FormControl(this.globals.correo_preving_privacidad, [
        Validators.required,
      ]),
      ccFormControl: new FormControl('', [
      ]),
      ccoFormControl: new FormControl('', [
      ]),
      subjectFormControl: new FormControl('', [
        Validators.required
      ]),
      fileFormControl: new FormControl('', [
        Validators.required
      ]),
      bodyFormControl: new FormControl('', [
      ])
    });
    this.shareDocumentGroup.controls['emailFormControl'].disable();
    let subject = "Envío de documento de 'Encargado de Protección de Datos'";
    this.translate.get('ASUNTO_ENVIAR_PROTECCION_DATOS').subscribe((res: string) => {
       subject = res;
    });
    this.shareDocumentGroup.controls['subjectFormControl'].setValue(subject);

  }

  disableAnimation = true;
  ngAfterViewInit(): void {
    setTimeout(() => this.disableAnimation = false);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onClick(): void {
    var data = new FormData();

    for (var i = 0; i < this.files.length; i++) {
      data.append("file", this.files[i]);
    }

    var formulario = {
      "to": "",
      "cc": "",
      "cco": "",
      "subject": "",
      "body": ""
    };
    formulario.to = this.globals.correo_preving_to_mail;
    formulario.cc = this.shareDocumentGroup.controls["ccFormControl"].value;
    formulario.cco = this.shareDocumentGroup.controls["ccoFormControl"].value;
    formulario.subject = this.shareDocumentGroup.controls["subjectFormControl"].value;
    formulario.body = this.shareDocumentGroup.controls["bodyFormControl"].value;

    let formularioJson = JSON.stringify(formulario)
    data.append('formulario', formularioJson);

    let titulo = "Se ha procedido al envío del documento de protección de datos";
    this.translate.get('ENVIO_EMAIL_DESCARGA_PROTECCION_DATOS').subscribe((res: string) => {
      titulo = res;
    });
    this.utils.mostrarMensajeSwalFire('info', titulo, '','var(--blue)', false);
    this.utils.envioProteccionDatos(data).subscribe(result => {
      if (!result){
         let titulo = "Error al enviar el mensaje";
         this.translate.get('ERROR_ENVIO_MENSAJE').subscribe((res: string) => {
           titulo = res;
         });
         this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
      }
    }),(error => {
      if (environment.debug) console.log("Error al Enviar EMAIL");
    });
  }

  onReady( editor ) {
    editor.ui.getEditableElement().parentElement.insertBefore(
        editor.ui.view.toolbar.element,
        editor.ui.getEditableElement()
    );
  }


  handleFileInput(files: FileList) {
    this.files = Array.from(files);
    let tamTotalArchivos = 0;
    for (var i = 0; i < this.files.length; i++) {
      tamTotalArchivos = tamTotalArchivos + this.files[i].size;
    }

    if (tamTotalArchivos > this.globals.extranet_limite_adjuntos){ //20971520 Bytes
        //Inicializamos los ficheros
        this.shareDocumentGroup.controls["fileFormControl"].setValue([]);
        this.files = [];

        let titulo = "Los archivos adjuntos superan el límite de 20MB";
        this.translate.get('ARCHIVOS_ADJUNTOS_LIMITE').subscribe((res: string) => {
           titulo = res;
        });
        this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
    }
  }

  ngOnDestroy() {
  }

}
