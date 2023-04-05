import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationMessageModalComponent } from './confirmation-modal.component';

describe('ConfirmationModalComponent', () => {
  let component: ConfirmationMessageModalComponent;
  let fixture: ComponentFixture<ConfirmationMessageModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmationMessageModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmationMessageModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
