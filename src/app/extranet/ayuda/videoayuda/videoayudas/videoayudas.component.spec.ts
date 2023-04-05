import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoAyudasComponent } from './videoayudas.component';

describe('VideoAyudasComponent', () => {
  let component: VideoAyudasComponent;
  let fixture: ComponentFixture<VideoAyudasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VideoAyudasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoAyudasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
