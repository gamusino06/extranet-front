import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDocumentacionComponent } from './modal-documentacion.component';

describe('ModalDocumentacionComponent', () => {
  let component: ModalDocumentacionComponent;
  let fixture: ComponentFixture<ModalDocumentacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalDocumentacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalDocumentacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
