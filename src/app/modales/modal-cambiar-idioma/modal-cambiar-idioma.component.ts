import { values } from './../../mocks/table-value-mock';
import { environment } from '../../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from 'src/app/services/user.service';
import { UtilsService } from 'src/app/services/utils.service';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-modal-cambiar-idioma',
  templateUrl: './modal-cambiar-idioma.component.html',
  styleUrls: ['./modal-cambiar-idioma.component.css']
})
export class ModalCambiarIdiomaComponent implements OnInit {

  environment = environment;
  loading = false;
  submitted = false;
  value: any;
  data: any;
  idiomasLoginList: any[] = [];
  idIdiomaSeleccionado: any;

  /*formularios*/
  loginForm: FormGroup;

  constructor(
    private modal: MatDialog,
    private userService: UserService,
    public utils: UtilsService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.getIdiomasLogin();
  }

  selectIdioma(idioma) {
      localStorage.setItem("lang",idioma.lang);
      this.translate.use(idioma.lang);
      switch (idioma.nombre) {
        case 'Inglés':
          this.translate.setDefaultLang('en-GB');
          break;
        case 'Euskera':
          this.translate.setDefaultLang('es-EU');
          break;
        case 'Catalán':
          this.translate.setDefaultLang('es-CA');
          break;
        case 'Español':
        default:
          this.translate.setDefaultLang('es-ES');
          break;
      }


    //TODO: si el idioma cambia, llamar a userService para cambiarlo, y lo mismo hacer para el storage?
    // fijarme de lo que haya en el login en relación al idioma
    this.cerrarModal()
  }

  getIdiomasLogin() {
    this.userService.getIdiomasLogin().subscribe(data => {
      this.idiomasLoginList = data;
      let lang = localStorage.getItem("lang");
      console.log('lang: ',lang)
      console.log('data: ',data)
      this.idIdiomaSeleccionado = data.filter(idioma => idioma.lang === lang)[0].idIdioma;
    }), (error => {
    })
  }

  getIdiomaTraducido(lang: string) {
    let idiomaTraducido = 'Español';
    this.translate.get('lang_' + lang.replace('-', '_')).subscribe((res: string) => {
      idiomaTraducido = res;
    });
    return idiomaTraducido;
  }

  cerrarModal() {
    this.modal.closeAll();
  }

}


