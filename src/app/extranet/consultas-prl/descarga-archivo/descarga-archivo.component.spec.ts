import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DescargaArchivoComponent } from './descarga-archivo.component';

describe('DescargaArchivoComponent', () => {
  let component: DescargaArchivoComponent;
  let fixture: ComponentFixture<DescargaArchivoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DescargaArchivoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DescargaArchivoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
