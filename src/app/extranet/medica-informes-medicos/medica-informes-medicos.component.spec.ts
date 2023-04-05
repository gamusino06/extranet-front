import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicaInformesMedicosComponent } from './medica-informes-medicos.component';

describe('MedicaInformesMedicosComponent', () => {
  let component: MedicaInformesMedicosComponent;
  let fixture: ComponentFixture<MedicaInformesMedicosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MedicaInformesMedicosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MedicaInformesMedicosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
