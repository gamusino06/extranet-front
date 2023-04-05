import { ParametrizedFilesTableComponent } from "./file-uploader-with-params/components/parametrized-files-table/parametrized-files-table.component";
import { ParametrizedUploaderComponent } from "./file-uploader-with-params/components/parametrized-uploader/parametrized-uploader.component";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatTableModule } from "@angular/material/table";
import { MatIconModule } from "@angular/material/icon";
import { FileUploaderWithParamsComponent } from "./file-uploader-with-params/file-uploader-with-params.component";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";

import { FileUploaderComponent } from "./file-uploader/file-uploader.component";

import { UploadFileBoxComponent } from "./components/upload-file-box/upload-file-box.component";
import { AddedFileListComponent } from "./components/added-file-list/added-file-list.component";
import { AddedFileRowComponent } from "./components/added-file-row/added-file-row.component";
import { DropableDirective } from "./directives/dropable.directive";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    FormsModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatTableModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
  ],
  declarations: [
    FileUploaderComponent,
    UploadFileBoxComponent,
    AddedFileListComponent,
    AddedFileRowComponent,
    DropableDirective,
    FileUploaderWithParamsComponent,
    ParametrizedUploaderComponent,
    ParametrizedFilesTableComponent,
  ],
  exports: [
    FileUploaderComponent,
    DropableDirective,
    FileUploaderWithParamsComponent,
  ],
})
export class FileUploaderModule {}
