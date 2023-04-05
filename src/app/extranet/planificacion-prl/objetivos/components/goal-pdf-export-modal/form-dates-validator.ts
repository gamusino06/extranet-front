import { Injectable } from "@angular/core";
import { FormGroup, ValidationErrors } from "@angular/forms";

@Injectable({ providedIn: "root" })
export class FormDatesValidator {
  public haveStartAndEndDateIfOneIsWithValue(
    formGroup: FormGroup
  ): ValidationErrors | null {
    const startDate = formGroup.get("start")?.value;
    const endDate = formGroup.get("end")?.value;

    const isStartDateEmpty = startDate === "";
    const isEndDateEmpty = endDate === "";

    if (isStartDateEmpty && !isEndDateEmpty) {
      return { invalidStartField: true };
    }

    if (!isStartDateEmpty && isEndDateEmpty) {
      return { invalidEndField: true };
    }

    return null;
  }
}
