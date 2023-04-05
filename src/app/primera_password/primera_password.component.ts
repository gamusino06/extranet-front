import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { LoginData } from '../login/login.component';
import { AcceptGdprComponent } from '../modales/acceptGdpr/acceptGdpr.component';
import { AuthTokenService } from '../services/auth-token.service';
import { UserService } from '../services/user.service';
import { UtilsService } from 'src/app/services/utils.service';
import { TranslateService } from '@ngx-translate/core';
import { Globals } from '../extranet/globals';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-primera_password',
  templateUrl: './primera_password.component.html',
  styleUrls: ['./primera_password.component.scss']
})
export class Primera_passwordComponent implements OnInit {
  logoUrl = '../assets/logos/logo_triple.png';
  hide1: boolean = true;
  hide2: boolean = true;
  tokenRecibido: string;
  user: string;
  password: string;
  regrexPattern:string;
  patterText: string;
  avisoPattern:string;
  text: string;
  loginData:LoginData;
  environment = environment;
  changePassForm: FormGroup;

  //Validators
  upperCasePattern = new RegExp(this.globals.upperCasePattern);
  lowerCasePattern = new RegExp(this.globals.lowerCasePattern);
  digitPattern = new RegExp(this.globals.digitPattern);
  espaciosPattern = new RegExp(this.globals.espaciosPattern);
  especialCharacterPattern = new RegExp(this.globals.especialCharacterPattern);

  valorPorcentajeFortalezaPwd: number;
  auxLongitudAnteriorPassword:number; //Para comprobar si se está borrando o añadiendo caracteres a la contraseña
  validadoMayuscula: boolean;
  validadoMinuscula: boolean;
  validadoDigito: boolean;
  validadoEspacioEnBlanco: boolean;
  validadoCaracterEspecial: boolean;
  validadoLongitudPassword: boolean;
  passwordFuerte: boolean;
  seCumpleTodoslosRequisitos: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private globals: Globals,
    private modalRgpd: MatDialog,
    private authTokenService:AuthTokenService,
    public utils: UtilsService,
    private spinner: NgxSpinnerService,
    private translate: TranslateService
  ) { }


  ngOnInit() {
    this.seteoPorcentajeYValidaciones();

    this.loginData={
      user: '',
      userId: 0,
      gdprId: 0,
      fechaAceptacionGdpr: new Date(),
      gdpr: {}
    };

    this.changePassForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.pattern(this.regrexPattern)]],
      passwordConfirmation: ['', [Validators.required]]
    }, {
      validator: [(this.passwordValidator('password', 'passwordConfirmation')), (this.passwordValidatorRequirement('password'))]
    });

    this.getPatternPassword();
  }

  //Servicio para obtener el patron y el texto.
  getPatternPassword(){
    this.userService.getPatternPassword().subscribe(data =>{
      if(data){
        this.regrexPattern= data.pattern;
        this.patterText = data.text;
        data.text=this.patterText;
        /*let aux=document.getElementById('patron')
        aux.innerHTML=data.text;*/
      }else{
        if (environment.debug) console.log("error en el servicio");
      }
    });
  }

  onSubmit() {
    this.userService.changePassword({ user: this.user, pwd: this.changePassForm.value.password }).subscribe(data => {
      if (data) {
        let tituloPwd = "Contraseña cambiada correctamente";
        this.translate.get('CAMBIO_CONTRASENA_SCCESS').subscribe((res: string) => {
            tituloPwd = res;
        });
        let boton = "Acceder";
        this.translate.get('ACCEDER').subscribe((res: string) => {
            boton = res;
        });

        Swal.fire({
          icon:'success',
          title:tituloPwd,
          confirmButtonText:boton,
          confirmButtonColor: 'var(--blue)',
          allowOutsideClick: false
        }).then((result) => {
          if(result.isConfirmed){
            this.goToExtranet();
          }
        })
      } else {
        let titulo = "No se ha podido cambiar la contraseña";
        this.translate.get('CAMBIO_CONTRASENA_ERROR').subscribe((res: string) => {
            titulo = res;
        });
        this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
      }
    }), (error => {
      if (environment.debug){
        alert("Error al realizar la operacion de cambio Password");
        console.log("no se puede conectar con el");
      }
    });
  }

  goToExtranet(): void {
    this.spinner.show();
    let user=JSON.parse(localStorage.getItem('userWP'));
    let data={
      user:user.email,
      pwd: this.changePassForm.value.password
    }
    localStorage.clear();
    this.authTokenService.getToken(data).subscribe( data => {
      this.spinner.hide();
      if (data){
        localStorage.clear();
        localStorage.setItem('token',data.token);
        localStorage.setItem('userData', user.email);
        localStorage.setItem('userDataFromUsuario', JSON.stringify(data.userDataFromUsuario));
        this.loginData.user = user.email;
        this.loginData.userId = data.userId;
        if(!data.fechaAceptacion) {
          if(data.gdpr) {
            this.loginData.gdprId = data.gdpr.idGdpr;
            this.loginData.gdpr=data.gdpr;
          }
          // fecha temporal hasta que se acepte la gdpr
          this.loginData.fechaAceptacionGdpr = new Date();
          this.openModalAcceptRgpd();
        } else {
          this.router.navigate([this.globals.extranet]);
        }
      }else{
        if (environment.debug) console.log("token no valido");
      }

    })
  }

  openModalAcceptRgpd(){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = this.loginData;
    dialogConfig.height = "80%";
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;
    this.modalRgpd.open(AcceptGdprComponent, dialogConfig);
   }

  seteoPorcentajeYValidaciones(){
    this.valorPorcentajeFortalezaPwd = 0;
    this.auxLongitudAnteriorPassword = 0;
    this.setearValidacionesPassword();
    this.seteoTotalCaracteresIntroducidos(0);
  }

  setearValidacionesPassword(){
    this.validadoMayuscula = false;
    this.validadoMinuscula = false;
    this.validadoDigito = false;
    this.validadoEspacioEnBlanco = false;
    this.validadoCaracterEspecial = false;
    this.validadoLongitudPassword = false;
    this.seCumpleTodoslosRequisitos = false;
    this.passwordFuerte = false;
  }

  seteoTotalCaracteresIntroducidos(numeroCaracteres){
    let aux=document.getElementById('totalCaracteresIntroducidos');
    let textoLlevas = 'llevas';
    this.translate.get('LLEVAS_CARACTERES_INTRODUCIDOS').subscribe((res: string) => {
      textoLlevas = res;
    });

    aux.innerHTML = "(" + textoLlevas + " " + numeroCaracteres + ")";
  }

  //Método que validará los requisitos para que sea una contraseña segura y aceptable por el grupo Preving
  passwordRequirementsValidator(password: string){
    let aumentaTamanioPassword: boolean = false;

    if(this.auxLongitudAnteriorPassword === 0){
      if(password.length > 0)
        aumentaTamanioPassword = true;

    }else{
      //Si es mayor que cero (no puede ser nunca menor que 0)
      //Si la pwd ahora tiene longitud mayor que antes, es que el usuario sigue introduciendo caracteres
      if(password.length > this.auxLongitudAnteriorPassword){
        aumentaTamanioPassword = true;
      }
    }
    //Se actualiza la variable auxiliar
    this.auxLongitudAnteriorPassword = password.length;

    //Se realiza el seteo de las setearValidacionesPassword
    this.setearValidacionesPassword();

    //Si la longitud de la password es mayor que 0 para setear la validación de espacios
    if (password.length > 0)
      this.validadoEspacioEnBlanco = true;

    for (let i = 0; i < password.length; i++){
      let char = password.charAt(i);
      //Se verifica si hay alguna mayúscula
      if(this.upperCasePattern.test(char))
        this.validadoMayuscula = true;

      //Se verifica si hay alguna minúsucla
      if(this.lowerCasePattern.test(char))
        this.validadoMinuscula = true;

      //Se verifica si hay algun dígito
      if(this.digitPattern.test(char))
        this.validadoDigito = true;

      //Se verifica si hay algun espacio
      if(this.espaciosPattern.test(char))
        this.validadoEspacioEnBlanco = false;

      //Se verifica si hay algun caracter especial
      if(this.especialCharacterPattern.test(char))
        this.validadoCaracterEspecial = true;
    }

    let longitudPassword: number = password.length;
    if(longitudPassword >= 8 && longitudPassword <= 15)
      this.validadoLongitudPassword = true;
    else
      this.validadoLongitudPassword = false;

    this.seteoTotalCaracteresIntroducidos(longitudPassword);

    let porcentaje: number = this.conseguirPorcentajeBarra(longitudPassword);
    this.actualizarBarraProgresoPassword(porcentaje, aumentaTamanioPassword);
  }

  conseguirPorcentajeBarra(numeroCaracteres){
    let porcentaje:number = 0;

    if(this.validadoMayuscula && this.lowerCasePattern && this.digitPattern
      && this.validadoDigito && this.validadoEspacioEnBlanco && this.validadoCaracterEspecial && this.validadoLongitudPassword){
      this.seCumpleTodoslosRequisitos = true;
    }else{
      this.seCumpleTodoslosRequisitos = false;
    }

    if(!this.seCumpleTodoslosRequisitos){
      if(numeroCaracteres < 3)
        porcentaje = 5;
      else if(numeroCaracteres < 5 && (this.validadoMayuscula || this.validadoMinuscula)){
        if(!this.validadoCaracterEspecial){
          if(this.validadoDigito)
            porcentaje = 20;
          else
            porcentaje = 15;
        }else{
          if(this.validadoDigito)
            porcentaje = 25;
          else
            porcentaje = 20;
        }
      }else if(numeroCaracteres < 8 && (this.validadoMayuscula || this.validadoMinuscula)){
        if(!this.validadoCaracterEspecial){
          if(this.validadoDigito)
            porcentaje = 40;
          else
            porcentaje = 30;
        }else{
          if(this.validadoDigito)
            porcentaje = 45;
          else
            porcentaje = 40;
        }
      }else if(numeroCaracteres < 8 && this.validadoMayuscula && this.validadoMinuscula && this.validadoDigito && this.validadoCaracterEspecial)
        porcentaje = 59;
      else if(numeroCaracteres > 7 && this.validadoMayuscula && this.validadoMinuscula){
        if(!this.validadoCaracterEspecial){
          if(this.validadoDigito)
            porcentaje = 50;
          else
            porcentaje = 45;
        }else{
          if(this.validadoDigito)
            porcentaje = 65;
          else
            porcentaje = 55;
        }
      }
    }

    //Sólo será password fuerte, si tiene los caracteres necesarios y si se cumple los requisitos
    if( (numeroCaracteres > 7 && numeroCaracteres <= 15) && this.seCumpleTodoslosRequisitos)
      this.passwordFuerte = true;

    if(this.seCumpleTodoslosRequisitos && !this.passwordFuerte)
        porcentaje = 75;

    if(this.seCumpleTodoslosRequisitos && this.passwordFuerte)
        porcentaje = 100;

    return porcentaje;
  }

  actualizarBarraProgresoPassword(porcentajeNuevo: number, aumentaTamanioPassword: boolean){
    let porcentajeAnterior: number = this.valorPorcentajeFortalezaPwd;

    if(aumentaTamanioPassword){
      for (let i = porcentajeAnterior; i <= porcentajeNuevo; i++) {
          window.setTimeout(() => (this.valorPorcentajeFortalezaPwd = i), i * 5);
      }
    }else{
      /*for (let i = porcentajeAnterior; i >= porcentajeNuevo; i--) {
          window.setTimeout(() => (this.valorPorcentajeFortalezaPwd = i), i * 5);
      }*/
      this.valorPorcentajeFortalezaPwd = porcentajeNuevo;
    }
  }

  passwordValidatorRequirement(password1: string) {
    return (passwordForm: FormGroup) => {
      const password = passwordForm.controls[password1];

      this.passwordRequirementsValidator(password.value);
      if (password.errors && !password.errors.mustMatch) {
        return;
      }
      //Si no hay erroes se devolverá null en dicho campo 'errors'
      password.setErrors(null);
    };
  }

  passwordValidator(password1: string, password2: string) {
    return (passwordForm: FormGroup) => {
      const password = passwordForm.controls[password1];
      const passwordConfirmation = passwordForm.controls[password2];
      if (passwordConfirmation.errors && !passwordConfirmation.errors.mustMatch) {
        return;
      }
      if (password.value !== passwordConfirmation.value) {
        passwordConfirmation.setErrors({ mustMatch: true })
      } else {
        passwordConfirmation.setErrors(null)
      }
    };
  }

}
