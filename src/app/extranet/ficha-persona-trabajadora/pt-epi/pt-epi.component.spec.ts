import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PtEpiComponent } from './pt-epi.component';

describe('PtEpiComponent', () => {
  let component: PtEpiComponent;
  let fixture: ComponentFixture<PtEpiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PtEpiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PtEpiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
