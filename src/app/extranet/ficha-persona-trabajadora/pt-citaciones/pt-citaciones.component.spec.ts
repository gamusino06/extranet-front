import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PtCitacionesComponent } from './pt-citaciones.component';

describe('PtCitacionesComponent', () => {
  let component: PtCitacionesComponent;
  let fixture: ComponentFixture<PtCitacionesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PtCitacionesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PtCitacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
