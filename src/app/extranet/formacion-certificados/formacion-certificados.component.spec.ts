import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormacionCertificadosComponent } from './formacion-certificados.component';

describe('FormacionCertificadosComponent', () => {
  let component: FormacionCertificadosComponent;
  let fixture: ComponentFixture<FormacionCertificadosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormacionCertificadosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormacionCertificadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
