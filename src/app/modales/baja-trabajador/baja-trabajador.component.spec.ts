import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BajaTrabajadorComponent } from './baja-trabajador.component';

describe('BajaTrabajadorComponent', () => {
  let component: BajaTrabajadorComponent;
  let fixture: ComponentFixture<BajaTrabajadorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BajaTrabajadorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BajaTrabajadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
