import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { JobProcedureModalComponent } from "./job-procedure-modal.component";

describe("JobProcedureModalComponent", () => {
  let component: JobProcedureModalComponent;
  let fixture: ComponentFixture<JobProcedureModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [JobProcedureModalComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobProcedureModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
