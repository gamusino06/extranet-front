import { TestBed } from '@angular/core/testing';

import { ServiceGenericErrorService } from './service-generic-error.service';

describe('ServiceGenericErrorService', () => {
  let service: ServiceGenericErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiceGenericErrorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
