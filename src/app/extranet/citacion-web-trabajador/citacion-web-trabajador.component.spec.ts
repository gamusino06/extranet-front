import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CitacionWebTrabajadorComponent } from './citacion-web-trabajador.component';

describe('VigilanciaInformesAptitudComponent', () => {
  let component: CitacionWebTrabajadorComponent;
  let fixture: ComponentFixture<CitacionWebTrabajadorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CitacionWebTrabajadorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CitacionWebTrabajadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
