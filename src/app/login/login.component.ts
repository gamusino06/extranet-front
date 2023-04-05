import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { environment } from '../../environments/environment';
import { UserService } from '../services/user.service';
import { AuthTokenService } from '../services/auth-token.service';
import { User } from '../Model/User';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Globals } from '../extranet/globals';

/*Routing */
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Location } from '@angular/common';
import { Login } from '../Model/Login';
import { ThrowStmt, tokenName } from '@angular/compiler';
import { NewResetPassComponent } from '../modales/new-reset-pass/new-reset-pass.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NewRgpdComponent } from '../modales/new-rgpd/new-rgpd.component';
import { AnonymousSubject } from 'rxjs/internal/Subject';
import { AcceptGdprComponent } from '../modales/acceptGdpr/acceptGdpr.component';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ModalCambiarIdiomaComponent } from '../modales/modal-cambiar-idioma/modal-cambiar-idioma.component';


export interface LoginData {
  user: string ,
  userId: number ,
  gdprId: number ,
  fechaAceptacionGdpr: Date,
  gdpr:any
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css', '../../assets/css/new-styles.css'],
  // encapsulation: ViewEncapsulation.None
})


export class LoginComponent implements OnInit {
  environment = environment;
  webEnMantenimiento: boolean;
  imgUrl = '../assets/img/login/login_banner_1920.png';
  logoUrl = '../assets/logos/logo_eslogan.png';
  logoMantenimientoUrl = '../assets/logos/logo.png';
  logoAcercateUrl = '../assets/logos/logo_vitaly_acercate.png';


  bannerObject = {
    title: 'CoronaVirus',
    detail: 'Con motivo del estado de alerta a nivel mundial sobre la epidemia del coronavirus 2019-nCoV, desde Grupo Preving queremos indicar algunas pautas claves del tema.',
    isButton: true,
    buttonDescription: 'SABER MÁS',
    imgUrl: '../assets/img/estrellas.jpg',
    bannertUrl: 'https://www.preving.com/prevencion-coronavirus/'
  };

  user: User;
  loginForm: FormGroup;
  login: Login;
  hide: Boolean = true;
  loginResponse : any;

  loginData: LoginData;

  constructor(private userService: UserService,
    private router: Router,
    private globals: Globals,
    private authTokenService: AuthTokenService,
    private modalReset: MatDialog,
    private modalRgpd: MatDialog,
    private modalAcceptGdpr: MatDialog,
    private modalCookies: MatDialog,
    private modalCambiarIdioma: MatDialog,
    private spinner: NgxSpinnerService,
    public translate: TranslateService
  ) {
  }

  ngOnInit(): void {
    localStorage.clear();

    this.webEnMantenimiento = environment.webEnMantenimiento;
    //Indica que la web está en mantenimiento y redirigirá a Login si no estaba ya en dicha pantalla y mostará una pantalla de mantenimiento
    if(!this.webEnMantenimiento){
      this.loginData={
          user: '',
          userId: 0,
          gdprId: 0,
          fechaAceptacionGdpr: new Date(),
          gdpr: {}
      };

      this.loginForm = new FormGroup({
        user: new FormControl('', [Validators.required, Validators.email]),
        pwd: new FormControl('', Validators.required),
        //NOTA: Descomentar para pruebas en local con un superAdmin
        //listaIdEmpresas: new FormControl([568772,30907,42966])
      }
      );
    }else{
      //Se setea el idioma del navegador del usuario al estar la web en mantenimiento y no tener ninguna llamada al Back
      let idiomaNavegador: string = navigator.language;
      let lang: string;

      switch(idiomaNavegador) {
        case "en-GB":
        case "es-EU":
        case "es-CA":
          lang = idiomaNavegador;
          break;
        default:
          lang = "es-ES";
      }
      localStorage.setItem("lang",lang);
      this.translate.use(lang);
      this.translate.setDefaultLang(lang);
    }
  }

  goToExtranet(): void {
    this.spinner.show();
    let data = this.loginForm.value;
    localStorage.clear();
    this.authTokenService.getToken(data).subscribe( data => {
      if (data){
        localStorage.setItem('token',data.token);
        localStorage.setItem('userData', this.loginForm.value.user);
        this.loginData.user = this.loginForm.value.user;
        this.loginData.userId = data.userId;

        let lang = localStorage.getItem("lang");
        if (lang == undefined)
        {
          lang = data.lang;
          localStorage.setItem("lang",lang);
        }
        this.translate.use(lang);
        this.translate.setDefaultLang(lang);

        if(!data.fechaAceptacion) {
          if(data.gdpr) {
            this.loginData.gdprId = data.gdpr.idGdpr;
            this.loginData.gdpr=data.gdpr;
          }
          // fecha temporal hasta que se acepte la gdpr
          this.loginData.fechaAceptacionGdpr = new Date();
          this.openModalAcceptRgpd();
        }
        else {
          this.router.navigate([this.globals.extranet]);
        }

        localStorage.setItem('userDataFromUsuario', JSON.stringify(data.userDataFromUsuario));
        this.getIdiomas();
        this.spinner.hide();

        /*this.userService.getUser().subscribe(result => { //Se obtiene todos los datos del usuario. Al tener ya el token del usuario.
          this.translate.use(data.lang);
          this.translate.setDefaultLang(data.lang);

          if(!data.fechaAceptacion) {
            if(data.gdpr) {
              this.loginData.gdprId = data.gdpr.idGdpr;
              this.loginData.gdpr=data.gdpr;
            }
            // fecha temporal hasta que se acepte la gdpr
            this.loginData.fechaAceptacionGdpr = new Date();
            this.openModalAcceptRgpd();
          }
          else {
            this.router.navigate([this.globals.extranet]);
          }

          localStorage.setItem('userDataFromUsuario', JSON.stringify(result));
          this.getIdiomas();
          this.spinner.hide();
        });*/
      }else{
        if (environment.debug) console.log("token no valido");
        this.spinner.hide();
      }

    });
  }

  getIdiomas() {
    this.userService.getIdiomas().subscribe(data => {
      localStorage.setItem('idiomas', JSON.stringify(data));
    }), (error => {
    })
  }


  openModalResetPass() {
    let dialogConfig = new MatDialogConfig();
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = false;
    const modalReset = this.modalReset.open(NewResetPassComponent, dialogConfig);
  }

  closeModalReset() {
    this.modalReset.closeAll();
  }

  openModalRgpd(){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = this.loginData;
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;
    this.modalRgpd.open(NewRgpdComponent, dialogConfig);
  }

  openModalAcceptRgpd(){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = this.loginData;
    dialogConfig.height = "80%";
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;
    this.modalRgpd.open(AcceptGdprComponent, dialogConfig);
  }

  closeModalRgpd() {
    this.modalRgpd.closeAll();
  }

  openModalCambiarIdioma() {
    const modalIdioma = this.modalCambiarIdioma.open(ModalCambiarIdiomaComponent,{
      height: '300px',
      width: '500px',
    });
  }


}
