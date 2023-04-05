import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {AppointmentInterface} from '../../interfaces/appointment-interface';
import {Globals} from '../../../globals';
import {UtilsService} from '../../../../services/utils.service';
import {AppointmentService} from '../../../../services/appointment.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-community-province-center-selector',
  templateUrl: './community-province-center-selector.component.html',
  styleUrls: ['./community-province-center-selector.component.css']
})
export class CommunityProvinceCenterSelectorComponent implements OnInit, OnChanges {

  communityProvinceCenterForm = new FormGroup({
    selectedCommunityList: new FormControl({ value: [], disabled: true }),
    selectedProvinceList: new FormControl({ value: [], disabled: true }),
    selectedMedicalCenterList: new FormControl({ value: [], disabled: true }),
    selectedMonthList: new FormControl([]),
    communityFilter: new FormControl(''),
    provinceFilter: new FormControl(''),
    centerFilter: new FormControl(''),
    selectedMonthListFilter: new FormControl([]),
    daysInAdvanceControl: new FormControl('')
  });

  communityList: any[] = [];
  provinceList: any[] = [];
  centerList: any[] = [];
  allCheckbox: boolean;
  previousAllCheckBox: boolean;
  previousdaysInAdvance: number;
  previousMonths: any[];

  @Input() module;
  @Input() medicalCenterRelationList: any[];
  @Input() appointmentManagement: AppointmentInterface;
  @Input() reloadSelector: boolean;
  @Output() onSaveEvent = new EventEmitter<boolean>();
  @Input() activeProp: boolean;
  @Input() showSaveButton: boolean;
  @Input() classes: string;
  @Input() allCheckboxLabelPosition: string = 'before';
  @Input() masiveEdition: boolean = false;
  @Input() massiveEditModalComponentData = {
    editActiveValue: true,
    editDaysInAdvanceValue: true,
    editAllowedMonthsValue: true,
    editAllowedMedicalCenterValue: true,
  };

  isFormLoaded = false;
  initFormState: any = {};
  previousReloadState: boolean;

  @Input() monthsList;
  filteredMonthList = [];
  @Input() filteredCommunityList;

  // completeCommunityList: any[];
  // completeProvinceList: any[];
  // completeMedicalCenterList: any[];

  constructor(
    public globals: Globals,
    private util: UtilsService,
    private appointmentService: AppointmentService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.communityList = [...this.filteredCommunityList];
    this.filteredMonthList = this.monthsList;
    // this.completeCommunityList = this.communityList;
    // this.completeProvinceList = this.getProvincesFromCommunityList(this.completeCommunityList);
    // this.completeMedicalCenterList = this.getCentersFromProvinceList(this.completeProvinceList);
    this.initializeSelectors();
  }

  initializeSelectors(): void {
    this.isFormLoaded = false;
    this.previousReloadState = this.reloadSelector;

    this.initializeCommunityProvinceAndCenterData();
    this.initFormState = JSON.parse(JSON.stringify(this.appointmentManagement));
    this.isFormLoaded = true;
  }

  ngOnChanges() {
    if (this.isFormLoaded && this.reloadSelector !== this.previousReloadState) {
      this.initializeSelectors();
    }
  }

  /**
   * Trigger change event when community selector changes, fulfills province selector
   */
  onCommunityChange() {
    const selectedCommunities = this.communityProvinceCenterForm.controls.selectedCommunityList.value;
    this.provinceList = this.getProvincesFromCommunityList(selectedCommunities);
    this.centerList = [];
    this.communityProvinceCenterForm.controls.selectedProvinceList.setValue([]);
    this.communityProvinceCenterForm.controls.selectedMedicalCenterList.setValue([]);
    this.toggleSelectorsDisability();
    this.communityProvinceCenterForm.controls.selectedMedicalCenterList.disable();
  }
  /**
   * Trigger change event when province selector changes, fulfills center selector
   */
  onProvinceChange() {
    const selectedProvinces = this.communityProvinceCenterForm.controls.selectedProvinceList.value;
    this.centerList = this.getCentersFromProvinceList(selectedProvinces);
    this.communityProvinceCenterForm.controls.selectedMedicalCenterList.setValue([]);
    this.toggleSelectorsDisability();
  }
  /**
   * Trigger toggle event when all selector checkbox changes, to select or unselect all appointments
   */
  onAllCheckboxChange() {
    this.allCheckbox = !this.allCheckbox;
    this.toggleSelectorsDisability();
  }
  /**
   * Trigger toggle event when select or unselect all communities
   */
  toggleSelectAllCommunities(event) {
    if (event) {
      this.communityProvinceCenterForm.controls.selectedCommunityList.setValue(this.communityList);
    } else {
      this.communityProvinceCenterForm.controls.selectedCommunityList.setValue([]);
    }
    this.toggleSelectorsDisability();
    this.onCommunityChange();
  }
  /**
   * Trigger toggle event when select or unselect all provinces
   */
  toggleSelectAllProvinces(event) {
    if (event) {
      this.communityProvinceCenterForm.controls.selectedProvinceList.setValue(this.provinceList);
    } else {
      this.communityProvinceCenterForm.controls.selectedProvinceList.setValue([]);
    }
    this.toggleSelectorsDisability();
    this.onProvinceChange();
  }
  /**
   * Trigger toggle event when select or unselect all centers
   */
  toggleSelectAllCenters(event) {
    if (event) {
      this.communityProvinceCenterForm.controls.selectedMedicalCenterList.setValue(this.centerList);
    } else {
      this.communityProvinceCenterForm.controls.selectedMedicalCenterList.setValue([]);
    }
  }
  /**
   * Checks if there is any community selected
   */
  isAnyCommunitySelected() {
    return this.communityProvinceCenterForm.controls.selectedCommunityList.value.length > 0;
  }
  /**
   * Checks if there is any province selected
   */
  isAnyProvinceSelected() {
    return this.communityProvinceCenterForm.controls.selectedProvinceList.value.length > 0;
  }
  /**
   * Depending on all checkbox and if there is any community, province, center selected, enables and disables form selectors
   */
  toggleSelectorsDisability() {
    if (this.allCheckbox) {
      this.communityProvinceCenterForm.controls.selectedCommunityList.disable();
      this.communityProvinceCenterForm.controls.selectedProvinceList.disable();
      this.communityProvinceCenterForm.controls.selectedMedicalCenterList.disable();
      this.communityProvinceCenterForm.controls.selectedCommunityList.setValue([]);
      this.communityProvinceCenterForm.controls.selectedProvinceList.setValue([]);
      this.communityProvinceCenterForm.controls.selectedMedicalCenterList.setValue([]);
    } else {
      this.communityProvinceCenterForm.controls.selectedCommunityList.enable();
      if (this.isAnyCommunitySelected()) {
        this.communityProvinceCenterForm.controls.selectedProvinceList.enable();
      } else {
        this.communityProvinceCenterForm.controls.selectedProvinceList.disable();
      }
      if (this.isAnyProvinceSelected()) {
        this.communityProvinceCenterForm.controls.selectedMedicalCenterList.enable();
      } else {
        this.communityProvinceCenterForm.controls.selectedMedicalCenterList.disable();
      }
    }
  }
  /**
   * Returns a list of provinces related to a list of communities passed by parameter
   */
  getProvincesFromCommunityList(selectedCommunities: any []): any[] {
    let provinceList = [];
    selectedCommunities.forEach(community => {
      if (community !== null) {
        const newArray = provinceList.concat(community.provinceMedicalCenterDtoList);
        provinceList = JSON.parse(JSON.stringify(newArray));
      }
    });
    provinceList = this.util.sortObjectListByStringProperty(provinceList, this.globals.provinceListSortKey);
    return provinceList;
  }
  /**
   * Returns a list of centers related to a list of provinces passed by parameter
   */
  getCentersFromProvinceList(selectedProvinces: any []): any[] {
    let centerList = [];
    selectedProvinces.forEach(province => {
      if (province !== null) {
        const newArray = centerList.concat(province.medicalCenterDtoList);
        centerList = JSON.parse(JSON.stringify(newArray));
      }
    });
    centerList = this.util.sortObjectListByStringProperty(centerList, this.globals.medicalCenterListSortKey);
    return centerList;
  }

  /**
   * Emits an event to save an appointment management object
   * @param appointmentManagement
   */
  saveAppointmentManagement(appointmentManagement: object): void {
    this.spinner.show();
    let appointmentToSendToBack = JSON.parse(JSON.stringify(appointmentManagement));
    appointmentToSendToBack = this.parseAppointmentManagement(appointmentToSendToBack);
    let appointmentListToSendToBack = [appointmentToSendToBack];
    this.completeFrontDataToBack(appointmentListToSendToBack);
    this.appointmentService.saveAppointmentManagement(appointmentListToSendToBack).subscribe(
      (appointmentList) => {
        this.spinner.hide();
        console.log('saved', appointmentList);
        this.appointmentManagement = this.parseAppointmentManagement(appointmentManagement);
        this.previousAllCheckBox = this.allCheckbox ? true : false;
        this.previousdaysInAdvance = this.appointmentManagement.daysInAdvance;
        this.previousMonths = this.appointmentManagement.selectedMonthList;
        this.onSaveEvent.emit(true);
    },
      (error) => {
        this.spinner.hide();
        console.log('error', error);
        this.onSaveEvent.emit(false);
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
      appointment.selectedMonthList = appointment.selectedMonthList === undefined || appointment.selectedMonthList.length === 12 ? [] : appointment.selectedMonthList;
      appointment.allMonthsAllowed = appointment.selectedMonthList.length === 0 || appointment.selectedMonthList.length === 12 ? true : false;
      appointment.selectedMedicalCenterList = appointment.selectedMedicalCenterList === undefined ? [] : appointment.selectedMedicalCenterList;
      appointment.selectedCommunityList = appointment.selectedCommunityList === undefined ? [] : appointment.selectedCommunityList;
      appointment.selectedProvinceList = appointment.selectedProvinceList === undefined ? [] : appointment.selectedProvinceList;
    });
  }

  /**
   * Fulfills appointment object
   */
  parseAppointmentManagement(appointmentManagement: any): AppointmentInterface {
    let selectedCommunityFormList = this.communityProvinceCenterForm.controls.selectedCommunityList.value;
    let selectedProvinceFormList = this.communityProvinceCenterForm.controls.selectedProvinceList.value;
    let selectedMedicalCenterFormList = this.communityProvinceCenterForm.controls.selectedMedicalCenterList.value;
    appointmentManagement.allCommunityMedicalCenter = false;
    appointmentManagement.allProvinceMedicalCenter = false;
    appointmentManagement.allMedicalCenter = false;
    appointmentManagement.daysInAdvance = this.communityProvinceCenterForm.controls.daysInAdvanceControl.value;
    appointmentManagement.selectedMonthList = this.communityProvinceCenterForm.controls.selectedMonthList.value;
    if (this.allCheckbox
          || selectedCommunityFormList.length === 0 
          || (selectedCommunityFormList.length === this.communityList.length 
            && (selectedProvinceFormList.length === 0 || (selectedProvinceFormList.length === this.provinceList.length 
              && (selectedMedicalCenterFormList.length === 0 
                || selectedMedicalCenterFormList.length === this.centerList.length))))) {
      appointmentManagement.allMedicalCenter = true;
      appointmentManagement.allCommunityMedicalCenter = true;
      appointmentManagement.allProvinceMedicalCenter = true;
      appointmentManagement.selectedCommunityList = [];
      appointmentManagement.selectedProvinceList = [];
      appointmentManagement.selectedMedicalCenterList = [];
    }else if(selectedCommunityFormList.length < this.communityList.length 
      && selectedProvinceFormList.length === this.provinceList.length 
      && (selectedMedicalCenterFormList.length === 0 
        || selectedMedicalCenterFormList.length === this.centerList.length)) {
        appointmentManagement.allMedicalCenter = false;
        appointmentManagement.allCommunityMedicalCenter = true;
        appointmentManagement.allProvinceMedicalCenter = true;
        appointmentManagement.selectedCommunityList = selectedCommunityFormList;
        appointmentManagement.selectedProvinceList = [];
        appointmentManagement.selectedMedicalCenterList = [];
    }else if(selectedProvinceFormList.length < this.provinceList.length 
      && selectedProvinceFormList.length > 0
      && selectedMedicalCenterFormList.length === this.centerList.length) {
        appointmentManagement.allMedicalCenter = false;
        appointmentManagement.allCommunityMedicalCenter = false;
        appointmentManagement.allProvinceMedicalCenter = true;
        appointmentManagement.selectedCommunityList = selectedCommunityFormList;
        appointmentManagement.selectedProvinceList = selectedProvinceFormList;
        appointmentManagement.selectedMedicalCenterList = [];
    } else {
      appointmentManagement.selectedCommunityList = this.communityProvinceCenterForm.controls.selectedCommunityList.value;
      appointmentManagement.selectedProvinceList = this.communityProvinceCenterForm.controls.selectedProvinceList.value;
      appointmentManagement.selectedMedicalCenterList = this.communityProvinceCenterForm.controls.selectedMedicalCenterList.value;
      if (this.communityProvinceCenterForm.controls.selectedCommunityList.value.length > 0
              && this.communityProvinceCenterForm.controls.selectedProvinceList.value.length === 0
              && this.communityProvinceCenterForm.controls.selectedMedicalCenterList.value.length === 0) {
        appointmentManagement.allCommunityMedicalCenter = true;
        appointmentManagement.allProvinceMedicalCenter = true;
        appointmentManagement.selectedProvinceList = [];
        appointmentManagement.selectedMedicalCenterList = [];
      }
      if (this.communityProvinceCenterForm.controls.selectedProvinceList.value.length > 0
              && this.communityProvinceCenterForm.controls.selectedMedicalCenterList.value.length === 0) {
        appointmentManagement.allProvinceMedicalCenter = true;
        appointmentManagement.selectedMedicalCenterList = [];
      }
      if (this.communityProvinceCenterForm.controls.selectedMedicalCenterList.value.length ===
              this.centerList.length
              && this.communityProvinceCenterForm.controls.selectedProvinceList.value.length > 0) {
        appointmentManagement.allProvinceMedicalCenter = true;
        appointmentManagement.selectedMedicalCenterList = [];
      }
    }
    return appointmentManagement;
  }

  /**
   * Initialize method which marks selected already saved communities, provinces and centers
   */
  initializeCommunityProvinceAndCenterData(): void {
    this.allCheckbox = this.appointmentManagement.allMedicalCenter;
    this.previousAllCheckBox = this.allCheckbox ? true : false;
    this.previousdaysInAdvance = this.appointmentManagement.daysInAdvance;
    this.communityProvinceCenterForm.controls.daysInAdvanceControl.setValue(this.appointmentManagement.daysInAdvance);
    this.previousMonths = [];
    if (this.appointmentManagement.selectedCommunityList !== undefined) {
      const communityListToBeSelected = [];
      this.appointmentManagement.selectedCommunityList.forEach(community => {
        const searchedCommunities = this.util.getObjectFromListByProperty(
          this.communityList, this.globals.communityIdPropertyName, community.id);
        communityListToBeSelected.push.apply(communityListToBeSelected, searchedCommunities);
      });
      this.communityProvinceCenterForm.controls.selectedCommunityList.setValue(communityListToBeSelected);
    }
    this.onCommunityChange();
    if (this.appointmentManagement.selectedProvinceList !== undefined) {
      const provinceListToBeSelected = [];
      this.appointmentManagement.selectedProvinceList.forEach(province => {
        const searchedProvinces = this.util.getObjectFromListByProperty(
          this.provinceList, this.globals.provinceIdPropertyName, province.id);
        provinceListToBeSelected.push.apply(provinceListToBeSelected, searchedProvinces);
      });
      this.communityProvinceCenterForm.controls.selectedProvinceList.setValue(provinceListToBeSelected);
    }
    this.onProvinceChange();
    if (this.appointmentManagement.selectedMedicalCenterList !== undefined) {
      const centerListToBeSelected = [];
      this.appointmentManagement.selectedMedicalCenterList.forEach(center => {
        const searchedCenters = this.util.getObjectFromListByProperty(
          this.centerList, this.globals.medicalCenterIdPropertyName, center.id);
        centerListToBeSelected.push.apply(centerListToBeSelected, searchedCenters);
      });
      this.communityProvinceCenterForm.controls.selectedMedicalCenterList.setValue(centerListToBeSelected);
    }
    this.toggleSelectorsDisability();
    if (this.appointmentManagement.selectedMonthList !== undefined) {
      this.previousMonths = this.appointmentManagement.selectedMonthList;
      this.communityProvinceCenterForm.controls.selectedMonthList.setValue(this.appointmentManagement.selectedMonthList);
    }
  }

  /**
   * Returns an string with center name + location + street value
   * @param center
   */
  getCenterSelectorTooltip(center: any): string {
    let tooltipValue: string = center.name;
    if (center.locationName !== undefined) {
      tooltipValue += ' ' + center.locationName;
    }
    if (center.medicalCenterStreet !== undefined) {
      tooltipValue += ' ' + center.medicalCenterStreet;
    }
    return tooltipValue;
  }

  formHasBeenChanged(blocked) {
    if(blocked){
      return false;
    }
    if (!this.allCheckbox) {
      const selectedCommunities = [];
      this.communityProvinceCenterForm.controls.selectedCommunityList.value.forEach(c => {
        selectedCommunities.push(c.id);
      });
      const appointmentCommunities = [];
      if (this.appointmentManagement.selectedCommunityList !== undefined) {
        this.appointmentManagement.selectedCommunityList.forEach(c => {
          appointmentCommunities.push(c.id);
        });
      }
      const sameCommunityValues = this.util.listHasSameContent(selectedCommunities.sort(), appointmentCommunities.sort());
      if (!sameCommunityValues) {
        return true;
      }

      const selectedProvinces = [];
      this.communityProvinceCenterForm.controls.selectedProvinceList.value.forEach(c => {
        selectedProvinces.push(c.id);
      });
      const appointmentProvinces = [];
      if(this.appointmentManagement.selectedProvinceList !== undefined){
        this.appointmentManagement.selectedProvinceList.forEach(c => {
          appointmentProvinces.push(c.id);
        });
      }
      const sameProvinceValues = this.util.listHasSameContent(selectedProvinces.sort(), appointmentProvinces.sort());
      if (!sameProvinceValues) {
        return true;
      }

      const selectedMedicalCenter = [];
      this.communityProvinceCenterForm.controls.selectedMedicalCenterList.value.forEach(c => {
        selectedMedicalCenter.push(c.id);
      });
      const appointmentMedicalCenter = [];
      if(this.appointmentManagement.selectedMedicalCenterList !== undefined){
        this.appointmentManagement.selectedMedicalCenterList.forEach(c => {
          appointmentMedicalCenter.push(c.id);
        });
      }
      const sameMedicalCenterValues = this.util.listHasSameContent(selectedMedicalCenter.sort(), appointmentMedicalCenter.sort());
      if (!sameMedicalCenterValues) {
        return true;
      }
    }

    if (this.previousAllCheckBox !== this.allCheckbox) {
      return true;
    }

    if(this.previousdaysInAdvance !== this.communityProvinceCenterForm.controls.daysInAdvanceControl.value){
      return true;
    }

    if(JSON.stringify(this.previousMonths) !== JSON.stringify(this.communityProvinceCenterForm.controls.selectedMonthList.value)){
      return true;
    }

    return false;
  }

  /**
   * Checks if all communities are selected
   */
  isAllCommunitySelected(): boolean {
    if (this.allCheckbox) {
      return true;
    } else if (this.communityProvinceCenterForm.controls.selectedCommunityList.value.length === 0 ||
        this.communityProvinceCenterForm.controls.selectedCommunityList.value.length === this.communityList.length) {
      return true;
    }
    return false;
  }

  /**
   * Checks if all provinces are selected
   */
  isAllProvinceSelected(): boolean {
    if (this.allCheckbox) {
      return true;
    } else if (this.communityProvinceCenterForm.controls.selectedProvinceList.value.length === 0 ||
      this.communityProvinceCenterForm.controls.selectedProvinceList.value.length === this.provinceList.length) {
      return true;
    }
    return false;
  }

  /**
   * Checks if all medical centers are selected
   */
  isAllMedicalCenterSelected(): boolean {
    if (this.allCheckbox) {
      return true;
    } else if (this.communityProvinceCenterForm.controls.selectedMedicalCenterList.value.length === 0 ||
      this.communityProvinceCenterForm.controls.selectedMedicalCenterList.value.length === this.centerList.length) {
      return true;
    }
    return false;
  }

  changeDaysInAdvance(event){
    if(event.target.value < 0 || event.target.value === ""){
      this.communityProvinceCenterForm.controls.daysInAdvanceControl.setValue(0)
    }

    if(event.target.value > 120){
      this.communityProvinceCenterForm.controls.daysInAdvanceControl.setValue(120)
    }
  }

  toggleSelectAllMonths(event){
    if(event){
      this.communityProvinceCenterForm.controls.selectedMonthList.setValue(this.monthsList.map(month =>{ return month.id; }));
    }
    else{
      this.communityProvinceCenterForm.controls.selectedMonthList.setValue([]);
    }
  }

  filterMonths(event){
    this.filteredMonthList = [...this.monthsList.filter(month =>{
      return month.value.toLowerCase().indexOf(event.toLowerCase()) > -1
    })]
  }

}
