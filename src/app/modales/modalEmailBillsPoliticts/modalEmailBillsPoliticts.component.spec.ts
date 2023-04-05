/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEmailBillsPoliticts } from './modalEmailBillsPoliticts.component';

describe('modalModifyBillsMail', () => {
  let component: ModalEmailBillsPoliticts;
  let fixture: ComponentFixture<ModalEmailBillsPoliticts>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalEmailBillsPoliticts ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalEmailBillsPoliticts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
