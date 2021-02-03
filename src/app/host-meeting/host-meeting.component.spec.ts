import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HostMeetingComponent } from './host-meeting.component';

describe('HostMeetingComponent', () => {
  let component: HostMeetingComponent;
  let fixture: ComponentFixture<HostMeetingComponent>;

  beforeEach(async(() => {
	TestBed.configureTestingModule({
		declarations: [ HostMeetingComponent ]
	})
	.compileComponents();
  }));

  beforeEach(() => {
	fixture = TestBed.createComponent(HostMeetingComponent);
	component = fixture.componentInstance;
	fixture.detectChanges();
  });

  it('should create', () => {
	expect(component).toBeTruthy();
  });
});
