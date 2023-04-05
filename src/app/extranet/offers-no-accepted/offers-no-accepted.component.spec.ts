import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OffersNoAcceptedComponent } from './offers-no-accepted.component';

describe('OffersNoAcceptedComponent', () => {
  let component: OffersNoAcceptedComponent;
  let fixture: ComponentFixture<OffersNoAcceptedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OffersNoAcceptedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OffersNoAcceptedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
