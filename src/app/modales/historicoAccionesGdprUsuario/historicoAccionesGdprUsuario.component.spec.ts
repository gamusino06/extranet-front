/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { HistoricoAccionesGdprUsuarioComponent } from './historicoAccionesGdprUsuario.component';

describe('HistoricoAccionesGdprUsuarioComponent', () => {
  let component: HistoricoAccionesGdprUsuarioComponent;
  let fixture: ComponentFixture<HistoricoAccionesGdprUsuarioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistoricoAccionesGdprUsuarioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoricoAccionesGdprUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
