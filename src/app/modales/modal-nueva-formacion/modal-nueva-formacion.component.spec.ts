import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalNuevaFormacionComponent } from './modal-nueva-formacion.component';

describe('ModalNuevaFormacionComponent', () => {
  let component: ModalNuevaFormacionComponent;
  let fixture: ComponentFixture<ModalNuevaFormacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalNuevaFormacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalNuevaFormacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
