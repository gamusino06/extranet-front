import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VigilanciaSaludInitComponent } from './vigilancia-salud-init.component';

describe('VigilanciaSaludInitComponent', () => {
  let component: VigilanciaSaludInitComponent;
  let fixture: ComponentFixture<VigilanciaSaludInitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VigilanciaSaludInitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VigilanciaSaludInitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
