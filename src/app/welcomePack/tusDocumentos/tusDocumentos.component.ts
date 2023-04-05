import { Component, OnInit } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { UserService } from 'src/app/services/user.service';
import { TranslateService } from '@ngx-translate/core';

export interface Documentos {
  idDocumento: number;
  nombre: string;
}
export interface EmpresaDocumentos {
  idEmpresa: number;
  nombre: string;
  documentos: Documentos[];
}

@Component({
  selector: 'app-tusDocumentos',
  templateUrl: './tusDocumentos.component.html',
  styleUrls: ['./tusDocumentos.component.scss']
})
export class TusDocumentosComponent implements OnInit {

  empresaDocumentos: EmpresaDocumentos;

  constructor(
    public utils: UtilsService,
    private userService: UserService,
    private spinner: NgxSpinnerService,
    public translate: TranslateService
  ) { }

  ngOnInit() {
    this.spinner.show();
    this.userService.getCertificadosEmpresasUser().subscribe(empresaDocumentos => {
      if(empresaDocumentos){
        this.empresaDocumentos = <EmpresaDocumentos>empresaDocumentos;
      }
      this.spinner.hide();
    }),(error=>{
    });
  }


  descargar(element) {
    if(!element)
      return false;

    this.spinner.show();
    this.utils.getFile({
      listaIdsDocumentos: [element.idDocumento],
      listaIdsTiposDocumentos: [element.tipoDocumento.idTipoDocumento],
      listaUuidsDocumentos: [element.ubicacion],
      accion: { idAccionDoc: "2" }
    }).subscribe(pdfBase64 => {
      if(pdfBase64){
        let downloadLink = document.createElement('a');
        downloadLink.href = `data:application/pdf;base64,${pdfBase64.fichero}`;
        const filename = pdfBase64.nombreFichero + '.pdf';
        downloadLink.download = filename;
        downloadLink.click();
      }
      this.spinner.hide();
    })
  }

}
