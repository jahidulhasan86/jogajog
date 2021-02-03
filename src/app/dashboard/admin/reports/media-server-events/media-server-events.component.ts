import { Component, OnInit } from '@angular/core';
import { MediaServerAdminService } from '../../../../shared/services/media-server-admin/media-server-admin.service';
import Swal from 'sweetalert2';
import { FormControl, FormGroup } from '@angular/forms';

interface Events {
  value: string;
  displayName: string;
}

@Component({
  selector: 'app-media-server-events',
  templateUrl: './media-server-events.component.html',
  styleUrls: ['./media-server-events.component.scss']
})
export class MediaServerEventsComponent implements OnInit {

  form: FormGroup;
  selected = 'Error';
  selectedEvents = [];
  events: Events[] = [
	{ value: 'RpcConnectionCreated', displayName: 'Rpc Connection Created' },
	{ value: 'OvmsConferenceCreated', displayName: 'Ovms Conference Created' },
	{ value: 'ConferenceCreated', displayName: 'Conference Created' },
	{ value: 'OvmsParticipantJoined', displayName: 'Ovms Participant Joined' },
	{ value: 'UserJoined', displayName: 'User Joined' },
	{ value: 'OvmsParticipantLeft', displayName: 'Ovms Participant Left' },
	{ value: 'UserLeave', displayName: 'User Leave' },
	{ value: 'OvmsConferenceClosed', displayName: 'Ovms Conference Closed' },
	{ value: 'ConferenceClosed', displayName: 'Conference Closed' },
	{ value: 'ConferenceTypeChanged', displayName: 'Conference Type Changed' },
	{ value: 'RpcConnectionClosed', displayName: 'Rpc Connection Closed' },
	{ value: 'Error', displayName: 'Error' }
  ];
  eventControl = new FormControl(this.events[0].displayName);
  constructor(private mediaWebSocketService: MediaServerAdminService) {
	this.form = new FormGroup({
		event: this.eventControl
	});
  }

  ngOnInit(): void {
	this.selectedEvents = ['Error'];
	this.mediaWebSocketService.connect();
	this.mediaWebSocketService.subcribeToEvents(this.selectedEvents);
	this.mediaWebSocketService.onConferenceEventMessageObserver.subscribe(x => {
		if (x && x.params) {
		Swal.fire(' ', x.params.event);
		}
	});
  }

  onChange(value) {
	this.selectedEvents = [];
	if (value) {
		this.mediaWebSocketService.closeConnection();
		this.mediaWebSocketService.connect();
		if (value && value === 'all') {
		this.selectedEvents = [];
		if (this.events && this.events.length > 0) {
			this.events.map(x => {
			this.selectedEvents.push(x.value);
			});
			this.mediaWebSocketService.subcribeToEvents(this.selectedEvents);
		}
		} else {
		this.selectedEvents.push(this.selected);
		this.mediaWebSocketService.subcribeToEvents(this.selectedEvents);
		}
	}
  }
}
