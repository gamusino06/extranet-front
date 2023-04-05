
export interface CourseType {
    id?: number;
    description?: string;
}
export interface CourseModality {
    id?: number;
    nombre?: string;
}
export interface InternalCourse {
    id?: number;
    description?: string;
    courseModality?: CourseModality;
    enterpriseId?: number;
    centerId: number;
    center:string;
    courseType?: CourseType;
    subcategory?: number;
    groupId?: number;
    management?: string;
    financialYear?: number;
    groupNumber?: number;
    managerName?: string;
    managerSurname?: string;
    hours?: number;
    initDate?: Date;
    endDate?: Date;
    origin?: number;
    managerEmail?: string;
}
