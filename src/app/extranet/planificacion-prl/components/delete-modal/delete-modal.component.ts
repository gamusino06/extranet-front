import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
} from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "app-delete-modal",
  templateUrl: "./delete-modal.component.html",
  styleUrls: ["./delete-modal.component.scss"],
})
export class DeleteModalComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<DeleteModalComponent>,
    private elem: ElementRef
  ) {}

  private inited;
  clicked = "";

  @Input() title: string;

  @HostListener("document:click", ["$event"])
  DocumentClick(event: Event) {
    if (!this.elem.nativeElement.contains(event.target)) {
      this.dialogRef.afterOpened().subscribe(() => {
        this.inited = true;
      });
      if (this.inited === true) {
        this.dialogRef.close(false);
      }
    } else {
    }
  }

  ngOnInit() {}

  cancel() {
    this.dialogRef.close(false);
  }

  accept() {
    this.dialogRef.close(true);
  }
}
