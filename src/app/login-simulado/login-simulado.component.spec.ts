import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginSimuladoComponent } from './login-simulado.component';

describe('LoginSimuladoComponent', () => {
  let component: LoginSimuladoComponent;
  let fixture: ComponentFixture<LoginSimuladoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginSimuladoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginSimuladoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
