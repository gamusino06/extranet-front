import { Component, OnInit, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "ui-button",
  templateUrl: "./ui-button.component.html",
  styleUrls: ["./ui-button.component.scss"],
})
export class UiButtonComponent implements OnInit {
  @Input() label: "BOTON";
  @Input() type: "primary" | "secondary" | "clean" = "primary";
  @Input() icon: string;
  @Input() imageSrc: string;
  @Input() disabled = false;
  @Output() onClick = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}

  get hasIconOrImage(): boolean {
    return !!this.icon || !!this.imageSrc;
  }

  get buttonClasses(): string {
    return `ui-button--${this.type}`;
  }
}
