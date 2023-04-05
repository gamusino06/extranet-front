import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentacionGeneralComponent } from './documentacion-general.component';

describe('DocumentacionGeneralComponent', () => {
  let component: DocumentacionGeneralComponent;
  let fixture: ComponentFixture<DocumentacionGeneralComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentacionGeneralComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentacionGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
