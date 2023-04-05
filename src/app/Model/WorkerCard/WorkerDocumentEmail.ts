import { WorkerDocument } from "./WorkerDocument";

export interface WorkerDocumentEmail{
  receiverEmail: string;
  ccReceiverEmail: string;
  ccoReceiverEmail: string;
  subject: string;
  body: string;
  documentList: WorkerDocumentEmail[];
}
