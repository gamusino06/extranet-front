import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Globals} from '../../../globals';

@Component({
  selector: 'app-company-center-selector',
  templateUrl: './company-center-selector.component.html',
  styleUrls: ['./company-center-selector.component.css']
})
export class CompanyCenterSelectorComponent implements OnInit {
  searchImgUrl = '../../assets/img/search.svg';

  userForm = new FormGroup({
    selectedCompanyList: new FormControl(''),
    selectedJobCenterList: new FormControl(''),
    companyFilter: new FormControl(),
    centerFilter: new FormControl()
  });

  companiesWithActiveVS: any[] = [];
  centersWithActiveVS: any[] = [];
  selectedCompanyListCopy: any[] = [];
  selectedJobCenterListCopy: any[] = [];

  @Input() title = '';

  @Output() onSearchAppointmentManagement = new EventEmitter<any>();

  constructor(
    public globals: Globals
  ) { }

  ngOnInit(): void {
    const userData = JSON.parse(localStorage.getItem('userDataFromUsuario'));
    this.companiesWithActiveVS = userData.empresas.filter(company => company.activoVS === true);

    // initialize company and center lists
    let defaultCompanyValue = [];
    if (this.companiesWithActiveVS.length) {
      defaultCompanyValue = new Array(this.companiesWithActiveVS[0]);
    }

    if (this.companiesWithActiveVS.length === 1) {
      this.userForm.controls.selectedCompanyList.setValue(defaultCompanyValue);
      this.centersWithActiveVS = defaultCompanyValue[0].centros.filter(center => center.activoVS === true);
    }

    this.selectedCompanyListCopy = Object.assign([], this.userForm.controls.selectedCompanyList.value);
    this.selectedJobCenterListCopy = Object.assign([], this.userForm.controls.selectedJobCenterList.value);
  }

  /**
   * Company change select event
   */
  onCompanyChange(): void {
    this.changeCompany();
  }

  /**
   * Backend query to get the list of appointments related to some company and its centers
   * Mounts a map with selected companies and its related selected center list
   */
  searchAppointments(): void {
    const companyCenterMap = new Map<object, any[]>();
    let selectedCompanies = this.userForm.controls.selectedCompanyList.value;
    if (selectedCompanies.length <= 0) {
      selectedCompanies = this.companiesWithActiveVS.slice();
    }
    for (let i = 0; i < selectedCompanies.length; i++) {
      const centerToAddList = [];
      for (let j = 0; j < selectedCompanies[i].centros.length; j++) {
        if (this.userForm.controls.selectedJobCenterList.value.includes(selectedCompanies[i].centros[j])) {
          centerToAddList.push(selectedCompanies[i].centros[j]);
        }
      }
      // if its no center selected, its assumed that all of them wants to be fetched
      if (!centerToAddList.length) {
        companyCenterMap.set(selectedCompanies[i], selectedCompanies[i].centros.filter(center => center.activoVS === true));
      }
      // if there are centers selected, only those are going to be fetched
      if (centerToAddList.length) {
        companyCenterMap.set(selectedCompanies[i], centerToAddList);
      }
    }
    this.onSearchAppointmentManagement.emit(companyCenterMap);
  }

  /**
   * Checks if there is any selected company in the dropdown
   */
  isAnyCompanySelected(): boolean {
    return this.userForm.controls.selectedCompanyList.value.length !== 0;
  }

  /**
   * Select all or unselect all companies
   * @param selectAllValue
   */
  toggleSelectAllCompanies(selectAllValue: boolean) {
    this.userForm.controls.selectedCompanyList.setValue([]);
    if (selectAllValue) {
      this.userForm.controls.selectedCompanyList.setValue(this.companiesWithActiveVS);
    }
    this.changeCompany();
  }

  /**
   * When a company changes in the dropdown, adds or removes its centers from the center dropdown
   */
  changeCompany(): void {
    const selectedCompanies = this.userForm.controls.selectedCompanyList.value;
    // check if is added
    if (this.selectedCompanyListCopy.length < selectedCompanies.length) {
      const differenceAdd = selectedCompanies.filter(x => !this.selectedCompanyListCopy.includes(x));
      for (let i = 0; i < differenceAdd.length; i++)  {
        this.centersWithActiveVS.push.apply(this.centersWithActiveVS, differenceAdd[i].centros.filter(center => center.activoVS === true));
      }
    }
    // check if is deleted
    if (this.selectedCompanyListCopy.length > selectedCompanies.length) {
      const differenceDelete = this.selectedCompanyListCopy.filter(x => !selectedCompanies.includes(x));
      for (let i = 0; i < differenceDelete.length; i++)  {
        if (differenceDelete[i].centros.length > 0) {
          for (let j = 0; j < differenceDelete[i].centros.length; j++) {
            if(differenceDelete[i].centros[j].activoVS === true) {
              const index = this.centersWithActiveVS.indexOf(differenceDelete[i].centros[j]);
              this.centersWithActiveVS.splice(index, 1);
              if (this.userForm.controls.selectedJobCenterList.value.includes(differenceDelete[i].centros[j])) {
                const index2 = this.userForm.controls.selectedJobCenterList.value.indexOf(differenceDelete[i].centros[j]);
                this.userForm.controls.selectedJobCenterList.value.splice(index2, 1);
              }
            }
          }
        }
      }
    }
    this.selectedCompanyListCopy = Object.assign([], this.userForm.controls.selectedCompanyList.value);
    this.selectedJobCenterListCopy = Object.assign([], this.userForm.controls.selectedJobCenterList.value);
  }

  /**
   * Select all or unselect all centers
   * @param selectAllValue
   */
  toggleSelectAllCenters(selectAllValue: boolean) {
    this.userForm.controls.selectedJobCenterList.setValue([]);
    if (selectAllValue) {
      this.userForm.controls.selectedJobCenterList.setValue(this.centersWithActiveVS);
    }
    this.changeCompany();
  }
}
