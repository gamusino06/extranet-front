import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {DomSanitizer} from "@angular/platform-browser";
import {MyErrorStateMatcher} from "../reproductorVideo/reproductorVideo.component";

@Component({
  selector: 'app-pills-view',
  templateUrl: './pills-view.component.html',
  styleUrls: ['./pills-view.component.css']
})
export class PillsViewComponent implements OnInit {

  url: any;
  tituloVideo = "";
  // iframe: any;

  constructor(
    public dialogRef: MatDialogRef<PillsViewComponent>,
    private sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    //this.url = this.data.url;
    this.tituloVideo = this.data.tituloVideo;
    // this.iframe = this.sanitizer.bypassSecurityTrustHtml(this.data.iframe);  //Para meterlo por el innerHtml
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(this.data.url);
    //this.loadVideo();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  matcher = new MyErrorStateMatcher();

}
