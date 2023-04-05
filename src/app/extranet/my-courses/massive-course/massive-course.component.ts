import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {UserService} from '../../../services/user.service';
import {MyCoursesService} from '../../../services/myCourses.service';
import {NgxSpinnerService} from 'ngx-spinner';
import Swal from 'sweetalert2';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-massive-course',
    templateUrl: './massive-course.component.html',
    styleUrls: ['./massive-course.component.css'],
    providers: [],
})

export class MassiveCourseComponent implements OnInit {
    form: FormGroup;
    empresas: any[];
    continueReadingButton: boolean = false;
    legalText = '';

    constructor(private formBuilder: FormBuilder,
                private userService: UserService,
                private myCoursesService: MyCoursesService,
                private spinner: NgxSpinnerService,
                public dialog: MatDialog,
                public translate: TranslateService,
                public dialogRef: MatDialogRef<MassiveCourseComponent>) {
    }

    async ngOnInit(): Promise<void> {
        this.initForm();
        this.getUserData();
        this.getLegalTextTranslate();

    }

    initForm() {
        this.form = this.formBuilder.group({
            empresaForm: new FormControl('', [Validators.required]),
            centroForm: new FormControl(''),
            file: new FormControl(null),
        });
    }

    getUserData(): void {
        this.spinner.show();
        this.userService.getUser().subscribe(user => {
            this.empresas = user.empresas;
            this.updateEmpresasYCentros();
            this.spinner.hide();
        });
    }

    updateEmpresasYCentros() {
        if (this.empresas.length === 1) {
            this.form.controls.empresaForm.setValue(this.empresas[0].idEmpresa);
        }
    }

    cancel() {
        this.dialogRef.close();
    }

    downloadTemplate() {
        this.myCoursesService.getTemplate().subscribe(response => {
            this.downloadFile(response.file, response.fileName);
        });
    }

    accept() {
        if (this.form.valid) {
            const file = this.form.controls.file.value;
            const extension = file.name.split('.').pop();
            if (extension === 'xlsx') {
                this.dialogRef.close(this.form);
            }
        } else {
          this.form.get('empresaForm').markAsTouched();
        }
    }

    getFileExtension() {
        const file = this.form.controls.file.value;
        const extension = file.name.split('.').pop();
        let errorMessage;
        this.translate.get('MY_COURSE.MASSIVE_COURSE.FILE_EXTENSION.NOT_VALID').subscribe((res: string) => {
            errorMessage = res;
        });
        if (extension !== 'xlsx') {
            return errorMessage;
        }
    }

    showErrorMessage(message) {
        return Swal.fire({
            icon: 'error',
            title: message,
            confirmButtonColor: 'var(--blue)',
            allowOutsideClick: false
        });
    }

    downloadFile(data, fileNameExtension) {
        const byteString = atob(data);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        const FileSaver = require('file-saver');
        const blob = new Blob([ab]);
        FileSaver.saveAs(blob, fileNameExtension);
    }

    handleFileInput(e) {
        this.form.controls.file.setValue(e.target.files[0]);
    }

    deleteFile() {
        this.form.controls.file.setValue(null);
    }

    hasFile() {
        return this.form.get('file').value === null;
    }

    isContinueReading() {
        return this.continueReadingButton;
    }

    continueReading() {
        this.continueReadingButton = !this.continueReadingButton;
    }

    getLegalTextTranslate() {
        this.legalText = 'MY_COURSE.LEGAL_TEXT';
        this.translate.get('MY_COURSE.LEGAL_TEXT').subscribe((res: string) => {
            this.legalText = res;
        });
    }
}
