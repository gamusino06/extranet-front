import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MyCoursesService} from '../../../services/myCourses.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-massive-student',
  templateUrl: './massive-student.component.html',
  styleUrls: ['./massive-student.component.css'],
  providers: [],
})
export class MassiveStudentComponent implements OnInit {
  form: FormGroup;
  continueReadingButton = false;
  legalText = '';

  constructor(
    private formBuilder: FormBuilder,
    private myCoursesService: MyCoursesService,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
    public translate: TranslateService,

    public dialogRef: MatDialogRef<MassiveStudentComponent>) {

  }
  async ngOnInit(): Promise<void> {
    this.initForm();
    this.getLegalTextTranslate();
  }

  initForm() {
    this.form = this.formBuilder.group({
      file: new FormControl(null),
    });
  }
  cancel() {
    this.dialogRef.close();
  }

  downloadStudentTemplate() {
    this.myCoursesService.getCourseMembersTemplate().subscribe(response => {
      this.downloadFile(response.file, response.fileName);
    });
  }
  accept() {
    if (this.form.valid) {
      const file =  this.form.controls.file.value;
      const extension = file.name.split('.').pop();
      if (extension === 'xlsx') {
        this.dialogRef.close(this.form);
      }
    }
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
  getFileExtension() {
    const file =  this.form.controls.file.value;
    const extension = file.name.split('.').pop();
    let errorMessage;
    this.translate.get('MY_COURSE.MASSIVE_COURSE.FILE_EXTENSION.NOT_VALID').subscribe((res: string) => {
      errorMessage = res;
    });
    if (extension !== 'xlsx') {
      return errorMessage;
    }
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
