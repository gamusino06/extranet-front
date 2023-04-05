import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { UserService } from './services/user.service';
import { Globals } from './extranet/globals';
import { Router } from '@angular/router';
import { UtilsService } from 'src/app/services/utils.service';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PrevingExtranetGuard implements CanActivate {

  environment = environment;
  webEnMantenimiento: boolean;
  nextRoute: any;
  roles: any;
  permisosRoles: any;
  areasGlobal: any;

  constructor(private userService: UserService,
    private translate: TranslateService,
    public globals: Globals,
    private router: Router,
    public utils: UtilsService
    ) { }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    let unauthorized = true;
    this.webEnMantenimiento = environment.webEnMantenimiento;
    //Indica que la web está en mantenimiento y redirigirá 'en el else' a Login si no estaba ya en dicha pantalla y mostará una pantalla de mantenimiento
    if(!this.webEnMantenimiento){
      let url = next.routeConfig;
      this.nextRoute = url.path;

      this.userService.getUser().subscribe(user => {
        if (Object.values(allowedExtraRoutesEnum).includes(this.nextRoute)) {
          unauthorized = setUnauthorizedByAllowedRoutes(this, user);
        } else {
          this.areasGlobal = user.areas;
          if (this.areasGlobal !== undefined && this.areasGlobal.length >= 0) {
            for (let areas of this.areasGlobal) {
              if (areas !== undefined)
              {
                if (areas.ruta==this.nextRoute){
                  unauthorized = false;
                  break;
                }else if (areas.secciones !== undefined && areas.secciones.length >= 0) {
                  for (let seccion of areas.secciones) {
                    if (seccion.ruta === this.nextRoute) {
                      unauthorized = false;
                      break;
                    }else if (seccion.subsecciones !== undefined && seccion.subsecciones.length >= 0) {
                      for (let subseccion of seccion.subsecciones) {
                        if (subseccion.ruta === this.nextRoute) {
                          unauthorized = false;
                          break;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        if (unauthorized) {
          let response_error = "Acceso no permitido.";
          this.translate.get('USUARIO_SIN_ACCESO').subscribe((res: string) => {
            response_error = res;
          });
          Swal.fire({
            icon: 'error',
            title: response_error,
            confirmButtonColor: 'var(--blue)',
            allowOutsideClick: false
          })
          this.router.navigate([this.globals.extranet_url]);
        }
      });
    }else{
      this.router.navigate([this.globals.login_url]);
    }

    //NOTA: A raiz del cambio del get User.
    //Se debe devolver lo contrario del unauthorized (antes del cambio era correcto pero ha cambiado)
    //Es decir, si el Guard esta activo es que unauthorized es false pero tiene que devolver true.
    return !unauthorized;
  }
}

/**
 * Authorizes some routes which have special permissions
 * @param scope
 * @param user
 */
function setUnauthorizedByAllowedRoutes(scope: any, user: any) {
  if (scope.nextRoute === allowedExtraRoutesEnum.allowedExtraRoute1 || scope.nextRoute === allowedExtraRoutesEnum.allowedExtraRoute2 || scope.nextRoute === allowedExtraRoutesEnum.allowedExtraRoute3) {
    return false;
  }
  if ((scope.nextRoute === allowedExtraRoutesEnum.allowedExtraRoute4 || scope.nextRoute === allowedExtraRoutesEnum.allowedExtraRoute5) && !scope.userService.hasAnyVSHiredCompany(user)) {
    return true;
  }
  if (scope.nextRoute === allowedExtraRoutesEnum.allowedExtraRoute6 || scope.nextRoute === allowedExtraRoutesEnum.allowedExtraRoute7) {
    return false;
  }
}

/**
 * Enum with route names which have special permissions
 */
enum allowedExtraRoutesEnum {
  allowedExtraRoute1 = 'citacion-web-calendario',
  allowedExtraRoute2 = 'citacion-web-hora',
  allowedExtraRoute3 = 'citacion-web-trabajador',
  allowedExtraRoute4 = 'gestion-citas-empresas',
  allowedExtraRoute5 = 'gestion-citas-personas',
  allowedExtraRoute6 = 'mi-perfil',
  allowedExtraRoute7 = 'cambiar-password',
}
