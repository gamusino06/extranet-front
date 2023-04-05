/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { DescargaProteccionDatosComponent } from './descargaProteccionDatos.component';

describe('ShareDocumentComponent', () => {
  let component: DescargaProteccionDatosComponent;
  let fixture: ComponentFixture<DescargaProteccionDatosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DescargaProteccionDatosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DescargaProteccionDatosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
