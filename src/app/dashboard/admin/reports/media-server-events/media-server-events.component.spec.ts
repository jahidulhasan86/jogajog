import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaServerEventsComponent } from './media-server-events.component';

describe('MediaServerEventsComponent', () => {
  let component: MediaServerEventsComponent;
  let fixture: ComponentFixture<MediaServerEventsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MediaServerEventsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaServerEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
