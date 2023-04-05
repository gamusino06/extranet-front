import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import Swal from 'sweetalert2';
import { UserService } from 'src/app/services/user.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { NewPasswordComponent } from 'src/app/new-password/new-password.component';
import { TranslateService } from '@ngx-translate/core';
import { ChangeDetectorRef } from '@angular/core';
import { Globals } from '../globals';

@Component({
  selector: 'app-cambiar-password',
  templateUrl: './cambiar-password.component.html',
  styleUrls: ['./cambiar-password.component.scss']
})
export class CambiarPasswordComponent implements OnInit {
  environment = environment;
  closeImgUrl = '../../assets/img/close.svg';

  hide1: boolean = true;
  hide2: boolean = true;
  hide3: boolean = true;
  tokenRecibido: string;
  user: any;
  password: string;
  regrexPattern:string;
  patterText: string;
  avisoPattern:string;
  text: string;
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
    public globals: Globals,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private cdRef:ChangeDetectorRef
  ) { }

  //Evita que se produzca el ERROR Error: ExpressionChangedAfterItHasBeenCheckedError
  ngAfterViewChecked()
  {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.seteoPorcentajeYValidaciones();
    this.getPatternPassword();
    this.initForm();
    this.getUser();

    //transformNecesario es el item que nos dices si ha llegado a través
    //de la barra de favoritos, si es true entonces hacemos el translateX
    let transform = JSON.parse(localStorage.getItem('transformNecesario'));
    if(transform == true){
        $(document).ready(function(){
          $('.mat-tab-list').css('transform', 'translateX(-28px)');
        });
    }

    //en caso de que sea una pantalla pequeña
    if(screen.width < 1530){
      $(document).ready(function(){
        $('.mat-tab-list').css('transform', 'translateX(-450px)');
      });
    }
  }

  initForm() {
    this.changePassForm = this.formBuilder.group({
      oldPassword: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required, Validators.pattern(this.regrexPattern)]),
      passwordConfirmation: new FormControl('', [Validators.required])
    }, {
      validator: [(this.passwordValidator('password', 'passwordConfirmation')), (this.oldPassValidator('oldPassword', 'password')), (this.passwordValidatorRequirement('password'))]
    });
  }

  ngAfterViewInit() {

  }

  getPatternPassword(){
    this.userService.getPatternPassword().subscribe(data =>{
      if(data){
        this.regrexPattern= data.pattern;
        this.patterText = data.text;
        data.text=this.patterText;
        /*let aux=document.getElementById('patron')
        aux.innerHTML=data.text;*/
      }else{
        if (environment.debug) console.log("Error en el servicio");
      }
    });
  }

  getUser(): void {
    this.spinner.show();
    this.userService.getUser().subscribe(user => {
      this.spinner.hide();
      this.user = user;
    });
  }

  onSubmit() {
    let dataReq = {
      user:this.user.email,
      pwd:this.changePassForm.value.password,
      oldPwd: this.changePassForm.value.oldPassword
    }

    this.spinner.show();
    var title_success = "Contraseña cambiada correctamente";
    var title_error = "No se ha podido cambiar la contraseña";
    var btn_text = "Acceder";
    this.translate.get('CAMBIO_CONTRASENA_SCCESS').subscribe((res: string) => {
      title_success = res;
    });
    this.translate.get('CAMBIO_CONTRASENA_ERROR').subscribe((res: string) => {
      title_error = res;
    });
    this.translate.get('ACCEDER').subscribe((res: string) => {
      btn_text = res;
    });
    this.userService.changePassword(dataReq).subscribe(data => {
      this.spinner.hide();
      if (data) {
        Swal.fire({
          icon:'success',
          title: title_success,
          confirmButtonText: btn_text,
          confirmButtonColor: 'var(--blue)',
          allowOutsideClick: false
        }).then((result) => {
          if(result.isConfirmed){
            location.reload();
          }
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: title_error,
          allowOutsideClick: false
        })
      }
    })
  }

  cancelEdit(){
    location.reload();
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

  oldPassValidator(oldPass: string, newPass:string){
    return(passForm: FormGroup) =>{
      const oldPassword = passForm.controls[oldPass];
      const password = passForm.controls[newPass];
      if(password.errors && !password.errors.mustMatch){
        return;
      }
      if(oldPassword.value === password.value){
        password.setErrors({ mustMatch: true })
      }
      else {
        password.setErrors(null)
      }
    }
  }

}
