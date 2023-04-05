import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DescargaDocComponent } from './descarga-doc.component';

describe('DescargaDocComponent', () => {
  let component: DescargaDocComponent;
  let fixture: ComponentFixture<DescargaDocComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DescargaDocComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DescargaDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
