import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";

import { FileUploaderModule } from "./file-uploader-module/file-uploader.module";
import { ProgressBarModule } from "./progress-bar-module/progress-bar.module";
import { UIComponentsModule } from "./ui-components-module/ui-components.module";
import { ConfirmationMessageModalComponent } from "src/app/shared/confirmation-modal/confirmation-modal.component";

@NgModule({
  imports: [
    CommonModule,
    FileUploaderModule,
    ProgressBarModule,
    TranslateModule,
    UIComponentsModule
  ],
  declarations: [ConfirmationMessageModalComponent],
  exports: [FileUploaderModule, ProgressBarModule, UIComponentsModule],

})
export class SharedModule {}
