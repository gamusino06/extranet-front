import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { UserService } from '../services/user.service';
import { AuthTokenService } from '../services/auth-token.service';
import { User } from '../Model/User';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Globals } from '../extranet/globals';
import { UtilsService } from 'src/app/services/utils.service';

/*Routing */
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Location } from '@angular/common';
import { Login } from '../Model/Login';
import { ThrowStmt, tokenName } from '@angular/compiler';
import { ResetPassComponent } from '../modales/reset-pass/reset-pass.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AnonymousSubject } from 'rxjs/internal/Subject';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-login',
  templateUrl: './login-simulado.component.html',
  styleUrls: ['./login-simulado.component.css']
})

export class LoginSimuladoComponent implements OnInit {
  environment = environment;
  imgUrl = '../assets/img/CrossBanner.png';
  logoUrl = '../assets/logos/logo.png';
  logoWhiteUrl = '../assets/img/LogoPrevingWhite.svg';

  user: string;
  token: string;
  loginSimulado: boolean = false;
  listaIdEmpresas: any;

  constructor(private userService: UserService,
              private router: Router,
              private globals: Globals,
              public utils: UtilsService,
              private authTokenService: AuthTokenService,
              private spinner: NgxSpinnerService,
              public translate: TranslateService) {
  }

  ngOnInit(): void {
    //Se llama a este componente de esta forma:
    //http://localhost:4200/login-simulado?loginSimulado=true&user=rarroyop@avansis.es&token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJtb2RlIjoiZXh0cmFuZXQiLCJ1c2VyIjoicmNsYXJhbXVudEBhdmFuc2lzLmVzIiwiYXV0aG9yaXRpZXMiOltdLCJqdGkiOiJwcmV2aW5nSldUVUlEXzNiMTdiYjMxODg4NDQ4MTdiNzk0NzE3ODRmZGJjOTkyIiwic3ViIjoiVG9rZW4gU2VjdXJpdHkgUHJldmluZyBFeHRyYW5ldCIsImF1ZCI6InByZXZpbmdXRUIiLCJpc3MiOiJwcmV2aW5nSldUIiwiaWF0IjoxNjQ0ODU3OTMwLCJuYmYiOjE2NDQ4NTc5MzAsImV4cCI6MTY0NDg5MzkzMH0.j7bZHq52C-fxaFXXJHxxxuyOl5-NIVf7JVBkCdNnq5TRsPE_ocz9xM6ei5JbCZszyDl3G1jKD-tbh7Xfh2p_UQ

    localStorage.clear();
    this.recogidaDeParametros();
  }

  recogidaDeParametros(){
    let paramsString = window.location.search;
    let searchParams = new URLSearchParams(paramsString);
    if (searchParams.has("user"))
      this.user = searchParams.get("user");

    if (searchParams.has("token"))
      this.token = searchParams.get("token");

    if (searchParams.has("loginSimulado"))
      this.loginSimulado = (searchParams.get("loginSimulado") === "true");

    if (searchParams.has("listaIdEmpresas"))
          this.listaIdEmpresas = (searchParams.get("listaIdEmpresas"));

    this.getUser();
  }

  getUser(): void {
    this.spinner.show();
    localStorage.setItem('token', this.token);
    localStorage.setItem('userData', this.user);
    if (this.user !== undefined && this.token !== undefined && this.loginSimulado != false){
      this.userService.getUser().subscribe(user => {
        this.spinner.hide();
        if (user !== undefined){
          localStorage.setItem('userDataFromUsuario', JSON.stringify(user));
          let lang = user.idioma.lang;
          localStorage.setItem("lang", lang);

          //Se setea que se ha accedido con loginSimulado para no guardar cambios con el usuario simulado en:
          //- Aceptar condiciones de uso de usuario
          //- Aceptaciones de términos de documentos
          //- Acciones de documentación: descarga, previsualizar, enviar por correo un doc
          //Sin embargo, SÍ deberá grabar mensajes en las siguientes acciones:
          //-consulta tus dudas, recordar welcome pack, recordar pass, enviar doc, citas ...
          localStorage.setItem("loginSimulado", 'true');

          this.translate.use(lang);
          this.translate.setDefaultLang(lang);
          this.goToExtranet();
        }/*else{
          this.mensajeErrorYRedireccionALogin();
        }*/
      });
    }else{
      this.spinner.hide();
      this.mensajeErrorYRedireccionALogin();
    }
  }

  goToExtranet(): void {
    if (this.user !== undefined && this.token !== undefined && this.loginSimulado != false){
      this.spinner.show();
      this.getIdiomas();
      this.router.navigate([this.globals.extranet]);
      this.spinner.hide();
    }else{
      this.mensajeErrorYRedireccionALogin();
    }
  }

  mensajeErrorYRedireccionALogin(){
    let titulo = "No ha sido posible redirigirle a la extranet del Grupo Preving. Contacte con el servicio técnico";
    this.translate.get('ERROR_CARGANDO_SIMULACION').subscribe((res: string) => {
      titulo = res;
    });
    this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
    this.router.navigate([this.globals.login_url]);
  }

  getIdiomas() {
    this.userService.getIdiomas().subscribe(data => {
      localStorage.setItem('idiomas', JSON.stringify(data));
    }), (error => {
    })
  }

}
