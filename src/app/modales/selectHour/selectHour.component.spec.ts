/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { selectHour } from './selectHour.component';

describe('selectHour', () => {
  let component: selectHour;
  let fixture: ComponentFixture<selectHour>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ selectHour ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(selectHour);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
