import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectCentroComponent } from './select-centro.component';

describe('SelectCentroComponent', () => {
  let component: SelectCentroComponent;
  let fixture: ComponentFixture<SelectCentroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectCentroComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectCentroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
