import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { MeetingService } from '../../../../shared/services/meeting/meeting.service';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { InviteMeetingComponent } from '../../../.././invite-meeting/invite-meeting.component';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { GlobalValue } from '../../../.././global';
import isElectron from 'is-electron';
import { AccountService } from '../../../../shared/services/account/account.service';
import { XmppChatService } from '../../../../shared/services/xmpp-chat/xmpp-chat.service';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-create-schedule',
  templateUrl: './create-schedule.component.html',
  styleUrls: ['./create-schedule.component.scss']
})
export class CreateScheduleComponent implements OnInit, AfterViewInit {
	
	isElectronRunning = isElectron();
	helper: JwtHelperService;
	authUser;
	addMeetingScheduleModel = {
    meeting_host_url: window.location.origin + '/#/meeting',
    room_id: '',
    created_by: '',
    created_by_name: '',
    users: [],
		meeting_name: '',
		timing: {
			start_time: '',
			end_time: ''
		},
	};
	email;
	startTimePickerUIBind;
	endTimePickerUIBind;
	min_start_time;
	min_end_time;
	date = new Date().toISOString().slice(0, 10);
	dateNow = new Date().toISOString().slice(0, 10);
	private subscriptions: Array<Subscription> = [];
	totalMeetingList: any;
	globalValue: any;
	
	large_meeting :any = {
		isChecked: false
	}
	
	bnEnLanguageCheck: any;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private meetingService: MeetingService,
		public dialogRef: MatDialogRef<CreateScheduleComponent>,
		private dialog: MatDialog,
		@Inject(MAT_DIALOG_DATA) public data: any,
    private accountService: AccountService,
    private xmppService: XmppChatService,
    private spinner: NgxSpinnerService
	) {
		this.globalValue = GlobalValue;
		this.accountService.getLanguage().subscribe((result) => {
			this.bnEnLanguageCheck = result;
		  });

		  if(!!this.data){
			  this.dateNow = this.data
		  }
	}

	ngOnInit(): void {
		
		if(this.isElectronRunning)
		{
			if(!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn')
				this.addMeetingScheduleModel.meeting_host_url = 'https://www.jogajog.com.bd/#/meeting'
			else this.addMeetingScheduleModel.meeting_host_url = 'https://www.jagajag.com/#/meeting'
		}
		this.authUser = JSON.parse(localStorage.getItem('sessionUser'));
		this.addMeetingScheduleModel.meeting_name = this.xmppService.selectedGroup.conference_name;
		if(!!this.addMeetingScheduleModel.meeting_name){
			Object.assign(this.addMeetingScheduleModel, {room_name: this.addMeetingScheduleModel.meeting_name})
		}
    this.email = this.authUser.email;
		
		// this.subscriptions.push(
		// 	this.meetingService.getRoomBoxMeetingScheduleObserver.subscribe((result) => {
		// 		this.totalMeetingList = result;
		// 	})
		// );
	}

	ngAfterViewInit() {
    this.addMeetingScheduleModel.room_id = this.xmppService.selectedGroup.id;
    this.addMeetingScheduleModel.created_by = this.xmppService.selectedGroup.created_by;
    this.addMeetingScheduleModel.created_by_name = this.xmppService.selectedGroup.owner;
    this.addMeetingScheduleModel.users = this.xmppService.selectedGroup.users;
		this.startTimePickerUIBind = this.defaultMeetingStartTime();
		this.endTimePickerUIBind = this.defaultMeetingEndTime();
		console.log(this.addMeetingScheduleModel);

		setTimeout(() => {
			this.min_start_time = new Date().toLocaleTimeString();
			this.min_end_time = new Date().toLocaleTimeString();
		}, 500);
	}

	addBoxMeetingSchedule() {
    if (!this.addMeetingScheduleModel.timing) {
      Swal.fire({
				icon: 'warning',
				text: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? ' প্রয়োজনীয় তথ্য পূরণ করা হয়নি' : 'Required field missing',
      });
      return;
    }
    if (!this.addMeetingScheduleModel.timing.start_time) {
      Swal.fire({
				icon: 'warning',
				text: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? ' প্রয়োজনীয় তথ্য পূরণ করা হয়নি' : 'Required field missing',
      });
      return;
    }
    if (!this.addMeetingScheduleModel.timing.end_time) {
      Swal.fire({
				icon: 'warning',
				text: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? ' প্রয়োজনীয় তথ্য পূরণ করা হয়নি' : 'Required field missing',
      });
      return;
    }
    $('#dashboardSideBar').css('z-index', '0');
		this.spinner.show();
		this.meetingService.addRoomBoxMeetingSchedule(this.addMeetingScheduleModel).subscribe(
			(result) => {
				if (result.status === 'ok') {
          $('#dashboardSideBar').css('z-index', '1000');
          this.spinner.hide();
					this.closeDialog();
          this.clearLoginModel();
          Swal.fire({
            icon: 'success',
            // title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? ' Schedule Added Successfully' : 'Schedule Added Successfully.',
            text:  (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'শিডিউল সফল ভাবে যোগ করা হয়েছে' : 'Schedule Added Successfully.',
          });
          // this.meetingService.getSelectedBoxSchedules(result.result.meeting_id).subscribe();
				}
			},
			(err) => {
        $('#dashboardSideBar').css('z-index', '1000');
        this.spinner.hide();
				console.log(err);
				this.addMeetingErrorHandler(err);
			}
		);
	}

	addMeetingErrorHandler(err) {
		console.log(err);
		if (err.status === 400) {
			Swal.fire({
				icon: 'warning',
				title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? ' প্রয়োজনীয় তথ্য পূরণ করা হয়নি' : 'Required field missing',
				text: err.error.message.en
			});
		} else if (err.status === 404) {
      Swal.fire({
				icon: 'info',
				// title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? ' প্রয়োজনীয় তথ্য পূরণ করা হয়নি' : 'Required field missing',
				text: err.error.message.en
			});
    } else {
			Swal.fire({
				icon: 'warning',
				title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'যান্ত্রিক  গোলযোগের জন্য মিটিং হোস্ট করা যাচ্ছে না' : 'Host meeting error',
				text: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'সার্ভার পাওয়া যায়নি' : 'Server not found'
			});
		}
	}

	closeDialog() {
		this.dialogRef.close();
	}

	clearLoginModel() {
		Object.keys(this.addMeetingScheduleModel).forEach((key) => (this.addMeetingScheduleModel[key] = ''));
	}

	inviteMeetingDialog(data) {
		const iDialog = this.dialog.open(InviteMeetingComponent, {
			disableClose: true,
			data: data,
			minWidth: '750px',
			minHeight: '455px',
		});
	}

	timeSelector(event, src) {
		const meeting_date = !this.data ? this.date : this.data;
		if (src == 'start_time') {
			this.addMeetingScheduleModel.timing.start_time = new Date(`${meeting_date} ${event}`.replace(/-/g, '/')).getTime().toString();
			// this.endTimePickerUIBind = '';
			// this.addMeetingScheduleModel.timing.end_time = '';
			this.defaultMeetingEndTime(this.addMeetingScheduleModel.timing.start_time)
		}
		if (src == 'end_time') {
			this.addMeetingScheduleModel.timing.end_time = new Date(`${meeting_date} ${event}`.replace(/-/g, '/')).getTime().toString();
		}
		console.log(this.addMeetingScheduleModel);
	}

	datePickerEvent(date) {
		// this.date = date  // only html input type
		const covertedDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString().slice(0, 10);
		this.date = covertedDate;

		console.log(this.date);

		// this.min_start_time = '';
		// this.min_end_time = '';

		// this.startTimePickerUIBind = '';
		// this.endTimePickerUIBind = '';

		// this.addMeetingScheduleModel.timing.start_time = '';
		// this.addMeetingScheduleModel.timing.end_time = '';

		if (this.dateNow == covertedDate) {
			// before covertedDate is date (only html input type)
			// this.min_start_time = new Date().toLocaleTimeString();
			// this.startTimePickerUIBind = this.min_start_time;
			// this.min_end_time = new Date().toLocaleTimeString();
			// this.endTimePickerUIBind = this.min_end_time;
		}

		if (this.dateNow !== covertedDate) {
			// before covertedDate is date (only html input type)
			this.min_start_time = '12:00 am';
			// this.startTimePickerUIBind = '12:00 am';
			this.min_end_time = '12:00 am';
			// this.endTimePickerUIBind = '12:00 am';
			console.log(this.startTimePickerUIBind)
			console.log(this.endTimePickerUIBind)
			this.addMeetingScheduleModel.timing.start_time = new Date(`${this.date} ${this.startTimePickerUIBind}`.replace(/-/g, '/')).getTime().toString();
		    this.addMeetingScheduleModel.timing.end_time = new Date(`${this.date} ${this.endTimePickerUIBind}`.replace(/-/g, '/')).getTime().toString();
		}
		// console.log(this.startTimePickerUIBind)
		// console.log(this.endTimePickerUIBind)

		// setTimeout(() => {
		// 	this.startTimePickerUIBind = '';
		// 	this.endTimePickerUIBind = '';
		// }, 50);

		console.log(this.addMeetingScheduleModel);
	}

	defaultMeetingStartTime() {
		const start_time = !this.data ? new Date(): new Date(this.dateNow);
		if(!this.data){
			start_time.setHours(start_time.getHours() + 1);
		}else{
			start_time.setHours(0, 0, 0, 0)
		}
		start_time.setMinutes(0);
		start_time.setSeconds(0);
		this.addMeetingScheduleModel.timing.start_time = start_time.getTime().toString();
		setTimeout(() => {
			return (this.startTimePickerUIBind = start_time.toLocaleTimeString());
		}, 200);

		console.log(start_time.toLocaleTimeString());
	}

	defaultMeetingEndTime(is_start_time?) {
		let end_time
		if (!is_start_time) {
			// calculate by current time
			end_time = !this.data ? new Date() : new Date(this.dateNow);
			if(!this.data){
				end_time.setHours(end_time.getHours() + 1);
			}else{
				end_time.setHours(0, 0, 0, 0);
			}
			end_time.setMinutes(30);
			end_time.setSeconds(0);
		} else {
			// calculate by start time selection
			end_time = new Date(Number(is_start_time))
			end_time.setHours(end_time.getHours() + 1);
		}

		this.addMeetingScheduleModel.timing.end_time = end_time.getTime().toString();
		setTimeout(() => {
			return (this.endTimePickerUIBind = end_time.toLocaleTimeString());
		}, 200);

		console.log(end_time.toLocaleTimeString())
	}

	tokenDecoder(token) {
		// this.tokenDecoder(this.route.snapshot.params.token) (ngOnInit)

		// atob(token.split('.')[1])
		// const groupInfoToken: string = this.route.snapshot.params.token
		// const dToken = this.helper.decodeToken(this.route.snapshot.params.token)
		this.helper = new JwtHelperService();
		const dToken = this.helper.decodeToken(token);
	}
}

// this.removeCharacterFromString(new Date().toLocaleDateString().slice(0, 10)),

// if (this.addMeetingScheduleModel.meeting_host_url == 'http://localhost:4006') {
//   this.addMeetingScheduleModel.meeting_host_url = window.location.origin.concat('/#/meeting')
// } else {
//   this.addMeetingScheduleModel.meeting_host_url = window.location.origin
// }
