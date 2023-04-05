import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PtFormacionComponent } from './pt-formacion.component';

describe('PtFormacionComponent', () => {
  let component: PtFormacionComponent;
  let fixture: ComponentFixture<PtFormacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PtFormacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PtFormacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
