import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { PreventiveMeasureModalComponent } from "./preventive-measure-modal.component";

describe("PreventiveMeasureModalComponent", () => {
  let component: PreventiveMeasureModalComponent;
  let fixture: ComponentFixture<PreventiveMeasureModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PreventiveMeasureModalComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreventiveMeasureModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
