import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectProvinciaComponent } from './select-provincia.component';

describe('SelectProvinciaComponent', () => {
  let component: SelectProvinciaComponent;
  let fixture: ComponentFixture<SelectProvinciaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectProvinciaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectProvinciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
