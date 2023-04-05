import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MassiveEditModalComponent } from "./massive-edit-modal.component";

describe('MassiveEditModalComponent', () => {
  let component: MassiveEditModalComponent;
  let fixture: ComponentFixture<MassiveEditModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MassiveEditModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MassiveEditModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
