import { Pipe, PipeTransform } from '@angular/core';
import { orderBy } from 'lodash';

@Pipe({ name: 'sortCentros' })
export class sortCentrosPipe implements PipeTransform {

  transform(empresas: any[], selectedEmpresas: any): any[] {

    if (!empresas) return [];
    let centros: any[] = [];

    //Se puede dar el caso, de que cuando no sea multipleCheck, el 'selectedEmpresas' se de tipo 'number'
    if(typeof selectedEmpresas === 'number'){
      let auxIdEmpresa = selectedEmpresas;
      selectedEmpresas = [];
      selectedEmpresas.push(auxIdEmpresa);
    }

    empresas.forEach(obj => {
      if( selectedEmpresas?.indexOf(obj.idEmpresa) >= 0) {
        centros = centros.concat(obj.centros);
      }
    });
    return centros.sort(this.sortAlphaNum);
 }


  sortAlphaNum(a, b) {
    var reA = /[^a-zA-Z]/g;
    var reN = /[^0-9]/g;

    var aA = a.nombre.replace(reA, "");
    var bA = b.nombre.replace(reA, "");
    if (aA === bA) {
      var aN = parseInt(a.nombre.replace(reN, ""), 10);
      var bN = parseInt(b.nombre.replace(reN, ""), 10);
      return aN === bN ? 0 : aN > bN ? 1 : -1;
    } else {
      return aA > bA ? 1 : -1;
    }
  }

}
