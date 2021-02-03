import { Component, ChangeDetectionStrategy, ViewChild, TemplateRef, OnInit, AfterViewInit, AfterContentInit, OnDestroy} from '@angular/core';
import { startOfDay, endOfDay, subDays, addDays, endOfMonth, isSameDay, isSameMonth, addHours } from 'date-fns';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent, CalendarView } from 'angular-calendar';
import { MeetingService } from 'src/app/shared/services/meeting/meeting.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { RoomBoxService } from '../../../shared/services/room-box/room-box.service';
import { XmppChatService } from '../../../shared/services/xmpp-chat/xmpp-chat.service';
import { AccountService } from '../../../shared/services/account/account.service';
import { CreateScheduleComponent } from './create-schedule/create-schedule.component';
import { MonthViewDay } from 'calendar-utils';

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
  selector: 'app-room-box-meeting-schedules',
  templateUrl: './meeting-schedules.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./meeting-schedules.component.scss']
})
export class RoomBoxMeetingSchedulesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;

  view: CalendarView = CalendarView.Month;

  isProgress: boolean;

  CalendarView = CalendarView;

  viewDate: Date = new Date();

  modalData: {
	action: string;
	event: CalendarEvent;
  };

  refresh: Subject<any> = new Subject();

  events: CalendarEvent[] = [];

  activeDayIsOpen = false;
	bnEnLanguageCheck: any;
  constructor(private router: Router, private modal: NgbModal, private meetingService: MeetingService,
	private spinner: NgxSpinnerService, private roomBoxServices: RoomBoxService,
	private dialog: MatDialog,
	private chatService: XmppChatService,
	private accountService: AccountService) {
	this.isProgress = true;
  }
  ngAfterViewInit(): void {
	$('.cal-header').css('background-image', 'linear-gradient(to bottom, #f5cf1f, #f49823)');
	$('.cal-header').css('color', 'white');
	$('.cal-header').css('font-weight', '400');
	// $('.cal-past:hover').css('opacity', '1');
	// $('.cal-past:hover').css('box-shadow', 'none');
  }

  ngOnInit(): void {
	setTimeout(() => {
		this._loadMettingSchedules();
	}, 1000);
	this.meetingService.getRoomBoxMeetingScheduleObserver.subscribe(x => {
		if (x && x.result) {
			this._loadMettingSchedules();
		}
	});
  this.changeEnBnLang()
  }
changeEnBnLang(){     
	this.accountService.getLanguage().subscribe((result) => {
		this.bnEnLanguageCheck = result;
		// console.log('lllll',result)
		if(!!result){
			this._loadMettingSchedules()
		}
	});
}

  ngOnDestroy() {
	this.meetingService.getRoomBoxMeetingSchedule$.next([]);
	this.roomBoxServices.isRoomScheduleSelected$.next(false);
  }
  _loadMettingSchedules() {
	this.events = [];
	$('#dashboardSideBar').css('z-index', '0');
	this.spinner.show();
	const meetId = this.chatService.selectedGroup.meeting_id ? this.chatService.selectedGroup.meeting_id : this.chatService.selectedGroup.id;
	this.meetingService.getSelectedBoxSchedules(meetId).subscribe(
		(result) => {
		if (result.status === 'ok') {
			$('#dashboardSideBar').css('z-index', '1000');
			this.spinner.hide();
			if (result.resultset.length > 0) {
			result.resultset.map((x) => {
				// const hostedBy = x.creted_by === this.accountService.currentUser.id ? 'You' : x.created_by_name;
				const hostedBy = x.owner.host_name;
				const startT = new Date(parseInt(x.start_time));
				const endT = new Date(parseInt(x.end_time));
				this.events.push({
				start: startT,
				end: endT,
				title:(!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'রুম: '+ x.meeting_name + ' [ আয়োজক: ' + hostedBy + ' ]' :'Room: '+  x.meeting_name + ' [ Host: ' + hostedBy + ' ]',
				newTitle: x.meeting_name,
				host: x.owner.host_name,
				time_span:(!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ?  startT.toLocaleString() + ' হতে ' + endT.toLocaleString() + ' পর্যন্ত ' : 'from ' + startT.toLocaleString() + ' to ' + endT.toLocaleString(),
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
			}
			//  else {
			// Swal.fire({
			// 	title:  (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'এই রুমে কোন পূর্বনির্ধারিত মিটিং নেই' : 'No meetings scheduled for this room'
			// });
			// }
		}
		},
		(err) => {
		Swal.fire({
			title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'কিছু ভুল হয়েছে!' : 'Something Went Wrong!',
		});
		$('#dashboardSideBar').css('z-index', '1000');
		this.spinner.hide();
		}
	);
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
	// if (events.length > 0) {
	// 	events.forEach (x => {
	// 		x.title = x.title + x.start.toLocaleString();
	// 	});
	// }
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
  }

  closeOpenMonthViewDay() {
	this.activeDayIsOpen = false;
  }

  backToRoomDetails() {
	  this.roomBoxServices.isRoomScheduleSelected$.next(false);
}

hostMeetingDialog(date?) {
	const lDialog = this.dialog.open(CreateScheduleComponent, {
		disableClose: true,
		panelClass: 'hostMeetingDialog',
		width: '50%',
		data: date
	});
}

joinRoomBoxMeeting(mInfo) {
	mInfo.isRequiredRegistration = '0';
	mInfo.is_private = '0';
	mInfo.is_req_password = '0';
	mInfo.meeting_name = mInfo.meeting_name;
	mInfo.timing = {'start_time' : '', 'end_time': '', 'total_duration' : ''};
	mInfo.timing.start_time = mInfo.start_time;
	mInfo.timing.end_time = mInfo.start_time;
	mInfo.timing.total_duration = mInfo.total_duration;
	// mInfo.base_meeting_id = mInfo.meeting_id;
	mInfo.id = mInfo.id;
	mInfo.meeting_id = mInfo.meeting_id;
	mInfo.meeting_code = Math.floor(1000000000000 + Math.random() * 9000000000000);
	mInfo.tag = 'room-box-meeting';
	mInfo.advance_options = [{allow_share_screen: 'Everyone'}];
	// 
	mInfo.redirectTo = 'box_schedule',
	localStorage.setItem('meetingInfo_current', JSON.stringify(mInfo));
	this.meetingService.getMeetingInfo$.next(mInfo);
	this.router.navigate(['/meeting/room-box' + '/' + mInfo.is_req_password + '/'
	+ mInfo.isRequiredRegistration]).then(function() {

	});
}

doubleClick(day: MonthViewDay) {
	if((new Date(day.date).setHours(0, 0, 0, 0)) < (new Date().setHours(0, 0, 0, 0))){
		return
	}
	this.hostMeetingDialog(new Date(Date.UTC(day.date.getFullYear(), day.date.getMonth(), day.date.getDate())).toISOString().slice(0, 10))
  }

}
