import { Component, Input, OnInit, Output, EventEmitter, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { Globals } from '../globals';
import { TranslateService } from '@ngx-translate/core';
import { Area } from '../../Model/Area';
import { environment } from '../../../environments/environment';
import {NgxSpinnerService} from 'ngx-spinner';
import {Empresa} from '../../Model/Empresa';

@Component({
  selector: 'app-user-header',
  templateUrl: './user-header.component.html',
  styleUrls: ['./user-header.component.css']
})
export class UserHeaderComponent implements OnInit {
  environment = environment;
  userLogoUrl = '../../assets/logos/logo_triple.png';
  pararLlamadas: boolean = false;

  @Input() userLoged:any;
  @Input() nMensajesLeidos:any;
  @Output() areaActive = new EventEmitter<Area>();
  @Input() areaSelected:number;

  areaList:Area[];
  extranetUrl: string;

  showLanguageModal = false;
  languageModalConfigurationObj: object = {
    languageList: []
  };
  // maibe delete
  areas: any;
  empresasUsuario: Empresa[];
  bannerCitas = false;


  constructor(
    private userSevice: UserService,
    private router: Router,
    public globals: Globals,
    public translate: TranslateService,
    private spinner: NgxSpinnerService,
    private userService: UserService
  ) {

  }

  ngOnInit(): void {
     let timerId = setInterval(() => this.timer(), 900000); // Ampliamos el tiempo a 15 minutos
     this.pararLlamadas = false;
     this.extranetUrl = this.globals.extranet_url;
  }

  ngOnChanges() {
    /*Cuando recibo la respuesta de el servidor puedo pintar los modulos correspondientes*/
    if (this.userLoged) {
       this.areaList = this.userLoged.areas;
    }
  }

  timer() {
    if(this.userLoged != undefined) {
      if (environment.production) this.mensajesSinLeer();
    }
  }

  logout() {
    var title_cerrar = "¿Quieres cerrar sesión?";
    var btn_text_cerrar  = "Si, cerrar sesión";
    var btn_text_volver = "Volver";
    this.translate.get('QUIERES_CERRAR_SESION').subscribe((res: string) => {
      title_cerrar = res;
    });
    this.translate.get('SI_CERRAR_SESION').subscribe((res: string) => {
      btn_text_cerrar = res;
    });
    this.translate.get('VOLVER').subscribe((res: string) => {
      btn_text_volver = res;
    });
    Swal.fire({
      title: title_cerrar,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#var(--blue)',
      // cancelButtonColor: '#d33',
      confirmButtonText: btn_text_cerrar,
      cancelButtonText: btn_text_volver,
      allowOutsideClick: false
    }).then((result) => {
      if (result.isConfirmed) {
          localStorage.clear();
          this.userLoged = undefined;
          this.pararLlamadas = true;
          this.router.navigate([this.globals.login_url]);
      }
    })
  }

  mensajesSinLeer(){
    if (this.pararLlamadas==false){
      this.userSevice.countNotRead().subscribe(data => {
        if (data===undefined) this.pararLlamadas = true;
        else {
          this.nMensajesLeidos = data;
          this.pararLlamadas == false;
        }
      }), (error => {
        if (environment.debug) console.log("Error");
        this.pararLlamadas=true;
      })
    }
  }

  selectModule(moduleId) {
    let area = {} as Area;
    area = this.areaList.find((obj => obj.idArea == moduleId));
    if (area!==undefined)
    {
      localStorage.setItem("selectedTab",null); //Seteamos la pestaña seleccionada del localStorage a null para que no marque ninguna pestaña.
      this.areaActive.emit(area);
      if (area.ruta!==undefined){
        this.router.navigate([this.extranetUrl + area.ruta]);
      }
      if (environment.debug) console.log(area);
    }

  }

  onShowLanguageModal(): void {
    this.showLanguageModal = true;
  }

  acceptLanguageChange(lang: any): void {
    this.translate.use(lang);
    this.translate.setDefaultLang(lang);
    localStorage.setItem('lang', lang);
    this.getUserData();
    location.reload();
  }
  discardLanguageChange(): void {
    this.showLanguageModal = false;
  }
  getUserData(): void {
    this.spinner.show();
    this.userService.getUser().subscribe(user => {
      this.empresasUsuario = user.empresas;
      this.areas = user.areas;
      this.userLoged = user;
      if (user.areas !== undefined) {
        if (user.areas.find(element => element.idArea === this.globals.idAreaVS)){
          this.bannerCitas = true;
        }
      }

      let lang = localStorage.getItem('lang');
      if (lang === undefined) {
        lang = user.idioma.lang;
        localStorage.setItem('lang', lang);
      }
      this.translate.use(lang);
      this.translate.setDefaultLang(lang);

      const auxArea = user.areas.find(element => element.idArea === this.areaSelected);
      this.areaActive.emit(auxArea);
      this.spinner.hide();
    });
  }

  redirectToMyProfile(): void {
    this.selectModule(this.globals.myProfileIdArea);
    this.router.navigate([this.globals.extranet_url + this.globals.myData]);
  }

  redirectToChangePassword(): void {
    this.selectModule(this.globals.myProfileIdArea);
    this.router.navigate([this.globals.extranet_url + this.globals.myPassword]);
  }

}
