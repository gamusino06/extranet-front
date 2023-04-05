import {Injectable} from '@angular/core';
import {UtilsService} from './utils.service';
import {MatDialog} from '@angular/material/dialog';
import {TranslateService} from '@ngx-translate/core';
import {UserService} from './user.service';
import {NgxSpinnerService} from 'ngx-spinner';

@Injectable({
  providedIn: 'root'
})
export class AptitudeReportService {
  constructor(
    public utils: UtilsService,
    public userService: UserService,
    public dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private translate: TranslateService
  ) {
  }

  showProtocolsPopUp(element) {
    this.translate.get('PROTOCOLOS').subscribe((res: string) => {
      element.titleProtocolsPopUp = res;
    });
    element.showProtocolsPopUpSpinner = true;
    let titulo = '';
    if (element.protocolos === undefined) {
      this.spinner.show();
      let data = [element.idDocumento - element.idTipoDocumento * 10000000];
      this.userService.getProtocols(data).subscribe((protocols) => {

        element.protocolos = [];
        if (protocols.length !== 0) {
          protocols = protocols[0].name.split(';').sort((a, b) => {
            return a.trim() < b.trim() ? -1 : 1;
          });
          protocols.forEach(p => {
            if (p.at(0) === ' ') {
              p = p.substring(1);
            }
            if (p.includes('RRMM Básico')) {
              element.protocolos = [p].concat(element.protocolos);
            } else {
              element.protocolos.push(p);
            }
          });
          this.translate.get('PROTOCOLOS').subscribe((res: string) => {
            titulo = res;
          });
          this.utils.fireMessageListPopup(undefined, titulo, element.protocolos, undefined, true);
        } else {
          this.mostrarMensajeSwalFireProtocoloNoEncontrado();
        }
        this.spinner.hide();
      }, (error) => {
        console.log('Error: ', error);
        let titulo = '';
        this.translate.get('ERROR').subscribe((res: string) => {
          titulo = res;
        });
        this.spinner.hide();
        this.utils.mostrarMensajeSwalFire('error', titulo, '', 'var(--blue)', false);
      });
    } else {
      if (element.protocolos.length !== 0) {
        this.translate.get('PROTOCOLOS').subscribe((res: string) => {
          titulo = res;
        });
        this.utils.fireMessageListPopup(undefined, titulo, element.protocolos, undefined, true);
      } else {
        this.mostrarMensajeSwalFireProtocoloNoEncontrado();
      }
    }
  }

  mostrarMensajeSwalFireProtocoloNoEncontrado() {
    let titulo = this.utils.traducirTextos('No hay datos a mostrar', 'COMPONENTS.POPUP-LIST.NO_DATA');
    this.utils.mostrarMensajeSwalFire('warning', titulo, '', 'var(--blue)', false);
  }
}
