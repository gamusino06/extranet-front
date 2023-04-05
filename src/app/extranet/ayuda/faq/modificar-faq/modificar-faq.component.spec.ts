import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModificarFaqComponent } from './modificar-faq.component';

describe('ModificarFaqComponent', () => {
  let component: ModificarFaqComponent;
  let fixture: ComponentFixture<ModificarFaqComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModificarFaqComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModificarFaqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
