import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingReminderComponent } from './meeting-reminder.component';

describe('MeetingReminderComponent', () => {
  let component: MeetingReminderComponent;
  let fixture: ComponentFixture<MeetingReminderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeetingReminderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeetingReminderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
