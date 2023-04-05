/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SeleccionEmpresasCentrosComponent } from './seleccionEmpresasCentros.component';

describe('SeleccionEmpresasCentrosComponent', () => {
  let component: SeleccionEmpresasCentrosComponent;
  let fixture: ComponentFixture<SeleccionEmpresasCentrosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeleccionEmpresasCentrosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeleccionEmpresasCentrosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
