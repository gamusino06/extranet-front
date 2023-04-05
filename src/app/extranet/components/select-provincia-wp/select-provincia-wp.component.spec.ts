import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectProvinciaWpComponent } from './select-provincia-wp.component';

describe('SelectProvinciaWpComponent', () => {
  let component: SelectProvinciaWpComponent;
  let fixture: ComponentFixture<SelectProvinciaWpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectProvinciaWpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectProvinciaWpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
