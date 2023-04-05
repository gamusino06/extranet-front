import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrevencionTrabajadoresComponent } from './prevencion-trabajadores.component';

describe('PrevencionTrabajadoresComponent', () => {
  let component: PrevencionTrabajadoresComponent;
  let fixture: ComponentFixture<PrevencionTrabajadoresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrevencionTrabajadoresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrevencionTrabajadoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
