import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InformacionInitComponent } from './informacion-init.component';

describe('InformacionInitComponent', () => {
  let component: InformacionInitComponent;
  let fixture: ComponentFixture<InformacionInitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InformacionInitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InformacionInitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
