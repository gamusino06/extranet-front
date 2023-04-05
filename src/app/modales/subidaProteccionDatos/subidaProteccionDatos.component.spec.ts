/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SubidaProteccionDatosComponent } from './subidaProteccionDatos.component';

describe('SubidaProteccionDatosComponent', () => {
  let component: SubidaProteccionDatosComponent;
  let fixture: ComponentFixture<SubidaProteccionDatosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubidaProteccionDatosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubidaProteccionDatosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
