/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TusPromocionesComponent } from './tusPromociones.component';

describe('TusPromocionesComponent', () => {
  let component: TusPromocionesComponent;
  let fixture: ComponentFixture<TusPromocionesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TusPromocionesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TusPromocionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
