import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PtReconocimientosComponent } from './pt-reconocimientos.component';

describe('PtReconocimientosComponent', () => {
  let component: PtReconocimientosComponent;
  let fixture: ComponentFixture<PtReconocimientosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PtReconocimientosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PtReconocimientosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
