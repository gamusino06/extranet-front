import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PtAccidentesComponent } from './pt-accidentes.component';

describe('PtAccidentesComponent', () => {
  let component: PtAccidentesComponent;
  let fixture: ComponentFixture<PtAccidentesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PtAccidentesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PtAccidentesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
