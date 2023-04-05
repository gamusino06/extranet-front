import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AltaIndividualTrabajadorComponent } from './alta-individual-trabajador.component';

describe('AltaIndividualTrabajadorComponent', () => {
  let component: AltaIndividualTrabajadorComponent;
  let fixture: ComponentFixture<AltaIndividualTrabajadorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AltaIndividualTrabajadorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AltaIndividualTrabajadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
