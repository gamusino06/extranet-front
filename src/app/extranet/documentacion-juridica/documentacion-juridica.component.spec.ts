import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentacionJuridicaComponent } from './documentacion-juridica.component';

describe('DocumentacionJuridicaComponent', () => {
  let component: DocumentacionJuridicaComponent;
  let fixture: ComponentFixture<DocumentacionJuridicaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentacionJuridicaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentacionJuridicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
