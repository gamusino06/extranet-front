import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultasPrlComponent } from './consultas-prl.component';

describe('ConsultasPrlComponent', () => {
  let component: ConsultasPrlComponent;
  let fixture: ComponentFixture<ConsultasPrlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultasPrlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultasPrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
