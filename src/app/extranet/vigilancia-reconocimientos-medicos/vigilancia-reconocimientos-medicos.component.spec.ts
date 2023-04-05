import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VigilanciaReconocimientosMedicosComponent } from './vigilancia-reconocimientos-medicos.component';

describe('VigilanciaReconocimientosMedicosComponent', () => {
  let component: VigilanciaReconocimientosMedicosComponent;
  let fixture: ComponentFixture<VigilanciaReconocimientosMedicosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VigilanciaReconocimientosMedicosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VigilanciaReconocimientosMedicosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
