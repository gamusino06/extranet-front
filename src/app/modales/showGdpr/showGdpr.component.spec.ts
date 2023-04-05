/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ShowGdprComponent } from './showGdpr.component';

describe('ShareDocumentComponent', () => {
  let component: ShowGdprComponent;
  let fixture: ComponentFixture<ShowGdprComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowGdprComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowGdprComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
