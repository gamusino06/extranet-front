import {
  FileUploaderError,
  FileUploaderErrorCodes,
  FileUploaderErrorField,
} from "../interfaces/file-uploader-error.interface";

function validateFileType(file: File, validTypes: string[]): boolean {
  return (
    validTypes.includes(`.${file.name.split(".").pop()}`) ||
    validTypes.includes(file.type) ||
    validTypes.includes("*")
  );
}

function validateFileSize(file: File, maxFileSize: number): boolean {
  return file.size <= maxFileSize;
}

export class FileUploaderValidator {
  static validateFile(
    file: File,
    validTypes: string[],
    maxFileSize: number
  ): boolean {
    const isValidType = validateFileType(file, validTypes);
    const isValidSize = validateFileSize(file, maxFileSize);

    return isValidType && isValidSize;
  }

  static errors(
    files: File[],
    validTypes: string[],
    maxFileSize: number
  ): FileUploaderError[] {
    const errors: FileUploaderError[] = [];

    for (const file of files) {
      const error: FileUploaderError = {};
      const errorMessages: FileUploaderErrorField[] = [];

      if (!validateFileType(file, validTypes)) {
        errorMessages.push({
          code: FileUploaderErrorCodes.INVALID_FILE_TYPE,
          message: "Invalid file type",
        });
      }

      if (!validateFileSize(file, maxFileSize)) {
        errorMessages.push({
          code: FileUploaderErrorCodes.FILE_SIZE_TOO_LARGE,
          message: "File size is too large",
        });
      }

      if (errorMessages.length === 0) continue;

      error[file.name] = errorMessages;
      errors.push(error);
    }

    return errors;
  }
}
