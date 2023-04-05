import {FormularioItem} from './FormularioItem';
export interface Formulario {
  id: string;
  nombre: string;
  items: FormularioItem[];
}
