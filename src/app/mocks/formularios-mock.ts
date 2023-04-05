import { FormularioItem } from '../Model/Formulario/FormularioItem';
import { Formulario } from '../Model/Formulario/Formulario';
import { FormularioDropDownItem } from '../Model/Formulario/FormularioDropDownItem';


//typos label=no editable string file= archivo adjunto string texto libre dropdown lista
export const dropdownList1: FormularioDropDownItem[] = [
  {
    name: 'Cambio de Centros de Trabajo'
  },
  {
    name: 'Cambio de dirección'
  },
  {
    name: 'Cambio de Trabajadores'
  },
  {
    name: 'Cambio de IBAN'
  },
  {
    name: 'Otros'
  }
];

export const form1: FormularioItem[] = [
  {
    nombreCampo: 'nombre',
    tipo: 'text',
    valor: '',
    campo: 'nombre'
  },
  {
    nombreCampo: 'apellidos',
    tipo: 'text',
    valor: '',
    campo: 'apellidos'
  },
  {
    nombreCampo: 'cargo',
    tipo: 'text',
    valor: '',
    campo: 'cargo'
  },
  {
    nombreCampo: 'telefono',
    tipo: 'text',
    valor: '',
    campo: 'telefono'
  },
  {
    nombreCampo: 'fecha/s solicitadas',
    tipo: 'text',
    valor: '',
    campo: 'fecha'
  },
  {
    nombreCampo: 'observaciones',
    tipo: 'text',
    valor: '',
    campo: 'observaciones'
  },
  {
    nombreCampo: 'archivo adjunto',
    tipo: 'file',
    valor: '',
    campo: 'file'
  }
];

export const form2: FormularioItem[] = [
  {
    nombreCampo: 'nombre',
    tipo: 'text',
    valor: '',
    campo: 'nombre'
  },
  {
    nombreCampo: 'apellidos',
    tipo: 'text',
    valor: '',
    campo: 'apellidos'
  },
  {
    nombreCampo: 'email',
    tipo: 'text',
    valor: '',
    campo: 'email'
  },
  {
    nombreCampo: 'cargo',
    tipo: 'text',
    valor: '',
    campo: 'cargo'
  },
  {
    nombreCampo: 'telefono',
    tipo: 'text',
    valor: '',
    campo: 'telefono'
  },
  {
    nombreCampo: 'asunto',
    tipo: 'text',
    valor: '',
    campo: 'asunto'
  },
  {
    nombreCampo: 'descripción',
    tipo: 'text',
    valor: '',
    campo: 'descripción'
  },
  {
    nombreCampo: 'observaciones',
    tipo: 'text',
    valor: '',
    campo: 'observaciones'
  },
  {
    nombreCampo: 'archivo adjunto',
    tipo: 'file',
    valor: '',
    campo: 'file'
  }
];

export const form3: FormularioItem[] = [
  {
    nombreCampo: 'nombre',
    tipo: 'text',
    valor: '',
    campo: 'nombre'
  },
  {
    nombreCampo: 'apellidos',
    tipo: 'text',
    valor: '',
    campo: 'apellidos'
  },
  {
    nombreCampo: 'email',
    tipo: 'text',
    valor: '',
    campo: 'email'
  },
  {
    nombreCampo: 'cargo',
    tipo: 'text',
    valor: '',
    campo: 'cargo'
  },
  {
    nombreCampo: 'telefono',
    tipo: 'text',
    valor: '',
    campo: 'telefono'
  },
  {
    nombreCampo: 'asunto',
    tipo: 'text',
    valor: '',
    campo: 'asunto'
  },
  {
    nombreCampo: 'datos de contrato',
    tipo: 'label',
    valor: '',
    campo: 'datoscontrato'
  },
  {
    nombreCampo: 'tipo de modificacion',
    tipo: 'dropdown',
    valor: dropdownList1,
    campo: 'tipomodificacion'
  },
  {
    nombreCampo: 'modificación',
    tipo: 'text',
    valor: '',
    campo: 'modificación'
  },
  {
    nombreCampo: 'observaciones',
    tipo: 'text',
    valor: '',
    campo: 'observaciones'
  },
  {
    nombreCampo: 'modificación',
    tipo: 'file',
    valor: '',
    campo: 'modificación'
  }
];

export const FORMULARIOSLIST: Formulario[] =

  [
    {
      id: '1',
      nombre: '¿TIENES ALGUNA DUDA?',
      items: form1
    },
    {
      id: '2',
      nombre: 'GENERAL',
      items: form2
    },
    {
      id: '3',
      nombre: 'MODIFICACIÓN ASPECTOS DEL CONTRATO',
      items: form3
    }
  ];
