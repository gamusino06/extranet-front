import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {AppointmentInterface} from '../../../interfaces/appointment-interface';
import {Globals} from '../../../../globals';

@Component({
  selector: 'app-massive-edit-modal',
  templateUrl: './massive-edit-modal.component.html',
  styleUrls: ['./massive-edit-modal.component.css'],
})
export class MassiveEditModalComponent implements OnInit {

  appointmentManagement: AppointmentInterface = {
    id: 0,
    company: {},
    center: {},
    active: false,
    daysInAdvance: 30,
    selectedMonthList: [],
    selectedCommunityList: [],
    selectedProvinceList: [],
    selectedMedicalCenterList: [],
    allCommunityMedicalCenter: undefined,
    allProvinceMedicalCenter: undefined,
    allMedicalCenter: undefined
  };

  @Input() monthsList;
  @Input() filteredCommunityList;
  @Input() appointmentList: any[];
  @Input() medicalCenterRelationList: any[];
  @Input() applicationManagementModule: number;
  @Input() checkedAppointmentList: any[];
  @Output() onAcceptEvent = new EventEmitter<object>();
  @Output() onCancelEvent = new EventEmitter<boolean>();
  @ViewChild('communityProvinceCenterSelectorComponent') communityProvinceCenterSelectorComponent;

  // iconClass(): string {
  //   return `swal2-${this.configurationObj.icon}`;
  // }
  isFormLoaded = false;


  massiveEditModalComponentData = {
    selectedCommunityList: [],
    selectedProvinceList: [],
    selectedMedicalCenterList: [],
    selectedMonthList: [],
    daysInAdvance: 30,
    allCheckboxSelected: false,
    editActiveValue: true,
    active: true,
    editDaysInAdvanceValue: true,
    editAllowedMonthsValue: true,
    editAllowedMedicalCenterValue: true,
    allCommunityMedicalCenter: false,
    allProvinceMedicalCenter: false,
    allMedicalCenter: false
  };

  constructor(public globals: Globals) {}

  ngOnInit(): void {
    this.findSimilaritiesAndFillMassiveData();
    this.isFormLoaded = true;
  }

  findSimilaritiesAndFillMassiveData(): void {
    this.appointmentManagement.allMedicalCenter = false;
    let activeIsEqual: boolean = (this.checkedAppointmentList[0].active === undefined || this.checkedAppointmentList[0].active === null) ? false : true;
    let daysInAdvanceAreEqual: boolean = (this.checkedAppointmentList[0].daysInAdvance === undefined || this.checkedAppointmentList[0].daysInAdvance === null) ? false : true;
    let selectedMonthsAreEqual: boolean = (this.checkedAppointmentList[0].selectedMonthList === undefined || this.checkedAppointmentList[0].selectedMonthList === null) ? false : true;
    let selectedCommunitiesAreEqual: boolean = (this.checkedAppointmentList[0].selectedCommunityList === undefined || this.checkedAppointmentList[0].selectedCommunityList === null) ? false : true;
    let selectedProvincesAreEqual: boolean = (this.checkedAppointmentList[0].selectedProvinceList === undefined || this.checkedAppointmentList[0].selectedProvinceList === null) ? false : true;
    let selectedMedicalCenterAreEqual: boolean = (this.checkedAppointmentList[0].selectedMedicalCenterList === undefined || this.checkedAppointmentList[0].selectedMedicalCenterList === null) ? false : true;
    for(let i = 1; i < this.checkedAppointmentList.length; i++) {
      if(activeIsEqual) activeIsEqual = this.checkedAppointmentList[0].active === this.checkedAppointmentList[i].active;
      if(daysInAdvanceAreEqual) daysInAdvanceAreEqual = this.checkedAppointmentList[0].daysInAdvance === this.checkedAppointmentList[i].daysInAdvance;
      if(selectedMonthsAreEqual) selectedMonthsAreEqual = this.areEqualLists(this.checkedAppointmentList[0].selectedMonthList, this.checkedAppointmentList[i].selectedMonthList);
      if(selectedCommunitiesAreEqual) selectedCommunitiesAreEqual = this.areEqualLists(this.checkedAppointmentList[0].selectedCommunityList, this.checkedAppointmentList[i].selectedCommunityList);
      if(selectedProvincesAreEqual) selectedProvincesAreEqual = this.areEqualLists(this.checkedAppointmentList[0].selectedProvinceList, this.checkedAppointmentList[i].selectedProvinceList);
      if(selectedMedicalCenterAreEqual) selectedMedicalCenterAreEqual = this.areEqualLists(this.checkedAppointmentList[0].selectedMedicalCenterList, this.checkedAppointmentList[i].selectedMedicalCenterList);
      if(!activeIsEqual && !daysInAdvanceAreEqual && !selectedMonthsAreEqual && !selectedCommunitiesAreEqual) {
        this.appointmentManagement.allMedicalCenter = true;
        return;
      }
    }
    if(activeIsEqual) this.massiveEditModalComponentData.active = this.checkedAppointmentList[0].active;
    if(daysInAdvanceAreEqual) this.appointmentManagement.daysInAdvance = this.checkedAppointmentList[0].daysInAdvance;
    if(selectedMonthsAreEqual) this.appointmentManagement.selectedMonthList = JSON.parse(JSON.stringify(this.checkedAppointmentList[0].selectedMonthList));
    if(selectedCommunitiesAreEqual) {
      this.appointmentManagement.selectedCommunityList = JSON.parse(JSON.stringify(this.checkedAppointmentList[0].selectedCommunityList));
      if(selectedProvincesAreEqual) {
        this.appointmentManagement.selectedProvinceList = JSON.parse(JSON.stringify(this.checkedAppointmentList[0].selectedProvinceList));
        if(selectedMedicalCenterAreEqual) this.appointmentManagement.selectedMedicalCenterList = JSON.parse(JSON.stringify(this.checkedAppointmentList[0].selectedMedicalCenterList));
      }
    } else {
      this.appointmentManagement.allMedicalCenter = true;
    }
    if(!selectedCommunitiesAreEqual && !selectedProvincesAreEqual && !selectedMedicalCenterAreEqual) this.appointmentManagement.allMedicalCenter = true;
    if(selectedCommunitiesAreEqual && this.checkedAppointmentList[0].selectedCommunityList.length === 0) this.appointmentManagement.allMedicalCenter = true;
  }

  areEqualLists(list1: any[], list2: any[]): boolean {
    if(list2 === undefined || list2 === null || list1.length !== list2.length) return false;
    else {
      let idList1 = JSON.parse(JSON.stringify(list1)).map(item => item.id === undefined ? item : item.id).sort();
      let idList2 = JSON.parse(JSON.stringify(list2)).map(item => item.id === undefined ? item : item.id).sort();
      for(let i = 0; i < idList1.length; i++) {
        if(idList1[i] !== idList2[i]) return false;
      }
    }
    return true;
  }

  /**
   * Triggers accept event for saving appointment managements on batch
   */
  onAccept(): void {
    this.parseSelectedDataFromSelectorsComponent();
    this.onAcceptEvent.emit(this.massiveEditModalComponentData);
  }

  /**
   * Triggers cancel event for closing modal
   */
  onCancel(): void {
    this.onCancelEvent.emit(true);
  }

  /**
   * Formats massiveEditModalComponentData object to have all needed data (selected centers, provinces and communities) to save it into
   * appointment managements objects
   */
  parseSelectedDataFromSelectorsComponent(): void {
    this.appointmentManagement = this.communityProvinceCenterSelectorComponent.parseAppointmentManagement(this.appointmentManagement);
    if(this.massiveEditModalComponentData.editAllowedMedicalCenterValue) {
      this.massiveEditModalComponentData.selectedCommunityList = this.appointmentManagement.selectedCommunityList;
      this.massiveEditModalComponentData.selectedProvinceList = this.appointmentManagement.selectedProvinceList;
      this.massiveEditModalComponentData.selectedMedicalCenterList = this.appointmentManagement.selectedMedicalCenterList;
      this.massiveEditModalComponentData.allCheckboxSelected = this.communityProvinceCenterSelectorComponent.allCheckbox;
      this.massiveEditModalComponentData.allCommunityMedicalCenter = this.appointmentManagement.allCommunityMedicalCenter;
      this.massiveEditModalComponentData.allProvinceMedicalCenter = this.appointmentManagement.allProvinceMedicalCenter;
      this.massiveEditModalComponentData.allMedicalCenter = this.appointmentManagement.allMedicalCenter;
    }
    if(this.massiveEditModalComponentData.editDaysInAdvanceValue){
      this.massiveEditModalComponentData.daysInAdvance = this.appointmentManagement.daysInAdvance;
    }
    if(this.massiveEditModalComponentData.editAllowedMonthsValue){
      this.massiveEditModalComponentData.selectedMonthList = this.appointmentManagement.selectedMonthList;
    }
  }

  /**
   * The form is considered as modified if active value is modified or medical center value is modified
   * or if actual form is employee appointment management massive edition and daysInAdvance value or allowedMonths value is modified
   */
  hasBeenModified(): boolean {
    return this.massiveEditModalComponentData.editActiveValue || this.massiveEditModalComponentData.editAllowedMedicalCenterValue
      || (this.applicationManagementModule === this.globals.EMPLOYEE_APPOINTMENT_MANAGEMENT && (
        this.massiveEditModalComponentData.editDaysInAdvanceValue || this.massiveEditModalComponentData.editAllowedMonthsValue
      ));
  }
}
