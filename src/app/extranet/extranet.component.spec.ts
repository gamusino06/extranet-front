import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtranetComponent } from './extranet.component';

describe('ExtranetComponent', () => {
  let component: ExtranetComponent;
  let fixture: ComponentFixture<ExtranetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExtranetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtranetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
