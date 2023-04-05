import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VigilanciaInformesMedicosAsociadosComponent } from './vigilancia-informes-medicos-asociados.component';

describe('VigilanciaInformesMedicosAsociadosComponent', () => {
  let component: VigilanciaInformesMedicosAsociadosComponent;
  let fixture: ComponentFixture<VigilanciaInformesMedicosAsociadosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VigilanciaInformesMedicosAsociadosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VigilanciaInformesMedicosAsociadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
