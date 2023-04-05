export interface Subcarpeta {
  idSubcarpeta: number;
  nombre: string;
}

export interface TipoDocumentoDto {
  idTipoDocumento: number;
  nombre: string;
}

export interface Actividad {
  idActividad: number;
  nombre: string;
}

export interface Documentation {
     idDoc: number;
     tipoDocumento: TipoDocumentoDto;
     nombre: string;
     fechaDocumento: Date;
     tecnico: string;
     ruta: string;
     subcarpeta: Subcarpeta;
     actividad: Actividad;
     observaciones: string;
}

