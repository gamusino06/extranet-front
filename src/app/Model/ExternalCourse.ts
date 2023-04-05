export interface ExternalCourseCategory {
  id?: number;
  description?: string;
}

export interface CourseType {
  id?: number;
  description?: string;
}

export interface CourseModality {
  id?: number;
  nombre?: string;
}

export interface ExternalCourse {
  id?: number;
  description?: string;
  courseModality?: CourseModality;
  enterpriseId?: number;
  centerId?: number;
  externalCourseCategory?: ExternalCourseCategory;
  courseType?: CourseType;
  hours?: number;
  initDate?: Date;
  endDate?: Date;
  createdAt?: Date;
  modifiedAt?: Date;
  modifiedBy?: number;
  recycleDate?: Date;
  companyIds?: number[];
  address?: string;
  origin?: string;
  checked: boolean;
}
