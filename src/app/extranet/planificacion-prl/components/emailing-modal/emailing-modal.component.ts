import { Component, Inject, Input, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { NgxSpinnerService } from "ngx-spinner";
import { Email, EmailFields, EMAIL_FIELDS } from "../../models/EmailDTO";
import { ValidatorUtils } from "src/app/services/validator-utils.service";

@Component({
  selector: "app-emailing-modal",
  templateUrl: "./emailing-modal.component.html",
  styleUrls: ["./emailing-modal.component.scss"],
})
export class EmailingModalComponent implements OnInit {
  form: FormGroup;
  @Input() title: string;
  @Input() attachmentsTitle: string;
  @Input() dataToEmailLabelKey: string = "name";
  @Input() hideDataToEmail: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<EmailingModalComponent>,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private validatorUtils: ValidatorUtils,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      dataToEmail: any[];
      emailFields: EmailFields[];
      client: any;
      center: any;
    }
  ) {}

  ngOnInit(): void {
    this.form = this.initForm();
  }

  close(): void {
    this.dialogRef.close();
  }

  /**
   * Close the modal and send the email object with center and client data
   */
  send(): void {
    this.spinner.show();

    const emailData = new Email({
      ...this.form.value,
      dataIdList: this.data.dataToEmail.map(({ id }) => id),
    });

    const result = {
      emailData,
      client: this.data.client,
      center: this.data.center,
    };
    try {
      this.dialogRef.close(result);
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Creates a new form group according to the email fields received.
   * By default, the address fields have a validator to check if the email is valid
   * @returns form group with the email fields
   */
  private initForm(): FormGroup {
    const emailFields = this.data.emailFields;

    const emailAddressFields = EMAIL_FIELDS.EMAIL_ADDRESS_FIELDS_CODE;

    const formGroup = this.fb.group({});

    emailFields.forEach((field) => {
      let validators = field.required
        ? [Validators.required, this.validatorUtils.notEmptyString]
        : [];

      if (emailAddressFields.includes(field.value.name))
        validators.push(this.validatorUtils.isValidEmailListSeparedBySemi);

      formGroup.addControl(
        field.value.formName,
        new FormControl("", validators)
      );
    });

    return formGroup;
  }
}
