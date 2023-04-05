import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PtDocumentacionComponent } from './pt-documentacion.component';

describe('PtDocumentacionComponent', () => {
  let component: PtDocumentacionComponent;
  let fixture: ComponentFixture<PtDocumentacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PtDocumentacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PtDocumentacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
