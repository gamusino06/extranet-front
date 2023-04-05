import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../environments/environment';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { error } from 'protractor';
import { Centro } from 'src/app/Model/Centro';
import { Empresa } from 'src/app/Model/Empresa';
import { Idioma } from 'src/app/Model/Idioma';
import { Rol } from 'src/app/Model/Rol';
import { UserService } from 'src/app/services/user.service';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { SelectEmpresaComponent } from 'src/app/extranet/components/select-empresa/select-empresa.component';
import { SelectCentroComponent } from 'src/app/extranet/components/select-centro/select-centro.component';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-alta-usuario',
  templateUrl: './alta-usuario.component.html',
  styleUrls: ['./alta-usuario.component.css'],
})
export class AltaUsuarioComponent implements OnInit {
  environment = environment;
  @Input() userData: any;
  closeImgUrl = '../../assets/img/close.svg';
  searchImgUrl = '../../assets/img/search.svg';
  filterImgUrl = '../../assets/img/filter.svg';
  excelImgUrl = '../../assets/img/excel.svg';
  mailImgUrl = '../../assets/img/mail.svg';
  downloadImgUrl = '../../assets/img/download.svg';

  hide1: boolean = true;
  hide2: boolean = true;

  empresasList: any[];
  mapaEmpresa = new Map();

  idiomasList: Idioma[];
  rolesList: Rol[];
  regrexPattern: string;
  user:any;
  isSuperAdmin:any;
  userForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private cdRef:ChangeDetectorRef
  ) { }

  //Evita que se produzca el ERROR Error: ExpressionChangedAfterItHasBeenCheckedError
  ngAfterViewChecked(){
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.spinner.show();
    this.userForm = this.formBuilder.group({
      mailUsuario: ['', [Validators.required, Validators.email]],
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      idioma: ['', Validators.required],
      acceso: ['', Validators.required],
      empresaForm: ['', Validators.required],
      empresaFilter: new FormControl(''),
      selectEmpresasRadioForm: new FormControl('1'),
      todosCentrosForm: true,
      verReconocimientosForm: ['']
    }, {
    });
    this.getIdiomas();
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
    let todosCentrosForm = this.userForm.get('todosCentrosForm').value;
    let titulo = "El usuario estará asociado de forma predeterminada a todos los centros de trabajo que posea la/s empresas/s seleccionada/s. Si se añaden nuevos centros de trabajo a la empresa, el usuario lo visualizará por defecto, pudiendo modificarlo desde la opción \"Ver/Modificar Centros de trabajo\"";

    if (todosCentrosForm)
    {
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
          this.insertUser();
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
    this.userService.getUser().subscribe(user => {
      this.user = user;
      this.rolesList = user.permisosRoles;
      this.empresasList = user.empresas;
      this.empresasList.forEach(empresa => {
          empresa.checked = true;
          empresa.todosCentros = true; //Dejamos todos los centros activados, para que podamos desactivarlos cuando se modifique sus centros en la modal
          empresa.centros.forEach(centro => {
              centro.checked = true;
          });
          this.mapaEmpresa.set(empresa.idEmpresa, empresa); //Rellenamos las empresas en su mapa correspondiente
      });
      this.isSuperAdmin = false;
      this.rolesList.forEach(rol => {
        if (rol.idRol==1)
          this.isSuperAdmin = true;
      });

      this.userForm.controls.idioma.setValue(user.idioma.idIdioma);
      this.spinner.hide();
    });
  }

  insertUser() {
    var verReconocimientos = false;
    if (this.userForm.get('verReconocimientosForm')!==undefined)
      verReconocimientos = this.userForm.get('verReconocimientosForm').value;

    //Se crea la lista de dto's para enviar al Back las empresas/centros
    let empresasDto: any[] = [];
    let todosCentrosForm = this.userForm.get('todosCentrosForm').value;
    this.userForm.get('empresaForm').value.forEach(idEmpresa => {
        //Se buscará la empresa guardada en la modal de elección de centros de cada empresa
        //Habrá que actualizar las empresas en el mapa para enviar al BACK las empresas modificadas
        let empresaDto = this.mapaEmpresa.get(idEmpresa);

        //Si no ha encontrado el id en el mapa, no se envia a Back
        if (empresaDto !== undefined){
          if (todosCentrosForm)
            empresaDto.todosCentros = true; //Se inserta el check de todosCentros, si este está activado
          //Si el check de 'todosCentrosForm' no está activado y
          //la empresa, no ha modificado sus centros y tiene su atributo 'todosCentros' a false
          if (!todosCentrosForm && !empresaDto.todosCentros){
              //Se recorre los centros para comprobar que como la empresa NO tiene
              //su atributo todosCentros
              let listaCentrosFinal: Centro[] = [];
              empresaDto.centros.forEach(centro => {
                  if (centro.checked)
                    listaCentrosFinal.push(centro);
              });
              empresaDto.centros = listaCentrosFinal.slice();
          }
          //Se inserta la empresa a enviar a Back
          empresasDto.push(empresaDto);
        }
    });

    const dataReq = {
      user: this.userForm.get('mailUsuario').value,
      nombre: this.userForm.get('nombre').value,
      apellidos: this.userForm.get('apellidos').value,
      idIdioma: this.userForm.get('idioma').value,
      idRoles: this.userForm.get('acceso').value,
      empresasDtos: empresasDto,
      verReconocimientos: verReconocimientos
    }

    this.spinner.show();
    this.userService.insertUser(dataReq).subscribe(data => {
      this.spinner.hide();
      if (data){
        let titulo = "Usuario dado de alta";
      	this.translate.get('USUARIO_DADO_DE_ALTA').subscribe((res: string) => {
            titulo = res;
        });
        Swal.fire({
          icon:'success',
          title: titulo,
          confirmButtonColor : 'var(--blue)',
          allowOutsideClick: false
        }).then((result) => {
            if(result.isConfirmed){
              location.reload();
            }
        })
      }
      //error captado en service-generic
    }), (error => {
      if (environment.debug) console.log("Error");
    })
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

  cancelEdit(){
    location.reload();
  }

}
