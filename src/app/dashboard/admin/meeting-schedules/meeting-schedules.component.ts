import { Component, ChangeDetectionStrategy, ViewChild, TemplateRef, OnInit, AfterViewInit, AfterContentInit, OnDestroy } from '@angular/core';
import { startOfDay, endOfDay, subDays, addDays, endOfMonth, isSameDay, isSameMonth, addHours } from 'date-fns';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent, CalendarView } from 'angular-calendar';
import { MeetingService } from 'src/app/shared/services/meeting/meeting.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { RoomBoxService } from '../../../shared/services/room-box/room-box.service';
import { XmppChatService } from '../../../shared/services/xmpp-chat/xmpp-chat.service';
import { AccountService } from '../../../shared/services/account/account.service';
import { Router } from '@angular/router';

const colors: any = {
	red: {
		primary: 'rgb(245 70 52)',
		secondary: '#FAE3E3'
	},
	blue: {
		primary: '#1e90ff',
		secondary: '#D1E8FF'
	},
	yellow: {
		primary: '#e3bc08',
		secondary: '#FDF1BA'
	}
};

@Component({
	selector: 'app-meeting-schedules',
	templateUrl: './meeting-schedules.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	styleUrls: ['./meeting-schedules.component.scss']
})
export class MeetingSchedulesComponent implements OnInit, AfterViewInit, OnDestroy {
	@ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;

	view: CalendarView = CalendarView.Day;

	isProgress: boolean;

	CalendarView = CalendarView;

	viewDate: Date = new Date();

	isScheduleFound: boolean;

	isProcessed: boolean;

	modalData: {
		action: string;
		event: CalendarEvent;
	};

	refresh: Subject<any> = new Subject();

	events: CalendarEvent[] = [];

	activeDayIsOpen = false;
	constructor(private modal: NgbModal, private meetingService: MeetingService,
		private spinner: NgxSpinnerService,
		private roomBoxServices: RoomBoxService,
		private chatService: XmppChatService,
		private router: Router,
		private accountService: AccountService) {
		this.isProgress = true;
		this.isScheduleFound = false;
		this.isProcessed = false;
	}
	ngAfterViewInit(): void {
		$('.cal-header').css('background-image', 'linear-gradient(to bottom, #f5cf1f, #f49823)');
		$('.cal-header').css('color', 'white');
		$('.cal-header').css('font-weight', '400');
		// $('.cal-past:hover').css('opacity', '1');
		// $('.cal-past:hover').css('box-shadow', 'none');
	}

	ngOnInit(): void {

		this.getMeetingScheduleByTime()
		// this._loadMettingSchedules();
		this._loadRoomBoxMettingSchedules();

		this.meetingService.getRoomBoxMeetingScheduleObserver.subscribe(x => {
			if (x && x.result) {
				this._loadRoomBoxMettingSchedules();
			}
		});

		if (!this.isScheduleFound && this.isProcessed) {
			Swal.fire({
				title: 'No Schedule(s) Found!'
			});
		}
	}

	ngOnDestroy() {
		this.meetingService.getUpcomingMeetingList$.next([]);
	}

	_loadMettingSchedules() {
		this.spinner.show();
		const days = '10';
		this.meetingService.getUpcomingMeetingInfoForMe(days).subscribe(
			(result) => {
				this.isProcessed = true;
				if (result.status === 'ok') {
					this.spinner.hide();
					if (result.result.upcomings_host.length > 0) {
						this.isScheduleFound = true;
						result.result.upcomings_guest.map((x) => {
							const startT = new Date(parseInt(x.timing.start_time));
							const endT = new Date(parseInt(x.timing.end_time));
							this.events.push({
								start: startT,
								end: endT,
								title: x.meeting_name + ' [Invited]',
								host: x.owner.host_name,
								time_span: 'from ' + startT.toLocaleString() + ' to ' + endT.toLocaleString(),
								meeting_url: x.meeting_url,
								meeting_password: x.meeting_password,
								meeting_code: x.meeting_code,
								meeting_duration: x.timing.total_duration,
								color: colors.yellow,
								cssClass: 'm-invited-class'
								// actions: this.actions,
							});
						});
						// $('.cal-cell-top').click();
						$('#calToday').click();
						this.isProgress = false;
					}

					if (result.result.upcomings_host.length > 0) {
						this.isScheduleFound = true;
						result.result.upcomings_host.map((x) => {
							const startT = new Date(parseInt(x.timing.start_time));
							const endT = new Date(parseInt(x.timing.end_time));
							this.events.push({
								start: startT,
								end: endT,
								title: x.meeting_name,
								host: x.owner.host_name,
								time_span: 'from ' + startT.toLocaleString() + ' to ' + endT.toLocaleString(),
								meeting_url: x.meeting_url,
								meeting_password: x.meeting_password,
								meeting_code: x.meeting_code,
								meeting_duration: x.timing.total_duration,
								color: colors.yellow
								// actions: this.actions,
							});
						});
						// $('.cal-cell-top').click();
						this.isProgress = false;
					} else {
						this.isScheduleFound = false;
						// Swal.fire({
						// 	title: 'No Meeting Schedule(s) Found!'
						// });
					}
				}
			},
			(err) => {
				this.isProcessed = true;
				console.log('error upcoming meeting', err);
				Swal.fire({
					title: 'Something Went Wrong!'
				});
				this.spinner.hide();
			}
		);
	}

	_loadRoomBoxMettingSchedules() {
		this.events = [];
		$('#dashboardSideBar').css('z-index', '0');
		this.spinner.show();
		this.meetingService.getAllRoomBoxSchedules().subscribe(
			(result) => {
				this.isProcessed = true;
				if (result.status === 'ok') {
					$('#dashboardSideBar').css('z-index', '1000');
					this.spinner.hide();
					if (result.resultset.length > 0) {
						this.isScheduleFound = true;
						result.resultset.map((x) => {
							x.tags = 'room_meeting';
							const hostedBy = x.creted_by === this.accountService.currentUser.id ? 'You' : x.created_by_name;
							const startT = new Date(parseInt(x.start_time));
							const endT = new Date(parseInt(x.end_time));
							this.events.push({
								start: startT,
								end: endT,
								// title: x.meeting_name + ' [Creator: ' + hostedBy + ']',
								title: x.meeting_name + ' [Room]',
								host: x.owner.host_name,
								time_span: 'from ' + startT.toLocaleString() + ' to ' + endT.toLocaleString(),
								meeting_duration: x.total_duration,
								color: colors.red,
								cssClass: 'm-invited-class',
								meetingInfo: x
								// actions: this.actions,
							});
						});
						// $('.cal-cell-top').click();
						$('#calToday').click();
						this.isProgress = false;
					} else {
						this.isScheduleFound = false;
						// Swal.fire({
						// 	title: 'No Schedule(s) Found!'
						// });
					}
				}
			},
			(err) => {
				this.isProcessed = true;
				Swal.fire({
					title: 'Something Went Wrong!'
				});
				$('#dashboardSideBar').css('z-index', '1000');
				this.spinner.hide();
			}
		);
	}

	dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
		if (isSameMonth(date, this.viewDate)) {
			if ((isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) || events.length === 0) {
				this.activeDayIsOpen = false;
			} else {
				this.activeDayIsOpen = true;
			}
			this.viewDate = date;
		}
	}

	handleEvent(action: string, event: CalendarEvent): void {
		this.modalData = { event, action };
		this.modal.open(this.modalContent, { size: 'lg' });
	}

	setView(view: CalendarView) {
		if (view === 'month' || view === 'week') {
			$('#calToday').html((!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'বর্তমান' : 'Current');
		} else {
			$('#calToday').html((!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'আজ' : 'Today');
		}
		this.view = view;

		// var x = this.calenderMeetingHandler(this.viewDate, this.view)
		// if (!!x) {
		// 	this.getMeetingInfoForMeByTime(x)
		// }

	}

	closeOpenMonthViewDay() {
		this.activeDayIsOpen = false;

		// var x = this.calenderMeetingHandler(this.viewDate, this.view)
		// if (!!x) {
		// 	this.getMeetingInfoForMeByTime(x)
		// }
	}

	joinRoomBoxMeeting(mInfo) {
		mInfo.isRequiredRegistration = '0';
		mInfo.is_private = '0';
		mInfo.is_req_password = '0';
		mInfo.meeting_name = mInfo.meeting_name;
		mInfo.timing = { 'start_time': '', 'end_time': '', 'total_duration': '' };
		mInfo.timing.start_time = mInfo.start_time;
		mInfo.timing.end_time = mInfo.start_time;
		mInfo.timing.total_duration = mInfo.total_duration;
		// mInfo.base_meeting_id = mInfo.meeting_id;
		mInfo.id = mInfo.id;
		mInfo.meeting_id = mInfo.meeting_id;
		mInfo.meeting_code = Math.floor(1000000000000 + Math.random() * 9000000000000);
		mInfo.tag = 'room-box-meeting';
		mInfo.advance_options = [{ allow_share_screen: 'Everyone' }];
		// 
		mInfo.redirectTo = 'global_schedule',
			localStorage.setItem('meetingInfo_current', JSON.stringify(mInfo));
		this.meetingService.getMeetingInfo$.next(mInfo);
		this.router.navigate(['/meeting/room-box' + '/' + mInfo.is_req_password + '/'
			+ mInfo.isRequiredRegistration]).then(function () {

			});
	}

	monthHandler(viewDate) {
		var date = new Date(viewDate);
		var monthFirstDay = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
		var monthLastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).setHours(23, 59, 59, 999);
		// console.log('month', monthFirstDay, monthLastDay)
		return { from: monthFirstDay, to: monthLastDay, type: 'month' }
	}

	weekHandler(viewDate) {
		var curr = new Date(viewDate);
		let day = curr.getDay();
		let weekFirstDay = new Date(curr.getTime() - 60 * 60 * 24 * day * 1000);
		let weekLastDay = new Date(weekFirstDay.getTime() + 60 * 60 * 24 * 6 * 1000);
		// console.log('week', weekFirstDay.setHours(0, 0, 0, 0), weekLastDay.setHours(23, 59, 59, 999))
		return { from: weekFirstDay.setHours(0, 0, 0, 0), to: weekLastDay.setHours(23, 59, 59, 999), type: 'week' }
	}

	dayHandler(viewDate) {
		var date = new Date(viewDate);
		var dayStart = new Date(date).setHours(0, 0, 0, 0);
		var dayEnd = new Date(date).setHours(23, 59, 59, 999);
		// console.log('day', dayStart, dayEnd)
		return { from: dayStart, to: dayEnd, type: 'day' }
	}

	calenderMeetingHandler(viewDate, view) {
		if (view === 'month') {
			return this.monthHandler(viewDate)
		} else if (view === 'week') {
			return this.weekHandler(viewDate)
		} else {
			return this.dayHandler(viewDate)
		}
	}

	getMeetingInfoForMeByTime(time) {
		// this.events = []
		this.spinner.show();
		this.meetingService.getMeetingInfoForMeByTime(time).subscribe((result) => {
			if (result) {
				this.isProcessed = true;
				if (result.status === 'ok') {
					this.spinner.hide();
					if (result.result.upcomings_host.length > 0) {
						this.isScheduleFound = true;
						result.result.upcomings_guest.map((x) => {
							const startT = new Date(parseInt(x.timing.start_time));
							const endT = new Date(parseInt(x.timing.end_time));
							this.events.push({
								start: startT,
								end: endT,
								title: x.meeting_name + ' [Invited]',
								host: x.owner.host_name,
								time_span: 'from ' + startT.toLocaleString() + ' to ' + endT.toLocaleString(),
								meeting_url: x.meeting_url,
								meeting_password: x.meeting_password,
								meeting_code: x.meeting_code,
								meeting_duration: x.timing.total_duration,
								color: colors.yellow,
								cssClass: 'm-invited-class'
								// actions: this.actions,
							});
						});
						// $('.cal-cell-top').click();
						$('#calToday').click();
						this.isProgress = false;
					}

					if (result.result.upcomings_host.length > 0) {
						this.isScheduleFound = true;
						result.result.upcomings_host.map((x) => {
							const startT = new Date(parseInt(x.timing.start_time));
							const endT = new Date(parseInt(x.timing.end_time));
							this.events.push({
								start: startT,
								end: endT,
								title: x.meeting_name,
								host: x.owner.host_name,
								time_span: 'from ' + startT.toLocaleString() + ' to ' + endT.toLocaleString(),
								meeting_url: x.meeting_url,
								meeting_password: x.meeting_password,
								meeting_code: x.meeting_code,
								meeting_duration: x.timing.total_duration,
								color: colors.yellow
								// actions: this.actions,
							});
						});
						// $('.cal-cell-top').click();
						this.isProgress = false;
					} else {
						this.isScheduleFound = false;
						// Swal.fire({
						// 	title: 'No Meeting Schedule(s) Found!'
						// });
					}
				}
			}
		}, err => {
			console.log(err)
		})
		console.log(this.events)
	}

	getMeetingScheduleByTime() {
		var d1 = new Date();
		d1.setMonth(0);
		var d2 = new Date();
		d2.setMonth(11);
		this.getMeetingInfoForMeByTime({ from: new Date(d1.getFullYear(), d1.getMonth(), 1).getTime(), to: new Date(d2.getFullYear(), d2.getMonth() + 1, 0).setHours(23, 59, 59, 999) })
	}
}
