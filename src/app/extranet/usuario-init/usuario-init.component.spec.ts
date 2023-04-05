import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuarioInitComponent } from './usuario-init.component';

describe('UsuarioInitComponent', () => {
  let component: UsuarioInitComponent;
  let fixture: ComponentFixture<UsuarioInitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsuarioInitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsuarioInitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
