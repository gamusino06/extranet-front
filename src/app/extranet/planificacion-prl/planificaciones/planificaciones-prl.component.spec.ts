import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {PlanificacionesPrlComponent} from "./planificaciones-prl.component";

describe('PlanificacionesPrlComponent', () => {
  let component: PlanificacionesPrlComponent;
  let fixture: ComponentFixture<PlanificacionesPrlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanificacionesPrlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanificacionesPrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
