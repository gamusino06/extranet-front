import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectCentroFilterComponent } from './select-centro-filter.component';

describe('SelectCentroFilterComponent', () => {
  let component: SelectCentroFilterComponent;
  let fixture: ComponentFixture<SelectCentroFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectCentroFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectCentroFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
