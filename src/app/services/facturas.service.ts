import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Producto } from '../Model/Facturas/producto';
import { Estado } from '../Model/Facturas/Estado';

import { PRODUCTOSLIST } from '../mocks/Facturas/productos-mock';
import { ESTADOSLIST } from '../mocks/Facturas/estados-mock';
import { FACTURASLIST } from '../mocks/Facturas/facturas-mock';
import { Factura } from '../Model/Facturas/Factura';


@Injectable({
  providedIn: 'root'
})
export class FacturasService {

  constructor() { }

  /*get a productos of facturas*/
  getProductos(): Observable<Producto[]> {
    return of(PRODUCTOSLIST);
  }

  /*get a table from a form*/
  getEstados(): Observable<Estado[]> {
    return of(ESTADOSLIST);
  }

  getFacturas(): Observable<Factura[]> {
    return of(FACTURASLIST);
  }
}
