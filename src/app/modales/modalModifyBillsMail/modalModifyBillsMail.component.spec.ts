/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalModifyBillsMail } from './modalModifyBillsMail.component';

describe('modalModifyBillsMail', () => {
  let component: ModalModifyBillsMail;
  let fixture: ComponentFixture<ModalModifyBillsMail>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalModifyBillsMail ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalModifyBillsMail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
