import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchButtonsComponent } from './search-buttons.component';

describe('SearchButtonsComponent', () => {
  let component: SearchButtonsComponent;
  let fixture: ComponentFixture<SearchButtonsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchButtonsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
