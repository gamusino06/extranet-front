import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { error } from 'protractor';
import { Idioma } from 'src/app/Model/Idioma';
import { Rol } from 'src/app/Model/Rol';
import { UserService } from 'src/app/services/user.service';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { ChangeDetectorRef } from '@angular/core';
import { AngularEditorConfig } from '@kolkov/angular-editor';

@Component({
  selector: 'app-alta-faq',
  templateUrl: './alta-faq.component.html',
  styleUrls: ['./alta-faq.component.css'],
})
export class AltaFaqComponent implements OnInit {
  environment = environment;
  @Input() userData: any;
  closeImgUrl = '../../../../assets/img/close.svg';
  searchImgUrl = '../../../../assets/img/search.svg';
  filterImgUrl = '../../../../assets/img/filter.svg';
  excelImgUrl = '../../../../assets/img/excel.svg';
  mailImgUrl = '../../../../assets/img/mail.svg';
  downloadImgUrl = '../../../../assets/img/download.svg';

  idiomasList: Idioma[];
  categoriasList: any[];
  rolesList: Rol[];
  isSuperAdmin:any;
  faqForm: FormGroup;

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
    this.faqForm = this.formBuilder.group({
      nombreForm: new FormControl('', [Validators.required]),
      idiomaForm: new FormControl('', [Validators.required]),
      categoriaForm: new FormControl('', [Validators.required]),
      fechaBajaForm: new FormControl(),
      afectaForm: new FormControl('', [Validators.required]),
      descripcionForm: new FormControl('')
    }, {
    });
    this.getCategoriasAyuda();
    this.getIdiomas();
    this.getRoles();
    this.getUser();
  }

  onSubmit(): void {
    this.insertFaq();
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

  getUser(): void {
    this.userService.getUser().subscribe(user => {
      //this.rolesList = data.permisosRoles;
      this.isSuperAdmin = false;
      user.roles.forEach(rol => {
        if (rol.idRol==1)
          this.isSuperAdmin = true;
      });

      this.faqForm.controls.idiomaForm.setValue(user.idioma.idIdioma);
      this.spinner.hide();
    });
  }

  insertFaq() {
    const dataReq = {
      nombre: this.faqForm.get('nombreForm').value,
      idIdioma: this.faqForm.get('idiomaForm').value,
      idCategorias: this.faqForm.get('categoriaForm').value,
      fechaBaja: this.faqForm.get('fechaBajaForm').value || '',
      idRoles: this.faqForm.get('afectaForm').value,
      descripcion: this.faqForm.get('descripcionForm').value
    }

    this.spinner.show();
    this.userService.insertFaq(dataReq).subscribe(data => {
      this.spinner.hide();
      if (data){
        let titulo = "Faq dada de alta";
      	this.translate.get('FAQ_DADO_DE_ALTA').subscribe((res: string) => {
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

  cancelEdit(){
    location.reload();
  }

}
