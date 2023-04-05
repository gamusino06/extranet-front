import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PtTrabajoADistanciaComponent } from './pt-trabajo-a-distancia.component';

describe('PtTrabajoADistanciaComponent', () => {
  let component: PtTrabajoADistanciaComponent;
  let fixture: ComponentFixture<PtTrabajoADistanciaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PtTrabajoADistanciaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PtTrabajoADistanciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
