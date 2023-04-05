import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CitacionWebHoraComponent } from './citacion-web-hora.component';

describe('CitacionWebHoraComponent', () => {
  let component: CitacionWebHoraComponent;
  let fixture: ComponentFixture<CitacionWebHoraComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CitacionWebHoraComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CitacionWebHoraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
