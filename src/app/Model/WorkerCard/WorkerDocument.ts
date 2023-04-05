import { DocumentType } from "./DocumentType";
import { BasicEntity } from "../BasicEntity";
import { PuestoTrabajo } from "../PuestoTrabajo";


export interface WorkerDocument {
  blocked?: boolean;
  checked?: boolean;
  id: number;
  employeeId: number;
  clientId: number;
  center: BasicEntity;
  jobPosition: PuestoTrabajo;
  submitDate: Date;
  expirationDate: Date;
  description: string;
  documentType: DocumentType;
  name: string;
  extension: string;
  uniqueName: string;
  isRemoved: number;
  createdBy: number;
  creationDate: Date;
  modifiedBy: number;
  modifiedDate: Date;
  file: any;
  fileYear: number;

}
