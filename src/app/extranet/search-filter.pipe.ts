import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'searchFilter' })
export class searchFilterPipe implements PipeTransform {
    transform(objArray: any[], filter: string): any[] {
        if (!filter)
            return objArray;
        return objArray.filter(item => item.nombre.toLowerCase().includes(filter.toLowerCase()));
    }
}
