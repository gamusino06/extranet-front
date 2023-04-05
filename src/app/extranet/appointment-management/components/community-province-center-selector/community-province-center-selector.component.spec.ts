import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityProvinceCenterSelectorComponent } from './community-province-center-selector.component';

describe('CcaaCenterSelectorComponent', () => {
  let component: CommunityProvinceCenterSelectorComponent;
  let fixture: ComponentFixture<CommunityProvinceCenterSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommunityProvinceCenterSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunityProvinceCenterSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
