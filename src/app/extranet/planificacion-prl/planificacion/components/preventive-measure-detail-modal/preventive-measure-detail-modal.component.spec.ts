import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreventiveMeasureDetailModalComponent } from './preventive-measure-detail-modal.component';

describe('PreventiveMeasureDetailModalComponent', () => {
  let component: PreventiveMeasureDetailModalComponent;
  let fixture: ComponentFixture<PreventiveMeasureDetailModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreventiveMeasureDetailModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreventiveMeasureDetailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
