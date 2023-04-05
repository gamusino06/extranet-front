import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrevencionTrabajosRealizadosComponent } from './prevencion-trabajos-realizados.component';

describe('PrevencionTrabajosRealizadosComponent', () => {
  let component: PrevencionTrabajosRealizadosComponent;
  let fixture: ComponentFixture<PrevencionTrabajosRealizadosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrevencionTrabajosRealizadosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrevencionTrabajosRealizadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
