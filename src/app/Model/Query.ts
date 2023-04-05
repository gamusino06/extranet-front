import {User} from './User';
import {QueryStatus} from './QueryStatus';
import {QueryLine} from './QueryLine';


export class Query {
  id: number;
  title: string;
  worker: string;
  workerPosition: string;
  workerPhone: string;
  workerEmail: string;
  priority: number = 1;
  queryStatus: QueryStatus = new QueryStatus();
  lines: QueryLine[] = new Array <QueryLine> ();
  created: Date = new Date();
  createdBy: number;
  closed: Date = new Date();
  closedBy: User = null;
}
