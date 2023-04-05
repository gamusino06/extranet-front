import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyCenterSelectorComponent } from './company-center-selector.component';

describe('CompanyCenterSelectorComponent', () => {
  let component: CompanyCenterSelectorComponent;
  let fixture: ComponentFixture<CompanyCenterSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompanyCenterSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyCenterSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
