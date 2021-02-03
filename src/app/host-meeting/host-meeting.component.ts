import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { MeetingService } from '../shared/services/meeting/meeting.service';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { InviteMeetingComponent } from '../invite-meeting/invite-meeting.component';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { GlobalValue } from '../global';
import isElectron from "is-electron";
import { AccountService } from '../shared/services/account/account.service';


@Component({
	selector: 'app-host-meeting',
	templateUrl: './host-meeting.component.html',
	styleUrls: []
})
export class HostMeetingComponent implements OnInit, AfterViewInit {
	
	isElectronRunning = isElectron();
	helper: JwtHelperService;
	authUser;
	addMeetingModel = {
		meeting_host_url: window.location.origin + '/#/meeting',
		meeting_name: '',
		is_req_password: '1',
		meeting_password: '',
		timing: {
			start_time: '',
			end_time: ''
		},
		advance_options: [{ allow_share_screen: 'Everyone' }],
		is_private: '0',
		isRequiredRegistration: '1',
		auto_recording: false
	}
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
	};
	
	bnEnLanguageCheck: any;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private meetingService: MeetingService,
		public dialogRef: MatDialogRef<HostMeetingComponent>,
		private dialog: MatDialog,
		private accountService: AccountService
	) {
		this.globalValue = GlobalValue;
		this.accountService.getLanguage().subscribe((result) => {
			this.bnEnLanguageCheck = result;
		  });
	}

	ngOnInit(): void {
		
		if(this.isElectronRunning)
		{
			if(!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn')
				this.addMeetingModel.meeting_host_url = 'https://www.jogajog.com.bd/#/meeting'
			else this.addMeetingModel.meeting_host_url = 'https://www.jagajag.com/#/meeting'
		}
		this.authUser = JSON.parse(localStorage.getItem('sessionUser'));
		this.addMeetingModel.meeting_name = `${this.authUser.user_name} Meeting`;
		this.email = this.authUser.email;
		this.addMeetingModel.meeting_password =
			this.authUser.user_name + this.removeCharacterFromString(new Date().toLocaleDateString().slice(0, 10));

		this.subscriptions.push(
			this.meetingService.getUpcomingMeetingListCast.subscribe((result) => {
				this.totalMeetingList = result;
			})
		);
	}

	ngAfterViewInit() {
		this.startTimePickerUIBind = this.defaultMeetingStartTime();
		this.endTimePickerUIBind = this.defaultMeetingEndTime();
		console.log(this.addMeetingModel);

		setTimeout(() => {
			this.min_start_time = new Date().toLocaleTimeString();
			this.min_end_time = new Date().toLocaleTimeString();
		}, 500);
	}

	addMeeting() {
		this.meetingService.addMeeting(this.addMeetingModel).subscribe(
			(result) => {
				if (result.status == 'ok') {
					console.log(result);
					this.closeDialog();
					this.clearLoginModel();
					// this.totalMeetingList.push(result.result);
					// this.totalMeetingList = this.totalMeetingList.sort((a, b) => (a.timing.start_time > b.timing.start_time ? 1 : -1));
					this.inviteMeetingDialog(result.result);
					// this.meetingService.getUpcomingMeetingList$.next(this.totalMeetingList);
					this.meetingService.getUpcomingMeetingInfoForMe('10').subscribe();
				}
			},
			(err) => {
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
		Object.keys(this.addMeetingModel).forEach((key) => (this.addMeetingModel[key] = ''));
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
		const meeting_date = this.date;
		if (src == 'start_time') {
			this.addMeetingModel.timing.start_time = new Date(`${meeting_date} ${event}`.replace(/-/g, '/')).getTime().toString();
			// this.endTimePickerUIBind = '';
			// this.addMeetingModel.timing.end_time = '';
			this.defaultMeetingEndTime(this.addMeetingModel.timing.start_time)
		}
		if (src == 'end_time') {
			this.addMeetingModel.timing.end_time = new Date(`${meeting_date} ${event}`.replace(/-/g, '/')).getTime().toString();
		}
		console.log(this.addMeetingModel);
	}

	datePickerEvent(date) {
		// this.date = date  // only html input type
		const covertedDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString().slice(0, 10);
		this.date = covertedDate;

		console.log(this.date);

		this.min_start_time = '';
		this.min_end_time = '';

		this.startTimePickerUIBind = '';
		this.endTimePickerUIBind = '';

		this.addMeetingModel.timing.start_time = '';
		this.addMeetingModel.timing.end_time = '';

		if (this.dateNow == covertedDate) {
			// before covertedDate is date (only html input type)
			this.min_start_time = new Date().toLocaleTimeString();
			this.startTimePickerUIBind = this.min_start_time;
			this.min_end_time = new Date().toLocaleTimeString();
			this.endTimePickerUIBind = this.min_end_time;
		}

		if (this.dateNow !== covertedDate) {
			// before covertedDate is date (only html input type)
			this.min_start_time = '12:00 am';
			this.startTimePickerUIBind = '12:00 am';
			this.min_end_time = '12:00 am';
			this.endTimePickerUIBind = '12:00 am';
		}

		setTimeout(() => {
			this.startTimePickerUIBind = '';
			this.endTimePickerUIBind = '';
		}, 50);

		console.log(this.addMeetingModel);
	}

	passwordCheckBoxChanger(is_checked) {
		if (is_checked) {
			this.addMeetingModel.is_req_password = '1';
			this.addMeetingModel.meeting_password =
				this.authUser.user_name + this.removeCharacterFromString(new Date().toLocaleDateString().slice(0, 10));
		} else {
			this.addMeetingModel.is_req_password = '0';
			this.addMeetingModel.meeting_password = null;
		}
	}

	registrationRequiredCheckBoxChanger(is_checked) {
		if (is_checked) {
			this.addMeetingModel.isRequiredRegistration = '1';
		} else {
			this.addMeetingModel.isRequiredRegistration = '0';
		}
	}
	largeMeetingCheckBoxChanger(is_checked) {
		let title , ok , cancel;
		if(GlobalValue.currentBuild =='en'){
			 title = 'This meeting will start in Push-to-Video Mode, where you will have to push the video button to talk and maximum 2 people can talk at the same time. This will optimize the bandwidth used in your meeting.';
			ok = 'Ok';
			cancel = 'Cancel'
		} else if(GlobalValue.currentBuild =='bn' && this.bnEnLanguageCheck =='en') {
			title = 'This meeting will start in Push-to-Video Mode, where you will have to push the video button to talk and maximum 2 people can talk at the same time. This will optimize the bandwidth used in your meeting.';
			ok = 'Ok';
			cancel = 'Cancel'
		} else {
			title ="এই মিটিং টি পুশ টু ভিডিও মুড এ চালু হবে যেখানে আপনাকে ভিডিও বাটনটি চাপ দিয়ে কথা বলতে হবে এবং সর্বোচ্চ দুই জন একসাথে কথা বলতে পারবে। এটা আপনার মিটিং এর ব্যান্ডউইথ এর জন্য সাশ্রয়ী হবে।";
			ok = 'ঠিক আছে';
			cancel = 'বাতিল করুন'
		}

		if (is_checked) {
			Swal.fire({
				// icon: 'info',
				title: title,
				icon: 'warning',
				showCancelButton: true,
				confirmButtonColor: "#3085d6",
				cancelButtonColor: "#d33",
				confirmButtonText: ok,
				cancelButtonText: cancel,

			}).then(result => {
				if (!result.value) {
					this.large_meeting.isChecked = false
				}//if
			});
		} else {

		}
	}	
	privateMeetingCheckBoxChanger(is_checked) {
		if (is_checked) {
			this.addMeetingModel.is_private = '1';

			let ele = document.getElementById('registration_required') as HTMLInputElement
			ele.checked = true
			ele.disabled = true
		} else {
			this.addMeetingModel.is_private = '0';

			let ele = document.getElementById('registration_required') as HTMLInputElement
			ele.disabled = false
		}
	}
	removeCharacterFromString(str) {
		return str.split('/').join('');
	}

	defaultMeetingStartTime() {
		const start_time = new Date();
		start_time.setHours(start_time.getHours() + 1);

		start_time.setMinutes(0);
		start_time.setSeconds(0);
		this.addMeetingModel.timing.start_time = start_time.getTime().toString();
		setTimeout(() => {
			return (this.startTimePickerUIBind = start_time.toLocaleTimeString());
		}, 200);

		console.log(start_time.toLocaleTimeString());
	}

	defaultMeetingEndTime(is_start_time?) {
		let end_time
		if (!is_start_time) {
			// calculate by current time
			end_time = new Date();
			end_time.setHours(end_time.getHours() + 1);
			end_time.setMinutes(30);
			end_time.setSeconds(0);
		} else {
			// calculate by start time selection
			end_time = new Date(Number(is_start_time))
			end_time.setHours(end_time.getHours() + 1);
		}

		this.addMeetingModel.timing.end_time = end_time.getTime().toString();
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

// if (this.addMeetingModel.meeting_host_url == 'http://localhost:4006') {
//   this.addMeetingModel.meeting_host_url = window.location.origin.concat('/#/meeting')
// } else {
//   this.addMeetingModel.meeting_host_url = window.location.origin
// }
