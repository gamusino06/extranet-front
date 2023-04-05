import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarioCursosComponent } from './calendario-cursos.component';

describe('CentrosTrabajoComponent', () => {
  let component: CalendarioCursosComponent;
  let fixture: ComponentFixture<CalendarioCursosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalendarioCursosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarioCursosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
