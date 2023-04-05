import {ExternalCourse} from './ExternalCourse';

export interface ExternalCourseStudent {
  id?: number;
  name?: string;
  surnames?: string;
  nif?: string;
  birthDate?: Date;
  certificateId?: string;
  externalCourse?: ExternalCourse;
  evaluation?: number;
  createdAt?: Date;
  modifiedAt?: Date;
  modifiedBy?: number;
}
