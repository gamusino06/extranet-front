export interface AppointmentInterface {
    id: number;
    company: any;
    center: any;
    active: boolean;
    accepted?: boolean;
    selectedCommunityList: any[];
    selectedProvinceList: any[];
    selectedMedicalCenterList: any[];
    allCommunityMedicalCenter: boolean;
    allProvinceMedicalCenter: boolean;
    allMedicalCenter: boolean;
    module?: number;
    allMonthsAllowed?: boolean;
    daysInAdvance?: number;
    lastModifiedBy?: object;
    lastModificationDate?: string;
    blocked?: boolean;
}