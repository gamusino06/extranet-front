/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { DebugElement } from "@angular/core";

import { EmailingModalComponent } from "./emailing-modal.component";

describe("AssignPreventiveMeasureModalComponent", () => {
  let component: EmailingModalComponent;
  let fixture: ComponentFixture<EmailingModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EmailingModalComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailingModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
