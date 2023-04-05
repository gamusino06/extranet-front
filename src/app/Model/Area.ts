
import {TiposDocumento} from './TiposDocumento';
import {Seccion} from './Seccion';

export interface Area {
  idArea: number;
  nombre: string;
  tiposDocumentos: TiposDocumento[];
  secciones: Seccion[];
  ruta: string;
}


