/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CookiesComponent } from './cookies.component';

describe('CookiesComponent', () => {
  let component: CookiesComponent;
  let fixture: ComponentFixture<CookiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CookiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CookiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
