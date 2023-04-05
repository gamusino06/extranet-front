/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalModificarAltaFavorito } from './modalModificarAltaFavorito.component';

describe('modalModificarAltaFavorito', () => {
  let component: ModalModificarAltaFavorito;
  let fixture: ComponentFixture<ModalModificarAltaFavorito>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalModificarAltaFavorito ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalModificarAltaFavorito);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
