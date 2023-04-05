import { environment } from '../../../environments/environment';
import { Component, Input, OnInit, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { TranslateService } from '@ngx-translate/core';
import { ChangeDetectorRef } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';
import { UserService } from 'src/app/services/user.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ReproductorVideoComponent } from 'src/app/modales/reproductorVideo/reproductorVideo.component';
import { PageScrollService } from 'ngx-page-scroll-core';
import { DOCUMENT } from '@angular/common';
import { MatAccordion } from '@angular/material/expansion';
import { BreakpointObserver } from '@angular/cdk/layout'; // Para media querys en TS
import { Globals } from '../../extranet/globals';

@Component({
  selector: 'app-bonus-fundae-info',
  templateUrl: './bonus-fundae-info.component.html',
  styleUrls: ['./bonus-fundae-info.component.css']

})
export class BonusFundaeInfoComponent implements OnInit {

  environment = environment;
  @Input() userDataLogged: any;
  categoriasList: any[];
  idCategoriasList: number[];
  mapaCategoria = new Map<number, any>();
  mapaCategoriaVideoAyuda = new Map<number, any>();
  rolesList: any[];
  idRolesList: number[];
  idIdiomasList: number[];
  videoAyudaList: any[];
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
    private breakpointObserver: BreakpointObserver,
    public globals: Globals,
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

  onSubmit(): void {

  }

  //Método que realiza scroll a una categoria en concreto
  public scrollTo(idCategoriaAyuda, llamadaDesdeHtml) {

    if (llamadaDesdeHtml){
      //Se recorre la lista de categorias para indicar las que no se deben expandir
      let categoriaAyuda;
      this.categoriasList.forEach(categoria => {
        if (categoria.idCategoriaAyuda !== idCategoriaAyuda){
          categoriaAyuda = this.mapaCategoria.get(categoria.idCategoriaAyuda);
          categoriaAyuda.expanded = false;
        }else{
          categoriaAyuda = this.mapaCategoria.get(idCategoriaAyuda);
          categoriaAyuda.expanded = true;
        }
        this.mapaCategoria.set(categoria.idCategoriaAyuda, categoriaAyuda);
      });
    }

    this.pageScrollService.scroll({
      document: this.document,
      scrollTarget: '#categoria_' + idCategoriaAyuda,
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

  //Método que verifica si se ha pulsado la tecla ENTER
  verificarPulsacionTecla(event:any, textoABuscar) {
      if (event.keyCode === 13 && !event.shiftKey) {
        this.getVideoAyudas(textoABuscar);
      }
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
        this.getCategoriasAyuda();
      }else{
      	this.spinner.hide();
      }

    });
  }

  //Aqui vamos a mostrar únicamente la categoría de ayuda de bonifícate
  getCategoriasAyuda() {
    //Para este caso solo queremos los videos de la  categoria Bonifícate
    this.userService.getCategoriaAyuda(this.globals.categoria_videoayuda_bonificate).subscribe(data => {
      if(data){
        this.categoriasList.push(data);
        this.categoriasList[0].expanded = true;
        this.idCategoriasList.push(this.categoriasList[0].idCategoriaAyuda);
        this.mapaCategoria.set(data.idCategoriaAyuda, data);
        this.mapaCategoriaVideoAyuda.set(data.idCategoriaAyuda, []);  //Array vacio, que serían los objetos de videoayudas
      }else{
        this.spinner.hide();
      }

      this.getVideoAyudas("");
    });
  }

  //Método que consigue las videoAyudas de dicha categoria
  getVideoAyudasCategoria(categoriaAyuda){
    return this.mapaCategoriaVideoAyuda.get(categoriaAyuda.idCategoriaAyuda);
  }

  //Método que consigue las videoAyudas de dicha categoria
  tieneVideoAyudasCategoria(categoriaAyuda){
    let listaVideoAyudas = this.mapaCategoriaVideoAyuda.get(categoriaAyuda.idCategoriaAyuda);
    if (listaVideoAyudas.length > 0)
      return true;
    return false;
  }

  //Método que reproduce el video de la ayuda
  abrirReproductorVideo(videoAyuda){
    const isSmallScreen = this.breakpointObserver.isMatched('(max-width: 900px)');
    const isLandscapeScreen = this.breakpointObserver.observe(['(orientation: landscape)']);
    const dialogConfig = new MatDialogConfig();
    //Se envía las empresas seleccionadas
    dialogConfig.data = {
        videoAyuda: videoAyuda,
        tituloVideo: videoAyuda.nombre,
        iframe:videoAyuda.embedded_code
    }
    if (isSmallScreen && !isLandscapeScreen){
      dialogConfig.width = "120%";
    }else {
      dialogConfig.width = "50%";
    }
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;
    const dialogRef = this.dialog.open(ReproductorVideoComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(video => {
    });
  }

  //Método que resetea todos los valores del mapaCategoriaVideoAyuda
  resetearMapaCategoriaVideoAyuda(){
    //Se resetea los valores del mapaCategoriaVideoAyuda con array vacio, que serían los objetos de videoayudas
    if (this.categoriasList.length > 0){
      for (var i = 0; i < this.categoriasList.length; i++) {
          this.mapaCategoriaVideoAyuda.set(this.categoriasList[i].idCategoriaAyuda, []);
      }
    }
  }

  //Método que envía la lista de categorias según los roles del usuario
  //y recibe las videoAyudas disponible para dicho usuario
  getVideoAyudas(textoABuscar) {
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

    this.userService.getVideoayudas(data).subscribe(dataReturn => {
      //Siempre vamos a recibir las videoAyudas que estén NO estén dadas de bajas
      if (dataReturn != undefined && dataReturn.length > 0){
        this.resetearMapaCategoriaVideoAyuda();
        this.videoAyudaList = dataReturn;
        this.videoAyudaList.forEach(videoAyuda => {
          //Se recorre las categorias que tienen asignada esta videoAyuda
          videoAyuda.categorias.forEach(categoria => {

            let categoriaAyudaActualizar = this.mapaCategoria.get(categoria.idCategoriaAyuda);
            categoriaAyudaActualizar.expanded = true;
            this.mapaCategoria.set(categoriaAyudaActualizar.idCategoriaAyuda, categoriaAyudaActualizar);

            //Se consigue el array de videoAyudas, la primera puede devolverse vacío
            let listaVideoAyudas = this.mapaCategoriaVideoAyuda.get(categoria.idCategoriaAyuda);
            listaVideoAyudas.push(videoAyuda);
            this.mapaCategoriaVideoAyuda.set(categoria.idCategoriaAyuda, listaVideoAyudas); //Se actualiza la lista de videoAyudas
          });
        });

        //Se realiza scroll al primer resultado de la búsqueda. Siempre va a tener al menos uno "dataReturn.length > 0"
        if (busquedaPorFiltro){
            this.scrollTo(this.videoAyudaList[0].categorias[0].idCategoriaAyuda, false);
        }
      }else if (dataReturn.length === 0){  //Si no se ha encontrado ninguna coincidencia con la busqueda
           let titulo = "No se han encontrado videoayudas para su búsqueda:";
           this.translate.get('SIN_VIDEOAYUDAS').subscribe((res: string) => {
             titulo = res;
           });
           this.utils.mostrarMensajeSwalFire('warning', titulo, this.textoABuscar,'var(--blue)', false);
      }else{
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

}
