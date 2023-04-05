import { TestBed } from "@angular/core/testing";
import { PreventiveMeasureScheduleService } from "./preventive-measure-schedule.service";

describe("PreventiveMeasureScheduleService", () => {
  let service: PreventiveMeasureScheduleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PreventiveMeasureScheduleService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});