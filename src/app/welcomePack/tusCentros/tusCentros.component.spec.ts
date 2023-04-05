/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TusCentrosComponent } from './tusCentros.component';

describe('TusCentrosComponent', () => {
  let component: TusCentrosComponent;
  let fixture: ComponentFixture<TusCentrosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TusCentrosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TusCentrosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
