import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanificacionPrlComponent } from './planificacion-prl.component';

describe('PlanificacionPrlComponent', () => {
  let component: PlanificacionPrlComponent;
  let fixture: ComponentFixture<PlanificacionPrlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanificacionPrlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanificacionPrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
