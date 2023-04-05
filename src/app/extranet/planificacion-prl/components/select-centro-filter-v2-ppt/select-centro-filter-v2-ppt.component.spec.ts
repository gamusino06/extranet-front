import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectCentroFilterV2PptComponent } from './select-centro-filter-v2-ppt.component';

describe('SelectCentroFilterV2PptComponent', () => {
  let component: SelectCentroFilterV2PptComponent;
  let fixture: ComponentFixture<SelectCentroFilterV2PptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectCentroFilterV2PptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectCentroFilterV2PptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
