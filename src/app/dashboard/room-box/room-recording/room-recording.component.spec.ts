import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomRecordingComponent } from './room-recording.component';

describe('RoomRecordingComponent', () => {
  let component: RoomRecordingComponent;
  let fixture: ComponentFixture<RoomRecordingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoomRecordingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomRecordingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
