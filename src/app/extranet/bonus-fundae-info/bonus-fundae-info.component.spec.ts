import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BonusFundaeInfoComponent } from './bonus-fundae-info.component';

describe('BonusFundaeInfoComponent', () => {
  let component: BonusFundaeInfoComponent;
  let fixture: ComponentFixture<BonusFundaeInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BonusFundaeInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BonusFundaeInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
