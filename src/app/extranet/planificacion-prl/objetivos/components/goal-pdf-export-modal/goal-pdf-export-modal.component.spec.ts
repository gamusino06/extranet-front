/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { GoalPdfExportModalComponent } from './goal-pdf-export-modal.component';

describe('GoalPdfExportModalComponent', () => {
  let component: GoalPdfExportModalComponent;
  let fixture: ComponentFixture<GoalPdfExportModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GoalPdfExportModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalPdfExportModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
