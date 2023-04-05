import { Component, OnInit, ChangeDetectionStrategy, SimpleChanges, ViewChild } from '@angular/core';
import { SelectProvinciaComponent } from '../components/select-provincia/select-provincia.component';
import { SelectLocalidadComponent } from '../components/select-localidad/select-localidad.component';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';

import { UserService } from 'src/app/services/user.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ChangeDetectorRef } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';
import { Globals } from '../globals';

@Component({
  selector: 'app-delegaciones',
  templateUrl: './delegaciones.component.html',
  styleUrls: ['./delegaciones.component.css'],
})
export class DelegacionesComponent implements OnInit {
  cleanImgUrl = '../../../assets/img/borrar_filtros.svg';
  searchImgUrl = '../../../assets/img/search.svg';
  excelImgUrl = '../../assets/img/excel.svg';
  mailImgUrl = '../../assets/img/mail.svg';
  downloadImgUrl = '../../assets/img/download.svg';

  localidadList: [];
  delegacionesList: any[] = [];
  delegacionesListLoaded:boolean = false;
  idDelegacionSelected: number;
  address:string;
  provinciaList: any[];
  userForm: FormGroup;
  centroMedico: boolean;
  oficinaTecnica: boolean;
  centroFormacion: boolean;

  @ViewChild(SelectProvinciaComponent) hijoProvincia;
  @ViewChild(SelectLocalidadComponent) hijoLocalidad;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private utilsService: UtilsService,
    private spinner: NgxSpinnerService,
    private cdRef:ChangeDetectorRef,
    public translate: TranslateService,
    public globals: Globals
  ) {
  }

  //Evita que se produzca el ERROR Error: ExpressionChangedAfterItHasBeenCheckedError
  ngAfterViewChecked()
  {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    /*inicializacion de formulario*/
    this.initForm();
    //this.getLocalidades();
    this.getProvincias();
    this.getDelegaciones();
    //transformNecesario es el item que nos dices si ha llegado a través
    //de la barra de favoritos, si es true entonces hacemos el translateX
    let transform = JSON.parse(localStorage.getItem('transformNecesario'));
    if(transform == true){
        $(document).ready(function(){
          $('.mat-tab-list').css('transform', 'translateX(0px)');
        });
    }

    //en caso de que sea una pantalla pequeña
    if(screen.width < 1530){
      $(document).ready(function(){
        $('.mat-tab-list').css('transform', 'translateX(-430px)');
      });
    }
  }

  initForm() {
    this.userForm = this.formBuilder.group({
      direccionForm: new FormControl(''),
      localidadForm: new FormControl(''),
      provinciaForm: new FormControl(''),
      centroMedicoForm: new FormControl(false),
      oficinaTecnicaForm: new FormControl(false),
      centroFormacionForm: new FormControl(false),
      tipoDelegacionCheck: new FormControl(false),
    });
    this.centroMedico = false;
    this.centroFormacion = false;
    this.oficinaTecnica = false;
  }

  resetForm(): void {
    this.userForm.controls['provinciaForm'].setValue('');
    this.localidadList = [];
    this.userForm.controls['localidadForm'].setValue('');

    //Indicamos al componente de provincia y localidad que debe de limpiar el texto de búsqueda
    this.hijoProvincia.setValueInputProvinciaFilter();
    this.hijoLocalidad.setValueInputLocalidadFilter();
  }

  getLocalidades() {
    this.localidadList = [];
    this.userForm.controls['localidadForm'].setValue('');
    /*mapeo de objeto JSON a enviar*/
    let maxProvinciasSelected = this.globals.maxProvinciasSelected;
    let dataReq = {
      listaIdsProvincia: this.userForm.value.provinciaForm || []
    };
    if (dataReq.listaIdsProvincia.length>0 && dataReq.listaIdsProvincia.length<maxProvinciasSelected+1)
    {
      this.utilsService.getLocalidades(dataReq).subscribe(data => {
        if(data){
          this.localidadList = data;
        }else{
          this.spinner.hide();
        }
      });
    }else if (dataReq.listaIdsProvincia.length==0 || dataReq.listaIdsProvincia.length>maxProvinciasSelected)
    {
      this.localidadList = [];
      if (dataReq.listaIdsProvincia.length>maxProvinciasSelected)
      {
              let titulo = "Seleccione un máximo de "+maxProvinciasSelected+" provincias para filtrar por Localidad";
              this.translate.get('ALERT_PROVINCIAS').subscribe((res: string) => {
                  titulo = res;
              });
              this.utilsService.mostrarMensajeSwalFire('warning', titulo, '','var(--blue)', false);
      }
    }
  }

  getProvincias() {
    /*mapeo de objeto JSON a enviar*/
    let dataReq = {

    };
    this.utilsService.getProvincias(dataReq).subscribe(data => {
      if(data){
        this.provinciaList = data;
      }else{
        this.spinner.hide();
      }
    })
  }


  selectAll(formName, formControlName, values, fieldName) {
    /*si viene 1 elemento en los controls es que estamos marcando el selectAll...
    si hay mas de uno deseleccionamos*/
    if (this[formName].controls[formControlName].value.length != 1) {
      this[formName].controls[formControlName].setValue([]);
    } else {
      let result = [];
      values.forEach(item => {
        result.push(item[fieldName]);
      })
      this[formName].controls[formControlName].setValue(result);
    }

    //En caso de que este haciendo el selectAll de Provincias debe actualizar localidades
    if (formControlName=='provinciaForm'){
      this.getLocalidades();
    }
  }



  selectAllTwoDimension(formName, formControlName, values, values2, subArrayfieldName, toCompare, fieldName) {
    let result = [];
    values.forEach(item1 => {
      values2.forEach(item2 => {
        if (item1[toCompare] === item2) {
          item1[subArrayfieldName].forEach(subItems => {
            result.push(subItems[fieldName]);
          })

        }
      })
    });

    /*si viene 1 elemento en los controls es que estamos marcando el selectAll...
    si hay mas de uno deseleccionamos*/
    if (this[formName].controls[formControlName].value.length != 1) {
      this[formName].controls[formControlName].setValue([]);
    } else {
      this[formName].controls[formControlName].setValue(result);
    }
  }


  setOnMap(idDelegacion:number) {
    this.idDelegacionSelected = idDelegacion;
  }

  getDelegaciones() {
    if (this.userForm.value.direccionForm!==null && this.userForm.value.direccionForm!== '')
      this.address = this.userForm.value.direccionForm;

    let tiposDelegaciones = [1];
    /*if (this.userForm.value.centroMedicoForm) {
      tiposDelegaciones.push(2);
    }
    if (this.userForm.value.oficinaTecnicaForm) {
      tiposDelegaciones.push(1);
    }
    if (this.userForm.value.centroFormacionForm) {
      tiposDelegaciones.push(3);
    }*/
    let dataReq = {
      //direccion: this.userForm.value.direccionForm || "",
      listaIdsTiposDelegaciones: tiposDelegaciones || [1],
      listaIdsLocalidades: this.userForm.value.localidadForm || [],
      listaIdsProvincias: this.userForm.value.provinciaForm || [],
    }
    this.spinner.show();
    this.userService.getDelegaciones(dataReq).subscribe(data => {
      if(data){
        this.delegacionesList = data;
        this.delegacionesListLoaded = true;
      }
      this.spinner.hide();
    })

  }
}

