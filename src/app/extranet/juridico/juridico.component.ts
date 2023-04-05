import { Idioma } from './../../Model/Idioma';
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {NavigationExtras, Router} from '@angular/router';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { ChangeDetectorRef } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { Empresa } from 'src/app/Model/Empresa';
import { Globals } from '../globals';
import {CustomerService} from "../../services/customer.service";
import {UserService} from '../../services/user.service';
import {MatDialog} from '@angular/material/dialog';
import {isUndefined} from 'util';

@Component({
  selector: 'app-juridico',
  templateUrl: './juridico.component.html',
  styleUrls: ['./juridico.component.css']

})
export class JuridicoComponent implements OnInit {

  @Input() cargaPosterior: boolean;
  empresas: any = [];
  searchForm: FormGroup;
  customerSelected: number;
  customerQuantities: number = 0;
  path = this.router.url;

  @Input() userDataLogged: any;
  environment = environment;

  idUsuarioPreving: number;
  hashUsuarioPreving: string;

  constructor(
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    private router: Router,
    private spinner: NgxSpinnerService,
    private cdRef:ChangeDetectorRef,
    public utils: UtilsService,
    public translate: TranslateService,
    public globals: Globals,
    private customerService: CustomerService
  ) { }

  //Evita que se produzca el ERROR Error: ExpressionChangedAfterItHasBeenCheckedError
  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    // this.getDatosJuridico();
    this.sacarId();
    this.initForm();
    this.getCustomers();
  }

  initForm() {
    if(this.customerQuantities != 1) {
      this.searchForm = this.formBuilder.group({
        empresaForm: new FormControl('')
      });
     } else {
       this.searchForm = this.formBuilder.group({
         empresaForm: new FormControl({value: '', disabled: true})
       });
     }
    this.setDefaultForm();
  }

  refresh(): void {
    if(this.path != '/extranet/juridico')
      window.location.reload();
  }

  setDefaultForm(): void {
    if(this.customerQuantities == 1 || this.router.url != '/extranet/juridico'){
      this.searchForm.controls['empresaForm'].setValue(this.customerSelected);
    }
    else
      this.searchForm.controls['empresaForm'].setValue('');
  }

  /**
   * Se consiguen los datos del usuario y se obtienen las empresas
   */
  getCustomers() {
    this.spinner.show();
    let userData = JSON.parse(localStorage.getItem('userDataFromUsuario'));

    this.customerService.getEmpresas(userData.idUsuario)
      .subscribe(data => {
        this.empresas = [];
        let swEmp = 0;
        for (let dato of data){
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

        sessionStorage.setItem('customerQuantities', this.empresas.length);
        if (!this.cargaPosterior)
          this.spinner.hide();
      }, error => {
        this.utils.mostrarMensajeSwalFire('error', "Ha ocurrido un error al intentar obtener las empresas", '','var(--blue)', false);
        this.spinner.hide();
      });

  }

  sacarId(){
    if(sessionStorage.getItem('customerId') && !isUndefined(sessionStorage.getItem('customerId')))
      this.customerSelected = Number(sessionStorage.getItem('customerId'));
    else
      this.customerSelected = Number('');

    if(sessionStorage.getItem('customerQuantities') == '1')
      this.customerQuantities = Number(sessionStorage.getItem('customerQuantities'));
  }

  /**
   * Se consigue los datos necesarios para poder enrutar a la intranet de Juridico
   */
  getDatosJuridico(){
    let userData = JSON.parse(localStorage.getItem('userDataFromUsuario'));

    let idsRoles: number[] = [];
    userData.roles.forEach(rol => {
      idsRoles.push(rol.idRol);
    });

    let idsEmpresasDtos: Empresa[] = [];
    userData.empresas.forEach(empresaAux => {
      let empresa: any;
      empresa = {
        idEmpresa: empresaAux.idEmpresa
      };
      idsEmpresasDtos.push(empresa);
    });

    let data = {
      user: userData.email,
      nombre: userData.nombre,
      apellidos: userData.apellidos,
      idIdioma: userData.idioma.idIdioma,
      idRoles: idsRoles,
      empresasDtos: idsEmpresasDtos
    }

    this.utils.getDatosJuridico(data).subscribe(result => {
      if (result) {
        this.idUsuarioPreving = result.usuarioPrevingId;
        this.hashUsuarioPreving = result.hash;
        this.redirigirJuridico();
      }else{
        let titulo = "Error al conseguir los datos necesarios para redireccionar al área de jurídico";
        this.translate.get('ERROR_OBTENER_DATOS_JURIDICO').subscribe((res: string) => {
          titulo = res;
        });
        this.utils.mostrarMensajeSwalFire('error', titulo, '','var(--blue)', false);
      }

      //Tanto si hubo error o no, se redirecciona a /extranet y se setea 'selectedTab' para que no quede el área
      //seleccionada para cuando el cliente vuelva a la extranet
      localStorage.setItem("selectedTab",null);
      this.router.navigate([this.globals.extranet]);  //Se le redirigue a la página inicial de la extranet

    }), (error => {
      if (environment.debug) console.log("Error al obtener los datos de la intranet de Preving - getDatosJuridico()");
    });
  }

  /**
   * Método que redirige a la intranet de Preving para el área de Juridico
   */
  redirigirJuridico(){
    let urlARedireccionar = this.globals.intranet_redireccion_juridico_preving + "?id=" + this.idUsuarioPreving + "&h=" + this.hashUsuarioPreving;
    window.open(urlARedireccionar, '_blank');
  }

  /**
   * Metodo para movernos con el ID asociado
   */
  entrada(idEmpresa) {
    this.spinner.show();
    sessionStorage.setItem('customerId', idEmpresa);
    let registros = [];
    let empresa: any;
    let fecha: Date = new Date('1/1/1800');
    this.customerService.getFechaEmpresa(idEmpresa).subscribe(data => {
      let swLanzamiento = 0;
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
        swLanzamiento = 1;
      }

      // Recargado de pagina al cambiar a la misma ruta
      this.router.routeReuseStrategy.shouldReuseRoute = () => {
        return false;
      }

      if(swLanzamiento == 1){
        if(this.router.url == '/extranet/juridico') {
          this.spinner.hide();
          this.router.navigate(['extranet/informacion-general']);

          // this.refresh();
        }
        else {
          this.spinner.hide();
          this.router.navigate([this.router.url]);

          // this.refresh();
        }
      }
    }, error => {
      this.utils.mostrarMensajeSwalFire('error', "Ha ocurrido un error al intentar tramitar la empresa", '','var(--blue)', false);
      this.spinner.hide();
    })
  }
}
