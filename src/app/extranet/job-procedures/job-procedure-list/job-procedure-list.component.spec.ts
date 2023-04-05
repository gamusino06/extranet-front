import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobProcedureListComponent } from './job-procedure-list.component';

describe('JobProcedureListComponent', () => {
  let component: JobProcedureListComponent;
  let fixture: ComponentFixture<JobProcedureListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobProcedureListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobProcedureListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
