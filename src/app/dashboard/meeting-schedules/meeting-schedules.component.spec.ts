import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingSchedulesComponent } from './meeting-schedules.component';

describe('MeetingSchedulesComponent', () => {
  let component: MeetingSchedulesComponent;
  let fixture: ComponentFixture<MeetingSchedulesComponent>;

  beforeEach(async(() => {
	TestBed.configureTestingModule({
		declarations: [ MeetingSchedulesComponent ]
	})
	.compileComponents();
  }));

  beforeEach(() => {
	fixture = TestBed.createComponent(MeetingSchedulesComponent);
	component = fixture.componentInstance;
	fixture.detectChanges();
  });

  it('should create', () => {
	expect(component).toBeTruthy();
  });
});
