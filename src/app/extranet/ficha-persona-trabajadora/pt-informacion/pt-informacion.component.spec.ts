import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PtInformacionComponent } from './pt-informacion.component';

describe('PtInformacionComponent', () => {
  let component: PtInformacionComponent;
  let fixture: ComponentFixture<PtInformacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PtInformacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PtInformacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
