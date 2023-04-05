import { Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {ErrorStateMatcher} from '@angular/material/core';
import {FormControl, FormGroup, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import * as $ from 'jquery';
import {DomSanitizer} from '@angular/platform-browser';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'reproductorVideo',
  templateUrl: 'reproductorVideo.component.html',
  styleUrls: ['reproductorVideo.component.scss'],
})
export class ReproductorVideoComponent {

  //url = "";
  tituloVideo = "";
  iframe: any;

  constructor(
    public dialogRef: MatDialogRef<ReproductorVideoComponent>,
    private sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {
    //this.url = this.data.url;
    this.tituloVideo = this.data.tituloVideo;
    this.iframe= this.sanitizer.bypassSecurityTrustHtml(this.data.iframe);  //Para meterlo por el innerHtml
    //this.loadVideo();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }


  matcher = new MyErrorStateMatcher();

  //Método que introduce la url mediante jquery, ya que dentro de HTML, produce un error,
  //debido a que Angular previene secuencias de comando entre sitios (XSS)
  /*loadVideo(){
     var frame = $('#frame');
     var url = this.url;
     frame.attr('src',url).show();
  }*/
}
