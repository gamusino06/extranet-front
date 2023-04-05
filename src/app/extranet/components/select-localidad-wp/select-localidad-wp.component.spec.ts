import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectLocalidadWpComponent } from './select-localidad-wp.component';

describe('SelectLocalidadWpComponent', () => {
  let component: SelectLocalidadWpComponent;
  let fixture: ComponentFixture<SelectLocalidadWpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectLocalidadWpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectLocalidadWpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
