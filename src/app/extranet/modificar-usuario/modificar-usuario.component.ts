import { Idioma } from './../../Model/Idioma';
import { environment } from '../../../environments/environment';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { UtilsService } from 'src/app/services/utils.service';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import {NgxSpinnerService} from 'ngx-spinner';
import { ChangeDetectorRef } from '@angular/core';
import * as _moment from 'moment';

import { Centro } from 'src/app/Model/Centro';
import { Empresa } from 'src/app/Model/Empresa';

const moment = _moment;

@Component({
  selector: 'app-modificar-usuario',
  templateUrl: './modificar-usuario.component.html',
  styleUrls: ['./modificar-usuario.component.css']
})
export class ModificarUsuarioComponent implements OnInit {
  environment = environment;
  closeImgUrl = '../../assets/img/close.svg';
  searchImgUrl = '../../assets/img/search.svg';
  filterImgUrl = '../../assets/img/filter.svg';
  excelImgUrl = '../../assets/img/excel.svg';
  mailImgUrl = '../../assets/img/mail.svg';
  downloadImgUrl = '../../assets/img/download.svg';

  data: any;

  hide1: boolean = true;
  hide2: boolean = true;
  mapaEmpresa = new Map();  //Uso en el componente select-empresa-filter
  empresasList: Empresa[];
  centroList: Centro[];
  idiomasList: Idioma[];
  rolesList: any[];
  regrexPattern: string;

  today = new Date().getDate();

  userModForm: FormGroup;

  @Input() userToMod: any;
  @Input() userDataLogged: any;
  @Output() usuarioModificadoEvent = new EventEmitter();

  rolesSelectedResult: any[];
  empresasSelected: any[];
  centrosSelected: any[];
  isSuperAdmin: any;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private spinner: NgxSpinnerService,
    public utils: UtilsService,
    private translate: TranslateService,
    private cdRef:ChangeDetectorRef
  ) { }

  //Evita que se produzca el ERROR Error: ExpressionChangedAfterItHasBeenCheckedError
  ngAfterViewChecked()
  {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.spinner.show();
    this.empresasList = [];

    /*rellenamos los inputs*/
    /*actualizadmos parametros roles, empresas y centros*/
    this.getUser();
    this.getIdiomas();
    this.transformRoles();
    this.transformEmpresasCentros();

    let fechaBaja= new Date();
    this.userModForm = this.formBuilder.group({
      mailUsuario: new FormControl({value:this.userToMod.email, disabled:true}, [Validators.required, Validators.email]),
      nombre: new FormControl(this.userToMod.nombre, [Validators.required]),
      apellidos: new FormControl(this.userToMod.apellidos, [Validators.required]),
      idioma: new FormControl(this.userToMod.idioma.idIdioma, [Validators.required]),
      accesoForm: new FormControl(this.rolesSelectedResult, [Validators.required]),
      empresaForm: new FormControl(this.empresasSelected, [Validators.required]),
      centroForm: new FormControl(this.centrosSelected, [Validators.required]),
      fechaCreacionForm: new FormControl({value:new Date(this.userToMod.fechaCreacion).toISOString(), disabled:true}, [Validators.required]),
      fechaBajaForm: new FormControl(),
      todosCentrosForm: true,
      verReconocimientosForm: new FormControl({value:this.userToMod.verReconocimientos, disabled:!this.isSuperAdmin})
    });
    if(this.userToMod.fechaBaja){
      this.userModForm.controls.fechaBajaForm.setValue(new Date(this.userToMod.fechaBaja));
    }

  }

  onSubmit(): void {
    let todosCentrosForm = this.userModForm.get('todosCentrosForm').value;
    let titulo = "El usuario estará asociado de forma predeterminada a todos los centros de trabajo que posea la/s empresas/s seleccionada/s. Si se añaden nuevos centros de trabajo a la empresa, el usuario lo visualizará por defecto, pudiendo modificarlo desde la opción \"Ver/Modificar Centros de trabajo\"";

    if (todosCentrosForm){
        this.translate.get('AVISO_USUARIO_ALTA').subscribe((res: string) => {
          titulo = res;
        });
    }else{
       this.translate.get('AVISO_USUARIO_EMPRESA_SIN_TODOSCENTROS').subscribe((res: string) => {
         titulo = res;
       });
    }

    let btn_text_aceptar = "Aceptar";
    this.translate.get('ACEPTAR').subscribe((res: string) => {
      btn_text_aceptar = res;
    });
    let btn_text_cancelar = "Cancelar";
    this.translate.get('CANCELAR').subscribe((res: string) => {
      btn_text_cancelar = res;
    });

    Swal.fire({
      icon:'info',
      title: titulo,
      showCancelButton: true,
      confirmButtonColor : 'var(--blue)',
      cancelButtonColor:  'var(--gray)',
      confirmButtonText: btn_text_aceptar,
      cancelButtonText: btn_text_cancelar,
      allowOutsideClick: false
    }).then((result) => {
      if(result.isConfirmed)
          this.updateUser();
    })
  }

  updateEmpresasYCentros(){
    this.empresasList.forEach(empresa =>{
      //EmpresasList -> Tengo las empresas del usuario PADRE.
      //Tengo que coger la empresa X del hijo y sustituir la empresa X en empresasList por la del hijo
      let empresaAux = this.userToMod.empresas.find(empresaHijo => empresaHijo.idEmpresa === empresa.idEmpresa);
      if (empresaAux!==undefined){
        let index = this.empresasList.indexOf(empresa);
        empresa.todosCentros = empresaAux.todosCentros;

        if (!empresa.todosCentros){
          //Recorrermos los centros de la empresa y si estan en empresaAux los marcamos a checked.
          empresa.centros.forEach(centro => {
            let indexCentro = empresa.centros.indexOf(centro);
            if (empresaAux.centros.find(centroAux => centroAux.idCentro === centro.idCentro)){
              centro.checked = true;
              empresa.centros[indexCentro] = centro;
            }
          });
        }

        this.empresasList[index] = empresa;
      }
    });
    this.spinner.hide();
  }

  transformRoles() {
    this.rolesSelectedResult = [];
    this.userToMod.roles.forEach(rolSelected => {
      this.rolesSelectedResult.push(rolSelected.idRol);
    });
  }

  transformEmpresasCentros() {
    this.empresasSelected = [];
    this.centrosSelected = [];
    this.userToMod.empresas.forEach(empresa => {
      this.empresasSelected.push(empresa.idEmpresa);
      empresa.centros.forEach(centro => {
        this.centrosSelected.push(centro.idCentro);
      })
    });
  }

  getIdiomas() {
    this.userService.getIdiomas().subscribe(data => {
      if(data){
        this.idiomasList = data;
        if (environment.debug) console.log("Succes");
      }else{
        this.spinner.hide();
      }
    }), (error => {
      if (environment.debug) console.log("Error");
    })
  }

  /*getRoles() {
    this.rolesList = this.userDataLogged.permisosRoles;
  }*/

  getUser(): void {
    this.userService.getUser().subscribe(data => {
      if(data){
      	this.rolesList = data.permisosRoles;
        this.isSuperAdmin = false;
        this.rolesList.forEach(rol => {
          if (rol.idRol==1)
            this.isSuperAdmin = true;
        });
        this.empresasList = data.empresas;
        this.updateEmpresasYCentros();
      }else{
      	this.spinner.hide();
      }
    });
  }

  /*/* TO DO  Editar comprobar que cuando añado otra empresa al menos tiene un centro asociada a esta*/


  updateUser() {
    //Se crea la lista de dto's para enviar al Back las empresas/centros
    let empresasDto: any[] = [];
    let todosCentrosForm = this.userModForm.get('todosCentrosForm').value;
    this.userModForm.get('empresaForm').value.forEach(idEmpresa => {
        let empresaDto = this.mapaEmpresa.get(idEmpresa);

        //Si no ha encontrado el id en el mapa, no se envia a Back
        if (empresaDto !== undefined){
          if (todosCentrosForm) empresaDto.todosCentros = true; //Se inserta el check de todosCentros, si este está activado
          //Si el check de 'todosCentrosForm' no está activado y
          //la empresa, no ha modificado sus centros y tiene su atributo 'todosCentros' a false
          if (!todosCentrosForm && !empresaDto.todosCentros){
              //Se recorre los centros para comprobar que como la empresa NO tiene
              //su atributo todosCentros
              let listaCentrosFinal: Centro[] = [];
              empresaDto.centros.forEach(centro => {
                  if (centro.checked) //Si el centro fue chequeado en la modal de 'seleccionEmpresasCentros'
                    listaCentrosFinal.push(centro);
              });
              empresaDto.centros = listaCentrosFinal.slice();
          }
          //Se inserta la empresa a enviar a Back
          empresasDto.push(empresaDto);
        }
    });

    //NOTA IMPORTANTE: Actualizamos la información del usuario para que vuelva a la anterior pantalla dle buscador de usuarios
    this.userToMod.nombre = this.userModForm.get('nombre').value;
    this.userToMod.apellidos = this.userModForm.get('apellidos').value;
    this.userToMod.idioma.idIdioma = this.userModForm.get('idioma').value;

    let rolesSelectedResult = [];
    this.userModForm.get('accesoForm').value.forEach(idRolUsuario => {
      let rolSelected = {
        idRol: idRolUsuario
      };
      rolesSelectedResult.push(rolSelected);
    });
    this.userToMod.roles = rolesSelectedResult;

    this.userToMod.empresas = empresasDto;

    this.userToMod.fechaBaja = this.userModForm.get('fechaBajaForm').value;
    if (this.userToMod.fechaBaja !== '' && this.userToMod.fechaBaja !== null
      && this.userToMod.fechaBaja !== undefined && this.userToMod.fechaBaja !== 'undefined'){

      //Se va a comprobar si la nueva fecha de baja es igual o anterior al día de hoy, para indicar el usuario
      //no activo o activo y así quitarlo de la lista o no del listado de usuarios
      let fechaHoy = new Date();
      fechaHoy.setHours(0, 0, 0);

      let nuevaFechaDeBajaUsuario: Date;
      if (this.userToMod.fechaBaja instanceof Date && !isNaN(this.userToMod.fechaBaja)){
        nuevaFechaDeBajaUsuario = new Date(this.userToMod.fechaBaja.getFullYear(), this.userToMod.fechaBaja.getMonth(), this.userToMod.fechaBaja.getDate(), 0, 0, 0);
      }else if (typeof this.userToMod.fechaBaja._i === "string"){
        nuevaFechaDeBajaUsuario = moment(this.userToMod.fechaBaja._i, "DD/MM/YYYY").toDate();
        nuevaFechaDeBajaUsuario.setHours(0, 0, 0);
      }else{
        nuevaFechaDeBajaUsuario = new Date(this.userToMod.fechaBaja._i.year, this.userToMod.fechaBaja._i.month, this.userToMod.fechaBaja._i.date, 0, 0, 0);
      }

      if(nuevaFechaDeBajaUsuario.getTime() <= fechaHoy.getTime()){
        this.userToMod.activo = false;
      }else{
        this.userToMod.activo = true;
      }
    }

    this.userToMod.verReconocimientos = this.userModForm.get('verReconocimientosForm').value;
    //Fin de la actualización de la información del usuario

    let dataReq = {
      user: this.userModForm.get('mailUsuario').value,
      nombre: this.userModForm.get('nombre').value,
      apellidos: this.userModForm.get('apellidos').value,
      idIdioma: this.userModForm.get('idioma').value,
      idRoles: this.userModForm.get('accesoForm').value,
      empresasDtos: empresasDto,
      fechaBaja: this.userModForm.get('fechaBajaForm').value || '',
      userId: 0,
      verReconocimientos: this.userModForm.get('verReconocimientosForm').value
    }

    dataReq.user = this.userToMod.email;
    dataReq.userId = this.userToMod.idUsuario;


    this.spinner.show();
    this.userService.updateUser(dataReq).subscribe(data => {
      this.spinner.hide();
      if (data){
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
            this.usuarioModificado();
          }
        })
      }/*else{  //Se comenta, para que muestre por pantalla el error que indica el back, ya que este Swal tiene preferencia al que genera el servicio
        this.spinner.hide();
        let titulo = "Error al actualizar el usuario";
        this.translate.get('ERROR_USUARIO_EDITADO').subscribe((res: string) => {
            titulo = res;
        });
        this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
      }*/
    }), (error => {
      if (environment.debug) console.log("Error");
    })
  }

  cancelEdit() {
    this.usuarioModificado();
  }

  usuarioModificado(){
    this.usuarioModificadoEvent.emit(true);
  }

  selectAll(formName, formControlName, values, fieldName) {
    let bExiste = "false";
    let rolExiste = "0";
    /*si estan todos seleccionados*/
      if (this[formName].controls[formControlName].value.length > 1) {
        this[formName].controls[formControlName].setValue([]);
      } else {
        let result = [];
        values.forEach(item => {
          if (bExiste=="false")
          {
            if (item.idRol == 1 || item.idRol == 2){ bExiste="true";rolExiste=item;}
            result.push(item[fieldName]);
          }
        })
        if (bExiste=="true")
        {
          this[formName].controls[formControlName].setValue([rolExiste[fieldName]]);
        }else{
          this[formName].controls[formControlName].setValue(result);
        }
      }
  }

  selectRol(formName, formControlName, values, fieldName,rolId){
    let bExiste = "false";
    let rolExiste = "0";
    this[formName].controls[formControlName].value.forEach(item => {
      if (item == "1" || item == "2"){ bExiste="true";rolExiste=item;}
    });

    if (rolId==1 || rolId==2 || bExiste=="true")
    {
      if (rolExiste != rolId){
        this[formName].controls[formControlName].setValue([rolExiste]);
      }else{
        this[formName].controls[formControlName].setValue([rolId]);
      }
    }
  }

  selectAllTwoDimension(formName,formControlName,values,values2,subArrayfieldName,toCompare,fieldName) {
      let result=[];
      values.forEach(item1=>{
        values2.forEach(item2=>{
          if(item1[toCompare] === item2){
            item1[subArrayfieldName].forEach(subItems => {
              result.push(subItems[fieldName]);
            })

          }
        })
      });

       /*si estan todos seleccionados*/

      if(this[formName].controls[formControlName].value.length == result.length+1){
        this[formName].controls[formControlName].setValue([]);
      }else{
              this[formName].controls[formControlName].setValue(result);
      }
  }


  myFilter = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay();
    return day !== this.today;
  }

  goToListado(){
    //location.reload(); //NOTA: Se comenta ya que no vuelve al buscador en sí, si no que enruta a 'usuario-init'
    this.usuarioModificado();
  }

  enviarMailWP(){
    this.spinner.show();
    this.userService.sendMailWP(this.userToMod.email).subscribe(data => {
      this.data = data;

      if (data){
        this.spinner.hide();
        let titulo = "Solicitud aceptada";
        this.translate.get('SOLICITUD_ACEPTADA').subscribe((res: string) => {
            titulo = res;
        });
        let texto = "Hemos enviado un email con las instrucciones que debe seguir";
        this.translate.get('INSTRUCCIONES_A_SEGUIR').subscribe((res: string) => {
            texto = res;
        });
        this.utils.mostrarMensajeSwalFire('success', titulo, texto,'var(--blue)', false);
      }else{
        this.spinner.hide();
      }
      //error captado en service-generic
    }),(error => {
      if (environment.debug) console.log("Error aL ENVIAR EMAIL");
    });
  }

  enviarMailPassword(){
    this.spinner.show();
    this.userService.resetPassword(this.userToMod.email).subscribe(data => {
      this.data = data;

      if (data){
        this.spinner.hide();
        let titulo = "Solicitud aceptada";
        this.translate.get('SOLICITUD_ACEPTADA').subscribe((res: string) => {
            titulo = res;
        });
        let texto = "Hemos enviado un email con las instrucciones que debe seguir";
        this.translate.get('INSTRUCCIONES_A_SEGUIR').subscribe((res: string) => {
            texto = res;
        });
        this.utils.mostrarMensajeSwalFire('success', titulo, texto,'var(--blue)', false);
      }else{
        this.spinner.hide();
      }
      //error captado en service-generic
    }),(error => {
      if (environment.debug) console.log("Error aL ENVIAR EMAIL");
    });
  }
}
