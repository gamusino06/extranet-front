/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ModalCambiarIdiomaComponent } from './modal-cambiar-idioma.component';

describe('ModalCambiarIdiomaComponent', () => {
  let component: ModalCambiarIdiomaComponent;
  let fixture: ComponentFixture<ModalCambiarIdiomaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalCambiarIdiomaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalCambiarIdiomaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
