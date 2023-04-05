import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectEmpresaFilterComponent } from './select-empresa-filter.component';

describe('SelectEmpresaFilterComponent', () => {
  let component: SelectEmpresaFilterComponent;
  let fixture: ComponentFixture<SelectEmpresaFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectEmpresaFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectEmpresaFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
