/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { NewRgpdComponent } from './new-rgpd.component';

describe('RgpdComponent', () => {
  let component: NewRgpdComponent;
  let fixture: ComponentFixture<NewRgpdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewRgpdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewRgpdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
