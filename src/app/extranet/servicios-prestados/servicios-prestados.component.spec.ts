import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiciosPrestadosComponent } from './servicios-prestados.component';

describe('ServiciosPrestadosComponent', () => {
  let component: ServiciosPrestadosComponent;
  let fixture: ComponentFixture<ServiciosPrestadosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiciosPrestadosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiciosPrestadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
