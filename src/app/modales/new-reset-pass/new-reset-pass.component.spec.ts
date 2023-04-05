/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { NewResetPassComponent } from './new-reset-pass.component';

describe('ResetPassComponent', () => {
  let component: NewResetPassComponent;
  let fixture: ComponentFixture<NewResetPassComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewResetPassComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewResetPassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
