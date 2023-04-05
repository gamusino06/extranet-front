import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PtDocumentacionTableComponent } from './pt-documentacion-table.component';

describe('PtDocumentacionTableComponent', () => {
  let component: PtDocumentacionTableComponent;
  let fixture: ComponentFixture<PtDocumentacionTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PtDocumentacionTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PtDocumentacionTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
