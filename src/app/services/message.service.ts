import { Injectable } from "@angular/core";

import Swal, { SweetAlertResult } from "sweetalert2";
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: "root",
})
export class MessageService {
  
  constructor(public translate: TranslateService) { }
  
  showSuccessMessage_i18n(i18nConstant): Promise<SweetAlertResult<any>> {
    return  this.showSuccessMessage(this.translate.instant(i18nConstant))
  }

  showErrorMessage_i18n(i18nConstant): Promise<SweetAlertResult<any>> {
    return this.showErrorMessage(this.translate.instant(i18nConstant))
  }

  showSuccessMessage(message: string): Promise<SweetAlertResult<any>> {
    return Swal.fire({
      icon: "success",
      title: message,
      confirmButtonColor: "var(--blue)",
      allowOutsideClick: true,
    });
  }

  showErrorMessage(message: string): Promise<SweetAlertResult<any>> {
    return Swal.fire({
      icon: "error",
      title: message,
      confirmButtonColor: "var(--blue)",
      allowOutsideClick: false,
    });
  }
}
