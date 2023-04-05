import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DelegacionesComponent } from './delegaciones.component';

describe('DelegacionesComponent', () => {
  let component: DelegacionesComponent;
  let fixture: ComponentFixture<DelegacionesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DelegacionesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DelegacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
