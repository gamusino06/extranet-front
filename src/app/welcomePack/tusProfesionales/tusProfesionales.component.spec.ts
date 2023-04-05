/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TusProfesionalesComponent } from './tusProfesionales.component';

describe('TusProfesionalesComponent', () => {
  let component: TusProfesionalesComponent;
  let fixture: ComponentFixture<TusProfesionalesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TusProfesionalesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TusProfesionalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
