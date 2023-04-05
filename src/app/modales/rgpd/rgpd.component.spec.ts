/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { RgpdComponent } from './rgpd.component';

describe('RgpdComponent', () => {
  let component: RgpdComponent;
  let fixture: ComponentFixture<RgpdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RgpdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RgpdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
