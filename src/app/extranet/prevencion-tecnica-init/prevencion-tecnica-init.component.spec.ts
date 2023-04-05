import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrevencionTecnicaInitComponent } from './prevencion-tecnica-init.component';

describe('PrevencionTecnicaInitComponent', () => {
  let component: PrevencionTecnicaInitComponent;
  let fixture: ComponentFixture<PrevencionTecnicaInitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrevencionTecnicaInitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrevencionTecnicaInitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
