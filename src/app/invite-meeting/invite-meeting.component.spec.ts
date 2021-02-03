import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InviteMeetingComponent } from './invite-meeting.component';

describe('InviteMeetingComponent', () => {
  let component: InviteMeetingComponent;
  let fixture: ComponentFixture<InviteMeetingComponent>;

  beforeEach(async(() => {
	TestBed.configureTestingModule({
		declarations: [ InviteMeetingComponent ]
	})
	.compileComponents();
  }));

  beforeEach(() => {
	fixture = TestBed.createComponent(InviteMeetingComponent);
	component = fixture.componentInstance;
	fixture.detectChanges();
  });

  it('should create', () => {
	expect(component).toBeTruthy();
  });
});
