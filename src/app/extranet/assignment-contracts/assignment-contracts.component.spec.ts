import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentContractsComponent } from './assignment-contracts.component';

describe('AssignmentContractsComponent', () => {
  let component: AssignmentContractsComponent;
  let fixture: ComponentFixture<AssignmentContractsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignmentContractsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignmentContractsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
