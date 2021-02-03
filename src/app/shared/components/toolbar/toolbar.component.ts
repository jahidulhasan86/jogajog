/*

 * Copyright (c) 2004-2020 by Protect Together, Inc.

 * All Rights Reserved

 * Protect Together Confidential

 */
import { Component, OnInit, Input, EventEmitter, Output, HostListener, OnDestroy } from '@angular/core';
import { UtilsService } from '../../services/utils/utils.service';
import { VideoFullscreenIcon } from '../../types/icon-type';
import { OvSettingsModel } from '../../models/ovSettings';
import { ChatService } from '../../services/chat/chat.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { MeetingService } from '../../services/meeting/meeting.service';
import { GlobalService } from '../../services/global/global.service';
import { GlobalValue } from 'src/app/global';
import { MatDialog } from '@angular/material/dialog';
import { MeetingInfoComponent } from '../../../meeting-info/meeting-info.component';
import { BfcpFloorService } from '../../services/bfcp-floor/bfcp-floor.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UserModel } from '../../models/user-model';
import { MeetingReminderComponent } from '../meeting-reminder/meeting-reminder.component';
@Component({
	selector: 'app-toolbar',
	templateUrl: './toolbar.component.html',
	styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit, OnDestroy {
	@Input() lightTheme: boolean;
	@Input() mySessionId: boolean;
	@Input() compact: boolean;
	@Input() showNotification: boolean;
	@Input() ovSettings: OvSettingsModel;
	@Input() isWebcamVideoEnabled: boolean;
	@Input() isWebcamAudioEnabled: boolean;
	@Input() isScreenEnabled: boolean;
	@Input() isAutoLayout: boolean;
	@Input() isConnectionLost: boolean;
	@Input() hasVideoDevices: boolean;
	@Input() hasAudioDevices: boolean;
	@Input() isUpdateConferenceTypeRequest: boolean;
	@Output() micButtonClicked = new EventEmitter<any>();
	@Output() camButtonClicked = new EventEmitter<any>();
	@Output() screenShareClicked = new EventEmitter<any>();
	@Output() layoutButtonClicked = new EventEmitter<any>();
	@Output() leaveSessionButtonClicked = new EventEmitter<any>();
	@Output() xamppChat = new EventEmitter<any>();
	@Output() changeConferenceTypeClick = new EventEmitter<any>();
	@Output() countDownTimer = new EventEmitter<any>();
	newMessagesNum: number;
	private chatServiceSubscription: Subscription;
	fullscreenIcon = VideoFullscreenIcon.BIG;
	participantsNames: string[] = [];
	meetingName: any;
	meetingCode: any;
	isPopedout: boolean;
	globalValue: any;
	private subscriptions: Array<Subscription> = [];
	private isCallModePtvCastSubs: Subscription;
	isCallModePtv: boolean;
	isMeetingHost: boolean;
	authUser: any;
	isCallInitiator: boolean;
	lUser: UserModel[];
	rUser: UserModel[];
	@Input()
	set localuser(localusers: UserModel[]) {
		this.lUser = localusers
	}
	@Input()
	set participants(participants: UserModel[]) {
		this.rUser = participants
	}
	constructor(
		private utilsSrv: UtilsService,
		private chatService: ChatService,
		private meetingService: MeetingService,
		public globalService: GlobalService,
		public dialog: MatDialog,
		public bfcpFloorService: BfcpFloorService,
		private router: Router
	) {
		this.chatServiceSubscription = this.chatService.messagesUnreadObs.subscribe((num) => {
			this.newMessagesNum = num;
		});

		this.globalValue = GlobalValue;
		this.isPopedout = false;
	}
	ngOnDestroy(): void {
		this.chatServiceSubscription.unsubscribe();
		this.subscriptions.forEach((subscription: Subscription) => {
			subscription.unsubscribe();
		});
		this.isCallModePtvCastSubs.unsubscribe();
	}

	@HostListener('window:resize', ['$event'])
	sizeChange(event) {
		const maxHeight = window.screen.height;
		const maxWidth = window.screen.width;
		const curHeight = window.innerHeight;
		const curWidth = window.innerWidth;
		if (maxWidth !== curWidth && maxHeight !== curHeight) {
			this.fullscreenIcon = VideoFullscreenIcon.BIG;
		}
	}

	ngOnInit() {
		this.authUser = JSON.parse(localStorage.getItem('sessionUser'));
		this.subscriptions.push(
			this.meetingService.getMeetingInfoCast.subscribe((result) => {
				if (result) {
					this.meetingName = result.meeting_name;
					this.meetingCode = result.meeting_code;
				}
			})
		);
		this.isCallModePtvCastSubs = this.bfcpFloorService.isCallModePtvCast.subscribe((result) => {
			this.isCallModePtv = result;
		});

		this.isMeetingHost = this.meetingService.isMeetingHost();

		this.isCallInitiator = this.meetingService.isCallInitiator();

		if (window.opener) {
			this.isPopedout = true;
		}
	}

	toggleMicrophone() {
		this.micButtonClicked.emit();
	}

	toggleCamera() {
		this.camButtonClicked.emit();
	}

	toggleScreenShare() {
		this.screenShareClicked.emit();
	}

	toggleSpeakerLayout() {
		this.layoutButtonClicked.emit();
	}

	leaveSession() {
		this.leaveSessionButtonClicked.emit();
	}

	toggleChat() {
		if (this.chatService.isChatOpened()) {
			this.globalService.callScreenSideNavShowData$.next('chat');
			this.xamppChat.emit();
		} else {
			this.globalService.callScreenSideNavShowData$.next('chat');
			this.chatService.toggleChat();
			this.xamppChat.emit();
		}
	}

	toggleFullscreen() {
		this.utilsSrv.toggleFullscreen('videoRoomNavBar');
		this.fullscreenIcon = this.fullscreenIcon === VideoFullscreenIcon.BIG ? VideoFullscreenIcon.NORMAL : VideoFullscreenIcon.BIG;
	}
	public showMeetingInfo() {
		const meetingInfo = JSON.parse(localStorage.getItem('meetingInfo_current'));
		const meetingInfoDialog = this.dialog.open(MeetingInfoComponent, {
			disableClose: false,
			panelClass: 'meetingInfoDialog',
			width: '50%',
			data: {
				meetingInfo: meetingInfo
			}
		});
	}

	public toggleFloor(floorLimit: number) {
		this.bfcpFloorService.updateFloor(floorLimit);
	}

	public UpdateConferenceTypeRequest(action: string, type?) {
		if (!type) {
			if (this.isUpdateConferenceTypeRequest) {
				this.updateConference(action, type)
			} else {
				Swal.fire({
					title: 'Push-to-Video Mode',
					text: !!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
					? 'পিটিভি মোডে সুইচ করলে, অংশগ্রহণকারীদের কথা বলার জন্য ভিডিও বোতামটি চাপতে হবে এবং একই সাথে সর্বোচ্চ দুই জন ব্যক্তি কথা বলতে পারবেন। আপনি কি নিশ্চিত?'
					: 'Once you switch, participants will have to Push the Video button to talk, and maximum two people can talk at the same time. Are you sure?',
					showCancelButton: true,
					confirmButtonColor: '#F4AD20',
					cancelButtonColor: '#d33',
					confirmButtonText: 'Yes',
					cancelButtonText: 'No, Thanks',
					position: 'top-end',
					padding: '1em',
				}).then((result) => {
					if (result.value) {
						this.updateConference(action, type)
					}
				});
			}
		} else {
			if (this.participantsChecker()) {
				Swal.fire({
					title: 'Push-to-Video Mode',
					text: !!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
					? 'আপনি একটি বড় মিটিং এ আছেন। দুঃখিত, আপনার সাবস্ক্রিপশন একই সাথে সবার কথা বলার অপশন সাপোর্ট করে না। আপনার সাবস্ক্রিপশন আপগ্রেড করুন|'
					: 'You are in a large meeting. Sorry, your subscription does not cover everyone talking at the same time. Please upgrade your subscription',
					position: 'top-end',
					padding: '1em',
					confirmButtonColor: '#F4AD20',
					timer: 5000,
				});
			} else {
				Swal.fire({
					title: 'Push-to-Video Mode',
					text: !!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
					? 'আপনি নন-পিটিভি মোডে ফিরে যাচ্ছেন। একই সাথে অধিক সংখ্যক ব্যবহারকারীর ভিডিও ট্রান্সমিট হওয়ার কারণে আপনার সাবস্ক্রিপশন খরচ বেড়ে যাবে। আপনি কি নিশ্চিত?'
					: 'You are switching back to non-PTV mode. With video from more people transmitted at the same time, your subscription will incur more cost. Are you sure?',
					showCancelButton: true,
					confirmButtonColor: '#F4AD20',
					cancelButtonColor: '#d33',
					confirmButtonText: 'Yes',
					cancelButtonText: 'No, Thanks',
					position: 'top-end',
					padding: '1em',
				}).then((result) => {
					if (result.value) {
						this.updateConference(action, type)
					}
				});
			}
		}
	}

	public doPopOut() {
		const callViewUrl = window.location.href;
		const meetingInfo: any = JSON.parse(localStorage.getItem('meetingInfo_current'));
		this.leaveSession();
		const params = `scrollbars=yes,resizable=no,status=no,location=no,toolbar=no,menubar=no,
                      	width=1200,height=680;addressbar=no,left=70,screenX=50`;
		const isWindow = window.open(callViewUrl, '_blank', params);
		localStorage.setItem('popout', JSON.stringify(isWindow));
		if (!isWindow || isWindow.closed || typeof isWindow.closed === 'undefined') {
			Swal.fire('Please Allow Popout!', '', 'info');
		}
	}

	participantsChecker() {
		const participants = [...this.lUser, ...this.rUser]
		if (participants.length > 8) return true
		else false
	}

	updateConference(action: string, type?) {
		const meetingInfo = JSON.parse(localStorage.getItem('meetingInfo_current'));
		this.changeConferenceTypeClick.emit({
			action: action,
			type: type
		});
		if (!this.isMeetingHost) {
			this.isMeetingHost = true
		}
		if (this.authUser.id !== meetingInfo.owner.host_id) {
			this.countDownTimer.emit(type ? 'normal' : 'ptv')
		}
	}

	reminderDialog() {
		this.dialog.open(MeetingReminderComponent, {
			disableClose: false,
			// panelClass: 'meetingReminderDialog',
			// width: '30%',
			data: this.checkWhoNotInCall(),
		});
	}

	reminderModelGenerator() {
		const meetingInfo: any = JSON.parse(localStorage.getItem('meetingInfo_current'));
		const newModel = []
		if (meetingInfo.meeting_url) {
			meetingInfo.emailList.map((e) => {
				if (e !== this.authUser.email) {
					newModel.push({ email: e, checked: false, id: null, user_name: null, notify_methods: ["push", "email"] })
				}
			})
			return newModel
		} else {
			let emailList = meetingInfo.users ? meetingInfo.users : []
			emailList.map((e) => {
				if (e.email !== this.authUser.email) {
					Object.assign(e, { checked: false, id: e.user_id, notify_methods: ["push", "email"] })
					delete e.user_id
					newModel.push(e)
				}
			})
			return newModel
		}
	}

	checkWhoNotInCall() {
		const emails = this.reminderModelGenerator()
		if (this.rUser.length > 0) {
			for (var i = 0; i < this.rUser.length; i++) {
				for (var z = i; z < emails.length; z++) {
					if (emails[z].email === JSON.parse(this.rUser[i].streamManager.stream.connection.data).email) {
						emails.splice(z, 1)
						break
					}
				}
			}
			return emails
		} else {
			return this.reminderModelGenerator()
		}
	}
}