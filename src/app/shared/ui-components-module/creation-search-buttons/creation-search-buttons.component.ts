import { Component, Input } from "@angular/core";

// import { coerceBooleanProperty } from "../utils/coercion-boolean-property.util";

@Component({
  selector: "creation-search-buttons",
  templateUrl: "./creation-search-buttons.component.html",
  styleUrls: ["./creation-search-buttons.component.scss"],
})
export class CreationSearchButtonsComponent {
  @Input() creationLabel: string;
  @Input() massiveLabel: string;
  @Input() cleanLabel: string;
  @Input() searchLabel: string;
}
