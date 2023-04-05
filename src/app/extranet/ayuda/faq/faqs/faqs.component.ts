import { Idioma } from './../../../../Model/Idioma';
import { Component, Input, OnInit, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { TranslateService } from '@ngx-translate/core';
import { ChangeDetectorRef } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';
import { UserService } from 'src/app/services/user.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import { PageScrollService } from 'ngx-page-scroll-core';
import { DOCUMENT } from '@angular/common';
import { environment } from 'src/environments/environment';
import { MatAccordion } from '@angular/material/expansion';

@Component({
  selector: 'app-faqs',
  templateUrl: './faqs.component.html',
  styleUrls: ['./faqs.component.css']

})
export class FaqsComponent implements OnInit {

  environment = environment;
  @Input() userDataLogged: any;
  categoriasList: any[];
  idCategoriasList: number[];
  mapaCategoria = new Map<number, any>();
  mapaCategoriaFaq = new Map<number, any>();
  rolesList: any[];
  idRolesList: number[];
  idIdiomasList: number[];
  faqList: any[];
  isSuperAdmin: boolean;
  textoABuscar: string;
  expandirPanel: boolean;
  @ViewChild(MatAccordion) accordion: MatAccordion;

  cleanImgUrl = '../../../../assets/img/borrar_filtros.svg';
  searchImgUrl = '../../../../assets/img/search.svg';

  constructor(
    public dialog: MatDialog,
    private formBuilder: FormBuilder,
    private router: Router,
    private spinner: NgxSpinnerService,
    public translate: TranslateService,
    public utils: UtilsService,
    private userService: UserService,
    private cdRef:ChangeDetectorRef,
    private pageScrollService: PageScrollService,
    @Inject(DOCUMENT) private document: any
  ) {

  }

  //Evita que se produzca el ERROR Error: ExpressionChangedAfterItHasBeenCheckedError
  ngAfterViewChecked(){
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.spinner.show();
    this.categoriasList = [];
    this.idCategoriasList = [];
    this.idIdiomasList = [];
    this.idRolesList = [];
    this.textoABuscar = "";
    this.expandirPanel = true;
    this.getUser();
  }

  //Método que realiza scroll a una categoria en concreto
  public scrollTo(idCategoriaFaq, llamadaDesdeHtml) {

    if (llamadaDesdeHtml){
      //Se recorre la lista de categorias para indicar las que no se deben expandir
      let categoriaAyuda;
      this.categoriasList.forEach(categoria => {
        if (categoria.idCategoriaAyuda !== idCategoriaFaq){
          categoriaAyuda = this.mapaCategoria.get(categoria.idCategoriaAyuda);
          categoriaAyuda.expanded = false;
        }else{
          categoriaAyuda = this.mapaCategoria.get(idCategoriaFaq);
          categoriaAyuda.expanded = true;
        }
        this.mapaCategoria.set(categoria.idCategoriaAyuda, categoriaAyuda);
      });
    }

    this.pageScrollService.scroll({
      document: this.document,
      scrollTarget: '#categoria_' + idCategoriaFaq,
    });
  }

  //Método que comprueba si esa categoria se debe expandir o no
  isExpanded(categoriaAyuda){
    let categoriaAyudaAExpandir = this.mapaCategoria.get(categoriaAyuda.idCategoriaAyuda);
    return categoriaAyudaAExpandir.expanded;
  }

  //Método que comprueba/actualiza tanto si antes de pulsar la categoria estaba expandida
  actualizarExpandedCategoria(categoriaAyuda){
    let categoriaEstabaExpandidaAntesClick: boolean = this.isExpanded(categoriaAyuda);
    let categoriaAyudaActualizar = this.mapaCategoria.get(categoriaAyuda.idCategoriaAyuda);
    if(categoriaEstabaExpandidaAntesClick)
      categoriaAyudaActualizar.expanded = false;
    else
      categoriaAyudaActualizar.expanded = true;
    this.mapaCategoria.set(categoriaAyudaActualizar.idCategoriaAyuda, categoriaAyudaActualizar);
  }

  verificarPulsacionTecla(event:any, textoABuscar) {
      if (event.keyCode === 13 && !event.shiftKey) {
        this.getFaqs(textoABuscar);
      }
  }

  onSubmit(): void {

  }

  getUser(): void {
    this.userService.getUser().subscribe(data => {
      if(data){
      	this.rolesList = data.permisosRoles;
        if (this.rolesList.length==0)
          this.rolesList = data.roles;

        this.isSuperAdmin = false;
        this.rolesList.forEach(rol => {
          this.idRolesList.push(rol.idRol);
          if (rol.idRol==1)
            this.isSuperAdmin = true;
        });
        //Se consigue las categorias de ayuda según los roles del usuario
        //TODO: Ahora de momento se consiguen todas
        this.getCategoriasAyuda();
      }else{
      	this.spinner.hide();
      }

    });
  }

  //Método que envía la lista de roles del usuario
  //y recibe las categorias visibles disponibles para dicho usuario
  getCategoriasAyuda() {
    //Se devuelven todas las categorias, da igual del rol del usuario (SÓLO CON CATEGORIAS)
    this.userService.getCategoriasAyuda().subscribe(data => {
      if(data){
        this.categoriasList = data;
        //Si la longitud del array de Categorias (devuelto según roles del usuario)
        //Si es mayor que dos, se realizará dos filas
        if (this.categoriasList.length > 0){
          for (var i = 0; i < this.categoriasList.length; i++) {
              this.categoriasList[i].expanded = true;
              this.idCategoriasList.push(this.categoriasList[i].idCategoriaAyuda);
              this.mapaCategoria.set(data[i].idCategoriaAyuda, data[i]);
              this.mapaCategoriaFaq.set(data[i].idCategoriaAyuda, []);  //Array vacio, que serían los objetos de videoayudas
          }
        }
      }else{
        this.spinner.hide();
      }

      this.getFaqs("");
    });
  }

  //Método que resetea todos los valores del mapaCategoriaFaq
  resetearMapaCategoriaFaq(){
    //Se resetea los valores del mapaCategoriaFaq con array vacio, que serían los objetos de faq
    if (this.categoriasList.length > 0){
      for (var i = 0; i < this.categoriasList.length; i++) {
          this.mapaCategoriaFaq.set(this.categoriasList[i].idCategoriaAyuda, []);
      }
    }
  }

  //Método que consigue las videoAyudas de dicha categoria
  getFaqsCategoria(categoriaAyuda){
    return this.mapaCategoriaFaq.get(categoriaAyuda.idCategoriaAyuda);
  }

  //Método que consigue las videoAyudas de dicha categoria
  tieneFaqsCategoria(categoriaAyuda){
    let listaFaqs = this.mapaCategoriaFaq.get(categoriaAyuda.idCategoriaAyuda);
    if (listaFaqs.length > 0)
      return true;
    return false;
  }

  //Método que envía la lista de categorias según los roles del usuario
  //y recibe las videoAyudas disponible para dicho usuario
  getFaqs(textoABuscar) {
    this.spinner.show();
    let lang = localStorage.getItem("lang");
    let idIdiomaSeleccionado = JSON.parse(localStorage.getItem("idiomas")).filter(idioma => idioma.lang === lang)[0].idIdioma;
    this.idIdiomasList.push(idIdiomaSeleccionado);

    let data = {
      texto: textoABuscar,
      listaIdCategorias: this.idCategoriasList,
      listaIdRoles:this.idRolesList,
      listaIdIdiomas:this.idIdiomasList,
      activo:1
    }

    this.textoABuscar = textoABuscar;
    let busquedaPorFiltro: boolean = false;
    if (this.textoABuscar != "") busquedaPorFiltro = true;

    this.userService.getFaqs(data).subscribe(dataReturn => {
      //Siempre vamos a recibir las faqs que estén NO estén dadas de bajas
      if (dataReturn != undefined && dataReturn.length > 0){
          this.resetearMapaCategoriaFaq();
          this.faqList = dataReturn;
          this.faqList.forEach(faq => {
            //Se recorre las categorias que tienen asignada esta videoAyuda
            faq.categorias.forEach(categoria => {

              let categoriaAyudaActualizar = this.mapaCategoria.get(categoria.idCategoriaAyuda);
              categoriaAyudaActualizar.expanded = true;
              this.mapaCategoria.set(categoriaAyudaActualizar.idCategoriaAyuda, categoriaAyudaActualizar);

              //Se consigue el array de videoAyudas, la primera puede devolverse vacío
              let listaFaqs = this.mapaCategoriaFaq.get(categoria.idCategoriaAyuda);
              listaFaqs.push(faq);
              this.mapaCategoriaFaq.set(categoria.idCategoriaAyuda, listaFaqs); //Se actualiza la lista de videoAyudas
            });
          });

        //Se realiza scroll al primer resultado de la búsqueda. Siempre va a tener al menos uno "dataReturn.length > 0"
        if (busquedaPorFiltro){
          this.scrollTo(this.faqList[0].categorias[0].idCategoriaAyuda, false);
        }
      }else if (dataReturn.length === 0){  //Si no se ha encontrado ninguna coincidencia con la busqueda
           this.spinner.hide();
           let titulo = "No se han encontrado preguntas frecuentes para su búsqueda:";
           this.translate.get('SIN_FAQS').subscribe((res: string) => {
             titulo = res;
           });
           this.utils.mostrarMensajeSwalFire('warning', titulo, this.textoABuscar,'var(--blue)', false);
      }else{
           this.spinner.hide();
           let titulo = "Error al intentar obtener los datos";
           this.translate.get('ERROR_OBTENER_DATOS').subscribe((res: string) => {
             titulo = res;
           });
           this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
      }
      this.spinner.hide();
    }),(error => {
      if (environment.debug) console.log("Error al obtener las videoayudas - getVideoAyudas()");
    });
  }

  //function to return list of numbers from 0 to n-1
  /*  numSequence(n: number): Array<number> {
      return Array(n);
    }*/
}
