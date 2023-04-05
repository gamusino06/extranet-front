/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AltaFaqComponent } from './alta-faq.component';

describe('AltaFaqComponent', () => {
  let component: AltaFaqComponent;
  let fixture: ComponentFixture<AltaFaqComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AltaFaqComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AltaFaqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
