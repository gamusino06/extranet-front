import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalXlsComponent } from './modal-xls.component';

describe('ModalXlsComponent', () => {
  let component: ModalXlsComponent;
  let fixture: ComponentFixture<ModalXlsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalXlsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalXlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
