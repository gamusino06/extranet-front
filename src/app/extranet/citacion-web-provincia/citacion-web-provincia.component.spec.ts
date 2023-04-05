import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CitacionWebProvinciaComponent } from './citacion-web-provincia.component';

describe('VigilanciaInformesAptitudComponent', () => {
  let component: CitacionWebProvinciaComponent;
  let fixture: ComponentFixture<CitacionWebProvinciaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CitacionWebProvinciaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CitacionWebProvinciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
