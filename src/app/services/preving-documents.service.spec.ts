import { TestBed } from '@angular/core/testing';

import { PrevingDocumentsService } from './preving-documents.service';

describe('PrevingDocumentsService', () => {
  let service: PrevingDocumentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrevingDocumentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
