import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PillsViewComponent } from './pills-view.component';

describe('PillsViewComponent', () => {
  let component: PillsViewComponent;
  let fixture: ComponentFixture<PillsViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PillsViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PillsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
