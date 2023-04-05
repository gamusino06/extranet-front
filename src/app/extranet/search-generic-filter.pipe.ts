import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'searchGenericFilter' })
export class SearchGenericFilterPipe implements PipeTransform {
  transform(objArray: any[], filter: string, propertyName: string): any[] {
    if (!filter)
      return objArray;
    return objArray.filter(item => item[propertyName].toLowerCase().includes(filter.toLowerCase()));
  }
}
