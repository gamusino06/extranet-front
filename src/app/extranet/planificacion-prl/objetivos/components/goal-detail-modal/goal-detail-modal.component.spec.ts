import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GoalDetailModalComponent } from './goal-detail-modal.component';

describe('GoalDetailModalComponent', () => {
  let component: GoalDetailModalComponent;
  let fixture: ComponentFixture<GoalDetailModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GoalDetailModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalDetailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
