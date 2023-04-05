import { TestBed } from '@angular/core/testing';

import { WorkersCardService } from './worker-card.service';

describe('WorkerCardService', () => {
  let service: WorkersCardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkersCardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
