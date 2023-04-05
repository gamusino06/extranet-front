import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { PreventiveMeasureDocsModalComponent } from "./preventive-measure-docs-modal.component";

describe("PreventiveMeasureDocsModalComponent", () => {
  let component: PreventiveMeasureDocsModalComponent;
  let fixture: ComponentFixture<PreventiveMeasureDocsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PreventiveMeasureDocsModalComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreventiveMeasureDocsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
