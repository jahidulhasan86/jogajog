import { Component, OnInit, OnDestroy, NgZone, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from 'src/app/shared/services/account/account.service';
import { MatDialog } from '@angular/material/dialog';
import { HostMeetingComponent } from 'src/app/host-meeting/host-meeting.component';
import { MeetingInfoComponent } from 'src/app/meeting-info/meeting-info.component';
import Swal from 'sweetalert2';
import { MeetingService } from 'src/app/shared/services/meeting/meeting.service';
import { Subscription } from 'rxjs';
import { InviteMeetingComponent } from 'src/app/invite-meeting/invite-meeting.component';
import { MultiCompanyComponent } from 'src/app/shared/components/multi-company/multi-company.component';
import { MultiCompanyService } from 'src/app/shared/services/multi-company/multi-company.service';
import { GlobalValue } from '../../global';

@Component({
	selector: 'app-dashboard-home',
	templateUrl: './dashboard-home.component.html',
	styleUrls: ['./dashboard-home.component.scss']
})
export class DashboardHomeComponent implements OnInit, OnDestroy {
	isUserLoggedIn: boolean;
	totalMeetingList: any[] = [];
	private subscriptions: Array<Subscription> = [];
	fullyear: number;
	companies = [];
	hostedBackground: any;
	invitedBackground: any;
	hostedByBackground: any;
	invitedByBackground: any;
	classBack: any;
	globalValue: any;
	bnEnLanguageCheck: any;
	company_information = {
		company_name: '',
		logo: '',
		id: undefined
	}
	@Output() company_switch = new EventEmitter<any>();
	isSharedRoomShow: boolean;

	constructor(
		private router: Router,
		private _ngZone: NgZone,

		private accountService: AccountService,
		private dialog: MatDialog,
		public meetingService: MeetingService,
		private multicompanyService: MultiCompanyService
	) {
		this.globalValue = GlobalValue;
	}
	SlideOptions = {
		items: 3,
		loop: true,
		autoplay: false,
		lazyLoad: true,
		merge: true,
		video: true,
		responsive: {
			0: {
				items: 1
			},
			600: {
				items: 2
			}
		}
	};
	serviceOptions = {
		items: 3,
		loop: false,
		autoplay: false,
		lazyLoad: true,
		merge: true,
		dots: true,
		margin: 50,
		navSpeed: 700,
		navText: ['Previous', 'Next'],
		responsive: {
			0: {
				items: 1
			},
			600: {
				items: 3
			}
		}
	};

	ngOnInit(): void {
		this.totalMeetingList = [];
		this.hostedBackground = '../../../assets/images/dashboard/rectangle_hosted.png';
		this.invitedBackground = '../../../assets/images/dashboard/Rectangle.png';
		this.hostedByBackground = '../../../assets/images/dashboard/hosted_by.png';
		this.invitedByBackground = '../../../assets/images/dashboard/invited_by.png';
		this.classBack = '../../../assets/images/dashboard/pexels-photo-416320_2.png';
		this.fullyear = new Date().getFullYear();
		this.getUpcommingMeetingList();
		this.subscriptions.push(
			this.accountService.userLoginChecker().subscribe((result) => {
				this.isUserLoggedIn = result;
			})
		);

		this.subscriptions.push(
			this.meetingService.getUpcomingMeetingListCast.subscribe((result) => {
				this.totalMeetingList = result;
			})
		);

		this.accountService.getLanguage().subscribe((result) => {
			this.bnEnLanguageCheck = result;
		})

		this.multicompanyService.getCompanyInformation().subscribe((result) => {
			if (!!result) {
				this.company_information.company_name = result.company_name
				this.company_information.logo = result.logo
				this.sharedRoomHandler(result)
			}
		})

		this.multicompanyService.companiesCast.subscribe((result) => {
			if (!!result) this.companies = result
		})
	}

	ngOnDestroy() {
		this.subscriptions.forEach((subscription: Subscription) => {
			subscription.unsubscribe();
		});
		this.meetingService.getUpcomingMeetingList$.next([]);
	}

	public joinMeeting(meeting?) {
		let _url;
		if (meeting) {
			const meetingUrl = meeting.meeting_url.split('#')[1];
			// this.router.navigate([res[1]]);
			// window.location.href = window.location.origin + '#' + meetingUrl;
			// window.location.reload();
			_url = meetingUrl;
		} else {
			// window.location.href = window.location.origin + '#/meeting';
			// window.location.reload();
			_url = '/meeting';
		}
		this._ngZone.run(() => {
			this.router.navigate([_url]);
		});
	}

	hostMeetingDialog() {
		const lDialog = this.dialog.open(HostMeetingComponent, {
			disableClose: true,
			panelClass: 'hostMeetingDialog',
			width: '50%'
		});
	}

	public permanentRooms(hasAccess) {
		if (hasAccess) {
			this.router.navigate(['./dashboard/room-box']);
		} else {
			Swal.fire({
				title:
					!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
						? 'এটি একটি প্রিমিয়াম ফিচার|বিস্তারিত তথ্যের জন্য আমাদের সাথে যোগাযোগ করুন|'
						: 'This is a premimum feature. Please contact us for details.',
				showConfirmButton: false
			});
		}
	}

	public companyAccounts() {
		Swal.fire({
			title:
				!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
					? 'কোম্পানি মিটিং ফিচারের মাধ্যমে আপনি আপনার সহকর্মীদের সাথে নিরাপদ এবং ব্যক্তিগত মিটিং এর সুবিধা পাবেন|এই ফিচারটি চালু করতে চাইলে আমাদের সাথে যোগাযোগ করুন|'
					: 'You have not been assigned to a company. Please contact us to sign up a company.',
			showConfirmButton: false
		});
	}

	public getUpcommingMeetingList() {
		const days = '10';
		this.meetingService.getUpcomingMeetingInfoForMe(days).subscribe(
			(result) => {
				if (result.status === 'ok') {
					console.log(result);
				}
			},
			(err) => {
				console.log(err);
				this.meetingService.getUpcomingMeetingList$.next([]);
			}
		);
	}

	public showMeetingInfo(meetinginfo) {
		const meetingInfoDialog = this.dialog.open(MeetingInfoComponent, {
			disableClose: false,
			panelClass: 'meetingInfoDialog',
			width: '50%',
			data: {
				meetingInfo: meetinginfo
			}
		});
	}

	public inviteMeetingDialog(data) {
		const iDialog = this.dialog.open(InviteMeetingComponent, {
			disableClose: true,
			data: data,
			minWidth: '750px',
			minHeight: '455px',
		});
	}

	mulitCompanyDialog() {
		this.dialog.open(MultiCompanyComponent, {
			disableClose: true,
			data: this.companies
		});
	}

	private sharedRoomHandler(result) {
		if (result.id == '78430815-ddfc-415e-9c5c-d10185da8d77' || result.id == '5e146eab-3d84-421b-8748-e0563daf5c24')
			this.isSharedRoomShow = false
		else this.isSharedRoomShow = true
	}
}
