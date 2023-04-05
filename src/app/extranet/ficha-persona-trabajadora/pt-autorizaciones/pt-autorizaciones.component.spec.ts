import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PtAutorizacionesComponent } from './pt-autorizaciones.component';

describe('PtAutorizacionesComponent', () => {
  let component: PtAutorizacionesComponent;
  let fixture: ComponentFixture<PtAutorizacionesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PtAutorizacionesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PtAutorizacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
