import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificacionesFrameComponent } from './notificaciones-frame.component';

describe('NotificacionesFrameComponent', () => {
  let component: NotificacionesFrameComponent;
  let fixture: ComponentFixture<NotificacionesFrameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotificacionesFrameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificacionesFrameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
