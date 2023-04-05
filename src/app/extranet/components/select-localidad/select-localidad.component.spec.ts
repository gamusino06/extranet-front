import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectLocalidadComponent } from './select-localidad.component';

describe('SelectLocalidadComponent', () => {
  let component: SelectLocalidadComponent;
  let fixture: ComponentFixture<SelectLocalidadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectLocalidadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectLocalidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});