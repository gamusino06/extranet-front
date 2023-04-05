import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrevencionDocumentosPersonasTrabajadorasComponent } from './prevencion-documentos-personas-trabajadoras.component';

describe('PrevencionDocumentosPersonasTrabajadorasComponent', () => {
  let component: PrevencionDocumentosPersonasTrabajadorasComponent;
  let fixture: ComponentFixture<PrevencionDocumentosPersonasTrabajadorasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrevencionDocumentosPersonasTrabajadorasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrevencionDocumentosPersonasTrabajadorasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
