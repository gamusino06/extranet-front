import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministracionInitComponent } from './administracion-init.component';

describe('AdministracionInitComponent', () => {
  let component: AdministracionInitComponent;
  let fixture: ComponentFixture<AdministracionInitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdministracionInitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministracionInitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
