import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Seccion } from 'src/app/Model/Seccion';
import { Empresa } from 'src/app/Model/Empresa';
import { Router, Event as NavigationEvent, NavigationStart , NavigationEnd, NavigationError } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Globals } from '../globals';
import { UtilsService } from 'src/app/services/utils.service';
import { UserService } from 'src/app/services/user.service';
import { ConsultaGeneralComponent } from 'src/app/modales/consultaGeneral/consultaGeneral.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { CustomerService } from '../../services/customer.service';
import { stringify } from 'querystring';
import * as path from 'path';
import {StructureIsReused} from '@angular/compiler-cli/src/transformers/util';
import {isNull} from 'util';
import { OffersService } from 'src/app/services/offers.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  currentRoute: string = '';
  @Input() seccionSelectedList: Seccion[];
  @Output() areaActive = new EventEmitter<any>();
  @Input() @Output() userLoged:any;
  @Input() fileToUpload: File;
  @Input() areaSelected:number;
  @Input() @Output() cambiosRealizadosEnSidebar:boolean;
  @Output() cambiosRealizadosEnSidebarActive = new EventEmitter<any>();
  @Input() userHasActiveAppointmentManagements: boolean

  notAcceptedOffers: number;


  bannerObject = {
    title: 'CoronaVirus',
    detail: 'Con motivo del estado de alerta a nivel mundial sobre la epidemia del coronavirus 2019-nCoV, desde Grupo Preving queremos indicar algunas pautas claves del tema.',
    isButton: true,
    buttonDescription: 'SABER MÁS',
    imgUrl: '../assets/img/estrellas.jpg'
  };
  bannerCitas = false;
  areas: any;
  empresasUsuario: Empresa[];
  extranetUrl: string;
  empresas: any = [{length: '1'}]
  fechaBajaEmpresaSeleccionada: string = '0';
  fechaAltaEmpresaSeleccionada: string;

  constructor(
    private router: Router,
    public globals: Globals,
    public utils: UtilsService,
    private offersService: OffersService,
    public dialog: MatDialog,
    public translate: TranslateService,
    private spinner: NgxSpinnerService,
    private userService: UserService,
    private customerService: CustomerService) {

    this.router.events
    .subscribe(
      (event: NavigationEvent) => {
        if(event instanceof NavigationStart && event.url == "/") {
          alert("Error de ruta, ruta vacia");
          return false;
        }
        if(event instanceof NavigationEnd) {
          this.currentRoute = event.url;
          this.globals.showMobileMenu = false;
        }
        if(event instanceof NavigationError 
          && event.url !== '/extranet/catalogo-formacion'
          && event.url !== '/extranet/cursos-pedidos'
          && event.url !== '/extranet/mis-cursos'
          && event.url !== '/extranet/plan-formacion'
          && event.url !== '/extranet/premium'
        ) {
          alert("Ruta invalida " + event.url);
        }
      });

    this.router.errorHandler = (error: any) => {
      //alert("Ruta invalida");
    }

  }

  ngOnInit(): void {
    this.initNotAcceptedOffers();
    this.offersService.getValue().subscribe((value) => {
      this.notAcceptedOffers = value
    });
    this.extranetUrl = this.globals.extranet_url;
    this.getUserData();
    this.getCustomers();
  }

  initNotAcceptedOffers(): void{
    // this.offersService.setValue(0);
    if (!this.offersService.getStatus()) this.getCountNotAcceptedOffers()
  }

  getCountNotAcceptedOffers () {
    this.offersService.getCountNotAcceptedOffers().subscribe((val) => {
      this.offersService.setValue(val)
    })
  }

  getUserData(): void {
    this.spinner.show();
    this.userService.getUser().subscribe(user => {
      this.empresasUsuario = user.empresas;
      this.areas = user.areas;
      this.userLoged = user;
      if (user.areas !== undefined) {
        if (user.areas.find(element => element.idArea === this.globals.idAreaVS)){
          this.bannerCitas = true;
        }
      }

      let lang = localStorage.getItem("lang");
      if (lang == undefined)
      {
        lang = user.idioma.lang;
        localStorage.setItem("lang",lang);
      }
      this.translate.use(lang);
      this.translate.setDefaultLang(lang);

      let auxArea = user.areas.find(element => element.idArea === this.areaSelected)
      this.areaActive.emit(auxArea);
      this.spinner.hide();
    });
  }

  hasSelectedSubsection(seccion): boolean {
    if (!seccion.subsecciones || !this.currentRoute)
      return false

    return Boolean(seccion.subsecciones.find(subseccion =>  this.currentRoute == (this.globals.extranet_url + subseccion.ruta)));
  }

  //Método que recibe una seccion o subseccion y navega a ella.
  infoEnrutamiento(seccionSubseccion){
    localStorage.setItem('areaActual',JSON.stringify(seccionSubseccion));
    this.cambiosRealizadosEnSidebar = true;
    this.cambiosRealizadosEnSidebarActive.emit(true);
  }

  useLanguage(lang:string) {
    this.translate.use(lang);
    this.translate.setDefaultLang(lang);
    localStorage.setItem("lang",lang);
    this.getUserData();
    location.reload();
  }

  //Muestra la modal de consulta general
  realizarConsultaGeneral() {
    const dialogConfig = new MatDialogConfig();
    let nombresEmpresasUsuario: string = "";
    this.empresasUsuario.forEach(empresa => {
      nombresEmpresasUsuario = nombresEmpresasUsuario + empresa.nombre + "; ";
    });

    dialogConfig.data = {
      empresasUsuario: nombresEmpresasUsuario
    };
    dialogConfig.width = "60%";
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;

    const dialogRef = this.dialog.open(ConsultaGeneralComponent, dialogConfig);
  }

  goToCitacionWeb() {
    if (this.areas !== undefined) {
      let area = this.areas.find(element => element.idArea === this.globals.idAreaVS);
      if (area !== undefined){
        this.areas.forEach((areaABuscar, index) => {
            if (areaABuscar.idArea === area.idArea){
              localStorage.setItem("selectedTab", index+1);
              localStorage.setItem('enrutadoPorFavoritos',"false");
              localStorage.setItem('enrutadoCitacionWeb', "true");
              localStorage.setItem('areaActual',JSON.stringify(area.secciones[3].subsecciones[0]));
              this.cambiosRealizadosEnSidebar = true;
              this.cambiosRealizadosEnSidebarActive.emit(true);
            }
        });
        this.areaActive.emit(area);
        if (area.ruta!==undefined){
          this.router.navigate([this.extranetUrl + area.ruta]);
        }
      }
    }
  }

  comprobarUrl() {
    if(this.router.url === '/extranet/juridico' && this.empresas.length != 1 && !this.comprobarFecha())
      return false;
    return true;
  }
//Metodo para movernos con el ID asociado
  entrada(idEmpresa) {
    sessionStorage.setItem('customerId', idEmpresa);
    let registros = [];
    let empresa: any;
    let fecha: Date = new Date('1/1/1800');
    this.customerService.getFechaEmpresa(idEmpresa).subscribe(data => {
      for(let empresa of data){
        if(empresa.claveRelEmpresaProducto.producto.idProducto == 3){
          registros.push(empresa);
        }
      }
      let sw = 0;
      for(let registro of registros){
        if(registro.fechaBaja == undefined){
          empresa = registro;
          sw = 1;
        } else if(new Date(registro.fechaAlta) > fecha && sw == 0){
          empresa = registro;
          fecha = new Date(registro.fechaAlta);
        }
      }
      if(empresa != undefined){
        sessionStorage.setItem('fechaBajaEmpresaSeleccionada', empresa.fechaBaja);
        sessionStorage.setItem('fechaAltaEmpresaSeleccionada', empresa.fechaAlta);
      }
    }, error => {
      this.utils.mostrarMensajeSwalFire('error', "Ha ocurrido un error al intentar tramitar la empresa", '','var(--blue)', false);
      this.spinner.hide();
    })
  }

  getCustomers() {
    // this.spinner.show();
    let userData = JSON.parse(localStorage.getItem('userDataFromUsuario'));
    this.customerService.getEmpresas(userData.idUsuario)
      .subscribe(data => {
        this.empresas = [];
        for (let dato of data){
          let swEmp = 0;
          if(this.empresas.length == 0){
            this.empresas.push(dato);
          }
          for (let empresa of this.empresas){
            if(empresa.id != dato.id){
              swEmp = 1;
            } else {
              swEmp = 0;
            }
          }
          if(swEmp == 1){
            this.empresas.push(dato);
          }
        }
        if(this.empresas.length != 1){
          sessionStorage.setItem('customerQuantities', this.empresas.length);
        }
        else if(this.empresas.length == 1){
          sessionStorage.setItem('customerId', this.empresas[0].id);
          sessionStorage.setItem('customerQuantities', '1');
          this.entrada(this.empresas[0].id);
        }
        // this.spinner.hide();
      }, error => {
        this.spinner.hide();
      });
  }

  comprobarFecha() {
    let pathNoSidebar = 0;
    if(this.router.url == '/extranet/documentacion-juridica' || this.router.url == '/extranet/consultas-prl' || this.router.url == '/extranet/documentacion-general' || this.router.url == '/extranet/servicios-prestados' || this.router.url == '/extranet/normativa-general-y-prl' || this.router.url == '/extranet/formacion-en-prl'){
      pathNoSidebar = 1;
    }
    if(this.router.url == '/extranet/juridico' || this.router.url == '/extranet/informacion-general' || this.router.url == '/extranet/documentacion-juridica' || this.router.url == '/extranet/consultas-prl' || this.router.url == '/extranet/documentacion-general' || this.router.url == '/extranet/servicios-prestados' || this.router.url == '/extranet/normativa-general-y-prl' || this.router.url == '/extranet/formacion-en-prl'){
      this.fechaBajaEmpresaSeleccionada = sessionStorage.getItem('fechaBajaEmpresaSeleccionada');
      this.fechaAltaEmpresaSeleccionada = sessionStorage.getItem('fechaAltaEmpresaSeleccionada');

      if(Date.parse(this.fechaBajaEmpresaSeleccionada) < Date.now() || Date.parse(this.fechaAltaEmpresaSeleccionada) > Date.now()) {
        if (pathNoSidebar == 1) {
          this.router.navigate(['extranet/informacion-general']);
        }
        if(this.router.url == '/extranet/juridico' && this.empresas.length == 1)
          this.router.navigate(['extranet/informacion-general']);

        return true;
      }
      else
        return false;
    } else
      return false;
  }
}
