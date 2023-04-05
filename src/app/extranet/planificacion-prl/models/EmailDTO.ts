/**
 * @description Data Model for emails
 */
export interface EmailDTO {
  to: string;
  cc?: string;
  cco?: string;
  subject?: string;
  observations?: string;
  dataIdList: number[];
}

export class Email implements EmailDTO {
  to: string;
  cc?: string;
  cco?: string;
  subject?: string;
  observations?: string;
  dataIdList: number[];

  constructor(data?: EmailDTO) {
    if (!data) return;

    this.to = data.to;
    this.cc = data.cc;
    this.cco = data.cco;
    this.subject = data.subject;
    this.observations = data.observations;
    this.dataIdList = data.dataIdList;
  }
}

/**
 * @description Data Model for email fields
 */
interface EmailField {
  code: number;
  name: string;
  formName: string;
  label: string;
}

export class EmailFields {
  value: EmailField;
  required: boolean;

  constructor(value, required: boolean = false) {
    this.value = value;
    this.required = required;
  }
}

/**
 * @description Email fields constants
 */
export const EMAIL_FIELDS = {
  EMAIL_FIELDS_CODE: {
    TO: {
      code: 0,
      name: "TO",
      formName: "to",
      label: "PARA",
    },
    CC: {
      code: 1,
      name: "CC",
      formName: "cc",
      label: "CC",
    },
    CCO: {
      code: 2,
      name: "CCO",
      formName: "cco",
      label: "CCO",
    },
    SUBJECT: {
      code: 3,
      name: "SUBJECT",
      formName: "subject",
      label: "ASUNTO",
    },
    OBSERVATIONS: {
      code: 4,
      name: "OBSERVATIONS",
      formName: "observations",
      label: "OBSERVACIONES",
    },
  },

  EMAIL_ADDRESS_FIELDS_CODE: ["TO", "CC", "CCO"],
};
