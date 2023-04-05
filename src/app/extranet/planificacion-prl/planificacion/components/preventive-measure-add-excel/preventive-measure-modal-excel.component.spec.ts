import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { PreventiveMeasureModalExcelComponent } from "./preventive-measure-modal-excel.component";

describe("PreventiveMeasureModalExcelComponent", () => {
  let component: PreventiveMeasureModalExcelComponent;
  let fixture: ComponentFixture<PreventiveMeasureModalExcelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PreventiveMeasureModalExcelComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreventiveMeasureModalExcelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
