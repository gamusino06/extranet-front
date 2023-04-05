import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginaEnContruccionComponent } from './pagina-en-construccion.component';

describe('PaginaEnContruccionComponent', () => {
  let component: PaginaEnContruccionComponent;
  let fixture: ComponentFixture<PaginaEnContruccionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaginaEnContruccionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaginaEnContruccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
