import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'busquedaFilter'
})
export class BusquedaPipe implements PipeTransform {

  transform(objArray: any[], filter: string): any[] {
    if (!filter)
      return objArray;
    return objArray.filter(item => item.companyName.toLowerCase().includes(filter.toLowerCase()));
  }

}
