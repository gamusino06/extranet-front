import {
  Directive,
  HostListener,
  ElementRef,
  Output,
  EventEmitter,
} from "@angular/core";

@Directive({
  selector: "[dropable]",
})
export class DropableDirective {
  @Output() onFileDropped: EventEmitter<{ target: { files: File[] } }> =
    new EventEmitter<{ target: { files: File[] } }>();
  @Output() onFileDragOver: EventEmitter<MouseEvent> =
    new EventEmitter<MouseEvent>();
  @Output() onFileDragLeave: EventEmitter<MouseEvent> =
    new EventEmitter<MouseEvent>();

  @HostListener("dragover", ["$event"]) onDragOver(event) {
    event.preventDefault();
    event.stopPropagation();

    this.el.nativeElement.classList.add("is-active");
    this.onFileDragOver.emit(event);
  }

  @HostListener("dragleave", ["$event"]) public onDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();

    this.el.nativeElement.classList.remove("is-active");
    this.onFileDragLeave.emit(event);
  }

  @HostListener("drop", ["$event"]) public onDrop(event) {
    event.preventDefault();
    event.stopPropagation();

    const files: File[] = event.dataTransfer.files;
    if (files.length > 0) this.onFileDropped.emit({ target: { files } });
    this.el.nativeElement.classList.remove("is-active");
  }

  constructor(private el: ElementRef) {}
}
