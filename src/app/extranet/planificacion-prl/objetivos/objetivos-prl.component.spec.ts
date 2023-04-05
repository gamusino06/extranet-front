import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjetivosPrlComponent } from './objetivos-prl.component';

describe('ObjetivosPrlComponent', () => {
  let component: ObjetivosPrlComponent;
  let fixture: ComponentFixture<ObjetivosPrlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ObjetivosPrlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjetivosPrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
