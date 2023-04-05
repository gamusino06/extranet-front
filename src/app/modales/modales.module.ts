import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ModalesComponent } from "./modales.component";
import { ResetPassComponent } from "./reset-pass/reset-pass.component";
import { RgpdComponent } from "./rgpd/rgpd.component";
import { MatExpansionModule } from "@angular/material/expansion";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { AcceptGdprComponent } from "./acceptGdpr/acceptGdpr.component";
import { AcceptGdprDocumentComponent } from "./acceptGdprDocument/acceptGdprDocument.component";
import { MatCardModule } from "@angular/material/card";
import { ModalModifyBillsMail } from "./modalModifyBillsMail/modalModifyBillsMail.component";
import { MatDialogModule } from "@angular/material/dialog";
import { ModalEmailBillsPoliticts } from "./modalEmailBillsPoliticts/modalEmailBillsPoliticts.component";
import { ModalCambiarIdiomaComponent } from "./modal-cambiar-idioma/modal-cambiar-idioma.component";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { PdfView } from "./pdfView/pdfView.component";
import { PdfViewerModule } from "ng2-pdf-viewer";
import { ShareDocumentComponent } from "./shareDocument/shareDocument.component";
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";
import { HistoricoAccionesDocumentoComponent } from "./historicoAccionesDocumento/historicoAccionesDocumento.component";
import { HistoricoAccionesGdprUsuarioComponent } from "./historicoAccionesGdprUsuario/historicoAccionesGdprUsuario.component";
import { ConsultaGeneralComponent } from "./consultaGeneral/consultaGeneral.component";
import { MatTableModule } from "@angular/material/table";
import {
  MatPaginatorIntl,
  MatPaginatorModule,
} from "@angular/material/paginator";
import { getPaginatorIntl } from "../extranet/paginator-intl";
import { ShowGdprComponent } from "./showGdpr/showGdpr.component";
import { Translate } from "../translate.module";
import { TrabajadoresComponent } from "./trabajadores/trabajadores.component";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatSortModule } from "@angular/material/sort";
import { MatNativeDateModule, MAT_DATE_LOCALE } from "@angular/material/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatTableExporterModule } from "mat-table-exporter";
import { NgxSpinnerModule } from "ngx-spinner";
import { NgxPageScrollModule } from "ngx-page-scroll";
import { NgxPageScrollCoreModule } from "ngx-page-scroll-core";
import { NgxScrollTopModule } from "ngx-scrolltop";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { Globals } from "../extranet/globals";
import { MatRadioModule } from "@angular/material/radio";
import { MatSelectModule } from "@angular/material/select";
import { MatGridListModule } from "@angular/material/grid-list";
import { SubidaProteccionDatosComponent } from "./subidaProteccionDatos/subidaProteccionDatos.component";
import { SeleccionEmpresasCentrosComponent } from "./seleccionEmpresasCentros/seleccionEmpresasCentros.component";
import { ReproductorVideoComponent } from "./reproductorVideo/reproductorVideo.component";
import { ModalModificarAltaFavorito } from "./modalModificarAltaFavorito/modalModificarAltaFavorito.component";
import { PillsViewComponent } from "./pills-view/pills-view.component";
import { BajaTrabajadorComponent } from "./baja-trabajador/baja-trabajador.component";
import { AltaIndividualTrabajadorComponent } from "./alta-individual-trabajador/alta-individual-trabajador.component";
import { AssigmentContractEditComponent } from "./AssigmentContractEdit/assigmentContractEdit.component";
import { AssigmentContractsEmptyModalComponent } from "./assigmentContractsEmptyModal/assigmentContractsEmptyModal.component";
import { AssigmentContractFormModalComponent } from "./assigmentContractFormModal/assigmentContractFormModal.component";
import { ExtranetModule } from "../extranet/extranet.module";
import { NewResetPassComponent } from "./new-reset-pass/new-reset-pass.component";
import { NewRgpdComponent } from "./new-rgpd/new-rgpd.component";
import { ErrorLoginComponent } from "./error-login/error-login.component";
import { ModalConfirmacionComponent } from "./modal-confirmacion/modal-confirmacion.component";
import { ModalNuevaFormacionComponent } from "./modal-nueva-formacion/modal-nueva-formacion.component";
import { SharedModule } from "../shared/shared.module";
import { ModalNuevoInformePtComponent } from "../extranet/prevencion-documentos-tecnicos/components/add-new-inform/modal-nuevo-informe-pt.component";
// tslint:disable-next-line:max-line-length
import { ModalEditarInformePtComponent } from "../extranet/prevencion-documentos-tecnicos/components/edit-inform/modal-editar-informe-pt.component";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { AddAuthorizationDocumentComponent } from './addAuthorizationDocument/addAuthorizationDocument.component';
import {ModalNuevoInformeVsComponent} from '../extranet/medica-informes-medicos/components/add-new-inform/modal-nuevo-informe-vs.component';

@NgModule({
  imports: [
    CommonModule,
    MatExpansionModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatCardModule,
    MatDialogModule,
    MatCheckboxModule,
    PdfViewerModule,
    CKEditorModule,
    MatTableModule,
    MatPaginatorModule,
    Translate,
    BrowserModule,
    BrowserAnimationsModule,
    MatSortModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatCardModule,
    MatTableExporterModule,
    NgxSpinnerModule,
    NgxPageScrollModule,
    NgxPageScrollCoreModule,
    NgxScrollTopModule,
    DragDropModule,
    FontAwesomeModule,
    MatRadioModule,
    MatSelectModule,
    MatGridListModule,
    ExtranetModule,
    SharedModule,
    MatButtonToggleModule,
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: "es-ES" },
    { provide: MatPaginatorIntl, useValue: getPaginatorIntl() },
    { provide: Globals },
  ],
  declarations: [
    ModalesComponent,
    ResetPassComponent,
    RgpdComponent,
    AcceptGdprComponent,
    AcceptGdprDocumentComponent,
    ModalModifyBillsMail,
    ModalEmailBillsPoliticts,
    ModalCambiarIdiomaComponent,
    ModalNuevoInformePtComponent,
    ModalEditarInformePtComponent,
    ModalNuevoInformeVsComponent,
    AssigmentContractEditComponent,
    AssigmentContractsEmptyModalComponent,
    AssigmentContractFormModalComponent,
    PdfView,
    ShareDocumentComponent,
    HistoricoAccionesDocumentoComponent,
    HistoricoAccionesGdprUsuarioComponent,
    ConsultaGeneralComponent,
    ShowGdprComponent,
    TrabajadoresComponent,
    SubidaProteccionDatosComponent,
    SeleccionEmpresasCentrosComponent,
    ReproductorVideoComponent,
    ModalModificarAltaFavorito,
    PillsViewComponent,
    BajaTrabajadorComponent,
    AltaIndividualTrabajadorComponent,
    NewResetPassComponent,
    NewRgpdComponent,
    ErrorLoginComponent,
    ModalConfirmacionComponent,
    ModalNuevaFormacionComponent,
    AddAuthorizationDocumentComponent
  ],
})
export class ModalesModule {}
