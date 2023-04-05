import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { FileUploaderError } from "../../../interfaces/file-uploader-error.interface";
import { FileUploaderWithParamsObject, ParametrizedUploaderConfig, ParametrizedUploaderFormControlConfig } from "../../../interfaces/file-uploader-with-params.interface";

@Component({
  selector: "app-parametrized-uploader",
  templateUrl: "./parametrized-uploader.component.html",
  styleUrls: ["./parametrized-uploader.component.scss"],
})
export class ParametrizedUploaderComponent
  implements OnInit, OnDestroy, OnChanges
{
  @Input() element: any;
  @Input() disabled: boolean = false;

  @Input() uploaderConfig: ParametrizedUploaderConfig;
  @Input() formConfig: ParametrizedUploaderFormControlConfig[] = [];
  
  @Output() onFileError: EventEmitter<FileUploaderError[]> = new EventEmitter<
    FileUploaderError[]
  >();
  @Output() onChanges: EventEmitter<FileUploaderWithParamsObject> =
    new EventEmitter<FileUploaderWithParamsObject>();
  @Output() canSubmit: EventEmitter<boolean> = new EventEmitter<boolean>();

  _form: FormGroup;
  _uploadFiles: File[] = [];
  _editMode: boolean = false;
  _fileNameListForPreview: string[] = [];

  _renameItems: boolean = true;
  _validTypes: string[] = ["*"];
  _maxFileSize: number = 2;

  private _formSubscriptor: any;
  private destroy$ = new Subject();

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    if (!this.element) {
      this.initForm();
    }
    this._editMode = this.element ? true : false;

    if (this.uploaderConfig) {
      this.initUploaderConfig();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.element &&
      ![undefined, null].includes(changes.element.currentValue)
    ) {
      this.initForm();
      this.initData();
    }

    if (changes.disabled && this._form) {
      if (changes.disabled.currentValue) {
        this._form.disable();
      } else {
        this._form.enable();
      }
    }
  }

  ngOnDestroy(): void {
    this._uploadFiles = [];
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Create form controls and validators according to the formConfig
   */
  initForm() {
    this._form = this.formBuilder.group({});

    this.formConfig.forEach((formControl) => {
      // Create validators
      let validators: ValidatorFn[] = formControl.validators || [];
      if (formControl.required) {
        validators.push(Validators.required);
      }

      // Create form control
      let formControlInstance = new FormControl(null, validators);
      this._form.addControl(formControl.name, formControlInstance);
    });

    // Subscribe to form changes
    this._formSubscriptor = this._form.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.emitChanges();
      });
  }

  /**
   * Init data if element is not null
   */
  initData() {
    // Unsubscribe to form changes
    this._formSubscriptor.unsubscribe();

    // Set form values
    this.getForm().forEach((formControl) => {
      this._form.controls[formControl].setValue(
        this.element[formControl] || null
      );
    });

    // Set file name list for preview
    this._fileNameListForPreview = [this.element.fileName];

    // Subscribe to form changes
    this._formSubscriptor = this._form.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.emitChanges();
      });
  }

  /**
   * Init uploader config
   * If config is not defined, use default values
   */
  initUploaderConfig() {
    this._renameItems = this.uploaderConfig.renameItems || this._renameItems;
    this._validTypes = this.uploaderConfig?.validFileTypes || this._validTypes;
    this._maxFileSize = this.uploaderConfig?.maxFileSize || this._maxFileSize;
  }

  /**
   * Emit changes to parent component
   * If form is valid and has file, emit the changes to parent component
   * Else, emit false to parent component
   */
  emitChanges() {
    const hasFile = this.element || this._uploadFiles.length > 0;
    if (this._form.valid && hasFile) {
      this.onChanges.emit({
        files: this.element ? this.element.files : this._uploadFiles,
        form: this._form,
        elementId: this.element ? this.element.id : null,
      });
      this.canSubmit.emit(true);
    } else {
      this.canSubmit.emit(false);
    }
  }

  onFilesChange(event) {
    this._uploadFiles = event;
    this.emitChanges();
  }

  /**
   * Emit file error to parent component
   * @param event
   */
  onFilesError(event) {
    this.onFileError.emit(event);
  }

  getForm() {
    return Object.keys(this._form.controls);
  }
}
