import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormacionInitComponent } from './formacion-init.component';

describe('FormacionInitComponent', () => {
  let component: FormacionInitComponent;
  let fixture: ComponentFixture<FormacionInitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormacionInitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormacionInitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
