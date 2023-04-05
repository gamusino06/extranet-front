import { AutorizacionTrabajadorTipo } from './AutorizacionTrabajadorTipo';

export interface AutorizacionTrabajador {
  blocked?: boolean;
  checked?: boolean;
  file: any;

  idAutorizacionTrabajador: number;
  idTrabajador: number;
  idCliente: number;
  tipoAutorizacion: AutorizacionTrabajadorTipo;
  observaciones: string;
  fechaentrega: Date;
  fechacaducidad: Date;
  activo: number;
  nombre: string;
  tipomyme: string;
  borrado: number;
  usuariocreador: number;
  fechacreacion: Date;
  usuarioultimaedicion: number;
  fechaultimaedicion: Date;
  anyo: number;
  nombreunico: string;
}
