import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrevencionDocumentosTecnicosComponent } from './prevencion-documentos-tecnicos.component';

describe('PrevencionDocumentosTecnicosComponent', () => {
  let component: PrevencionDocumentosTecnicosComponent;
  let fixture: ComponentFixture<PrevencionDocumentosTecnicosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrevencionDocumentosTecnicosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrevencionDocumentosTecnicosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
