import { Area } from './Area';
import { Subcarpeta } from './Documentacion/PrevingDocumentacion';
import { Empresa } from './Empresa';
import { Idioma } from './Idioma';
import { PuestoTrabajo } from './PuestoTrabajo';
import { Rol } from './Rol';

export interface User {
  idUsuario: number;
  nombre: string;
  apellidos: string;
  email: string;
  idioma: Idioma;
  empresas: Empresa[];
  subcarpetas: Subcarpeta[];
  puestosTrabajos: PuestoTrabajo[];
  rol: Rol;
  areas: Area[];
  error: string;
}
