import {TiposDocumento} from './TiposDocumento';
export interface Documento {
  idDocumento: number;
  tipoDocumento: TiposDocumento;
  nombre: string;
  ubicacion:string;
}


