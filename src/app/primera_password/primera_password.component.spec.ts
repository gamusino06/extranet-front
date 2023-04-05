/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Primera_passwordComponent } from './primera_password.component';

describe('Primera_passwordComponent', () => {
  let component: Primera_passwordComponent;
  let fixture: ComponentFixture<Primera_passwordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Primera_passwordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Primera_passwordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
