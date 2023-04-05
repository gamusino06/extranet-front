export interface FileUploaderError {
  [key: string]: FileUploaderErrorField[];
}

export interface FileUploaderErrorField {
  code: FileUploaderErrorCodes;
  message: string;
}

export enum FileUploaderErrorCodes {
  INVALID_FILE_TYPE = "invalid-file-type",
  FILE_SIZE_TOO_LARGE = "file-size-too-large",
}
