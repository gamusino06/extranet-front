import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Translate } from "../../translate.module";
// import { CreationSearchButtonsComponent } from "./creation-search-buttons/creation-search-buttons.component";
import { CreationButtonsComponent } from "./creation-buttons/creation-buttons.component";
import { SearchButtonsComponent } from "./search-buttons/search-buttons.component";
import { UiButtonComponent } from './ui-button/ui-button.component';

@NgModule({
  imports: [Translate, CommonModule],
  declarations: [
    CreationButtonsComponent,
    SearchButtonsComponent,
    UiButtonComponent
  ],
  exports: [
    CreationButtonsComponent,
    SearchButtonsComponent,
    UiButtonComponent
  ],
})
export class UIComponentsModule {}
