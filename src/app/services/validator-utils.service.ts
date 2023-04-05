import { Injectable } from "@angular/core";

import { environment } from "../../environments/environment";
import { FormControl } from "@angular/forms";

@Injectable({
  providedIn: "root",
})
export class ValidatorUtils {
  apiToken = "INVALIDTOKEN";
  environment = environment;

  constructor() {
    this.apiToken = localStorage.getItem("token");
  }

  // Required validator function
  public requiredTextValidator(fieldName: string = "") {
    return (control: FormControl) => {
      const name = control.value;
      if (!name || !this.validateText(name)) {
        return { required: "Please enter your " + fieldName };
      }
      return null;
    };
  }

  /** Validate the text passed */
  validateText(str: string, length?, maxLength?): boolean {
    str = str ? str.toString() : "";
    if (str) {
      if (
        !str.trim() ||
        str.trim() === "" ||
        (length && str.length < length) ||
        (maxLength && str.length > maxLength)
      ) {
        return false;
      }
      return true;
    }
    return false;
  }

  isValidEmailListSeparedBySemi(control: FormControl) {
    const controlValue: string = control.value;
    const errorField = { invalidEmailList: true };

    if (controlValue) {
      const emails = controlValue.split(";");
      const invalidEmails = emails.filter(
        (email) => !isValidEmail(email.trim())
      );

      if (invalidEmails.length > 0) return errorField;
    }

    return null;
  }

  notEmptyString(control: FormControl) {
    const controlValue: string = control.value;
    const errorField = { isNotEmptyString: true };

    if (controlValue) {
      if (controlValue.trim() === "") return errorField;
    }

    return null;
  }
}

function isValidEmail(email: string) {
  const regex =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(email);
}
