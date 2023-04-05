import { TestBed } from '@angular/core/testing';
import { SchedulingsService } from './schedulings.service';

describe('schedulingsService', () => {
  let service: SchedulingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SchedulingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
