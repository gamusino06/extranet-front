import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NormativaGeneralPrlComponent } from './normativa-general-prl.component';

describe('NormativaGeneralPrlComponent', () => {
  let component: NormativaGeneralPrlComponent;
  let fixture: ComponentFixture<NormativaGeneralPrlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NormativaGeneralPrlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NormativaGeneralPrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
