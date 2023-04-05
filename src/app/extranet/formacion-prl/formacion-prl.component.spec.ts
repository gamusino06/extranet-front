import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormacionPrlComponent } from './formacion-prl.component';

describe('FormacionPrlComponent', () => {
  let component: FormacionPrlComponent;
  let fixture: ComponentFixture<FormacionPrlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormacionPrlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormacionPrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
