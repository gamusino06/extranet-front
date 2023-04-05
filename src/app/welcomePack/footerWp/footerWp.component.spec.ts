/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { FooterWpComponent } from './footerWp.component';

describe('FooterWpComponent', () => {
  let component: FooterWpComponent;
  let fixture: ComponentFixture<FooterWpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FooterWpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterWpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
