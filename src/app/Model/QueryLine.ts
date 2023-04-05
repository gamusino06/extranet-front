import {Query} from './Query';
import {QueryMethod} from './QueryMethod';
import {User} from './User';
import {QueryLineByAttachments} from './QueryLineByAttachments';

export class QueryLine {
  id: number;
  query: Query = new Query();
  message: string;
  queryMethod: QueryMethod = new QueryMethod();
  queryLineByAttachments: QueryLineByAttachments[] = new Array <QueryLineByAttachments> ();
  extranet: number;
  created: Date;
  createdBy: number;
  createdByName: string;
}
