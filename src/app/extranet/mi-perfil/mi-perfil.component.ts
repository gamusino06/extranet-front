import { Idioma } from './../../Model/Idioma';
import { environment } from '../../../environments/environment';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.component.html',
  styleUrls: ['./mi-perfil.component.css']

})
export class MiPerfilComponent implements OnInit {
  environment = environment;
  closeImgUrl = '../../assets/img/close.svg';
  searchImgUrl = '../../assets/img/search.svg';
  filterImgUrl = '../../assets/img/filter.svg';
  excelImgUrl = '../../assets/img/excel.svg';
  mailImgUrl = '../../assets/img/mail.svg';
  downloadImgUrl = '../../assets/img/download.svg';

  hide1: boolean = true;
  hide2: boolean = true;
  empresasList: any[];
  centroList: any[];
  idiomasList: Idioma[];
  rolesList: any[];
  regrexPattern: string;

  userForm: FormGroup;
  userToMod: any;
  @Input() userDataLogged: any;

  rolesSelectedResult: any[];
  empresasSelected: any[];
  centrosSelected: any[];

  isSuperAdmin: any;
  verReconocimientos:boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
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
    this.empresasList = [];
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
        $('.mat-tab-list').css('transform', 'translateX(-430px)');
      });
    }
  }

  onSubmit(): void {
    this.modifyUser();
  }

  transformRoles() {
    this.rolesSelectedResult = [];
    this.userToMod.roles.forEach(rolSelected => {
      this.rolesSelectedResult.push(rolSelected.idRol);
    })
  }

  transformEmpresas() {
    this.empresasSelected = [];
    this.userToMod.empresas.forEach(empresa => {
      this.empresasSelected.push(empresa.idEmpresa);
    })
  }

  transformCentros() {
    this.centrosSelected = [];
    this.userToMod.empresas.forEach(empresas => {
      empresas.centros.forEach(centro => {
        this.centrosSelected.push(centro.idCentro);
      })
    })
  }

  getEmpresasyCentrosUser() {
    this.userService.getEmpresasUser().subscribe(data => {
      if(data){
        this.empresasList = data;
        this.centroList = [];
        this.empresasList.forEach(empresas => {
          empresas.centros.forEach(centro => {
            this.centroList.push(centro);
          });
        })
      }else{
        this.spinner.hide();
      }

      if (environment.debug) console.log("Succes");
    }), (error => {
      if (environment.debug) console.log("Error");
    })
  }

  getIdiomas() {
    this.userService.getIdiomas().subscribe(data => {
      if(data){
        this.idiomasList = data;
      }else{
        this.spinner.hide();
      }
      if (environment.debug) console.log("Succes");
    }), (error => {
      if (environment.debug) console.log("Error");
    })
  }



  getUser(): void {
    this.userService.getUser().subscribe(data => {
      if(data){
      	this.userToMod=data;
        this.rolesList = data.roles;
        this.isSuperAdmin = false;
        this.rolesList.forEach(rol => {
          if (rol.idRol==1)
            this.isSuperAdmin = true;
        });
        this.verReconocimientos= data.verReconocimientos;
        this.empresasList = data.empresas;
        this.getIdiomas();
        this.transformRoles();
        this.transformEmpresas();
        this.transformCentros();

        this.fillUserDataInfo();
      }else{
      	this.spinner.hide();
      }

    });
  }

  fillUserDataInfo(){
    this.userForm = this.formBuilder.group({
      mailUsuario: new FormControl({value:this.userToMod.email, disabled:true}, [Validators.required, Validators.email]),
      nombre: new FormControl(this.userToMod.nombre, [Validators.required]),
      apellidos: new FormControl(this.userToMod.apellidos, [Validators.required]),
      idioma: new FormControl(this.userToMod.idioma.idIdioma, [Validators.required]),
      password: new FormControl(''),
      passwordConfirmation: new FormControl(''),
      accesoForm: new FormControl({value:this.rolesSelectedResult, disabled: true}),
      empresaForm: new FormControl({value:this.empresasSelected, disabled: true}),
      centroForm: new FormControl({value:this.centrosSelected, disabled: true}),
      verReconocimientosForm: new FormControl({value:this.userToMod.verReconocimientos, disabled: true})
    });
  }

  modifyUser() {
    let dataReq = {
      user: this.userForm.get('mailUsuario').value,
      nombre: this.userForm.get('nombre').value,
      apellidos: this.userForm.get('apellidos').value,
      idIdioma: this.userForm.get('idioma').value,
      userId: 0
    }

    dataReq.user = this.userToMod.email;
    dataReq.userId = this.userToMod.idUsuario;

    this.spinner.show();
    this.userService.modifyUser(dataReq).subscribe(data => {
      this.spinner.hide();
      //Modificamos el usuario del localStorage por el que obtiene de back tras modificarlo.
      localStorage.setItem('userDataFromUsuario', JSON.stringify(data));
      let titulo = "Usuario editado con exito";
      this.translate.get('USUARIO_EDITADO_CON_EXITO').subscribe((res: string) => {
          titulo = res;
      });

      Swal.fire({
      icon: 'success',
      title: titulo,
      confirmButtonColor: 'var(--blue)',
      allowOutsideClick: false
    }).then((result) => {
      if (result.isConfirmed) {
        location.reload();
      }
    })

  }), (error => {
    if (environment.debug) console.log("Error");
  })
  }

  cancelEdit(){
    location.reload();
  }
}
