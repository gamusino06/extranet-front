import {Centro} from './Centro';
import {Documento} from './Documento';
export interface Empresa {
  idEmpresa: number;
  nombre: string;
  centros: Centro[];
  activo:boolean;
  activoPT:boolean;
  activoVS:boolean;
  tienePT:boolean;
  tieneVS:boolean;
  mostrar:boolean;
  documentos: Documento[];
  checked: boolean;
  todosCentros: boolean;
}
