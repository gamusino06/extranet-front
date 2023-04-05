/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { JobProcedureService } from './job-procedure.service';

describe('Service: JobProcedure', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JobProcedureService]
    });
  });

  it('should ...', inject([JobProcedureService], (service: JobProcedureService) => {
    expect(service).toBeTruthy();
  }));
});
