import { FormGroup, ValidatorFn } from "@angular/forms";

export interface UploaderWithParamsTableField {
  name: string;
  label: string;
  dateFormat?: string;
}

export interface UploaderWithParamsTableActions {
  edit?: boolean;
  delete?: Function;
  preview?: Function;
  download?: Function;
}

export interface UploaderWithParamsTableConfig {
  fields: UploaderWithParamsTableField[];
  actions?: UploaderWithParamsTableActions;
}

export interface ParametrizedUploaderFormControlConfig {
  label: string;
  name: string;
  type: "text" | "number" | "select" | "date" | "textarea";
  options?: ParametrizedUploaderOption[];
  required?: boolean;
  validators?: ValidatorFn[];
  compareObjects?: Function;
}

export interface ParametrizedUploaderOption {
  value: any;
  label: string;
}

export interface ParametrizedUploaderConfig {
  validFileTypes?: string[];
  renameItems?: boolean;
  maxFileSize?: number;
}

export interface FileUploaderWithParamsObject {
  files?: File[];
  form: FormGroup;
  elementId?: number;
}
