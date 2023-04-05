import { UserHeaderComponent } from "./user-header/user-header.component";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ExtranetRoutesModule } from "./extranet-routing.module";
import { ExtranetComponent } from "./extranet.component";
import { MedicaInformesMedicosComponent } from "./medica-informes-medicos/medica-informes-medicos.component";
import { PrevingBillsComponent } from "./preving-bills/preving-bills.component";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import {
  MatPaginatorIntl,
  MatPaginatorModule,
} from "@angular/material/paginator";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatTabsModule } from "@angular/material/tabs";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatSelectModule } from "@angular/material/select";
import { MAT_DATE_LOCALE, MatNativeDateModule } from "@angular/material/core";
import { MatInputModule } from "@angular/material/input";
import { MatListModule } from "@angular/material/list";
import { MatMenuModule } from "@angular/material/menu";
import { MatTooltipModule } from "@angular/material/tooltip";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { ModulesComponent } from "./modules/modules.component";
import { HistoricoCitasComponent } from "./historico-citas/historico-citas.component";
import { AltaUsuarioComponent } from "./alta-usuario/alta-usuario.component";
import { MatIconModule } from "@angular/material/icon";
import { BuscadorUsuariosComponent } from "./buscador-usuarios/buscador-usuarios.component";
import { ModificarUsuarioComponent } from "./modificar-usuario/modificar-usuario.component";
import { MiPerfilComponent } from "./mi-perfil/mi-perfil.component";
import { NgxSpinnerModule } from "ngx-spinner";
import { MapComponent } from "./map/map.component";
import { MatToolbarModule } from "@angular/material/toolbar";
// import { MatSelectInfiniteScrollModule } from 'ng-mat-select-infinite-scroll';
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import { NgxPageScrollModule } from "ngx-page-scroll";
import { NgxPageScrollCoreModule } from "ngx-page-scroll-core";
import { NgxScrollTopModule } from "ngx-scrolltop";
import { AngularEditorModule } from "@kolkov/angular-editor";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";

/*librerias importadas*/
import { DragDropModule } from "@angular/cdk/drag-drop";
import { CambiarPasswordComponent } from "./cambiar-password/cambiar-password.component";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { MatRadioModule } from "@angular/material/radio";
import { ContactoComponent } from "./contacto/contacto.component";
import { MatCardModule } from "@angular/material/card";
import { DelegacionesComponent } from "./delegaciones/delegaciones.component";
import { MatTableExporterModule } from "mat-table-exporter";
import { CentrosTrabajoComponent } from "./centros-trabajo/centros-trabajo.component";
import { ContratosComponent } from "./contratos/contratos.component";
import { CertificadosComponent } from "./certificados/certificados.component";
import { TratamientoComponent } from "./tratamiento/tratamiento.component";
import { VigilanciaInformesAptitudComponent } from "./vigilancia-informes-aptitud/vigilancia-informes-aptitud.component";
import { getPaginatorIntl } from "./paginator-intl";
import { Globals } from "./globals";
import { FormacionCertificadosComponent } from "./formacion-certificados/formacion-certificados.component";
import { VigilanciaReconocimientosMedicosComponent } from "./vigilancia-reconocimientos-medicos/vigilancia-reconocimientos-medicos.component";
import { PrevencionDocumentosTecnicosComponent } from "./prevencion-documentos-tecnicos/prevencion-documentos-tecnicos.component";
import { PrevencionTrabajosRealizadosComponent } from "./prevencion-trabajos-realizados/prevencion-trabajos-realizados.component";
import { MyCoursesComponent } from "./my-courses/my-courses.component";
import { CourseMembersComponent } from "./my-courses/members/course-members.component";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { TruncatePipe } from "./truncate.component.pipe";
import { CreateCourseFormComponent } from "./my-courses/create-course-form/create-course-form.component";
import { CreateStudentFormComponent } from "./my-courses/create-student-form/create-student-form.component";
import { ContactManagerComponent } from "./my-courses/contact-manager/contact-manager.component";
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";
import { SelectCentroFilterV2Component } from "./my-courses/components/select-centro-filter-v2/select-centro-filter-v2.component";
import { DeleteCourseModalComponent } from "./my-courses/delete-course-modal/delete-course-modal.component";
import { EditCourseModalComponent } from "./my-courses/edit-course-modal/edit-course-modal.component";
import { MassiveCourseComponent } from "./my-courses/massive-course/massive-course.component";
import { MassiveDocumentErrorComponent } from "./my-courses/massive-document-error/massive-document-error.component";
import { MassiveStudentComponent } from "./my-courses/massive-student/massive-student.component";
import { MassiveErrorComponent } from "./my-courses/massive-error/massive-error.component";
import { NavTabsComponent } from "./components/nav-tabs/nav-tabs.component";
import { PtFormacionComponent } from "./ficha-persona-trabajadora/pt-formacion/pt-formacion.component";
import { PtInformacionComponent } from "./ficha-persona-trabajadora/pt-informacion/pt-informacion.component";
import { PtReconocimientosComponent } from "./ficha-persona-trabajadora/pt-reconocimientos/pt-reconocimientos.component";
import { PtEpiComponent } from "./ficha-persona-trabajadora/pt-epi/pt-epi.component";
import { PtAccidentesComponent } from "./ficha-persona-trabajadora/pt-accidentes/pt-accidentes.component";
import { PtAutorizacionesComponent } from "./ficha-persona-trabajadora/pt-autorizaciones/pt-autorizaciones.component";
import { PtDocumentacionComponent } from "./ficha-persona-trabajadora/pt-documentacion/pt-documentacion.component";
import { PtCitacionesComponent } from "./ficha-persona-trabajadora/pt-citaciones/pt-citaciones.component";
import { PtTrabajoADistanciaComponent } from "./ficha-persona-trabajadora/pt-trabajo-a-distancia/pt-trabajo-a-distancia.component";

import { DeleteCourseMemberModalComponent } from "./my-courses/delete-course-member-modal/delete-course-member-modal.component";
import { PrevencionTrabajadoresComponent } from "./ficha-persona-trabajadora/prevencion-trabajadores.component";
import { PlanificacionPrlComponent } from "./planificacion-prl/planificacion/planificacion-prl.component";
import { ObjetivosPrlComponent } from "./planificacion-prl/objetivos/objetivos-prl.component";
import { CalendarioCursosComponent } from "./calendario-cursos/calendario-cursos.component";
import { sortCentrosPipe } from "./sort-centros.pipe";
import { searchFilterPipe } from "./search-filter.pipe";
import { Translate } from "../translate.module";
import { CitacionWebProvinciaComponent } from "./citacion-web-provincia/citacion-web-provincia.component";
import { CitacionWebCalendarioComponent } from "./citacion-web-calendario/citacion-web-calendario.component";
import { CitacionWebTrabajadorComponent } from "./citacion-web-trabajador/citacion-web-trabajador.component";
import { CalendarModule, DateAdapter } from "angular-calendar";
import { adapterFactory } from "angular-calendar/date-adapters/date-fns";
import { JuridicoComponent } from "./juridico/juridico.component";
import { PrevencionTecnicaInitComponent } from "./prevencion-tecnica-init/prevencion-tecnica-init.component";
import { VigilanciaSaludInitComponent } from "./vigilancia-salud-init/vigilancia-salud-init.component";
import { AdministracionInitComponent } from "./administracion-init/administracion-init.component";
import { FormacionInitComponent } from "./formacion-init/formacion-init.component";
import { InformacionInitComponent } from "./informacion-init/informacion-init.component";
import { UsuarioInitComponent } from "./usuario-init/usuario-init.component";
import { SelectEmpresaComponent } from "./components/select-empresa/select-empresa.component";
import { SelectEmpresaFilterComponent } from "./components/select-empresa-filter/select-empresa-filter.component";
import { SelectCentroComponent } from "./components/select-centro/select-centro.component";
import { SelectCentroFilterComponent } from "./components/select-centro-filter/select-centro-filter.component";
import { SelectProvinciaComponent } from "./components/select-provincia/select-provincia.component";
import { SelectLocalidadComponent } from "./components/select-localidad/select-localidad.component";
import { ProgressBarComponent } from "./components/progress-bar/progress-bar.component";
import { PopupListComponent } from "./components/popup-list/popup-list.component";
import { CitacionWebHoraComponent } from "./citacion-web-hora/citacion-web-hora.component";
import { AyudaInitComponent } from "./ayuda/ayuda-init/ayuda-init.component";
import { PaginaEnContruccionComponent } from "./pagina-en-construccion/pagina-en-construccion.component";
import { VideoAyudasComponent } from "./ayuda/videoayuda/videoayudas/videoayudas.component";
import { BonusFundaeInfoComponent } from "./bonus-fundae-info/bonus-fundae-info.component";
import { ListadoVideoAyudasComponent } from "./ayuda/videoayuda/listado-videoayudas/listado-videoayudas.component";
import { ModificarVideoAyudaComponent } from "./ayuda/videoayuda/modificar-videoayuda/modificar-videoayuda.component";
import { AltaVideoAyudaComponent } from "./ayuda/videoayuda/alta-videoayuda/alta-videoayuda.component";
import { FaqsComponent } from "./ayuda/faq/faqs/faqs.component";
import { ListadoFaqsComponent } from "./ayuda/faq/listado-faqs/listado-faqs.component";
import { ModificarFaqComponent } from "./ayuda/faq/modificar-faq/modificar-faq.component";
import { AltaFaqComponent } from "./ayuda/faq/alta-faq/alta-faq.component";
import { VigilanciaInformesMedicosAsociadosComponent } from "./vigilancia-informes-medicos-asociados/vigilancia-informes-medicos-asociados.component";
import { PrevencionDocumentosPersonasTrabajadorasComponent } from "./prevencion-documentos-personas-trabajadoras/prevencion-documentos-personas-trabajadoras.component";
import { InformacionGeneralComponent } from "./informacion-general/informacion-general.component";
import { DocumentacionJuridicaComponent } from "./documentacion-juridica/documentacion-juridica.component";
import { ConsultasPrlComponent } from "./consultas-prl/consultas-prl.component";
import { DocumentacionGeneralComponent } from "./documentacion-general/documentacion-general.component";
import { ServiciosPrestadosComponent } from "./servicios-prestados/servicios-prestados.component";
import { NormativaGeneralPrlComponent } from "./normativa-general-prl/normativa-general-prl.component";
import { FormacionPrlComponent } from "./formacion-prl/formacion-prl.component";
import { BusquedaPipe } from "./busqueda.pipe";
import { NuevaConsultaComponent } from "./consultas-prl/nueva-consulta/nueva-consulta.component";
import { DescargaArchivoComponent } from "./consultas-prl/descarga-archivo/descarga-archivo.component";
import { DescargaDocComponent } from "./documentacion-juridica/descarga-doc/descarga-doc.component";
import { EmployeeAppointmentManagementComponent } from "./appointment-management/employee-appointment-management/employee-appointment-management.component";
import { CompanyAppointmentManagementComponent } from "./appointment-management/company-appointment-management/company-appointment-management.component";
import { AppointmentManagementComponent } from "./appointment-management/components/appointment-management/appointment-management.component";
import { CompanyCenterSelectorComponent } from "./appointment-management/components/company-center-selector/company-center-selector.component";
import { ConfirmationModalComponent } from "./appointment-management/components/modals/confirmation-modal/confirmation-modal.component";
import { MassiveEditModalComponent } from "./appointment-management/components/modals/massive-edit-modal/massive-edit-modal.component";
import { CommunityProvinceCenterSelectorComponent } from "./appointment-management/components/community-province-center-selector/community-province-center-selector.component";
import { LanguageModalComponent } from "./appointment-management/components/modals/language-modal/language-modal.component";
import { SearchGenericFilterPipe } from "./search-generic-filter.pipe";
import { ModalXlsComponent } from "./modal-xls/modal-xls.component";
import { AssignmentContractsComponent } from "./assignment-contracts/assignment-contracts.component";
import { SafeUrlPipe } from "./safeUrl.pipe";
import { OffersNoAcceptedComponent } from "./offers-no-accepted/offers-no-accepted.component";
import { NotificacionesFrameComponent } from "./notificacion-mejoras/notificaciones-frame/notificaciones-frame.component";
import { GoalModalComponent } from "./planificacion-prl/objetivos/components/goal-modal/goal-modal.component";
import { SelectCentroFilterV2PptComponent } from "./planificacion-prl/components/select-centro-filter-v2-ppt/select-centro-filter-v2-ppt.component";
import { GoalDocsModalComponent } from "./planificacion-prl/objetivos/components/goal-docs-modal/goal-docs-modal.component";
import { GoalAddDocsModalComponent } from "./planificacion-prl/objetivos/components/goal-add-docs-modal/goal-add-docs-modal.component";
import { GoalDetailModalComponent } from "./planificacion-prl/objetivos/components/goal-detail-modal/goal-detail-modal.component";
import { PtDocumentacionTableComponent } from "./ficha-persona-trabajadora/pt-documentacion/pt-documentacion-table/pt-documentacion-table.component";
import { SelectProvinciaWpComponent } from "./components/select-provincia-wp/select-provincia-wp.component";
import { ExportToExcelModalComponent } from "./planificacion-prl/components/export-to-excel-modal/export-to-excel-modal.component";
import { PreventiveMeasureModalComponent } from "./planificacion-prl/planificacion/components/preventive-measure-modal/preventive-measure-modal.component";
import { PreventiveMeasureModalExcelComponent } from "./planificacion-prl/planificacion/components/preventive-measure-add-excel/preventive-measure-modal-excel.component";
import { PreventiveMeasureExcelErrorModalComponent } from "./planificacion-prl/planificacion/components/preventive-measure-excel-error-modal/preventive-measure-excel-error-modal.component";
import { MatTreeModule } from "@angular/material/tree";
import { GoalPdfExportModalComponent } from "./planificacion-prl/objetivos/components/goal-pdf-export-modal/goal-pdf-export-modal.component";
import { DeleteModalComponent } from "./planificacion-prl/components/delete-modal/delete-modal.component";
import { EmailingModalComponent } from "./planificacion-prl/components/emailing-modal/emailing-modal.component";
import { PreventiveMeasureDetailModalComponent } from "./planificacion-prl/planificacion/components/preventive-measure-detail-modal/preventive-measure-detail-modal.component";
import { DropdownMenuComponent } from './components/dropdown-menu/dropdown-menu.component';
import { SharedModule } from "../shared/shared.module";
import { PlanificacionesPrlComponent } from "./planificacion-prl/planificaciones/planificaciones-prl.component";
import { JobProcedureListComponent } from "./job-procedures/job-procedure-list/job-procedure-list.component";
import { JobProcedureModalComponent } from "./job-procedures/job-procedure-modal/job-procedure-modal.component";
import { PreventiveMeasureDocsModalComponent } from "./planificacion-prl/planificacion/components/preventive-measure-docs-modal/preventive-measure-docs-modal.component";
import { GeneratePreventivePlanningModalComponent } from "./planificacion-prl/components/generate-preventive-planning-modal/generate-preventive-planning-modal.component";
import { PreventiveMeasureMassiveModalComponent } from "./planificacion-prl/planificacion/components/preventive-measure-massive-modal/preventive-measure-massive-modal.component";
import { DocsModalComponent } from "./job-procedures/components/docs-modal/docs-modal.component";
import { SelectLocalidadWpComponent } from './components/select-localidad-wp/select-localidad-wp.component';
import { DelegacionesWpComponent } from './delegaciones-wp/delegaciones-wp.component';
import {PtAutorizacionTableComponent} from './ficha-persona-trabajadora/pt-autorizaciones/pt-autorizacion-table/pt-autorizacion-table.component';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    CommonModule,
    ExtranetRoutesModule,
    MatSortModule,
    MatTableModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatProgressBarModule,
    MatListModule,
    MatMenuModule,
    MatTooltipModule,
    MatIconModule,
    MatRadioModule,
    MatCardModule,
    MatTableExporterModule,
    MatTabsModule,
    MatSlideToggleModule,
    NgxSpinnerModule,
    NgxPageScrollModule,
    NgxPageScrollCoreModule,
    NgxScrollTopModule,
    DragDropModule,
    FontAwesomeModule,
    Translate,
    MatToolbarModule,
    // MatSelectInfiniteScrollModule,
    NgxMatSelectSearchModule,
    AngularEditorModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    MatButtonToggleModule,
    CKEditorModule,
    MatTreeModule,
    SharedModule,
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: "es-ES" },
    { provide: MatPaginatorIntl, useValue: getPaginatorIntl() },
    { provide: Globals },
  ],
  declarations: [
    ExtranetComponent,
    MedicaInformesMedicosComponent,
    PrevingBillsComponent,
    SidebarComponent,
    ModulesComponent,
    UserHeaderComponent,
    HistoricoCitasComponent,
    AltaUsuarioComponent,
    BuscadorUsuariosComponent,
    ModificarUsuarioComponent,
    MiPerfilComponent,
    CambiarPasswordComponent,
    ContactoComponent,
    MapComponent,
    DelegacionesComponent,
    CentrosTrabajoComponent,
    ContratosComponent,
    CertificadosComponent,
    TratamientoComponent,
    VigilanciaInformesAptitudComponent,
    FormacionCertificadosComponent,
    VigilanciaReconocimientosMedicosComponent,
    PrevencionDocumentosTecnicosComponent,
    PrevencionTrabajosRealizadosComponent,
    PrevencionTrabajadoresComponent,
    PlanificacionPrlComponent,
    PlanificacionesPrlComponent,
    ObjetivosPrlComponent,
    CalendarioCursosComponent,
    CitacionWebProvinciaComponent,
    CitacionWebCalendarioComponent,
    CitacionWebTrabajadorComponent,
    CitacionWebHoraComponent,
    JuridicoComponent,
    PrevencionTecnicaInitComponent,
    VigilanciaSaludInitComponent,
    AdministracionInitComponent,
    FormacionInitComponent,
    InformacionInitComponent,
    UsuarioInitComponent,
    SelectEmpresaComponent,
    SelectEmpresaFilterComponent,
    SelectCentroComponent,
    SelectCentroFilterComponent,
    SelectCentroFilterV2Component,
    SelectProvinciaComponent,
    SelectLocalidadComponent,
    ProgressBarComponent,
    DropdownMenuComponent,
    PopupListComponent,
    AyudaInitComponent,
    PaginaEnContruccionComponent,
    VideoAyudasComponent,
    ListadoVideoAyudasComponent,
    ModificarVideoAyudaComponent,
    AltaVideoAyudaComponent,
    FaqsComponent,
    ListadoFaqsComponent,
    ModificarFaqComponent,
    AltaFaqComponent,
    PrevencionDocumentosPersonasTrabajadorasComponent,
    VigilanciaInformesMedicosAsociadosComponent,
    sortCentrosPipe,
    searchFilterPipe,
    InformacionGeneralComponent,
    ServiciosPrestadosComponent,
    DocumentacionGeneralComponent,
    DocumentacionJuridicaComponent,
    NormativaGeneralPrlComponent,
    FormacionPrlComponent,
    ConsultasPrlComponent,
    BusquedaPipe,
    SafeUrlPipe,
    NuevaConsultaComponent,
    DescargaArchivoComponent,
    DescargaDocComponent,
    EmployeeAppointmentManagementComponent,
    CompanyAppointmentManagementComponent,
    AppointmentManagementComponent,
    CompanyCenterSelectorComponent,
    ConfirmationModalComponent,
    MassiveEditModalComponent,
    CommunityProvinceCenterSelectorComponent,
    LanguageModalComponent,
    SearchGenericFilterPipe,
    TruncatePipe,
    ModalXlsComponent,
    OffersNoAcceptedComponent,
    BonusFundaeInfoComponent,
    AssignmentContractsComponent,
    NotificacionesFrameComponent,
    MyCoursesComponent,
    CourseMembersComponent,
    CreateCourseFormComponent,
    DeleteCourseModalComponent,
    EditCourseModalComponent,
    CreateStudentFormComponent,
    MassiveCourseComponent,
    MassiveDocumentErrorComponent,
    MassiveStudentComponent,
    MassiveErrorComponent,
    ContactManagerComponent,
    DeleteCourseMemberModalComponent,
    NotificacionesFrameComponent,
    NavTabsComponent,
    PtFormacionComponent,
    PtInformacionComponent,
    PtReconocimientosComponent,
    PtEpiComponent,
    PtAccidentesComponent,
    PtAutorizacionesComponent,
    PtDocumentacionComponent,
    PtCitacionesComponent,
    PtTrabajoADistanciaComponent,
    GoalModalComponent,
    GoalDocsModalComponent,
    GoalAddDocsModalComponent,
    SelectCentroFilterV2PptComponent,
    GoalDetailModalComponent,
    PreventiveMeasureModalComponent,
    PreventiveMeasureModalExcelComponent,
    PreventiveMeasureExcelErrorModalComponent,
    ExportToExcelModalComponent,
    PreventiveMeasureModalComponent,
    GoalPdfExportModalComponent,
    DeleteModalComponent,
    EmailingModalComponent,
    PreventiveMeasureDetailModalComponent,
    PtDocumentacionTableComponent,
    SelectProvinciaWpComponent,
    SelectLocalidadWpComponent,
    JobProcedureListComponent,
    GeneratePreventivePlanningModalComponent,
    PreventiveMeasureDocsModalComponent,
    JobProcedureModalComponent,
    PreventiveMeasureMassiveModalComponent,
    JobProcedureListComponent,
    PreventiveMeasureDocsModalComponent,
    GeneratePreventivePlanningModalComponent,
    JobProcedureModalComponent,
    DocsModalComponent,
    DelegacionesWpComponent,
    PtDocumentacionTableComponent,
    PtAutorizacionTableComponent
  ],
  exports: [
    DelegacionesComponent,
    DelegacionesWpComponent,
    MapComponent,
    SafeUrlPipe,
  ],
})
export class ExtranetModule {}
