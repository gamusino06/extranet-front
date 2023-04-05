import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { PreventiveMeasureMassiveModalComponent } from "./preventive-measure-massive-modal.component";

describe("PreventiveMeasureMassiveModalComponent", () => {
  let component: PreventiveMeasureMassiveModalComponent;
  let fixture: ComponentFixture<PreventiveMeasureMassiveModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PreventiveMeasureMassiveModalComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreventiveMeasureMassiveModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
