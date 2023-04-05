import { Injectable } from "@angular/core";

@Injectable()
export class Globals {
  rgpd: string = "1";
  adjunto_mensaje = "2";
  facturas: string = "3";
  contratos: string = "4";
  anexo: string = "5";
  informes_medicos: string = "6";
  test_rapido_covid19: string = "37";
  informes_medicos_asociados: string = "39";
  certificado_contratacion: string = "41";
  certificado_corriente_de_pago: string = "42";
  historico_citas: string = "43";
  reconocimiento_medico: string = "44";
  informes_aptitud: string = "45";
  diplomas: string = "46";
  otra_formacion: string = "48";
  informes_tecnicos: string = "49";
  documentos_vigor: string = "50";
  otros_documentos: string = "51";
  puesto_trabajo: string = "52";
  planes_formacion: string = "53";
  producto_prl: string = "54";
  registros_prl: string = "55";
  trabajos_realizados: string = "64";
  calendario_cursos: string = "65";
  erl_puestos_trabajo: string = "78";
  codigo_conducta: string = "94";
  historico_formacion: string = "101";
  offers_no_accepted: string = "105";
  assignment_contracts: string = "106";

  //TODO prv
  documentacion_propia_pt: string = "107";
  documentacion_propia_vs: string = "118";

  //Nombres metadatos
  metadato_idioma: string = "idioma";
  metadato_importe: string = "importe";
  metadato_descripcion: string = "descripcion";
  metadato_service_type: string = "serviceType";
  metadato_numero_factura: string = "numero_factura";
  metadato_entidad: string = "entidad";
  metadato_entidad_nombre: string = "entidad_nombre";
  metadato_fichero_encomienda: string = "fichero_encomienda";
  metadato_estado_nombre: string = "estado_nombre";
  metadato_fecha_baja: string = "fecha_baja";
  metadato_observaciones: string = "observaciones";
  metadato_centro_medico: string = "centro_medico";
  metadato_asistencia: string = "asistencia";
  metadato_trabajador: string = "trabajador";
  metadato_motivo: string = "motivo";
  metadato_nombre_trabajador: string = "nombre_trabajador";
  metadato_apellidos_trabajador: string = "apellidos_trabajador";
  metadato_nif_trabajador: string = "nif_trabajador";
  metadato_trabajador_activo: string = "trabajador_activo";
  metadato_puesto_trabajo: string = "puesto_trabajo";
  metadato_nombre_o_nif_trabajador: string = "nombre_o_nif_trabajador";
  metadato_subcategoria_doc: string = "subcategoria_doc";
  metadato_subcategoria_formacion: string = "subcategoria_formacion";
  metadato_origen_curso: string = "origen_curso";

  metadato_fecha_reciclaje: string = "fecha_reciclaje";
  metadato_tipo_reciclaje: string = "tipo_reciclaje";
  metadato_estado_reciclaje: string = "estado_reciclaje";
  metadato_anios_reciclaje: string = "anios_reciclaje";
  metadato_fecha_curso: string = "fecha_curso";
  metadato_tipo_fecha: string = "tipo_fecha";
  metadato_aptitud: string = "aptitud";
  metadato_protocolo: string = "protocolo";
  metadato_modalidad: string = "modalidad";
  metadato_curso: string = "curso";
  metadato_id_curso: string = "curso_id";
  metadato_nombre_curso: string = "nombre_curso";
  metadato_horas: string = "horas";
  metadato_formador: string = "formador";
  metadato_nombre_formador: string = "nombre_formador";
  metadato_tecnico: string = "tecnico";
  metadato_nombre_tecnico: string = "nombre_tecnico";
  metadato_subcarpeta: string = "subcarpeta";
  metadato_nombre_subcarpeta: string = "nombre_subcarpeta";
  metadato_producto_prl: string = "producto_prl";
  metadato_nombre_producto_prl: string = "nombre_producto_prl";
  metadato_proximo_test: string = "proximo_test";
  metadato_recomendado_pcr: string = "recomendado_pcr";
  metadato_actividad: string = "actividad";
  metadato_direccion: string = "direccion";
  metadato_codigo_postal: string = "cp";
  metadato_horario: string = "horario";
  metadato_localidad: string = "localidad";
  metadato_provincia_localidad: string = "provincia_localidad";
  metadato_pagina_inicio: string = "pagina_inicio";
  metadato_pagina_fin: string = "pagina_fin";
  metadato_sensibilidades: string = "sensibilidades";
  metadato_denominacion: string = "denominacion";

  //Areas
  idAreaPT: number = 1;
  idAreaVS: number = 2;
  idAreaAyuda: number = 5;
  idAreaContacto: number = 6;
  idAreaMensajes: number = 7;
  idAreaBlog: number = 10;
  idSeccionAyudas: number = 26;
  idSeccionProfComercial: number = 67;
  idSeccionProfTecnico: number = 68;
  idSeccionProfGestor: number = 69;
  idSeccionProfMedico: number = 70;
  idSeccionProfResponsableGC: number = 71;
  idSeccionPromPT: number = 72;
  idSeccionPromVS: number = 73;
  idSeccionPromCalendario: number = 74;
  idSeccionPromPRL: number = 75;
  idSeccionPromFormacionBonificada: number = 76;
  idSeccionPromJuridico: number = 77;
  idAreaJuridico: number = 81;

  formacion_prl: number = 1;
  mas_formacion: number = 2;

  max_exercises_number: number = 5;

  //Productos
  idProductoPT = 1;
  idProductoVS = 2;

  //Tipos Contacto
  idTipoContactoTecnico: number = 1;
  idTipoContactoComercial: number = 2;
  idTipoContactoResponsableGC: number = 3;
  idTipoContactoGestor: number = 4;
  idTipoContactoMedico: number = 5;

  //Correo to para el envío consultas generales
  correo_preving_to_mail: string = "extranet@preving.com";
  correo_preving_privacidad: string = "privacidad@grupopreving.com";

  //Rutas
  extranet: string = "extranet";
  login: string = "login";
  barraExtranet: string = "/extranet";
  extranetBarra: string = "extranet/";
  login_url: string = "/login";
  extranet_url: string = "/extranet/";
  primeraPassword: string = "primera-password";
  altaUsuario: string = "alta-usuario";
  ayuda: string = "ayuda/";
  altaVideoayudas: string = "alta-videoayuda";
  altaFaqs: string = "alta-faq";
  myData: string = "/mi-perfil";
  myPassword: string = "/cambiar-password";

  pagina_en_construccion: string = "pagina-en-construccion";

  intranet_redireccion_juridico_preving: string =
    "https://demo-extranet.preving.com/extranet-juridico/simulationLogin.do";
  extranet_header_EI_apiKeyUsername: string =
    "4f15cf16-77c1-4374-a168-393bfed9701b";
  extranet_header_EI_apiKey: string = "e622ad27-b579-4790-8493-fb9b8f8a9c98";
  extranet_header_EI_apiKeyUserId: string = "1";

  //Estado de origen de la citacion
  extranet_citacion_web_origen_extranet: number = 1;

  extranet_citacion_web_provincia_url: string = "citacion-web";
  extranet_citacion_web_calendario_url: string = "citacion-web-calendario";
  extranet_citacion_web_hora_url: string = "citacion-web-hora";
  extranet_citacion_web_trabajador_url: string = "citacion-web-trabajador";
  extranet_citacion_web_trabajador_errorConCodigo8100: number = 8100;
  extranet_citacion_web_trabajador_errorConCodigo8101: number = 8101;
  extranet_citacion_web_trabajador_errorConCodigo8102: number = 8102;
  extranet_citacion_web_trabajador_errorConCodigo8103: number = 8103;
  extranet_citacion_web_trabajador_errorConCodigo8104: number = 8104;
  extranet_citacion_web_trabajador_errorConCodigo8105: number = 8105;
  extranet_citacion_web_trabajador_errorConCodigo8106: number = 8106;
  extranet_citacion_web_trabajador_errorConCodigo8107: number = 8107;
  extranet_citacion_web_trabajador_errorConCodigo8108: number = 8108;
  extranet_citacion_web_trabajador_errorConCodigo8109: number = 8109;
  extranet_citacion_web_trabajador_errorConCodigo8110: number = 8110;
  extranet_citacion_web_trabajador_errorConCodigo8111: number = 8111;
  extranet_citacion_web_trabajador_errorConCodigo8112: number = 8112;
  showMobileMenu: boolean = false;

  //Limite de MB adjuntos
  extranet_limite_adjuntos: number = 20000000; //Limite original 20971520

  //Patrones de validaciones
  //NOTA (patrón no extricto): Permite NIE (EJ VALIDO: X1234567F ; X1234567 ; X123; 4567F) (EJ NO VALIDO: X123F; X12345678F ; 4567F1)
  //y sigue permitiendo el NIF (EJ VALIDO: 12345678F; 678F ; 456; F) (EJ NO VALIDO: 123456789F; 78F1)
  nifNiePattern: string =
    "((^[x-zX-Z]{0,1}[0-9]{7}[a-zA-Z]{0,1}$)|(^[x-zX-Z]{0,1}[0-9]{0,7})$)|(^[0-9]{0,8}[a-zA-Z]{0,1}$)";
  emailPattern: string = "^(([a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}),{0,1})+$";
  documentPattern: string = "^[a-zA-ZÀ-ÿ\u00f1\u00d1\0-9 ]+$";
  observePattern: string = "^[a-zA-ZÀ-ÿ\u00f1\u00d1\0-9 ]+$";
  puestoPattern: string = "^[a-zA-ZÀ-ÿ\u00f1\u00d1\0-9 ]+$";
  workerPattern: string = "^[a-zA-ZÀ-ÿ\u00f1\u00d1\0-9 ]+$";

  //Se incluye: A-Z; Diéresis y acentos español y francés de las vocales A, E, I, O, U; Ñ;
  upperCasePattern: string =
    "^[A-Z\u00C0-\u00C4\u00C8-\u00CF\u00D2-\u00D6\u00D9-\u00DC\u00d1]+$";
  //Se incluye: a-z; Diéresis y acentos español y francés de las vocales a, e, i, o, u; ñ;
  lowerCasePattern: string =
    "^[a-z\u00E0-\u00E4\u00E8-\u00EF\u00F2-\u00F6\u00F9-\u00FC\u00f1]+$";
  digitPattern: string = "^[0-9]+$";
  especialCharacterPattern: string = "^[$@$.!%*?&]+$";
  espaciosPattern: string = "^[ ]+$";

  //phonePattern: string = "(\\+34|0034|34)?([0-9]){9}";
  //vaciosPattern: string = "^[^]+$";
  //phonePattern: string = "(\\+34|0034|34)?([0-9]){9}";

  //Url genérica Maps
  urlGenericaMaps: string = "http://maps.google.co.uk/maps?";

  //Máximo de provincias que se pueden seleccionar en los desplegables.
  maxProvinciasSelected: number = 3;

  //Estados de los mensajes
  extranet_mensajes_estadoMensajeNoLeido: number = 1;
  extranet_mensajes_estadoMensajeLeido: number = 2;

  //Intervalo, en años, por defecto de fechas en los filtros
  extranet_intervalo_fechas_filtro: number = 1;
  extranet_fecha_mas_antigua: string = "2001-01-01 00:00:00";

  DESCARGA_UNIFICADA: number = 1;
  DESCARGA_SEPARADA: number = 2;

  //Máximo de documentos para realizar una descarga multiple o compartir multiple
  extranet_maximo_documentos_multiple: number = 25;

  medicalExamination = "medicalExamination";

  companyListSortKey = "nombre";
  centerListSortKey = "nombre";
  communityListSortKey = "name";
  provinceListSortKey = "name";
  medicalCenterListSortKey = "name";
  communityIdPropertyName = "id";
  provinceIdPropertyName = "id";
  medicalCenterIdPropertyName = "id";
  myProfileIdArea = 95;
  COMPANY_APPOINTMENT_MANAGEMENT = 1;
  EMPLOYEE_APPOINTMENT_MANAGEMENT = 2;

  HEALTH_SURVEILLANCE_AREA_NAME = "AREA_VIGILANCIA";
  MEDICAL_RECOGNITION_SECTION_NAME = "SEC_RECONOCIMIENTOS_MED";
  ASK_FOR_APPOINTMENT_SUBSECTION_NAME = "SS_CITA";
  //Categoría de videoayuda bonifícate
  categoria_videoayuda_bonificate: number = 7;

  more_training_calendar_url =
    "https://www.preving.com/calendario-cursos/#results";

  APTITUDE_REPORT_STATUS_GREY = 0;
  APTITUDE_REPORT_STATUS_ORANGE = 1;
  APTITUDE_REPORT_STATUS_RED = 2;
  APTITUDE_REPORT_STATUS_YELLOW = 3;
  APTITUDE_REPORT_STATUS_GREEN = 4;

  // Sections
  SECTION_NAME = "section_name";
  SECTION_WORKER_PAGE = "prevencion-trabajadores";

  my_courses_internal_origin: number = 0;
  my_courses_external_origin: number = 1;

  my_courses_prl_type: number = 1;

  my_courses_more_training_type: number = 2;

  my_courses_evaluation_not_started: number = 0;
  my_courses_evaluation_ok: number = 1;
  my_courses_evaluation_ko: number = 2;


  my_courses_modality_face_to_face: number = 1;

  my_courses_more_training_course_certificate: number = 99;
  my_courses_prl_course_certificate: number = 93;

  my_courses_soon_course: number = 0;
  my_courses_active_course: number = 1;
  my_courses_closed_course: number = 2;
}
