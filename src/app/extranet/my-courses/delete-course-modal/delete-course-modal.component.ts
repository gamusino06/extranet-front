import {Component, ElementRef, HostListener, Input, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-delete-course-modal',
  templateUrl: './delete-course-modal.component.html',
  styleUrls: ['./delete-course-modal.component.css'],
  providers: [],
})
export class DeleteCourseModalComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<DeleteCourseModalComponent>,private elem: ElementRef) {
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
