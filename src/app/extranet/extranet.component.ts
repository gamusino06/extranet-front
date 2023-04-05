import {UserService} from './../services/user.service';
import {environment} from '../../environments/environment';
import {ChangeDetectorRef, Component, OnInit, Output} from '@angular/core';
import {User} from '../Model/User';
import {ActivatedRoute, Router} from '@angular/router';
import {Area} from '../Model/Area';
import {NgxSpinnerService} from 'ngx-spinner';
import {TranslateService} from '@ngx-translate/core';
import {Globals} from './globals';
import {AppointmentService} from '../services/appointment.service';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import Swal from 'sweetalert2';
import {NotificacionesFrameComponent} from './notificacion-mejoras/notificaciones-frame/notificaciones-frame.component';
import {UtilsService} from '../services/utils.service';

@Component({
  selector: 'app-extranet',
  templateUrl: './extranet.component.html',
  styleUrls: ['./extranet.component.css']
})

export class ExtranetComponent implements OnInit {
  environment = environment;
  user: User;
  seccionSelectedList: any[];
  areaSelected = 0;
  nMensajesLeidos: any;
  extranetImg = false;
  @Output() cambiosRealizadosEnSidebar = false;
  sectionActionMap: Map<string,Function> = new Map<string, Function>();
  userHasActiveAppointmentManagements = false;
  isFormLoaded = false;

  constructor(
    private userService: UserService,
    private router: Router,
    private globals: Globals,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    public utils: UtilsService,
    public translate: TranslateService,
    private cdRef: ChangeDetectorRef,
    private appointmentService: AppointmentService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.spinner.show();
    this.sectionActionMap.set(this.globals.HEALTH_SURVEILLANCE_AREA_NAME, this.removeAskForAppointmentSubsection);

    const promiseArray = [];

    const getUserPromise = this.getUser();
    promiseArray.push(getUserPromise);

    const checkIfUserHasActiveAppointmentManagementsPromise =  this.checkIfUserHasActiveAppointmentManagements();
    promiseArray.push(checkIfUserHasActiveAppointmentManagementsPromise);

    Promise.all(promiseArray)
      .then(res => {
        // if (environment.debug) console.log(res);
      })
      .catch(err => {
        if (environment.debug) console.log(err);
      })
      .finally(() => {

        this.updateSelections();
        this.spinner.hide();
        this.isFormLoaded = true;
      });
    this.userService.getNotificacionAceptada().subscribe(data => {
      if(null != data && data.id != 0){
        this.abrirModalNovedades(data);
      }
    });
  }

  // Evita que se produzca el ERROR Error: ExpressionChangedAfterItHasBeenCheckedError
  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  getUser() {
      return new Promise((resolve, reject) => {
        this.userService.getUser().subscribe(user => {
            this.user = user;
            resolve(true);
          },
          (error) => {
            if (environment.debug) console.log('error', error);
            reject(true);
          });
      });
  }

  /*actualiza el area pulsada con la seccion/es correspondientes*/
  updateArea(area: Area): void {
    this.spinner.show();
    const promiseArray = [];

    const getUserPromise = this.getUser();
    promiseArray.push(getUserPromise);

    const checkIfUserHasActiveAppointmentManagementsPromise =  this.checkIfUserHasActiveAppointmentManagements();
    promiseArray.push(checkIfUserHasActiveAppointmentManagementsPromise);

    Promise.all(promiseArray)
      .then(res => {
        // if (environment.debug) console.log(res);
      })
      .catch(err => {
        if (environment.debug) console.log(err);
      })
      .finally(() => {
        if (area !== undefined && this.sectionActionMap.get(area.nombre) !== undefined) {
          // set areas in initial state
          const storageUserData = JSON.parse(localStorage.getItem('userDataFromUsuario'));
          this.user.areas = storageUserData.areas;
          // restructure areas depending on section action map
          if (!this.userHasActiveAppointmentManagements) {
            this.executeSectionActionMap();
          } else {
            this.setSelectedArea(area, this);
          }
        } else if (area !== undefined) {
          this.setSelectedArea(area, this);
        }
        this.spinner.hide();
      });
  }

  setSelectedArea(area: Area, scope) {
    localStorage.setItem('areaSelected', JSON.stringify(area));
    scope.areaSelected = area.idArea;
    scope.seccionSelectedList = area.secciones;

    if (scope.router.url === scope.globals.barraExtranet) {
      scope.extranetImg = true;
    } else {
      scope.extranetImg = false;
    }
  }

  updateSidebar(cambiosSidebar: boolean) {
    this.cambiosRealizadosEnSidebar = cambiosSidebar;
  }

  onActivate(elementRef) {
    console.log("s")
  }

  updateSelections() {
    /*actualizamos el area seleccionada*/

    if (localStorage.getItem('areaSelected') !== 'undefined') {
      const seleccionArea = JSON.parse(localStorage.getItem('areaSelected'));
      if (seleccionArea != null) {
        this.areaSelected = seleccionArea.idArea;
        this.seccionSelectedList = seleccionArea.secciones;
      }
    }
    if (this.router.url === this.globals.barraExtranet) {
      this.extranetImg = true;
    } else {
      this.extranetImg = false;
    }
  }

  mensajeLeidoMetodo() {
    this.userService.countNotRead().subscribe(data => {
      if (data) {
      	this.nMensajesLeidos = data;
      } else {
      	this.spinner.hide();
      }
    }), (error => {
      if (environment.debug) { console.log('Error'); }
    });
  }

  executeSectionActionMap(this) {
    this.user.areas.forEach(area => {
      const selectedAreaFn = this.sectionActionMap.get(area.nombre);
      if (selectedAreaFn !== undefined) {
        selectedAreaFn(this);
      }
    });
  }

  removeAskForAppointmentSubsection(scope): void {
      const areas = scope.user.areas;
      let selectedArea;
      let selectedAreaIndex;
      let selectedSection;
      let selectedSectionIndex;
      let selectedSubsectionIndex;

      if (areas !== undefined) {
        areas.forEach((area, index) => {
          if (area.nombre === scope.globals.HEALTH_SURVEILLANCE_AREA_NAME) {
            selectedArea = area;
            selectedAreaIndex = index;
          }
        });
      }
      if (selectedArea !== undefined) {
        selectedArea.secciones.forEach((section, index) => {
          if (section.nombre === scope.globals.MEDICAL_RECOGNITION_SECTION_NAME) {
            selectedSection = section;
            selectedSectionIndex = index;
          }
        });
      }
      if (selectedSection !== undefined) {
        selectedSection.subsecciones.forEach((subsection, index) => {
          if (subsection.nombre === scope.globals.ASK_FOR_APPOINTMENT_SUBSECTION_NAME) {
            selectedSubsectionIndex = index;
          }
        });

        // set new area list
        if (selectedSubsectionIndex !== undefined) {
          selectedSection.subsecciones.splice(selectedSubsectionIndex, 1);
          areas[selectedAreaIndex].secciones[selectedSectionIndex] = selectedSection;

          scope.user.areas = areas;

          if (selectedArea !== undefined) {
            scope.setSelectedArea(selectedArea, scope);
          }
        }
      }
  }

  checkIfUserHasActiveAppointmentManagements() {
    return new Promise((resolve, reject) => {
      const centersIdList = [];
      this.user.empresas.forEach(company => {
        const filteredCenterList = company.centros.filter(center => center.activoVS);
        const filteredCenterIdList = filteredCenterList.map(a => a.idCentro);
        centersIdList.push(...filteredCenterIdList);
      });
      if (centersIdList.length <= 0) {
        this.userHasActiveAppointmentManagements = false;
        resolve(true);
      } else {
        this.appointmentService.checkIfUserHasActiveAppointmentManagements(centersIdList, this.globals.COMPANY_APPOINTMENT_MANAGEMENT)
          .subscribe(bool => {
              this.userHasActiveAppointmentManagements = bool;
              resolve(true);
            },
            (error) => {
              if (environment.debug) console.log('error', error);
              reject(true);
            });
      }
    });
  }

  abrirModalNovedades(novedad){
    Swal.fire({
      title: "¡Novedades!",
      text: "Hay una nueva actualización disponible, ¡Descúbrela!",
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#var(--blue)',
      confirmButtonText: "Ver ahora",
      cancelButtonText: "No, gracias",
      allowOutsideClick: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.spinner.show();

        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = {
          comprobante: 1,
          novedad: novedad
        };
        dialogConfig.width = "80%";
        dialogConfig.hasBackdrop = true;
        dialogConfig.disableClose = true;

        const dialogRef = this.dialog.open(NotificacionesFrameComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(data => {

        });
      }

      this.enviar();
    })
  }

  enviar(){
    this.spinner.show();

    this.userService.setNotificacionAceptada().subscribe(data => {
      if(data == "400"){
        this.utils.mostrarMensajeSwalFire("error", "Ha ocurrido un error al aceptar la notificación de novedades", "", 'var(--blue)',false);
      }

      this.spinner.hide();
    });
  }

}




