import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AyudaInitComponent } from './ayuda-init.component';

describe('AyudaInitComponent', () => {
  let component: AyudaInitComponent;
  let fixture: ComponentFixture<AyudaInitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AyudaInitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AyudaInitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
