import {TableHeader} from './TableHeader';
import {TableInfo} from './TableInfo';

export interface Table {
  name: string;
  tableHeader: TableHeader[];
  tableInfo: TableInfo[][];
}
