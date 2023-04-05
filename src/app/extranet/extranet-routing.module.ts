import { MessageCenterComponent } from "./message-center/message-center.component";
import { ExtranetComponent } from "./extranet.component";
import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { MedicaInformesMedicosComponent } from "./medica-informes-medicos/medica-informes-medicos.component";
import { PrevingBillsComponent } from "./preving-bills/preving-bills.component";
import { HistoricoCitasComponent } from "./historico-citas/historico-citas.component";
import { AltaUsuarioComponent } from "./alta-usuario/alta-usuario.component";
import { BuscadorUsuariosComponent } from "./buscador-usuarios/buscador-usuarios.component";
import { MiPerfilComponent } from "./mi-perfil/mi-perfil.component";
import { CambiarPasswordComponent } from "./cambiar-password/cambiar-password.component";
import { ContactoComponent } from "./contacto/contacto.component";
import { DelegacionesComponent } from "./delegaciones/delegaciones.component";
import { CentrosTrabajoComponent } from "./centros-trabajo/centros-trabajo.component";
import { ContratosComponent } from "./contratos/contratos.component";
import { CertificadosComponent } from "./certificados/certificados.component";
import { TratamientoComponent } from "./tratamiento/tratamiento.component";
import { VigilanciaInformesAptitudComponent } from "./vigilancia-informes-aptitud/vigilancia-informes-aptitud.component";
import { VigilanciaReconocimientosMedicosComponent } from "./vigilancia-reconocimientos-medicos/vigilancia-reconocimientos-medicos.component";
import { FormacionCertificadosComponent } from "./formacion-certificados/formacion-certificados.component";
import { PrevencionDocumentosTecnicosComponent } from "./prevencion-documentos-tecnicos/prevencion-documentos-tecnicos.component";
import { PrevencionTrabajosRealizadosComponent } from "./prevencion-trabajos-realizados/prevencion-trabajos-realizados.component";
import { CalendarioCursosComponent } from "./calendario-cursos/calendario-cursos.component";
import { CitacionWebProvinciaComponent } from "./citacion-web-provincia/citacion-web-provincia.component";
import { CitacionWebCalendarioComponent } from "./citacion-web-calendario/citacion-web-calendario.component";
import { CitacionWebTrabajadorComponent } from "./citacion-web-trabajador/citacion-web-trabajador.component";
import { JuridicoComponent } from "./juridico/juridico.component";
import { PrevencionTecnicaInitComponent } from "./prevencion-tecnica-init/prevencion-tecnica-init.component";
import { VigilanciaSaludInitComponent } from "./vigilancia-salud-init/vigilancia-salud-init.component";
import { AdministracionInitComponent } from "./administracion-init/administracion-init.component";
import { FormacionInitComponent } from "./formacion-init/formacion-init.component";
import { InformacionInitComponent } from "./informacion-init/informacion-init.component";
import { UsuarioInitComponent } from "./usuario-init/usuario-init.component";
import { PrevingExtranetGuard } from "../preving-extranet.guard";
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
import { PrevencionDocumentosPersonasTrabajadorasComponent } from "./prevencion-documentos-personas-trabajadoras/prevencion-documentos-personas-trabajadoras.component";
import { VigilanciaInformesMedicosAsociadosComponent } from "./vigilancia-informes-medicos-asociados/vigilancia-informes-medicos-asociados.component";
import { InformacionGeneralComponent } from "./informacion-general/informacion-general.component";
import { DocumentacionJuridicaComponent } from "./documentacion-juridica/documentacion-juridica.component";
import { ConsultasPrlComponent } from "./consultas-prl/consultas-prl.component";
import { DocumentacionGeneralComponent } from "./documentacion-general/documentacion-general.component";
import { ServiciosPrestadosComponent } from "./servicios-prestados/servicios-prestados.component";
import { NormativaGeneralPrlComponent } from "./normativa-general-prl/normativa-general-prl.component";
import { FormacionPrlComponent } from "./formacion-prl/formacion-prl.component";
import { CompanyAppointmentManagementComponent } from "./appointment-management/company-appointment-management/company-appointment-management.component";
import { EmployeeAppointmentManagementComponent } from "./appointment-management/employee-appointment-management/employee-appointment-management.component";
import { OffersNoAcceptedComponent } from "./offers-no-accepted/offers-no-accepted.component";
import { AssignmentContractsComponent } from "./assignment-contracts/assignment-contracts.component";
import { JobProcedureListComponent } from "./job-procedures/job-procedure-list/job-procedure-list.component";
import { MyCoursesComponent } from "./my-courses/my-courses.component";
import { PlanificacionPrlComponent } from "./planificacion-prl/planificacion/planificacion-prl.component";
import { PrevencionTrabajadoresComponent } from "./ficha-persona-trabajadora/prevencion-trabajadores.component";

const ExtranetRoutes: Routes = [
  {
    path: "extranet",
    component: ExtranetComponent,
    children: [
      {
        path: "medico-informes-medicos",
        component: MedicaInformesMedicosComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "ofertas-pendientes",
        component: OffersNoAcceptedComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "preving-facturas",
        component: PrevingBillsComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "prevencion-documentos-tecnicos",
        component: PrevencionDocumentosTecnicosComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "prevencion-documentos-personas-trabajadoras",
        component: PrevencionDocumentosPersonasTrabajadorasComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "historico-citas",
        component: HistoricoCitasComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "alta-usuario",
        component: AltaUsuarioComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "buscador-usuarios",
        component: BuscadorUsuariosComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "mi-perfil",
        component: MiPerfilComponent,
        canActivate: [PrevingExtranetGuard],
      },
      { path: "centro-mensajes", component: MessageCenterComponent },
      {
        path: "cambiar-password",
        component: CambiarPasswordComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "contacto",
        component: ContactoComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "delegaciones",
        component: DelegacionesComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "centros-trabajo",
        component: CentrosTrabajoComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "certificados",
        component: CertificadosComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "contratos",
        component: ContratosComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "tratamiento",
        component: TratamientoComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "vigilancia-informes-aptitud",
        component: VigilanciaInformesAptitudComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "vigilancia-reconocimientos-medicos",
        component: VigilanciaReconocimientosMedicosComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "vigilancia-informes-medicos-asociados",
        component: VigilanciaInformesMedicosAsociadosComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "formacion-certificados",
        component: FormacionCertificadosComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "prevencion-trabajos-realizados",
        component: PrevencionTrabajosRealizadosComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "planificacion-prl",
        component: PlanificacionPrlComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "planificacion-prl/planificacion",
        component: PlanificacionPrlComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "planificacion-prl/historico",
        component: PlanificacionPrlComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "planificacion-prl/objetivos",
        component: PlanificacionPrlComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "procedimientos-trabajo",
        component: JobProcedureListComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "calendario-cursos",
        component: CalendarioCursosComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "citacion-web",
        component: CitacionWebProvinciaComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "citacion-web-calendario",
        component: CitacionWebCalendarioComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "citacion-web-hora",
        component: CitacionWebHoraComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "citacion-web-trabajador",
        component: CitacionWebTrabajadorComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "juridico",
        component: JuridicoComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "informacion-general",
        component: InformacionGeneralComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "documentacion-juridica",
        component: DocumentacionJuridicaComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "consultas-prl",
        component: ConsultasPrlComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "documentacion-general",
        component: DocumentacionGeneralComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "servicios-prestados",
        component: ServiciosPrestadosComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "normativa-general-y-prl",
        component: NormativaGeneralPrlComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "formacion-en-prl",
        component: FormacionPrlComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "prevencion-tecnica-init",
        component: PrevencionTecnicaInitComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "vigilancia-salud-init",
        component: VigilanciaSaludInitComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "administracion-init",
        component: AdministracionInitComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "formacion-init",
        component: FormacionInitComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "informacion-init",
        component: InformacionInitComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "usuario-init",
        component: UsuarioInitComponent,
        canActivate: [PrevingExtranetGuard],
      },
      { path: "ayuda-init", component: AyudaInitComponent },
      {
        path: "pagina-en-construccion",
        component: PaginaEnContruccionComponent,
      },
      { path: "ayuda/videoayudas", component: VideoAyudasComponent },
      {
        path: "ayuda/listado-videoayudas",
        component: ListadoVideoAyudasComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "ayuda/modificar-videoayuda",
        component: ModificarVideoAyudaComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "ayuda/alta-videoayuda",
        component: AltaVideoAyudaComponent,
        canActivate: [PrevingExtranetGuard],
      },
      { path: "ayuda/faqs", component: FaqsComponent },
      {
        path: "ayuda/listado-faqs",
        component: ListadoFaqsComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "ayuda/modificar-faqs",
        component: ModificarFaqComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "ayuda/alta-faq",
        component: AltaFaqComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "gestion-citas-empresas",
        component: CompanyAppointmentManagementComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "gestion-citas-personas",
        component: EmployeeAppointmentManagementComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "ayuda/alta-faq",
        component: AltaFaqComponent,
        canActivate: [PrevingExtranetGuard],
      },
      { path: "bonus-fundae-info", component: BonusFundaeInfoComponent },
      {
        path: "datos-credito-formativo",
        component: AssignmentContractsComponent,
      },
      { path: "mis-cursos", component: MyCoursesComponent },
      {
        path: "prevencion-trabajadores",
        component: PrevencionTrabajadoresComponent,
        canActivate: [PrevingExtranetGuard],
      },
      {
        path: "procedimientos-trabajo",
        component: JobProcedureListComponent,
        canActivate: [PrevingExtranetGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(ExtranetRoutes)],
  exports: [RouterModule],
})
export class ExtranetRoutesModule {}
