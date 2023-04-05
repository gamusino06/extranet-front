import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricoCitasComponent } from './historico-citas.component';

describe('HistoricoCitasComponent', () => {
  let component: HistoricoCitasComponent;
  let fixture: ComponentFixture<HistoricoCitasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistoricoCitasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoricoCitasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
