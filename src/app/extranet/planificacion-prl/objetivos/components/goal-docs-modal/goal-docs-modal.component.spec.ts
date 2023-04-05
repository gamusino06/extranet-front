import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GoalDocsModalComponent } from './goal-docs-modal.component';

describe('GoalDocsModalComponent', () => {
  let component: GoalDocsModalComponent;
  let fixture: ComponentFixture<GoalDocsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GoalDocsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalDocsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
