import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PtAutorizacionTableComponent } from './pt-autorizacion-table.component';

describe('PtAutorizacionTableComponent', () => {
  let component: PtAutorizacionTableComponent;
  let fixture: ComponentFixture<PtAutorizacionTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PtAutorizacionTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PtAutorizacionTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
