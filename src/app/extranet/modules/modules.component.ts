import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User } from 'src/app/Model/User';
import { Seccion } from '../../Model/Seccion';
import { Area } from '../../Model/Area';
import { Rol } from '../../Model/Rol';
import { Router, Event as NavigationEvent, NavigationStart , NavigationEnd, NavigationError } from '@angular/router';
import { Globals } from '../globals';
import { environment } from '../../../environments/environment';
import { UserService } from 'src/app/services/user.service';
import { UtilsService } from 'src/app/services/utils.service';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ModalModificarAltaFavorito } from 'src/app/modales/modalModificarAltaFavorito/modalModificarAltaFavorito.component';
import Swal from 'sweetalert2';

export interface Favorito {
  usuario: User;
  area: Area;
  areaPadre: Area;
  nombre: string;
}

@Component({
  selector: 'app-modules',
  templateUrl: './modules.component.html',
  styleUrls: ['./modules.component.css']
})
export class ModulesComponent implements OnInit {
  environment = environment;

  @Input() @Output() userLoged: User;
  @Output() areaActive = new EventEmitter<Area>();
  @Input() areaSelected:number;
  @Input() @Output() cambiosRealizadosEnSidebar:boolean;
  @Output() cambiosRealizadosEnSidebarActive = new EventEmitter<boolean>();
  @Input() sectionActionMap;

  public selectedIndexBinding = 0;
  public tabs = []; // ["Prevención Técnica","Vigilancia de la Salud","Administración","Información","Mi Perfil"];

  profileLogoUrl = '../../assets/img/user.svg';
  starLogoUrl = '../../assets/img/star.svg';

  areaList: Area[];
  favoritosList: Favorito[];
  extranetUrl: string;
  clickDone = false;
  paginaEnFavoritos = false;
  cambiosSidebar = false;

  constructor(private router: Router,
              private userService: UserService,
              private translate: TranslateService,
              public utils: UtilsService,
              public dialog: MatDialog,
              public globals: Globals) {
  }

  ngOnInit(): void {
    if (environment.debug) { console.log('>ngOnInit'); }
    this.extranetUrl = this.globals.extranet_url;
    this.selectedIndexBinding = 0;
    this.cambiosRealizadosEnSidebar = false;
    this.cambiosSidebar = false;
    this.favoritosList = [];
    this.getFavoritos(); // Se actualiza de nuevo los favoritos del usuario
    if (localStorage.getItem('selectedTab') !== null) {
      this.selectedIndexBinding = +localStorage.getItem('selectedTab');
      localStorage.setItem('enrutadoPorFavoritos', 'false');
      // transformNecesario se usará para arreglar el problema
      // de translateX(-430px) al enrutar por favoritos
      localStorage.setItem('transformNecesario', 'true');
    }
  }

  ngOnChanges() {
    if (this.cambiosRealizadosEnSidebar != true) {
      /*Cuando recibo la respuesta de el servidor puedo pintar los modulos correspondientes*/
      if (this.userLoged) {
         this.areaList = this.userLoged.areas;
         this.tabs = [];
         this.areaList.forEach(module => {
         if (module.idArea != this.globals.idAreaMensajes &&
             module.idArea != this.globals.idAreaBlog &&
             module.idArea != this.globals.idAreaContacto &&
             module.idArea != this.globals.idAreaAyuda &&
            module.idArea !== this.globals.myProfileIdArea) {
                 // Sólo metemos las areas que nos interesan.
                 this.tabs.push(module);
          }
        });

         if (localStorage.getItem('selectedTab') !== null) {
           this.selectedIndexBinding = +localStorage.getItem('selectedTab');
           this.cambiosSidebar = false;
        }
        this.comprobarPaginaEnFavoritos();
      }
    }else{
      this.cambiosSidebar = true;
      localStorage.setItem('enrutadoPorFavoritos', 'false');
      localStorage.setItem('transformNecesario', 'false');
      this.cambiosRealizadosEnSidebarActive.emit(false); // Reseteamos la variable
      this.comprobarPaginaEnFavoritos();
    }
  }

  selectModule($event) {
    if (environment.debug) { console.log('>selectModule'); }
    if (this.clickDone) {
      // Cuando se enruta desde el sidebar hacia la citación web, es necesario que no se vuelva a emitir el are, se controla con 'enrutadoCitacionWeb'
      if (localStorage.getItem('enrutadoPorFavoritos') != 'true' && this.cambiosSidebar != true
        && (localStorage.getItem('enrutadoCitacionWeb') == 'false' || localStorage.getItem('enrutadoCitacionWeb') == null) ) {
          let area = {} as Area;
          area = this.areaList.find((obj => obj.idArea == $event.tab.textLabel));
          if (environment.debug) { console.log('*cambio enrutadoPorFavoritos a false -> if selectModule'); }
          localStorage.setItem('enrutadoPorFavoritos', 'false');
          localStorage.setItem('transformNecesario', 'false');
          localStorage.setItem('areaActual', JSON.stringify(area));
          if (area !== undefined) {
            localStorage.setItem('areaSelected', JSON.stringify(area));
            this.areaActive.emit(area);
            if (area.ruta !== undefined) {
              this.router.navigate([this.extranetUrl + area.ruta]);
            }
          }
          if (environment.debug) { console.log(area); }
      } else {
          if (environment.debug) { console.log('*cambio enrutadoPorFavoritos a false -> else selectModule'); }
          localStorage.setItem('enrutadoPorFavoritos', 'false'); // Se resetea a false para así volver a emitir un area dentro del 'if'
          localStorage.setItem('transformNecesario', 'false');
          localStorage.setItem('enrutadoCitacionWeb', 'false');
          this.cambiosSidebar = false;
      }
    }
  }

  changeIndex($event) {
    if (environment.debug) { console.log('>changeIndex'); }
    this.clickDone = true;
    if ($event !== undefined) {
      this.selectedIndexBinding = $event;
      localStorage.setItem('selectedTab', this.selectedIndexBinding.toString());
    }
  }

  updateEnrutarPorFavoritos() {
    if (environment.debug) { console.log('>updateEnrutarPorFavoritos'); }
    localStorage.setItem('enrutadoPorFavoritos', 'false');
    localStorage.setItem('transformNecesario', 'false');
  }

  // Método que realiza el enrutamiento a la ruta guardada en el favorito
  enrutar(favorito) {
    if (environment.debug) { console.log('>enrutar'); }
    const area = favorito.area;
    localStorage.setItem('areaActual', JSON.stringify(area));

    let areaPadre = favorito.areaPadre;
    const idAreaPadre: number = areaPadre.idArea;
    areaPadre = this.areaList.find((obj => obj.idArea == idAreaPadre));

    // Cuando va a enrutar a una area de las siguientes: Ayuda(5), Contacto(6), Mensajes(7), Blog(10)
    if (idAreaPadre === this.globals.idAreaAyuda || idAreaPadre === this.globals.idAreaContacto ||
          idAreaPadre === this.globals.idAreaMensajes || idAreaPadre === this.globals.idAreaBlog) {
       localStorage.setItem('selectedTab', null);  // Se setea la pestaña seleccionada del localStorage a null para que no marque ninguna pestaña en estas áreas.
    } else {
        const usuario: any = JSON.parse(localStorage.getItem('userDataFromUsuario'));
        usuario.areas.forEach((area, index) => {
            if (area.idArea === idAreaPadre) {
              localStorage.setItem('selectedTab', index + 1);
            }
        });
    }
    if (environment.debug) { console.log('*cambio enrutadoPorFavoritos a true -> enrutar'); }
    localStorage.setItem('enrutadoPorFavoritos', 'true');
    localStorage.setItem('transformNecesario', 'true');

    this.areaActive.emit(areaPadre);
    if (area.ruta !== undefined) {
      const ruta = area.ruta;
      if (ruta.includes(this.globals.extranet)) {
        this.router.navigate([this.globals.extranet]);
      } else {
        this.router.navigate([this.globals.extranet_url + ruta]);
      }
    } else {
        localStorage.setItem('selectedTab', null);
        this.router.navigate([this.globals.extranet]);
    }
  }

  // Método que devuelve los favoritos del usuario
  getFavoritos() {
    this.userService.getFavoritos().subscribe(favoritos => {
        if (favoritos != undefined && favoritos.length >= 0) {
          this.favoritosList = favoritos;
          // Se verifica en la página en la que estamos, si se encuentra en dicha lista 'favoritosList',
          // si así es, hay que poner  this.paginaEnFavoritos = true
          this.comprobarPaginaEnFavoritos();
        }else if (favoritos == undefined ) {
          // 20/05/2022 -> Eliminamos este mensaje de error ya que impide la navegación de usuarios (por ejemplo Glovo)
          //this.mostrarMensajeSwalFire("Error al intentar obtener los favoritos del usuario", 'ERROR_OBTENER_FAVORITOS', true);
        }
    });
  }

  // Método que guarda el favorito del usuario
  guardarFavorito(favorito) {
    this.userService.insertFavorito(favorito).subscribe(result => {
        if (result && result != undefined) {
            this.mostrarMensajeSwalFire('Se ha guardado correctamente el favorito', 'ALTA_FAVORITO', false);
            this.getFavoritos();  // Se actualiza la lista
        } else {
            this.mostrarMensajeSwalFire('Error al guardar el favorito', 'ERROR_ALTA_FAVORITO', true);
        }
    });
  }

  // Método que actualiza el nombre del favorito del usuario
  actualizarFavorito(favorito) {
    // Sea abre una ventana emergente (misma ventana que altaFavorito) para indicar con qué nombre quiere guardar esa ruta del favorito
    // (Tendrá el input Nombre: 'Ya aparecerá el nombre que tenia'  y botón Cancelar y Modificar)
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      modificarFavorito: true,
      favorito: {
          nombre: favorito.nombre
      }
    };
    dialogConfig.width = '50%';
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;
    const dialogRef = this.dialog.open(ModalModificarAltaFavorito, dialogConfig);

    dialogRef.afterClosed().subscribe(resultDialogRef => {
      if (resultDialogRef !== undefined) {
        favorito.nombre = resultDialogRef;

        this.userService.updateFavorito(favorito).subscribe(result => {
            if (result && result != undefined) {
                this.mostrarMensajeSwalFire('Se ha editado correctamente el favorito', 'FAVORITO_EDITADO', false);
                this.getFavoritos();  // Se actualiza la lista
            } else {
                this.mostrarMensajeSwalFire('Error al actualizar el favorito', 'ERROR_FAVORITO_EDITADO', true);
            }
        });
      }
    });
  }

  // Método que elimina el favorito del usuario
  eliminarFavorito(favorito) {
    // Se preguntará si se quiere eliminar de favoritos, en caso de que si, entonces this.paginaEnFavoritos = false; y llamamos a deleteFavorito
    let titulo = '¿Desea eliminar esta pantalla de favoritos?';
    this.translate.get('BAJA_FAVORITO_PRELIMINAR').subscribe((res: string) => {
     titulo = res;
    });
    let btn_text = 'Si';
    this.translate.get('SI').subscribe((res: string) => {
      btn_text = res;
    });
    let btn_text_cancelar = 'No';
    this.translate.get('NO').subscribe((res: string) => {
      btn_text_cancelar = res;
    });
    Swal.fire({
          icon: 'warning',
          title: titulo,
          text: '',
          showCancelButton: true,
          confirmButtonColor: 'var(--blue)',
          confirmButtonText: btn_text,
          cancelButtonText: btn_text_cancelar,
          allowOutsideClick: false
        }).then(resultSwal => {
            if (resultSwal.isConfirmed) {
                this.userService.deleteFavorito(favorito).subscribe(result => {
                    if (result && result != undefined) {
                        this.mostrarMensajeSwalFire('Se ha eliminado correctamente el favorito', 'BAJA_FAVORITO', false);
                        this.paginaEnFavoritos = false;
                        this.getFavoritos();  // Se actualiza la lista
                    } else {
                        this.mostrarMensajeSwalFire('Error al eliminar el favorito', 'ERROR_BAJA_FAVORITO', true);
                    }
                });
            }
        });
  }

  // Método que recibe el texto y el campo a buscar para su traducción
  mostrarMensajeSwalFire(tituloMensaje, campoTranslate, error) {
    let titulo = tituloMensaje;
    this.translate.get(campoTranslate).subscribe((res: string) => {
     titulo = res;
    });
    if (!error) {
        this.utils.mostrarMensajeSwalFire('success', titulo, '', 'var(--blue)', false);
    } else {
        this.utils.mostrarMensajeSwalFire('error', titulo, '', 'var(--blue)', false);
    }
  }

  altaFavorito() {
    if (!this.paginaEnFavoritos) {
      const favoritoPantalla = {} as Favorito;

      // Se abre una ventana emergente para indicar con qué nombre quiere guardar esa ruta del favorito (Tendrá el input Nombre:   y botón Cancelar y Agregar)
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = {
        modificarFavorito: false,
        favorito: {
            nombre: ''
        }
      };
      dialogConfig.width = '50%';
      dialogConfig.hasBackdrop = true;
      dialogConfig.disableClose = true;
      const dialogRef = this.dialog.open(ModalModificarAltaFavorito, dialogConfig);

      dialogRef.afterClosed().subscribe(resultDialogRef => {
        if (resultDialogRef !== undefined) {

          const favoritoPantalla = {
              nombre: resultDialogRef,
              area: this.areaPantallaActual()
          };

          this.paginaEnFavoritos = true;
          this.guardarFavorito(favoritoPantalla);
        }
      });
    }
  }

  // Método que extrae la url de la pantalla actual
  areaPantallaActual() {
    const areaActual = JSON.parse(localStorage.getItem('areaActual'));
    const area = {} as Area;
    area.idArea = this.obtenerIdArea(areaActual);

    return area;
  }

  // Método que obtiene el id del area pasada por parámetro
  obtenerIdArea(areaActual) {
    let idArea = 0;

    if (areaActual != null) {
      if (areaActual.idArea != undefined) {
        idArea = areaActual.idArea;
      } else if (areaActual.idSeccion != undefined) {
        idArea = areaActual.idSeccion;
      } else if (areaActual.idSubseccion != undefined) {
        idArea = areaActual.idSubseccion;
      }
    }

    return idArea;
  }

  // Método que comprueba si la pagina actual se encuentra dentro de favoritos
  comprobarPaginaEnFavoritos() {
    if (localStorage.getItem('areaActual') != 'undefined') {
      const areaActual = JSON.parse(localStorage.getItem('areaActual'));
      const idAreaActual = this.obtenerIdArea(areaActual);
      this.paginaEnFavoritos = false;
      if (this.favoritosList !== undefined) {
          this.favoritosList.forEach(favorito => {
              if (favorito.area.idArea === idAreaActual) {
                this.paginaEnFavoritos = true;
                return;
              }
          });
      }
    }
  }

}


