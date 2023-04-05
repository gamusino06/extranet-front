import { TestBed } from '@angular/core/testing';

import { PrevingExtranetGuard } from './preving-extranet.guard';

describe('PrevingExtranetGuard', () => {
  let guard: PrevingExtranetGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(PrevingExtranetGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
