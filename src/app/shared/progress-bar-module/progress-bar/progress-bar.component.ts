import { Component, Input } from "@angular/core";

import { coerceBooleanProperty } from "../utils/coercion-boolean-property.util";

@Component({
  selector: "progress-bar",
  templateUrl: "./progress-bar.component.html",
  styleUrls: ["./progress-bar.component.scss"],
})
export class ProgressBarComponent {
  @Input() progress: number;
  @Input()
  set hideProgress(value: boolean) {
    this._hideProgress = coerceBooleanProperty(value);
  }
  get hideProgress(): boolean {
    return this._hideProgress;
  }

  private _hideProgress: boolean = false;
}
