/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfView } from './pdfView.component';

describe('PdfView', () => {
  let component: PdfView;
  let fixture: ComponentFixture<PdfView>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PdfView ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PdfView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
