import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DelegacionesWpComponent } from './delegaciones-wp.component';

describe('DelegacionesWpComponent', () => {
  let component: DelegacionesWpComponent;
  let fixture: ComponentFixture<DelegacionesWpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DelegacionesWpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DelegacionesWpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
