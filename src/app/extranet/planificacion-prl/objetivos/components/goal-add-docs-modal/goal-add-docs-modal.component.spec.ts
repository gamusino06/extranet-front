import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GoalAddDocsModalComponent } from './goal-add-docs-modal.component';

describe('GoalDocsModalComponent', () => {
  let component: GoalAddDocsModalComponent;
  let fixture: ComponentFixture<GoalAddDocsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GoalAddDocsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalAddDocsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
