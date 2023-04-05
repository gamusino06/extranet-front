import {Component, Input, OnInit, Optional, ViewChild} from '@angular/core';
import {UtilsService} from 'src/app/services/utils.service';
import {ConfirmationModal} from 'src/app/Model/ConfirmationModal';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {MatCheckbox} from '@angular/material/checkbox';
import { NgxSpinnerService } from 'ngx-spinner';
import {AppointmentService} from 'src/app/services/appointment.service';
import {MatSort, Sort} from '@angular/material/sort';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {AppointmentInterface} from 'src/app/extranet/appointment-management/interfaces/apointment.interface';
import {Globals} from 'src/app/extranet/globals';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {getAppointmentMockData} from '../../data/mockData';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-appointment-management',
  templateUrl: './appointment-management.component.html',
  styleUrls: ['./appointment-management.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class AppointmentManagementComponent implements OnInit {
  editImgUrl = '../../assets/img/icon-edit.svg';

  dataSource: any;
  showTable = false;
  appointmentList: any[];
  initFormState: any[];
  paginator: MatPaginator;
  sort: Sort;
  pageSize = 10;
  @Input() module;
  @Input() title;
  monthsList;
  filteredCommunityList = [];
  haveBlockeds: boolean = false;

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    if (mp) {
      this.paginator = mp;
      this.dataSource.paginator = this.paginator;
    }
  }

  @ViewChild(MatSort) set matSort(srt: MatSort) {
    if (srt) {
      this.sort = srt;
      this.dataSource.sort = this.sort;
    }
  }
  @ViewChild('allCheckbox') allCheckbox: MatCheckbox;

  // TODO CODE QUALITY: USING ONLY ONE OBJECT AND ONE VARIABLE TO CONTROL THE CONTENT OF MODAL INSTEAD OF N OBJECT. SET CORRESPONDING PROPERTY VALUE (TITLE, ICON, CANCEL BUTTON) IN EACH CASE. REMOVE N METHOD OF CLOSE MODAL
  configurationObj: ConfirmationModal = {
    title: 'COMPANY_APPOINTMENT.ACTIVATE_CONFIRMATION_QUESTION',
    text: '',
    showCancelButton: true,
    icon: 'question',
    modalSize: ''
  };
  massiveEditAdviceModalConfigurationObj: ConfirmationModal = {
    title: 'MODALS.MASSIVE_EDIT_MODAL.NOT_ENOUGH_CENTER_SELECTED',
    text: '',
    showCancelButton: false,
    icon: 'warning',
    modalSize: ''
  };
  saveModalConfigurationObj: ConfirmationModal = {
    title: 'MODALS.CONFIRMATION_MODAL.SAVED',
    text: '',
    showCancelButton: false,
    icon: 'success',
    modalSize: ''
  };
  notSaveModalConfigurationObj: ConfirmationModal = {
    title: 'MODALS.CONFIRMATION_MODAL.NOT_SAVED',
    text: '',
    showCancelButton: false,
    icon: 'error',
    modalSize: ''
  };
  errorResponseModalObject: ConfirmationModal = {
    title: 'MODALS.CONFIRMATION_MODAL.RESPONSE_ERROR',
    text: '',
    showCancelButton: false,
    icon: 'error',
    modalSize: ''
  };
  showConfigurationModal = false;
  selectedAppointmentToAccept: any = {};
  showMassiveEditAdviceModal = false;
  showSaveModal = false;
  showNotSaveModal = false;
  showResponseErrorModal = false;

  showMassiveEditModal = false;

  medicalCenterRelationList: any [];

  columnsToDisplay = ['checklist', 'companyCenter', 'active'];
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  expandedElement: AppointmentInterface | null;

  checkedAppointmentList: any [] = [];

  constructor(
    public utils: UtilsService,
    private spinner: NgxSpinnerService,
    private appointmentService: AppointmentService,
    public globals: Globals,
    private translate: TranslateService,
    private util: UtilsService
  ) {
  }

  ngOnInit(): void {
    this.monthsList = [
      { id: 'JANUARY',   value: 'COMPANY_APPOINTMENT.MONTHS.JANUARY' },
      { id: 'FEBRUARY',  value: 'COMPANY_APPOINTMENT.MONTHS.FEBRUARY' },
      { id: 'MARCH',     value: 'COMPANY_APPOINTMENT.MONTHS.MARCH' },
      { id: 'APRIL',     value: 'COMPANY_APPOINTMENT.MONTHS.APRIL' },
      { id: 'MAY',       value: 'COMPANY_APPOINTMENT.MONTHS.MAY' },
      { id: 'JUNE',      value: 'COMPANY_APPOINTMENT.MONTHS.JUNE' },
      { id: 'JULY',      value: 'COMPANY_APPOINTMENT.MONTHS.JULY' },
      { id: 'AUGUST',    value: 'COMPANY_APPOINTMENT.MONTHS.AUGUST' },
      { id: 'SEPTEMBER', value: 'COMPANY_APPOINTMENT.MONTHS.SEPTEMBER' },
      { id: 'OCTOBER',   value: 'COMPANY_APPOINTMENT.MONTHS.OCTOBER' },
      { id: 'NOVEMBER',  value: 'COMPANY_APPOINTMENT.MONTHS.NOVEMBER' },
      { id: 'DECEMBER',  value: 'COMPANY_APPOINTMENT.MONTHS.DECEMBER' }
    ];
    this.utils.getAllCommunitiesProvincesLocalitiesAndMedicalCenters().subscribe(data => {
      this.medicalCenterRelationList = data;
      this.medicalCenterRelationList.forEach(medicalCenterRelation => {
        this.filteredCommunityList.push(medicalCenterRelation);
      });
      this.filteredCommunityList = this.util.sortObjectListByStringProperty(this.filteredCommunityList, this.globals.communityListSortKey);
    });
  }

  /**
   * Search appointment management related to selected company and center
   * @param companyAndCenterMap: selected company and center map
   */
  searchAppointmentManagementByCompanyAndCenter(companyAndCenterMap): void {
    this.spinner.show();
    this.showTable = false;
    // this.setFormData();
    const centersId = [].concat(...companyAndCenterMap.values()).map((center)=>{return center.idCentro});

    this.appointmentService.getAppointmentsByCompanyAndCenter(centersId, this.module).subscribe(appointmentList => {
      this.dataSource = new MatTableDataSource<AppointmentInterface>(appointmentList);
      this.appointmentList = appointmentList;
      this.haveBlockeds = appointmentList.find(appointment => appointment.blocked);
      this.initFormState = JSON.parse(JSON.stringify(this.appointmentList));
      // this.totalSize = this.appointmentList.length;
      this.sortData({active: 'company-center', direction: 'asc'});
      this.spinner.hide();
      this.showTable = true;
    },(error) => {
      this.spinner.hide();
      console.log('error', error);
      this.showResponseErrorModal = true;
    });
  }

  /**
   * Toggles and untoggles list checkboxes
   */
  checkAllRows(): void {
    if (this.appointmentList !== undefined || Object.keys(this.appointmentList).length !== 0) {
      if (this.appointmentList.filter(val => !val.blocked).every(val => val.checked === true)) {
        this.appointmentList.filter(val => !val.blocked).forEach(val => {
          val.checked = false;
        });
        if (this.allCheckbox.checked) {
          this.allCheckbox.toggle();
        }
      } else {
        this.appointmentList.filter(val => !val.blocked).forEach(val => {
          val.checked = true;
        });
        if (!this.allCheckbox.checked) {
          this.allCheckbox.toggle();
        }
      }
    }
  }

  /**
   * Changes eyeSelected param to change eye icon shape
   * @param element: element with eye selected is toggled
   */
  changeEyeSelected(element): void {
    element.eyeSelected = !element.eyeSelected;
  }

  /**
   * Modifies showConfigurationModal value to show modal
   * @param element
   */
  showConfirmationModal(element): void {
    this.selectedAppointmentToAccept = element;
    if (element.active) {
      this.configurationObj.title = 'COMPANY_APPOINTMENT.ACTIVATE_CONFIRMATION_QUESTION';
    } else {
      this.configurationObj.title = 'COMPANY_APPOINTMENT.DEACTIVATE_CONFIRMATION_QUESTION';
    }
    this.showConfigurationModal = true;
  }

  /**
   * Changes appointment active value when modal is accepted
   */
  acceptStatusChanges(): void {
    this.spinner.show();
    let appointmentListToSendToBack = [JSON.parse(JSON.stringify(this.selectedAppointmentToAccept))];
    this.completeFrontDataToBack(appointmentListToSendToBack);
    this.appointmentService.saveAppointmentManagement(appointmentListToSendToBack).subscribe(
      (savedAppointment) => {
        this.elementHasChanged(this.selectedAppointmentToAccept);
        this.selectedAppointmentToAccept.initialActiveState = this.selectedAppointmentToAccept.active;
        this.appointmentList.forEach((appointment, index) => {
          if (appointment.id === this.selectedAppointmentToAccept.id) {
            this.appointmentList[index].active = this.selectedAppointmentToAccept.active;
            this.appointmentList[index].initialActiveState = this.selectedAppointmentToAccept.initialActiveState;
          }
        });
        this.initFormState = JSON.parse(JSON.stringify(this.appointmentList));
        this.spinner.hide();
        console.log('saved', savedAppointment);
        this.showConfigurationModal = false;
        this.showSaveModal = true;
      },
      (error) => {
        this.discardStatusChanges();
        this.spinner.hide();
        console.log('error', error);
        this.showNotSaveModal = true;
      }
    );
  }

  /**
   * fill in the rest of the missing fields necessary to send the data to the back
   * @param appointmentList: array of appointments to send to the back
   */
  completeFrontDataToBack(appointmentList: any[]) {
    appointmentList.forEach(appointment => {
      appointment.module = this.module;
      let userDataFromUsuario = JSON.parse(localStorage.getItem('userDataFromUsuario'));
      appointment.lastModifiedBy = {
        id: Number(userDataFromUsuario.idUsuario),
        firstName: userDataFromUsuario.nombre,
        lastName: userDataFromUsuario.apellidos,
        email: userDataFromUsuario.email
      };
      appointment.selectedMonthList = appointment.selectedMonthList === undefined ? [] : appointment.selectedMonthList;
      appointment.allMonthsAllowed = appointment.selectedMonthList.length === 0 || appointment.selectedMonthList.length === 12 ? true : false;
      appointment.selectedMedicalCenterList = appointment.selectedMedicalCenterList === undefined ? [] : appointment.selectedMedicalCenterList;
      appointment.selectedCommunityList = appointment.selectedCommunityList === undefined ? [] : appointment.selectedCommunityList;
      appointment.selectedProvinceList = appointment.selectedProvinceList === undefined ? [] : appointment.selectedProvinceList;
    });
  }

  /**
   * Modifies showConfigurationModal value to close modal
   */
  discardStatusChanges(): void {
    if (this.selectedAppointmentToAccept.initialActiveState === undefined) {
      this.selectedAppointmentToAccept.initialActiveState = !this.selectedAppointmentToAccept.active;
    }
    this.selectedAppointmentToAccept.active = this.selectedAppointmentToAccept.initialActiveState;
    this.showConfigurationModal = false;
  }

  /**
   * Check if an element active property has been changed
   * @param element
   */
  elementHasBeenChanged(element: any): any {
    if (element.initialActiveState !== undefined && element.initialActiveState !== element.active) {
      return true;
    }
    return false;
  }

  /**
   * Checks if an appointment changed his state from active to inactive or vice versa
   * @param element
   */
  elementHasChanged(element: any): void {
    if (element.initialActiveState === undefined) {
      element.initialActiveState = !element.active;
    }
    if (!element.active && this.expandedElement === element) {
      this.expandedElement = this.expandedElement === element ? null : element;
      this.changeEyeSelected(element);
    }
  }

  /**
   * Sorts the data in column Company-Center based on the parameter sort
   * @param sort
   */
  sortData(sort: Sort) {
    const data = this.dataSource.data;
    if (!sort.active || sort.direction === '') {
      return;
    }

    this.appointmentList = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      let nameA: string = a.name.toString();
      let nameB: string = b.name.toString();
      switch (sort.active) {
        case 'company-center':
          return (nameA < nameB ? -1 : 1) * (isAsc ? 1 : -1);
        default:
          return 0;
      }
    });
  }

  /**
   * Saves an appointment list with AppointmentInterface object structure
   * @param appointmentManagementList
   */
  saveAppointmentManagement(appointmentManagementList) {
    this.spinner.show();
    this.completeFrontDataToBack(appointmentManagementList);
    return new Promise((resolve, rejects) => {
      this.appointmentService.saveAppointmentManagement(appointmentManagementList).subscribe(
          (appointmentList) => {
            this.spinner.hide();
            console.log('saved', appointmentList);
            resolve(true);
        },
          (error) => {
            this.spinner.hide();
            console.log('error', error);
            this.showNotSaveModal = true;
            resolve(false);
          }
        );
    });
  }

  /**
   * Modifies expandedElement value so changes table appearance with an expandable row
   * @param event
   * @param element
   */
  expandRow(event, element) {
    if (element.active) {
      this.expandedElement = this.expandedElement === element ? null : element;
      event.stopPropagation();
      this.changeEyeSelected(element);

      if (element.isSelectorLoaded === undefined) {
        element.isSelectorLoaded = true;
      }
    }
  }

  /**
   * Enables massive edit modal component and generates a list with checked appointment management objects
   */
  showMassiveEditModalEvent(): void {
    this.appointmentList.forEach(appointment => {
      if (appointment.checked && !appointment.blocked) {
        this.checkedAppointmentList.push(appointment);
      }
    });
    
    if (this.checkedAppointmentList.length >= 1) {
      this.showMassiveEditModal = true;
    } else {
      this.showMassiveEditAdviceModal = true;
    }
  }

  /**
   * Gets selected data (centers, provinces and communities) from massive edit modal component,
   * injects them into checked appointment management objects and saves them
   * @param massiveEditModalComponentData
   */
  async acceptMassiveEditionChanges(massiveEditModalComponentData) {
    let appointmentListToSendToBack = JSON.parse(JSON.stringify(this.checkedAppointmentList));
    let copyOfMassiveEditModalComponentData = JSON.parse(JSON.stringify(massiveEditModalComponentData));
    this.updateAppointmentListFromMassiveEditData(appointmentListToSendToBack, copyOfMassiveEditModalComponentData);
    let backReceivedAppointment = <boolean>await this.saveAppointmentManagement(appointmentListToSendToBack);
    console.log('backReceivedAppointment: ', backReceivedAppointment);
    if(backReceivedAppointment){
      this.updateAppointmentListFromMassiveEditData(this.checkedAppointmentList, massiveEditModalComponentData);
      this.checkedAppointmentList.forEach(appointment => {
        appointment.checked = false;
        appointment.reloadSelector = appointment.reloadSelector === undefined ? true : !appointment.reloadSelector;
        if(!appointment.active) this.expandedElement = null;
      });
      this.checkedAppointmentList = [];
      this.showMassiveEditModal = false;
      this.showSaveModal = true;
      if (this.allCheckbox.checked) {
        this.allCheckbox.toggle();
      }
    }
  }

  /**
   * Update appointmentList with massive edit data if is decided to edit
   * @param appointmentList
   * @param massiveEditData
   */
  updateAppointmentListFromMassiveEditData(appointmentList, massiveEditData){
    for (let i = 0; i < appointmentList.length; i++) {
      if (massiveEditData.editActiveValue) {
        appointmentList[i].active = massiveEditData.active;
      }
      if (massiveEditData.editAllowedMedicalCenterValue) {
        appointmentList[i].all = massiveEditData.allMedicalCenter;
        appointmentList[i].allMedicalCenter = massiveEditData.allMedicalCenter;
        appointmentList[i].allCommunityMedicalCenter = massiveEditData.allCommunityMedicalCenter;
        appointmentList[i].allProvinceMedicalCenter = massiveEditData.allProvinceMedicalCenter;
        appointmentList[i].selectedMedicalCenterList = massiveEditData.selectedMedicalCenterList;
        appointmentList[i].selectedCommunityList = massiveEditData.selectedCommunityList;
        appointmentList[i].selectedProvinceList = massiveEditData.selectedProvinceList;
      }
      if (massiveEditData.editDaysInAdvanceValue) {
        appointmentList[i].daysInAdvance = massiveEditData.daysInAdvance;
      }
      if (massiveEditData.editAllowedMonthsValue) {
        appointmentList[i].selectedMonthList = massiveEditData.selectedMonthList;
      }
    }
  }

  /**
   * Closes massive edit modal component
   */
  discardMassiveEditionChanges(): void {
    this.showMassiveEditModal = false;
    this.checkedAppointmentList = [];
  }

  /**
   * Closes massive edit modal advice component
   */
  closeMassiveEditAdviceModal() {
    this.showMassiveEditAdviceModal = false;
    this.checkedAppointmentList = [];
  }

  /**
   * Closes save modal component
   */
  closeSaveModal(): void {
    this.showSaveModal = false;
  }

  /**
   * Closes not save modal component
   */
   closeNotSaveModal(): void {
    this.showNotSaveModal = false;
  }

  closeResponseErrorModal(): void {
    this.showResponseErrorModal = false;
  }

  dropColumn(event: CdkDragDrop<string[]>, tableHeaders) {
    if(event.currentIndex === 0) return;
    moveItemInArray(tableHeaders, event.previousIndex, event.currentIndex);
  }

  showSelectorsConfirmationModal(event){
    if(event){
      this.showSaveModal = true;
    }else{
      this.showNotSaveModal = true;
    }
  }
}
/**
   * Function to compare order of Appointments
   * @param a Name of the first Apointment
   * @param b Name of the second Apointment
   * @param isAsc Type of order
   * @returns
   */
function compare(a: string, b: string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
