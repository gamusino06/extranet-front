import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CitacionWebCalendarioComponent } from './citacion-web-calendario.component';

describe('VigilanciaInformesAptitudComponent', () => {
  let component: CitacionWebCalendarioComponent;
  let fixture: ComponentFixture<CitacionWebCalendarioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CitacionWebCalendarioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CitacionWebCalendarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
