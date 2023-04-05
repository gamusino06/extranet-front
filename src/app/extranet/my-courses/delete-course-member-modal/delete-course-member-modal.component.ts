import {Component, ElementRef, HostListener, Input, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-delete-course-modal',
  templateUrl: './delete-course-member-modal.component.html',
  styleUrls: ['./delete-course-member-modal.component.css'],
  providers: [],
})
export class DeleteCourseMemberModalComponent implements OnInit {

  @Input() title: string;

  private inited;
  clicked = '';
  constructor(public dialogRef: MatDialogRef<DeleteCourseMemberModalComponent>, private elem: ElementRef) {
  }

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
