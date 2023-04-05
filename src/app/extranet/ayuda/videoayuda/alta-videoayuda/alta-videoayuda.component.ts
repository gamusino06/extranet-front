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
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import * as _moment from 'moment';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {MY_FORMATS} from '../../../../../config/config';

@Component({
  selector: 'app-alta-videoayuda',
  templateUrl: './alta-videoayuda.component.html',
  styleUrls: ['./alta-videoayuda.component.css'],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})
export class AltaVideoAyudaComponent implements OnInit {
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
  videoAyudaForm: FormGroup;

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
    let fechaBaja= new Date();
    this.videoAyudaForm = this.formBuilder.group({
      nombreForm: new FormControl('', [Validators.required]),
      idiomaForm: new FormControl('', [Validators.required]),
      categoriaForm: new FormControl('', [Validators.required]),
      fechaBajaForm: new FormControl(),
      afectaForm: new FormControl('', [Validators.required]),
      descripcionForm: new FormControl(''),
      codigoIframeForm: new FormControl('', [Validators.required])
    }, {
    });
    this.getCategoriasAyuda();
    this.getIdiomas();
    this.getRoles();
    this.getUser();
  }

  onSubmit(): void {
    this.insertVideoAyuda();
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

  getUser(): void {
    this.userService.getUser().subscribe(user => {
      if(user){
      	//this.rolesList = data.permisosRoles;
        this.isSuperAdmin = false;
        user.roles.forEach(rol => {
          if (rol.idRol==1)
            this.isSuperAdmin = true;
        });

        this.videoAyudaForm.controls.idiomaForm.setValue(user.idioma.idIdioma);
      }
      this.spinner.hide();
    });
  }

  insertVideoAyuda() {
    const dataReq = {
      nombre: this.videoAyudaForm.get('nombreForm').value,
      idIdioma: this.videoAyudaForm.get('idiomaForm').value,
      idCategorias: this.videoAyudaForm.get('categoriaForm').value,
      fechaBaja: this.videoAyudaForm.get('fechaBajaForm').value || '',
      idRoles: this.videoAyudaForm.get('afectaForm').value,
      descripcion: this.videoAyudaForm.get('descripcionForm').value,
      embedded_code: this.videoAyudaForm.get('codigoIframeForm').value
    }

    this.spinner.show();
    this.userService.insertVideoayuda(dataReq).subscribe(data => {
      this.spinner.hide();
      if (data){
        let titulo = "Videoayuda dada de alta";
      	this.translate.get('VIDEOAYUDA_DADO_DE_ALTA').subscribe((res: string) => {
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
