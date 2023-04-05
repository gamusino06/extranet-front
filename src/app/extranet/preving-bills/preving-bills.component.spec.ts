import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrevingBillsComponent } from './preving-bills.component';

describe('PrevingBillsComponent', () => {
  let component: PrevingBillsComponent;
  let fixture: ComponentFixture<PrevingBillsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrevingBillsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrevingBillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
