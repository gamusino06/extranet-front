import { Component, OnInit, Inject, Input } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from "@angular/material/core";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { MY_FORMATS } from "src/config/config";
import { MatTableDataSource } from "@angular/material/table";
import { GoalsService } from "src/app/services/goals.service";
import {Globals} from 'src/app/extranet/globals';
import {UtilsService} from 'src/app/services/utils.service';

export enum AllowedExtensions {
  xls = 'xls',
  xlsx = 'xlsx',
  pdf = 'pdf',
  doc = 'doc',
  docx = 'docx',
  // png = 'png',
  // jpg = 'jpg'
};


export interface goalDoc {
  id: number;
  goal: any;
  fileName: string;
  fileType: string;
  filePath: string;
}

@Component({
  selector: "app-goal-add-docs-modal",
  templateUrl: "./goal-add-docs-modal.component.html",
  styleUrls: ["./goal-add-docs-modal.component.scss"],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class GoalAddDocsModalComponent implements OnInit {
  @Input() title: string;
  form: FormGroup;
  file: File;

  constructor(
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    public translate: TranslateService,
    private goalsService: GoalsService,
    private globals: Globals,
    public utils: UtilsService,
    public dialogRef: MatDialogRef<GoalAddDocsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    let auxFile = null
    if (this.data.goalDoc?.id) { 
      auxFile = new File([], this.data.goalDoc.fileName, { type: this.data.goalDoc.fileType });
      this.file = auxFile;
    }
    this.form = this.formBuilder.group({
      fileFormControl: new FormControl(auxFile, [Validators.required]),
      docName: new FormControl(this.data?.goalDoc?.fileName, [Validators.required]),
    });
  }

  cancel() {
    this.dialogRef.close();
  }

  accept() {
    if (!this.form.valid) {
      this.form.get("fileFormControl").markAsTouched();
      this.form.get("docName").markAsTouched();
    } else if (this.form.valid) {
      try {
        // Renamed file with docName
        const extension = this.file.name.split('.').pop();
        const name = this.form.get("docName").value.split('.').shift();

        const fileName = `${name}.${extension}`;
        const renamedFile = new File([this.file], fileName, { type: extension }); 
        this.dialogRef.close({id: this.data.goalDoc?.id, file: renamedFile, docName: this.form.get("docName").value});
      } catch (e) {
        console.error(e);
      }
    }
  }

  handleFileInput(event) {
    let eventFile = event.target.files[0];
    let size = eventFile.size;
    if (size > this.globals.extranet_limite_adjuntos) { //20971520 Bytes
      //Inicializamos los ficheros
      this.form.controls["fileFormControl"].setValue([]);
      this.file = null;

      let titulo = "El archivo adjunto supera el límite de 20MB";
      this.translate.get('ARCHIVOS_ADJUNTOS_LIMITE').subscribe((res: string) => {
        titulo = res;
      });

      this.utils.mostrarMensajeSwalFire('error', titulo, '', 'var(--blue)', false);
    } else { 
      this.form.controls.fileFormControl.setValue(eventFile);
      this.file = eventFile;
    }
  }
  
  hasFile() {
    return this.form.get('fileFormControl').value !== null;
  }
  
  deleteFile() {
    this.form.controls.fileFormControl.setValue(null);
  }
  getFileExtension() {
    const extension = this.file.name.split('.').pop();
    let errorMessage;
    this.translate.get('PLANIFICACION_PRL.FILE_EXTENSION.NOT_VALID').subscribe((res: string) => {
      errorMessage = res;
    });
    if (Object.keys(AllowedExtensions).find(key => AllowedExtensions[key] === extension) === undefined) {
      return errorMessage;
    }
  }

  getDateErrorMessage() {
    if (this.form.controls.expectedDate.hasError("matDatepickerParse")) {
      return this.translate.instant("PLANIFICACION_PRL.ERRORES.FECHA_INVALIDA");
    }
    if (this.form.controls.executionDate.hasError("matDatepickerParse")) {
      return this.translate.instant("PLANIFICACION_PRL.ERRORES.FECHA_INVALIDA");
    }
    return this.translate.instant(
      "PLANIFICACION_PRL.ERRORES.REQUIERE_FECHA_PREVISTA"
    );
  }
}
