import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VigilanciaInformesAptitudComponent } from './vigilancia-informes-aptitud.component';

describe('VigilanciaInformesAptitudComponent', () => {
  let component: VigilanciaInformesAptitudComponent;
  let fixture: ComponentFixture<VigilanciaInformesAptitudComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VigilanciaInformesAptitudComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VigilanciaInformesAptitudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
