import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModificarVideoAyudaComponent } from './modificar-videoayuda.component';

describe('ModificarVideoAyudaComponent', () => {
  let component: ModificarVideoAyudaComponent;
  let fixture: ComponentFixture<ModificarVideoAyudaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModificarVideoAyudaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModificarVideoAyudaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
