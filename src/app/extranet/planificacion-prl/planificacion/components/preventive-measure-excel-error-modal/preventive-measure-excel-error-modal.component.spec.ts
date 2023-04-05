import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { PreventiveMeasureExcelErrorModalComponent } from "./preventive-measure-excel-error-modal.component";

describe("PreventiveMeasureExcelErrorModalComponent", () => {
  let component: PreventiveMeasureExcelErrorModalComponent;
  let fixture: ComponentFixture<PreventiveMeasureExcelErrorModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PreventiveMeasureExcelErrorModalComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(
      PreventiveMeasureExcelErrorModalComponent
    );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
