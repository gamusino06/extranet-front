import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialogRef} from '@angular/material/dialog';
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import '@ckeditor/ckeditor5-build-classic/build/translations/es';
import {environment} from '../../../../environments/environment';
import {TranslateService} from '@ngx-translate/core';

export enum AllowedExtensions {
  xls = 'xls',
  xlsx = 'xlsx',
  pdf = 'pdf',
  doc = 'doc',
  docx = 'docx',
  png = 'png',
  jpg = 'jpg'
};


@Component({
    selector: 'app-contact-manager',
    templateUrl: './contact-manager.component.html',
    styleUrls: ['./contact-manager.component.css'],
    providers: []
})


export class ContactManagerComponent implements OnInit {
    public Editor = DecoupledEditor;
    editorConfig = {
        toolbar: {
            plugins: ['Essentials', 'Alignment', 'Autoformat', 'BlockQuote', 'List', 'Paragraph'],
            items: ['heading', '|',
                'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|',
                'bold', 'italic', '|',
                'bulletedList', 'numberedList', '|',
                'blockQuote', 'insertTable', '|',
                'undo', 'redo', '|',
            ]
        }
    };
    @ViewChild('textoCompleto') textoCompleto: ElementRef;

    constructor(
        private formBuilder: FormBuilder,
        public translate: TranslateService,
        public dialogRef: MatDialogRef<ContactManagerComponent>,
    ) {
        DecoupledEditor
            .create( document.querySelector( '#Editor' ), {
                removePlugins: [ 'exportPdf', 'Link' ],
                toolbar: [ 'bold', 'italic', 'bulletedList', 'numberedList', 'blockQuote' ]
            } )
            .catch( error => {
                if (environment.debug) { console.log( error ); }
            } );
    }
    form: FormGroup;
    environment = environment;


    disableAnimation = true;

    ngOnInit(): void {
    this.initForm();
    }
    initForm() {
        this.form = this.formBuilder.group({
            contactManager: new FormControl('', [Validators.required]),
            attachment: new FormControl(null)
        });
    }

    cancel() {
        this.dialogRef.close();
    }
    send() {
      if (this.form.valid) {
        try {
          const file =  this.form.controls.attachment.value;
          const extension = file.name.split('.').pop();
          if(Object.keys(AllowedExtensions).find(key => AllowedExtensions[key] === extension) !== undefined){
            this.dialogRef.close(this.form);
          }
        } catch (e) {
          console.log(e);
        }
      }
    }
    handleFileInput(e) {
        this.form.controls.attachment.setValue(e.target.files[0]);
    }

    onReady(editor) {
        editor.ui.getEditableElement().parentElement.insertBefore(
            editor.ui.view.toolbar.element,
            editor.ui.getEditableElement()
        );
    }
    hasFile() {
        return this.form.get('attachment').value !== null;
    }
    deleteFile() {
        this.form.controls.attachment.setValue(null);
    }

  getFileExtension() {
    const file =  this.form.controls.attachment.value;
    const extension = file.name.split('.').pop();
    let errorMessage;
    this.translate.get('MY_COURSE.MASSIVE_COURSE.FILE_EXTENSION.NOT_VALID').subscribe((res: string) => {
      errorMessage = res;
    });
    if (Object.keys(AllowedExtensions).find(key => AllowedExtensions[key] === extension) === undefined) {
      return errorMessage;
    }
  }

}
