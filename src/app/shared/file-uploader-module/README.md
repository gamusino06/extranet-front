# File Uploader Module

- [Introduction](#introduction)
- [Use Cases](#use-cases)
  - [File Uploader](#file-uploader-use-case)
  - [File Uploader With Params](#file-uploader-with-params-use-case)
  - [Dropable Directive](#dropable-directive-use-case)
- [Directives](#directives)
  - [Dropable](#dropable-directive)
    - [Events](#dropable-directive-events)
- [Interfaces](#interfaces)
  - [FileUploaderError](#file-uploader-error-interface)
  - [FileUploaderErrorField](#file-uploader-error-field-interface)
  - [FileUploaderErrorCodes Enum](#file-uploader-error-codes-enum-interface)
  - [FileUploaderFileChange](#file-uploader-file-change-interface)
  - [FileUploaderWithParamsObject](#file-uploader-with-params-object-interface)
  - [ParametrizedUploaderFormControlConfig](#parametrized-uploader-form-control-config-interface)
  - [ParametrizedUploaderOption](#parametrized-uploader-option-interface)
  - [ParametrizedUploaderConfig](#parametrized-uploader-config-interface)
  - [UploaderWithParamsTableConfig](#uploader-with-params-table-config-interface)
  - [UploaderWithParamsTableField](#uploader-with-params-table-field-interface)
  - [UploaderWithParamsTableActions](#uploader-with-params-table-actions-interface)
- [Utils](#utils)
  - [FileUploaderValidator](#file-uploader-validator-util)
  - [CoercionBooleanProperty](#coercion-boolean-property-util)
- [Components](#components)
  - [Internal Components](#internal-components)
    - [UploadFileBox](#upload-file-box-component)
    - [AddedFileList](#added-file-list-component)
    - [AddedFileRow](#added-file-row-component)
    - [ParametrizedUploader](#parametrized-uploader-component)
    - [ParametrizedFilesTable](#parametrized-files-table-component)
  - [Global Components](#global-components)
    - [FileUploader](#file-uploader-component)
    - [FileUploaderWithParams](#file-uploader-with-params-component)
- [I18n Translations](#i18n-translations)

## <a name="introduction"></a> Introduction

Module with file-uploader component and dropaple directive for manage files to upload.

## <a name="use-cases"></a> Use Cases

You need to import the file-uploader module in your module.

### <a name="file-uploader-use-case"></a> File Uploader

#### <a name="file-uploader-use-case-usage"></a> Usage

```html
<file-uploader
  multiple
  compact
  renameItems
  showTitles
  [validTypes]="['image/png', 'image/jpeg', '.svg']"
  [maxFileSize]="10"
  [files]="files"
  (onFilesChange)="onFilesChange($event)"
  (onFilesError)="onFilesError($event)"
></file-uploader>
```

### <a name="#file-uploader-with-params-use-case"></a> File Uploader With Params

#### <a name="file-uploader-with-params-use-case-usage"></a> Usage

```html
<app-file-uploader-with-params
  [dataSource]="dataSource"
  [formConfig]="formConfig"
  [tableConfig]="tableConfig"
  [uploaderConfig]="uploaderConfig"
  [sendFunction]="sendFunction"
  (showingButtons)="showingButtons($event)"
></app-file-uploader-with-params>
```

### <a name="#dropable-directive-use-case"></a> Dropable Directive

#### <a name="dropable-directive-use-case-usage"></a> Usage

```html
<div
  dropable
  (onFileDragOver)="onFileDragOver($event)"
  (onFileDragLeave)="onFileDragLeave($event)"
  (onFileDropped)="onFileDropped($event)"
>
  <p>Drop files here</p>
</div>
```

## <a name="directives"></a> Directives

### <a name="dropable-directive"></a> Dropable

Directive to control HTML element's `ondragover`, `ondragleave` and `drop` events.

#### <a name="dropable-directive-events"></a> Events

- `onFileDragOver`: Fires on dragover
- `onFileDragLeave`: Fires on dragleave
- `onFileDropped`: Fires on drop

## <a name="interfaces"></a> Interfaces

### <a name="file-uploader-error-interface"></a> FileUploaderError

```ts
export interface FileUploaderError {
  [key: string]: FileUploaderErrorField[];
}
```

### <a name="file-uploader-error-field-interface"></a> FileUploaderErrorField

```ts
export interface FileUploaderErrorField {
  code: FileUploaderErrorCodes;
  message: string;
}
```

### <a name="file-uploader-error-codes-enum-interface"></a> FileUploaderErrorCodes Enum

- `INVALID_FILE_TYPE`: invalid-file-type
- `FILE_SIZE_TOO_LARGE`: file-size-too-large

### <a name="file-uploader-file-change-interface"></a> FileUploaderFileChange

```ts
export interface FileUploaderFileChange {
  file: File;
  index: number;
}
```

### <a name="file-uploader-with-params-object-interface"></a> FileUploaderWithParamsOject

Object returned once the file has been uploaded and the form filled out

- <b>form</b>: Form completed
- <b>files</b>: Uploaded file. It will only be returned in case of uploading a new file
- <b>elementId</b>: Id of the element in edition. Only returned in case of being in edition mode

```ts
export interface FileUploaderWithParamsObject {
  form: FormGroup;
  files?: File[];
  elementId?: number;
}
```

### <a name="parametrized-uploader-form-control-config-interface"></a> ParametrizedUploaderFormControlConfig

Form controls configuration

- <b>label</b>: Label to show
- <b>name</b>: Name of the field. Must match attribute name
- <b>type</b>: Type of the field. It must be one of the ones shown
- <b>options</b>: It should only be passed in case it is a selectable field. It must be of type <i>ParametrizedUploaderOption</i>
- <b>required</b>: If true, required validator will be applied
- <b>validators</b>: Validators that will be applied in the field
- <b>compareObjects</b>: Required when type "select" is choosed

```ts
export interface ParametrizedUploaderFormControlConfig {
  label: string;
  name: string;
  type: "text" | "number" | "select" | "date" | "textarea";
  options?: ParametrizedUploaderOption[];
  required?: boolean;
  validators?: ValidatorFn[];
  compareObjects?: Function
}
```

```ts
 compareObjects() {
    return (option: any, object: any) => {
      return option && object && option.id == object.id;
    }
  }
```



### <a name="parametrized-uploader-option-interface"></a> ParametrizedUploaderOption

Selectable field options:

- <b>value</b>: Value of the option
- <b>label</b>: Label to show

```ts
export interface ParametrizedUploaderOption {
  value: any;
  label: string;
}
```

### <a name="parametrized-uploader-config-interface"></a> ParametrizedUploaderConfig

Uploader Configuration

```ts
export interface ParametrizedUploaderConfig {
  validFileTypes?: string[];
  renameItems?: boolean;
  maxFileSize?: number;
}
```

### <a name="uploader-with-params-table-config-interface"></a> UploaderWithParamsTableConfig

Table configuration:

- <b>fields</b>: Selected fields to display in the table
- <b>actions</b>: Table actions

```ts
export interface UploaderWithParamsTableConfig {
  fields: UploaderWithParamsTableField[];
  actions?: UploaderWithParamsTableActions;
}
```

### <a name="uploader-with-params-table-field-interface"></a> UploaderWithParamsTableField

Table columns:

- <b>name</b>: Object attributes to display
- <b>label</b>: Column label
- <b>dateFormat</b>: Date format for dates. Only needed if the element is a date

```ts
export interface UploaderWithParamsTableField {
  name: string;
  label: string;
  dateFormat?: string;
}
```

### <a name="uploader-with-params-table-actions-interface"></a> UploaderWithParamsTableActions

Table actions:

- <b>edit</b>:
  - If true: when the edit action is clicked, the edit mode of the <i>File Uploader With Params Component</i> will be triggered .
  - Else: the action button will not be displayed
- <b>delete</b>: Delete callback function. If null, the action button will not be displayed
  - When the delete action button is clicked, a delete confirmation modal will be displayed; if accepted, the callback function will be activated.
- <b>preview</b>: Preview callback function. If null, the action button will not be displayed
- <b>download</b>: Download callback function. If null, the action button will not be displayed

> **NOTE**: Callback functions must return <b><i>Promise</i></b> and update the <b>data source</b>

```ts
export interface UploaderWithParamsTableActions {
  edit?: boolean;
  delete?: Function;
  preview?: Function;
  download?: Function;
}
```

## <a name="utils"></a> Utils

### <a name="file-uploader-validator-util"></a> FileUploaderValidator

Utility class to validate files.

```ts
interface FileUploaderValidator {
  static validateFile(
    file: File,
    validTypes: string[],
    maxFileSize: number
  ): boolean;

  static errors(
    files: File[],
    validTypes: string[],
    maxFileSize: number
  ): FileUploaderError[];
}
```

### <a name="coercion-boolean-property-util"></a> CoercionBooleanProperty

Utility class to coerces a data-bound value (typically a string) to a boolean.

```ts
function coerceBooleanProperty(value: any): boolean;
```

## <a name="components"></a> Components

### <a name="internal-components"></a> Internal Components

This components are only used internally by the FileUploader component and module and are not exported.

#### <a name="upload-file-box-component"></a> UploadFileBox

This component is used to show the upload box.

##### Inputs

| Name                     | Type       | Description                                             |
| ------------------------ | ---------- | ------------------------------------------------------- |
| `maxFileSize`            | `number`   | The max file size pass in bytes                         |
| `compact`                | `boolean`  | If true, the component will be compact                  |
| `multiple`               | `boolean`  | If true, the component will be multiple                 |
| `disabled`               | `boolean`  | If true, the component will be disabled                 |
| `validTypes`             | `string[]` | The valid types of files                                |
| `uploadFileBoxLabel`     | `string`   | The i18n label key of the upload file box               |
| `fileList`               | `File[]`   | File array with files to upload                         |
| `preview`                | `boolean`  | Preview mode, only to show files names                  |
| `fileNameListForPreview` | `string[]` | Array with file name, only works with preview prop true |

##### Outputs

| Name            | Type                  | Description             |
| --------------- | --------------------- | ----------------------- |
| `onFilesChange` | `File[]`              | Fires when files change |
| `onFilesError`  | `FileUploaderError[]` | Fires when files error  |

#### <a name="added-file-list-component"></a> AddedFileList

This component is used to show the list of added files.

##### Inputs

| Name                     | Type       | Description                                             |
| ------------------------ | ---------- | ------------------------------------------------------- |
| `multiple`               | `boolean`  | If true, the component will be multiple                 |
| `disabled`               | `boolean`  | If true, the component will be disabled                 |
| `files`                  | `File[]`   | The files to show                                       |
| `renameItems`            | `boolean`  | If true, the component will allow to rename the items   |
| `showTitles`             | `boolean`  | If true, the component will show the titles             |
| `preview`                | `boolean`  | Preview mode, only to show files names                  |
| `fileNameListForPreview` | `string[]` | Array with file name, only works with preview prop true |

##### Outputs

| Name           | Type                     | Description              |
| -------------- | ------------------------ | ------------------------ |
| `onFileChange` | `FileUploaderFileChange` | Fires when a file change |
| `onDelete`     | `FileUploaderFileChange` | Fires when a file remove |

#### <a name="added-file-row-component"></a> AddedFileRow

This component is used to show the added file row.

##### Inputs

| Name             | Type      | Description                                             |
| ---------------- | --------- | ------------------------------------------------------- |
| `disabled`       | `boolean` | If true, the component will be disabled                 |
| `files`          | `File[]`  | The files to show                                       |
| `renameItems`    | `boolean` | If true, the component will allow to rename the items   |
| `preview`        | `boolean` | Preview mode, only to show files names                  |
| `fileForPreview` | `string`  | File name to display, only works with preview prop true |

##### Outputs

| Name           | Type                     | Description              |
| -------------- | ------------------------ | ------------------------ |
| `onFileChange` | `FileUploaderFileChange` | Fires when a file change |
| `onDelete`     | `FileUploaderFileChange` | Fires when a file remove |

#### <a name="parametrized-uploader-component"></a> ParametrizedUploader

This component is used to show the uploader and the form

##### Inputs

| Name             | Type                                      | Description                                                           |
| ---------------- | ----------------------------------------- | --------------------------------------------------------------------- |
| `element`        | `any`                                     | Element to edit. If it is not null, the uploader will be in edit mode |
| `uploaderConfig` | `ParametrizedUploaderConfig`              | The uploader configuration. Default values will applied if not passed |
| `formConfig`     | `ParametrizedUploaderFormControlConfig[]` | Form controls matching file parameters                                |
| `disabled`       | `boolean`                                 | If true, disable form inputs                                          |

##### Outputs

| Name          | Type                           | Description                                     |
| ------------- | ------------------------------ | ----------------------------------------------- |
| `onChanges`   | `FileUploaderWithParamsObject` | Fires when the file uploader and form are valid |
| `canSubmit`   | `boolean`                      | Fires when file or form has been changed        |
| `onFileError` | `FileUploaderError[]`          | Fires when the uploaded file has errors         |

#### <a name="parametrized-files-table-component"></a> ParametrizedFilesTable

This component is used to show the table with the data and actions

##### Inputs

| Name          | Type                            | Description         |
| ------------- | ------------------------------- | ------------------- |
| `tableConfig` | `UploaderWithParamsTableConfig` | Table configuration |
| `dataSource`  | `any`                           | Data to represent   |

##### Outputs

| Name              | Type  | Description                               |
| ----------------- | ----- | ----------------------------------------- |
| `onEditClick`     | `any` | Fires when the edit action is clicked     |
| `onDeleteClick`   | `any` | Fires when the delete action is clicked   |
| `onDownloadClick` | `any` | Fires when the download action is clicked |
| `onPreviewClick`  | `any` | Fires when the preview action is clicked  |

### <a name="global-components"></a> Global Components

This components are exported and can be used in any other component.

#### <a name="file-uploader-component"></a> FileUploader

This component is used to join <i>AddedFileRow</i>, <i>AddedFileList</i> and <i>UploadFileBox</i> components and directives to create the file uploader.

##### Inputs

| Name                      | Type       | Default                                       | Description                                           |
| ------------------------- | ---------- | --------------------------------------------- | ----------------------------------------------------- |
| `maxFileSize`             | `number`   | `2`                                           | The max file size pass in mb                          |
| `compact`                 | `boolean`  | `false`                                       | If true, the component will be compact                |
| `multiple`                | `boolean`  | `false`                                       | If true, the component will be multiple               |
| `disabled`                | `boolean`  | `false`                                       | If true, the component will be disabled               |
| `validTypes`              | `string[]` | `['*']`                                       | The valid types of files                              |
| `uploadFileBoxLabel`      | `string`   | `'FILE_UPLOADER.UPLOAD_FILE_BOX.LABEL'`       | The i18n label key of the upload file box             |
| `uploadFileBoxLabelHover` | `string`   | `'FILE_UPLOADER.UPLOAD_FILE_BOX.LABEL_HOVER'` | The i18n label key of the upload file box when hover  |
| `renameItems`             | `boolean`  | `false`                                       | If true, the component will allow to rename the items |
| `hideTitles`              | `boolean`  | `false`                                       | If true, the component will hide the titles           |
| `hint`                    | `string`   | `''`                                          | The hint of the component                             |

##### Outputs

| Name             | Type                  | Description             |
| ---------------- | --------------------- | ----------------------- |
| `fileListChange` | `File[]`              | Fires when files change |
| `onError`        | `FileUploaderError[]` | Fires when files error  |

#### <a name="file-uploader-with-params-component"></a> FileUploaderWithParamsComponent

This component is used to join <i>ParametrizedUploader</i> and <i>ParametrizedFilesTable</i> components to create the file uploader with params.

##### Inputs

| Name             | Type                                      | Default                                                     | Description                      |
| ---------------- | ----------------------------------------- | ----------------------------------------------------------- | -------------------------------- |
| `formConfig`     | `ParametrizedUploaderFormControlConfig[]` | Required                                                    | Form configuration (File params) |
| `tableConfig`    | `UploaderWithParamsTableConfig`           | Required                                                    | Table configuration              |
| `uploaderConfig` | `ParametrizedUploaderConfig`              | `validFileTypes: ['*']; renameItems: true; maxFileSize: 2;` | Uploader configuration           |
| `dataSource`     | `any`                                     | Required                                                    | Data source                      |
| `sendFunction`   | `Function`                                | Required                                                    | Send callback function           |

##### Outputs

| Name             | Type      | Description                                      |
| ---------------- | --------- | ------------------------------------------------ |
| `showingButtons` | `boolean` | Fires when the upload mode buttons are displayed |

> **NOTE**: Callback functions must return <b><i>Promise</i></b> and update the <b>data source</b>

## <a name="i18n-translations"></a> I18n Translations

- `FILE_UPLOADER.UPLOAD_FILE_BOX.LABEL`: Drag here or click
- `FILE_UPLOADER.UPLOAD_FILE_BOX.LABEL_HOVER`: Drop it here
- `FILE_UPLOADER.UPLOAD_FILE_BOX.MAX_FILE_SIZE` (params: {size}): (max: {{size}} Mb per file)
- `FILE_UPLOADER.ADDED_FILE_LIST.MULTIPLE_TITLE` (params: {count}): {{count}} file/s prepared for sending
- `FILE_UPLOADER.ADDED_FILE_LIST.SINGLE_TITLE`: File prepared for sending
- `FILE_UPLOADER.ADDED_FILE_LIST.RENAME_HINT`: If you need it, click on the file to rename it
- `FILE_UPLOADER.DELETE_SUCCESS_MSG`: Document successfully deleted
- `FILE_UPLOADER.DELETE_ERROR_MSG`: Error deleting document
- `FILE_UPLOADER.SEND_NEW_SUCCESS_MSG`: New document sent successfully
- `FILE_UPLOADER.SEND_EDIT_SUCCESS_MSG`: Document successfully edited
- `FILE_UPLOADER.SEND_ERROR_MSG`: Error sending document
- `FILE_UPLOADER.GENERIC_ERROR_MSG`: An unexpected error has occurred. Please try again later.
- `FILE_UPLOADER.UPLOAD_FILE`: Upload file
