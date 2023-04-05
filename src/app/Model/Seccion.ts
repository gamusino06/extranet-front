import {Subseccion} from './Subseccion';

export interface Seccion {
  idSeccion: number;
  nombre: string;
  subsecciones: Subseccion[];
  ruta: string;
}


