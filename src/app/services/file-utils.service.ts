import { Injectable } from "@angular/core";

export interface uploadDocumentDto {
  fileType: string;
  fileName: string;
  fileExtension: string;
  description?: string;
  file?;
}

@Injectable({
  providedIn: "root",
})
export class FileUtils {
  /**
   *
   * @param file
   * @returns Base64 string
   */
  getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(",").pop());
      reader.onerror = (error) => reject(error);
    });
  }

  /**
   * @param docsToUpload: File[]
   * @returns Promise<uploadDocumentDto[]>
   * @description Transform the files to base64 and return a list of uploadDocumentDto
   */
  getUploadDocumentDTO(docsToUpload: File[]): Promise<uploadDocumentDto[]> {
    return new Promise((resolve) => {
      if (docsToUpload.length === 0) resolve([]);

      const listDocumentDTO = [];
      docsToUpload.forEach((file) => {
        const uploadDocumentDto: uploadDocumentDto = {
          fileName: file.name.split(".").shift(),
          fileType: file.type,
          fileExtension: file.name.split(".").pop(),
          file: file,
        };
        listDocumentDTO.push(uploadDocumentDto);
      });

      // Transform the files to base64
      const promises = listDocumentDTO.map((document) => {
        const file = document.file;
        if (file) {
          return this.getBase64(file).then((base64File) => {
            document.file = base64File;
            return Promise.resolve(document);
          });
        } else {
          return Promise.resolve(document);
        }
      });

      Promise.all(promises).then((documentsWithBase64) => {
        const documentsToSend = documentsWithBase64.filter(
          (doc) => doc.file !== undefined
        );
        resolve(documentsToSend);
      });
    });
  }

  /**
   * @param DocumentDownloadDto || {file, contentType, filename}
   * @returns void
   * @description Download file from base64 string
   */
  downloadFileFromBase64(documentDownloadDto) {
    if (documentDownloadDto.file) {
      const linkSource = `data:${documentDownloadDto.contentType};base64,${documentDownloadDto.file}`;
      const filename = documentDownloadDto.fileName;
      const downloadLink = document.createElement("a");
      downloadLink.href = linkSource;
      downloadLink.download = filename;
      downloadLink.click();

      setTimeout(function () {
        downloadLink.remove();
        // document.body.removeChild(downloadLink);
      }, 1000);
    }
  }

  /**
   * @param DocumentDownloadDto || {file, contentType, filename}
   * @returns Blob
   * @description Get PDF Blob from base64 string
   */
  getPDFBlobFromBase64(documentDownloadDto) {
    if (documentDownloadDto) {
      const byteArray = new Uint8Array(
        atob(documentDownloadDto.file)
          .split("")
          .map((char) => char.charCodeAt(0))
      );
      let blob = new Blob([byteArray], { type: "application/pdf" });
      return blob;
    }
  }

  /**
   * @param Blob
   * @param filename
   * @returns void
   * @description Download file from Blob
   * @example downloadFileFromBlob(blob, "filename.pdf")
   */
  downloadFileFromBlob(blob, filename) {
    const link = document.createElement("a");

    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    setTimeout(function () {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(window.URL.createObjectURL(blob));
    }, 1000);
  }
}
