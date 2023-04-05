import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreationButtonsComponent } from './creation-buttons.component';

describe('CreationButtonsComponent', () => {
  let component: CreationButtonsComponent;
  let fixture: ComponentFixture<CreationButtonsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreationButtonsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreationButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
