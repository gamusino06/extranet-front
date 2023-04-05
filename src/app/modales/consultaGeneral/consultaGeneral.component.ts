import { ElementRef, Inject, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { MyErrorStateMatcher } from '../modalModifyBillsMail/modalModifyBillsMail.component';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { TranslateService } from '@ngx-translate/core';
import { Area } from 'src/app/Model/Area';
import { UtilsService } from 'src/app/services/utils.service';
import { Globals } from '../../extranet/globals';

@Component({
  selector: 'app-consultaGeneral',
  templateUrl: './consultaGeneral.component.html',
  styleUrls: ['./consultaGeneral.component.scss']
})

export class ConsultaGeneralComponent implements OnInit, OnDestroy {
  environment = environment;
  consultaGeneralGroup: FormGroup;
  matcher = new MyErrorStateMatcher();
  public Editor = DecoupledEditor;
  areaList: string[];
  files: File[];
  file: File;
  enviarConsulta = false;

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
    public dialogRef: MatDialogRef<ConsultaGeneralComponent>,
    private formBuilder: FormBuilder,
    public translate: TranslateService,
    public globals: Globals,
    public utils: UtilsService,
    @Inject(MAT_DIALOG_DATA) public data:any) {

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
    let prevencion_tecnica = "Prevención Técnica";
    this.translate.get('PREVENCION_TECNICA').subscribe((res: string) => {
      prevencion_tecnica = res;
    });
    let vigilancia_salud = "Vigilancia de la Salud";
    this.translate.get('VIGILANCIA_SALUD').subscribe((res: string) => {
      vigilancia_salud = res;
    });
    let administracion = "Administración";
    this.translate.get('ADMINISTRACION').subscribe((res: string) => {
      administracion = res;
    });
    let cumplimiento_normativo_etico = "Cumplimiento normativo y ético";
    this.translate.get('CUMPLIMIENTO_NORMATIVO_ETICO').subscribe((res: string) => {
      cumplimiento_normativo_etico = res;
    });
    let otros = "Otros";
    this.translate.get('OTROS').subscribe((res: string) => {
      otros = res;
    });

    this.areaList = [prevencion_tecnica, vigilancia_salud, administracion, cumplimiento_normativo_etico, otros];
    this.consultaGeneralGroup = this.formBuilder.group({
      areaFormControl: new FormControl('', [
        Validators.required
      ]),
      /*fromFormControl: new FormControl('', [
        Validators.required
      ]),*/
      jobFormControl: new FormControl('', [
      ]),
      phoneFormControl: new FormControl('', [
        //Validators.pattern(this.globals.phonePattern)
      ]),
      subjectFormControl: new FormControl('', [
        Validators.required
      ]),
      fileFormControl: new FormControl('', [
      ]),
      bodyFormControl: new FormControl('', [
        Validators.required
      ])
    });
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

    if (this.files!==undefined && this.files.length>0)
    {
      for (var i = 0; i < this.files.length; i++) {
        data.append("file", this.files[i]);
      }
    }

    var formulario = {
      "to": "",
      "empresasUsuario": this.data.empresasUsuario,
      "area": "",
      "cargo": "",
      "telefonoContacto": "",
      "subject": "",
      "content": ""
    };
    formulario.to = this.globals.correo_preving_to_mail;
    formulario.area = "[" + this.consultaGeneralGroup.controls["areaFormControl"].value + "]";
    formulario.cargo = this.consultaGeneralGroup.controls["jobFormControl"].value;
    formulario.telefonoContacto =  this.consultaGeneralGroup.controls["phoneFormControl"].value;
    formulario.subject = this.consultaGeneralGroup.controls["subjectFormControl"].value;
    formulario.content = this.consultaGeneralGroup.controls["bodyFormControl"].value;

    let formularioJson = JSON.stringify(formulario)
    data.append('formulario', formularioJson);

    let titulo = "Se ha procedido al envío de su consulta general";
    this.translate.get('ENVIO_EMAIL_CONSULTA_GENERAL').subscribe((res: string) => {
      titulo = res;
    });
    this.utils.mostrarMensajeSwalFire('info', titulo, '','var(--blue)', false);

    this.utils.envioMailConsultaGeneral(data).subscribe(result => {
      if (!result){
         let titulo = "Error al enviar el mensaje";
         this.translate.get('ERROR_ENVIO_MENSAJE').subscribe((res: string) => {
           titulo = res;
         });
         this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
      }
    }),(error => {
      if (environment.debug) console.log("Error al Enviar EMAIL - realizarConsultaGeneral()");
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
        this.consultaGeneralGroup.controls["fileFormControl"].setValue([]);
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
