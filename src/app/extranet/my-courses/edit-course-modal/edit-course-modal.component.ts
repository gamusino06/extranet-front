import {Component, ElementRef, HostListener, Input, OnInit, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-edit-course-modal',
  templateUrl: './edit-course-modal.component.html',
  styleUrls: ['./edit-course-modal.component.css'],
  providers: [],
})
export class EditCourseModalComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<EditCourseModalComponent>, private elem: ElementRef, @Inject(MAT_DIALOG_DATA) public data: any) {
  }
  private inited;
  clicked = '';

  @Input() title: string;

  @HostListener('document:click', ['$event'])
  DocumentClick(event: Event) {
    if (!this.elem.nativeElement.contains(event.target)) {
      this.dialogRef.afterOpened().subscribe(() => {
        this.inited = true;
      });
      if (this.inited === true) {
        this.dialogRef.close(false);
        }
    }
  }

  ngOnInit() {

  }

  cancel() {
    this.dialogRef.close(false);
  }

  accept() {
    this.dialogRef.close(true);
  }
}
