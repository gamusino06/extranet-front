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
import { AngularEditorConfig } from '@kolkov/angular-editor';

@Component({
  selector: 'app-modificar-faq',
  templateUrl: './modificar-faq.component.html',
  styleUrls: ['./modificar-faq.component.css']
})
export class ModificarFaqComponent implements OnInit {
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
  faqModForm: FormGroup;
  @Input() faqToMod: any;
  @Input() userDataLogged: any;
  @Output() faqModificadoEvent = new EventEmitter();
  rolesSelectedResult: any[];
  categoriasSelectedResult: any[];
  isSuperAdmin: any;

  config: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '15rem',
    minHeight: '5rem',
    placeholder: '',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
    sanitize: false,
    toolbarHiddenButtons: [[],['insertVideo','backgroundColor']]
  };

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
    this.faqModForm = this.formBuilder.group({
      nombreForm: new FormControl(this.faqToMod.nombre, [Validators.required]),
      idiomaForm: new FormControl(this.faqToMod.idioma.idIdioma, [Validators.required]),
      categoriaForm: new FormControl(this.categoriasSelectedResult, [Validators.required]),
      fechaBajaForm: new FormControl(),
      afectaForm: new FormControl(this.rolesSelectedResult, [Validators.required]),
      descripcionForm: new FormControl(this.faqToMod.descripcion)
    });
    if(this.faqToMod.fechaBaja){
      this.faqModForm.controls.fechaBajaForm.setValue(new Date(this.faqToMod.fechaBaja));
    }
  }

  onSubmit(): void {
    this.updateFaq();
  }

  transformRoles() {
    this.rolesSelectedResult = [];
    this.faqToMod.roles.forEach(rolSelected => {
      this.rolesSelectedResult.push(rolSelected.idRol);
    });
  }

  transformCategoriasAyuda() {
    this.categoriasSelectedResult = [];
    this.faqToMod.categorias.forEach(categoriaAyudaSelected => {
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
        if (environment.debug) console.log("Succes");
      }else{
        this.spinner.hide();
      }
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
        if (environment.debug) console.log("Succes");
      }else{
        this.spinner.hide();
      }
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

  //Método que actualiza la faq modificada por el usuario
  updateFaq() {
    let dataReq = {
      idFaq: this.faqToMod.idFaq,
      nombre: this.faqModForm.get('nombreForm').value,
      idIdioma: this.faqModForm.get('idiomaForm').value,
      idCategorias: this.faqModForm.get('categoriaForm').value,
      fechaBaja: this.faqModForm.get('fechaBajaForm').value || '',
      idRoles: this.faqModForm.get('afectaForm').value,
      descripcion: this.faqModForm.get('descripcionForm').value
    }

    this.spinner.show();
    this.userService.updateFaq(dataReq).subscribe(data => {
      this.spinner.hide();
      if (data){
        let titulo = "Faq editada con exito";
        this.translate.get('FAQ_EDITADA_CON_EXITO').subscribe((res: string) => {
            titulo = res;
        });

        Swal.fire({
          icon: 'success',
          title: titulo,
          confirmButtonColor: 'var(--blue)',
          allowOutsideClick: false
        }).then((result) => {
          if (result.isConfirmed) {
            this.faqModificado();
          }
        })
      }else{
        let titulo = "Error al actualizar la faq";
        this.translate.get('ERROR_FAQ_EDITADO').subscribe((res: string) => {
            titulo = res;
        });
        this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
      }
    }), (error => {
      if (environment.debug) console.log("Error");
    })
  }

  cancelEdit() {
    this.faqModificado();
  }

  faqModificado(){
    this.faqModificadoEvent.emit(true);
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
    this.faqModificado();
  }
}
