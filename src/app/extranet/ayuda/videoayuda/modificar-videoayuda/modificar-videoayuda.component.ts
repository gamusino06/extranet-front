import { Idioma } from './../../../../Model/Idioma';
import { environment } from '../../../../../environments/environment';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { UtilsService } from 'src/app/services/utils.service';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import {NgxSpinnerService} from 'ngx-spinner';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-modificar-videoayuda',
  templateUrl: './modificar-videoayuda.component.html',
  styleUrls: ['./modificar-videoayuda.component.css']
})
export class ModificarVideoAyudaComponent implements OnInit {
  environment = environment;
  closeImgUrl = '../../../../assets/img/close.svg';
  searchImgUrl = '../../../../assets/img/search.svg';
  filterImgUrl = '../../../../assets/img/filter.svg';
  excelImgUrl = '../../../../assets/img/excel.svg';
  mailImgUrl = '../../../../assets/img/mail.svg';
  downloadImgUrl = '../../../../assets/img/download.svg';

  data: any;
  today = new Date().getDate();

  idiomasList: Idioma[];
  categoriasList: any[];
  rolesList: any[];
  videoAyudaModForm: FormGroup;
  @Input() videoAyudaToMod: any;
  @Input() userDataLogged: any;
  @Output() videoAyudaModificadoEvent = new EventEmitter();
  rolesSelectedResult: any[];
  categoriasSelectedResult: any[];
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

    this.getCategoriasAyuda();
    this.getRoles();
    this.getUser();
    this.getIdiomas();
    this.transformRoles();
    this.transformCategoriasAyuda();

    let fechaBaja= new Date();
    this.videoAyudaModForm = this.formBuilder.group({
      nombreForm: new FormControl(this.videoAyudaToMod.nombre, [Validators.required]),
      idiomaForm: new FormControl(this.videoAyudaToMod.idioma.idIdioma, [Validators.required]),
      categoriaForm: new FormControl(this.categoriasSelectedResult, [Validators.required]),
      fechaBajaForm: new FormControl(),
      afectaForm: new FormControl(this.rolesSelectedResult, [Validators.required]),
      descripcionForm: new FormControl(this.videoAyudaToMod.descripcion),
      codigoIframeForm: new FormControl(this.videoAyudaToMod.embedded_code, [Validators.required])
    });
    if(this.videoAyudaToMod.fechaBaja){
      this.videoAyudaModForm.controls.fechaBajaForm.setValue(new Date(this.videoAyudaToMod.fechaBaja));
    }
  }

  onSubmit(): void {
    this.updateVideoAyuda();
  }

  transformRoles() {
    this.rolesSelectedResult = [];
    this.videoAyudaToMod.roles.forEach(rolSelected => {
      this.rolesSelectedResult.push(rolSelected.idRol);
    });
  }

  transformCategoriasAyuda() {
    this.categoriasSelectedResult = [];
    this.videoAyudaToMod.categorias.forEach(categoriaAyudaSelected => {
      this.categoriasSelectedResult.push(categoriaAyudaSelected.idCategoriaAyuda);
    });
  }

  //Método que recibe las categorias visibles
  getCategoriasAyuda() {
    this.categoriasList = [];
    this.userService.getCategoriasAyuda().subscribe(data => {
      if(data){
        this.categoriasList = data;
      }else{
        this.spinner.hide();
      }
    });
  }

  //Método que recibe los idiomas disponible
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

  //Método que recibe la lista de roles del usuario logeado (el cual es enviado desde el listado de VideoAyudas)
  getRoles() {
    //this.rolesList = this.userDataLogged.permisosRoles;
    this.userService.getRoles().subscribe(data => {
      if(data){
        this.rolesList = data;
        this.rolesList.shift();  //Eliminamos el 1º elemento de la lista de Roles (Rol SuperAdmin)
      }else{
        this.spinner.hide();
      }
      if (environment.debug) console.log("Succes");
    }), (error => {
      if (environment.debug) console.log("Error");
    })
  }

  //Método que recibe la información del usuario con el token de la sesión del usuario
  getUser(): void {
    this.userService.getUser().subscribe(data => {
      if(data){
      	//this.rolesList = data.permisosRoles;
        this.isSuperAdmin = false;
        data.roles.forEach(rol => {
          if (rol.idRol==1)
            this.isSuperAdmin = true;
        });
      }
      this.spinner.hide();

    });
  }

  //Método que actualiza la videoayuda modificada por el usuario
  updateVideoAyuda() {
    let dataReq = {
      idVideoayuda: this.videoAyudaToMod.idVideoayuda,
      nombre: this.videoAyudaModForm.get('nombreForm').value,
      idIdioma: this.videoAyudaModForm.get('idiomaForm').value,
      idCategorias: this.videoAyudaModForm.get('categoriaForm').value,
      fechaBaja: this.videoAyudaModForm.get('fechaBajaForm').value || '',
      idRoles: this.videoAyudaModForm.get('afectaForm').value,
      descripcion: this.videoAyudaModForm.get('descripcionForm').value,
      embedded_code: this.videoAyudaModForm.get('codigoIframeForm').value
    }

    this.spinner.show();
    this.userService.updateVideoayuda(dataReq).subscribe(data => {
      this.spinner.hide();
      if (data){
        let titulo = "Videoayuda editada con exito";
        this.translate.get('VIDEOAYUDA_EDITADA_CON_EXITO').subscribe((res: string) => {
            titulo = res;
        });

        Swal.fire({
          icon: 'success',
          title: titulo,
          confirmButtonColor: 'var(--blue)',
          allowOutsideClick: false
        }).then((result) => {
          if (result.isConfirmed) {
            this.videoAyudaModificado();
          }
        })
      }else{
        let titulo = "Error al actualizar la videoayuda";
        this.translate.get('ERROR_VIDEOAYUDA_EDITADO').subscribe((res: string) => {
            titulo = res;
        });
        this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
      }
    }), (error => {
      if (environment.debug) console.log("Error");
    })
  }

  cancelEdit() {
    this.videoAyudaModificado();
  }

  videoAyudaModificado(){
    this.videoAyudaModificadoEvent.emit(true);
  }

  selectAll(formName, formControlName, values, fieldName) {
    /*si estan todos seleccionados*/
    if (this[formName].controls[formControlName].value.length == values.length+1) {
      this[formName].controls[formControlName].setValue([]);
    } else {
      let result = [];
      values.forEach(item => {
        result.push(item[fieldName]);
      })
      this[formName].controls[formControlName].setValue(result);
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
    ////location.reload(); //NOTA: Se comenta ya que no vuelve al buscador en sí, si no que enruta a 'ayuda-init'
    this.videoAyudaModificado();
  }
}
