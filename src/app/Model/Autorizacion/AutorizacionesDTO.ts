import {AutorizacionTrabajadorTipo} from './AutorizacionTrabajadorTipo';

export interface AutorizacionesDTO {

  idautorizaciontrabajador: number;
  idtrabajador: number;
  idcliente: number;
  autorizaciontipo: AutorizacionTrabajadorTipo;
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
  nombreUnico: string;
  anyo: number;
  file: any;
  firmaElectronica: number;
  fileFlag: number;
}
