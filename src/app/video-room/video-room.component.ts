/*

 * Copyright (c) 2004-2020 by Protect Together Inc.

 * All Rights Reserved

 * Protect Together Inc Confidential

 */

/* 
 
 Room configuration, Room toolbar (Top), XMPP chat, 
 Participants, Stream (local and remote) and Room control (Bottom) component generate from here.  
 
*/

import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import {
	Publisher,
	Subscriber,
	Session,
	SignalOptions,
	StreamEvent,
	StreamPropertyChangedEvent,
	SessionDisconnectedEvent,
	PublisherSpeakingEvent,
	Connection,
	ConnectionEvent,
	StreamManager
} from 'openvidu-browser';
import { OpenViduLayout, OpenViduLayoutOptions } from '../shared/layout/openvidu-layout';
import { UserModel } from '../shared/models/user-model';
import { ChatComponent } from '../shared/components/chat/chat.component';
import { OvSettingsModel } from '../shared/models/ovSettings';
import { ScreenType } from '../shared/types/video-type';
import { ILogger } from '../shared/types/logger-type';
import { LayoutType } from '../shared/types/layout-type';
import { Theme } from '../shared/types/webcomponent-config';
import { ExternalConfigModel } from '../shared/models/external-config';
import { MatDialog } from '@angular/material/dialog';
// Services
import { DevicesService } from '../shared/services/devices/devices.service';
import { OpenViduSessionService } from '../shared/services/openvidu-session/openvidu-session.service';
import { NetworkService } from '../shared/services/network/network.service';
import { LoggerService } from '../shared/services/logger/logger.service';
import { RemoteUsersService } from '../shared/services/remote-users/remote-users.service';
import { UtilsService } from '../shared/services/utils/utils.service';
import { MatSidenav } from '@angular/material/sidenav';
import { ChatService } from '../shared/services/chat/chat.service';
import { AccountService } from '../shared/services/account/account.service';
import { BfcpFloorService } from '../shared/services/bfcp-floor/bfcp-floor.service';
import { MeetingService } from '../shared/services/meeting/meeting.service';
import Swal from 'sweetalert2';
import { promise } from 'protractor';
import { XmppChatService } from '../shared/services/xmpp-chat/xmpp-chat.service';
import { GlobalValue } from '../global';
import { GlobalService } from '../shared/services/global/global.service';
import { NotificationService } from '../shared/services/notifications/notification.service';
import { findIndex } from 'rxjs/operators';
import { MessagingService } from '../shared/services/messaging/messaging.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { RoomBoxService } from '../shared/services/room-box/room-box.service';
import { NetworkStatusAngularService } from 'network-status-angular';
import { RecordingConfigModel } from '../shared/models/recordingConfig';
import { RecordingService } from '../shared/services/recording/recording.service'
import { UnzipperService } from '../shared/services/unzipper/unzipper.service'
import { rejects } from 'assert';

let self;
@Component({
	selector: 'app-video-room',
	templateUrl: './video-room.component.html',
	styleUrls: ['./video-room.component.css']
})
export class VideoRoomComponent implements OnInit, OnDestroy {
	// Config from webcomponent or angular-library
	@Input() externalConfig: ExternalConfigModel;
	@Output() _session = new EventEmitter<any>();
	@Output() _publisher = new EventEmitter<any>();
	@Output() _error = new EventEmitter<any>();

	// !Deprecated
	@Output() _joinSession = new EventEmitter<any>();
	// !Deprecated
	@Output() _leaveSession = new EventEmitter<any>();

	@ViewChild('chatComponent') chatComponent: ChatComponent;
	@ViewChild('sidenav') chatSidenav: MatSidenav;

	ovSettings: OvSettingsModel;
	compact = false;
	sidenavMode: 'side' | 'over' = 'side';
	lightTheme: boolean;
	showConfigRoomCard = true;
	session: Session;
	sessionScreen: Session;
	openviduLayout: OpenViduLayout;
	openviduLayoutOptions: OpenViduLayoutOptions;
	mySessionId: string;
	localUsers: UserModel[] = [];
	remoteUsers: UserModel[] = [];
	isConnectionLost: boolean;
	isAutoLayout = false;
	hasVideoDevices: boolean;
	hasAudioDevices: boolean;
	private log: ILogger;
	private oVUsersSubscription: Subscription;
	private remoteUsersSubscription: Subscription;
	private chatSubscription: Subscription;
	private floorStatusCastSubs: Subscription;
	isUserLoggedIn: boolean;
	private subscriptions: Array<Subscription> = [];
	currentMeetingInfo: any;
	authUser: any;
	selectedGroup: any = {};
	isProgress = false;
	currentFloorStatus: any;
	callScreenSideNavShowData: string;
	isCallModePtv: boolean;
	floorQuery: any = [];
	floorState_Custom: string;
	spinnerText: string;
	spinnerBGColor = 'rgba(13,12,12,0.8)';
	spinnerType = 'ball-clip-rotate-multiple'
	isUpdateConferenceTypeRequest: boolean;
	countDownTimerObj: NodeJS.Timeout;
	isTimerShow: boolean;
	countDownValue: string = '';
	timeLeft: number;
	interval: NodeJS.Timeout;
	counter: any;
	internetStatus: any;
	chair_id: any;
	recordingConfig = new RecordingConfigModel();
	recodingList = []
	isWaitForHost: boolean = false
	constructor(
		private networkSrv: NetworkService,
		private router: Router,
		private utilsSrv: UtilsService,
		private remoteUsersService: RemoteUsersService,
		public oVSessionService: OpenViduSessionService,
		private oVDevicesService: DevicesService,
		private messagingService: MessagingService,
		private loggerSrv: LoggerService,
		private chatService: ChatService,
		private dialog: MatDialog,
		private accountService: AccountService,
		private bfcpFloorService: BfcpFloorService,
		private meetingService: MeetingService,
		private xmppChatService: XmppChatService,
		private globalService: GlobalService,
		private notificationService: NotificationService,
		private spinner: NgxSpinnerService,
		private roomBoxServices: RoomBoxService,
		private networkStatusAngularService: NetworkStatusAngularService,
		private recordingService: RecordingService,
		private unzipperService: UnzipperService
	) {
		this.log = this.loggerSrv.get('VideoRoomComponent');
		if (localStorage.hasOwnProperty("in_call")) { // if user reconect after internet back then set spinner background color and spinner text (Jahid) 
			this.spinnerBGColor = '#000000'
			this.spinnerText = 'Trying to reconnect the meeting'
		}
	}

	@HostListener('window:load') // it calls, when the browser load end.
	loadhandaler() {
		this.leaveMeetingRestApi();
	}

	@HostListener('window:unload') // The onunload event occurs once a page has unloaded (or the browser window has been closed).
	unload() {
		this.leaveSession();
	}

	@HostListener('window:beforeunload') // it calls, when the browser loading start( before load).
	beforeunload() {
		this.leaveSession();
	}

	@HostListener('window:resize')
	sizeChange() {
		if (this.openviduLayout) {
			this.updateOpenViduLayout();
			this.checkSizeComponent();
		}
	}

	async ngOnInit() {
		this.lightTheme = this.externalConfig?.getTheme() === Theme.LIGHT;
		this.ovSettings = !!this.externalConfig ? this.externalConfig.getOvSettings() : new OvSettingsModel();
		this.ovSettings.setScreenSharing(this.ovSettings.hasScreenSharing() && !this.utilsSrv.isMobile());

		// My Code
		this.authUser = JSON.parse(localStorage.getItem('sessionUser'));
		this.accountService.userLoginChecker().subscribe((result) => {
			this.isUserLoggedIn = result;
		});
		this.subscriptions.push(
			this.bfcpFloorService.onMessageFormFloorSocketCast.subscribe((response) => {
				if (response) {
					console.log('onMessageFormFloorSocketSub');
					this.processOnMessageData(response);
				}
			})
		);

		this.subscriptions.push(
			this.meetingService.getMeetingInfoCast.subscribe((result) => {
				if (result) {
					this.currentMeetingInfo = result;
				} else {
					this.currentMeetingInfo = null;
				}
			})
		);

		this.floorStatusCastSubs = this.bfcpFloorService.floorStatusCast.subscribe((result) => {
			console.log('currentFloorStatus', result);
			if (result) {
				this.currentFloorStatus = result;

				if (this.currentFloorStatus.result) {
					// this.setCallInitiatorId(this.currentFloorStatus.result.hosts[0])
					this.floorQuery = [];
					if (this.currentFloorStatus.method === 'ConferenceStatus') {
						if (
							this.currentFloorStatus.result.floors &&
							this.currentFloorStatus.result.floors.length > 0 &&
							this.currentFloorStatus.result.floors[0].floor_query
						) {
							this.floorQuery = this.currentFloorStatus.result.floors[0].floor_query;
							this.setCallInitiatorId(this.currentFloorStatus.result.floors[0].chair_id)
						}
					} else {
						// for FloorStatus, RequestFloor, ReleaseFloor
						if (this.currentFloorStatus.result.floor_query) {
							this.floorQuery = this.currentFloorStatus.result.floor_query;
						}
					}
					this.checkFloorState_Status(this.floorQuery);
					// this.floorState = this.floorQuery.length ===
					if (this.bfcpFloorService.isModePtv()) {
						this.floorUserLayoutHandler(this.floorQuery)
					}
				}
			}
		});
		this.subscriptions.push(
			this.globalService.callScreenSideNavShowDataCast.subscribe((result) => {
				if (result) {
					this.callScreenSideNavShowData = result;
					if (result === 'chat') {
						this.chatService.messagesUnread = 0;
						this.chatService._messagesUnread.next(0);
					}
				}
			})
		);

		this.subscriptions.push(
			this.bfcpFloorService.isCallModePtvCast.subscribe((result) => {
				this.isCallModePtv = result;
			})
		);

		this.networkStatusAngularService.status.subscribe((result) => { // internet status subscribe (Jahid)
			if (result) {
				this.internetStatus = result
				this.networkDropIntervalClear() // clear interval if internet back (Jahid)
			} else {
				this.internetStatus = result
			}
		})
	}

	checkFloorState_Status(floorQurey) {
		// RELEASE
		// REQUESTING
		// GRANTED
		this.floorState_Custom = '';
		this.authUser = JSON.parse(localStorage.getItem('sessionUser'));

		if (floorQurey.findIndex((id) => id.user_id === this.authUser.id) !== -1) {
			// Find user on floorQuery
			this.floorState_Custom = 'REQUESTING';
		} else {
			if (floorQurey.length === GlobalValue.bfcp_floor_limit_ptvMode) {
				// Floor is full
				this.floorState_Custom = 'GRANTED';
			}
			if (floorQurey.length < GlobalValue.bfcp_floor_limit_ptvMode) {
				this.floorState_Custom = 'RELEASE';
			}
		}
	}

	ngOnDestroy() {
		// Reconnecting session is received in Firefox
		// To avoid 'Connection lost' message uses session.off()
		this.session?.off('reconnecting');
		this.remoteUsersService.clean();
		this.session = null;
		this.sessionScreen = null;
		this.localUsers = [];
		this.remoteUsers = [];
		this.openviduLayout = null;
		if (this.oVUsersSubscription) {
			this.oVUsersSubscription.unsubscribe();
		}
		if (this.remoteUsersSubscription) {
			this.remoteUsersSubscription.unsubscribe();
		}
		if (this.chatSubscription) {
			this.chatSubscription.unsubscribe();
		}
		this.leaveMeetingRestApi();
		// this.bfcpFloorService.releaseFloor();
		// this.bfcpFloorService.closeConnection();

		// My code
		this.subscriptions.forEach((subscription: Subscription) => {
			subscription.unsubscribe();
		});
		this.floorStatusCastSubs.unsubscribe();
		this.bfcpFloorService.onMessageFormFloorSocket$.next(null);
		this.bfcpFloorService.floorStatus$.next(null);
	}

	processOnMessageData(data: any) {
		if (data.method === 'openConnection') {
			// this.isProgress = true;
			// own created tag for open connection response
			this.bfcpFloorService.createConference();
		} else if (data.method === 'CreateConference') {
			console.log('floor socket: [onMessage] CreateConference');
			this.processCreateConferenceResponse(data);
		} else if (data.method === 'JoinConference') {
			console.log('floor socket: [onMessage] JoinConference');
			this.processJoinConferenceResponse(data);
		} else if (data.method === 'UserJoined') {
			console.log('floor socket: [onMessage] UserJoined');
			this.processUserJoinedReference(data);
		} else if (data.method === 'CreateFloor') {
			if (data.id) {
				if (data.id.toString() !== '0') {
					// 0 is for all conference users.
					console.log('floor socket: [onMessage] CreateFloor');
					this.processCreateFloorResponse(data);
				}
			}
		} else if (data.method === 'FloorStatus') {
			console.log('floor socket: [onMessage] FloorStatus');
			this.processFloorStatusResponse(data);
			// this.currentUserOnFloor(data)
		} else if (data.method === 'ConferenceStatus') {
			console.log('floor socket: [onMessage] ConferenceStatus');
			this.processConferenceStatusResponse(data);
		} else if (data.method === 'RequestFloor') {
			console.log('floor socket: [onMessage] RequestFloor');
			this.processRequestFloorResponse(data);
		} else if (data.method === 'ReleaseFloor') {
			console.log('floor socket: [onMessage] ReleaseFloor');
			this.processReleaseFloorResponse(data);
		} else if (data.method === 'UpdateFloor') {
			console.log('floor socket: [onMessage] Update Floor');
			this.processUpdateFloorResponse(data);
		} else if (data.method === 'AddUser') {
			console.log('floor socket: [onMessage] AddUser');
			this.processAddUserResponse(data);
		} else if (data.method === 'UpdateConferenceTypeRequest') {
			console.log('floor socket: [onMessage] UpdateConferenceTypeRequest');
			this.processUpdateConferenceTypeRequestResponse(data);
		} else if (data.method === 'OnTransaction') {
			console.log('floor socket: [onMessage] OnTransaction');
			this.processOnTransactionResponse(data);
		} else if (data.method === 'ConferenceTypeChanged') {
			console.log('floor socket: [onMessage] ConferenceTypeChanged');
			this.processConferenceTypeChangedResponse(data);
		} else if (data.method === 'ChangeConferenceType') {
			console.log('floor socket: [onMessage] ChangeConferenceType');
			// For Host or Who accept/decline
			this.processChangeConferenceTypeResponse(data);
		}
	}
	processAddUserResponse(data) {
		if (data.result) {
			this.bfcpFloorService.joinConference();
		} else {
			this.bfcpCloseCommon(data, true);
			// this.bfcpFloorService.closeConnection(data.error);
		}
	}
	processUpdateFloorResponse(data) {
		console.log('update floor data:::::::::::::', data);
		this.chair_id = data.result.chair_id

		const bfcpCurrentFloor = this.bfcpFloorService.getBFCPCurrentFloorLimit();
		const isUpdatefloorCallByMe: boolean = this.bfcpFloorService.isUpdateFloorCall();
		// if (isUpdatefloorCallByMe) {
		// when updateFloor service call by me
		if (data.id.toString() !== '0') {
			this.commonUpdateFloorResponse(data);
			this.bfcpFloorService.setUpdateFloorCallFlag(false);
		}
		// } else {
		// 	// when updateFloor service call by other and server send me a notification without data.id
		// 	this.commonUpdateFloorResponse(data);
		// }
	}
	public commonUpdateFloorResponse(data) {
		this.bfcpFloorService.setBFCPCurrentFloorLimit(data.result.limit_granted_floor);
		this.bfcpFloorService.conferenceStatus();
		// if (data.result.limit_granted_floor === GlobalValue.bfcp_floor_limit_normalMode) {
		// this.onConfigRoomJoin();
		// this.bfcpFloorService.requestFloor();

		// Confer status call

		// }
		// if (data.result.limit_granted_floor === GlobalValue.bfcp_floor_limit_ptvMode) {
		// this.onConfigRoomJoin();
		// this.bfcpFloorService.requestFloor();
		// Confer status call
		// this.bfcpFloorService.conferenceStatus();
		// 	this.doActionForPTVMode();
		// }
	}

	processCreateConferenceResponse(data, openViduServiceRef?) {
		if (data.result) {
			// if success

			this.currentMeetingInfo.ptt_session_id = data.result.session_id;
			localStorage.setItem('meetingInfo_current', JSON.stringify(this.currentMeetingInfo));

			const meetingInfo: any = JSON.parse(localStorage.getItem('meetingInfo_current'));
			if (meetingInfo.tag === 'room-box' || meetingInfo.tag === 'room-box-meeting') {
				this.bfcpFloorService.addUser();
				this.bfcpFloorService.joinConference();
			} else {
				if (this.currentMeetingInfo.owner.host_id !== this.authUser.id) {
					// user is not host
					this.bfcpFloorService.addUser();
				} else {
					this.bfcpFloorService.joinConference();
				}
			}


		} else if (data.error) {
			if (typeof data.error === 'object') {
				if (data.error.code === 400) {
					// if Conference exists then add that user to call add user.
					// And then joinConference form addUser responce.

					// this.bfcpFloorService.joinConference();
					const meetingInfo: any = JSON.parse(localStorage.getItem('meetingInfo_current'));
					if (meetingInfo.tag === 'room-box' || meetingInfo.tag === 'room-box-meeting') {
						this.bfcpFloorService.addUser();
						this.bfcpFloorService.joinConference();
					} else {
						if (this.currentMeetingInfo.owner.host_id !== this.authUser.id) {
							// user is not host
							this.bfcpFloorService.addUser();
						} else {
							this.bfcpFloorService.joinConference();
						}
					}
				} else {
					// close socket connection and show a popup msg.
					this.bfcpCloseCommon(data, true);
					// this.bfcpFloorService.closeConnection(data.error.message);
				}
			} else if (typeof data.error === 'string') {
				this.bfcpCloseCommon(data, true);
				// this.bfcpFloorService.closeConnection(data.error);
			}
		} else {
			//
			this.bfcpCloseCommon(data, true);
			// this.bfcpFloorService.closeConnection(data.error);
		}
	}

	processJoinConferenceResponse(data, openViduServiceRef?) {
		if (data.result) {
			// nothing to do

			if (data.result.transaction_id && data.result.status === 'pending') {
				// (Update Conference type event send to host participant and here show a loader
				this.bfcpFloorService.setTransactionId(data.result.transaction_id);
				this.spinnerText =
					!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
						? 'সর্বোচ্চ সংখ্যক অতিথি ইতিমধ্যেই মিটিং এ যোগদান করেছে। মিটিং আয়োজক  আপনাকে গ্রহণ না করা পর্যন্ত অনুগ্রহ করে অপেক্ষা করুন।'
						: 'Maximum number of participants have already joined this meeting. Please wait until the meeting host updates the meeting to accept you.';
				this.spinnerBGColor = 'rgba(13,12,12,0.8)'
				this.spinner.show();
			} else {
				this.oVSessionService.setSessionId(data.result.session_id);
				this.networkSrv.setOpenviduServerInfo(data.result.openvidu)
			}
		} else if (data.error) {
			this.oVSessionService.setSessionId(null);

			const showMessage =
				!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
					? 'সম্মেলনে সর্বাধিক অংশগ্রহণকারী রয়েছে, আপনি এই মুহুর্তে যোগদান করতে পারবেন না।'
					: 'The conference has maximum participants, you cannot join at this moment.';
			this.bfcpCloseCommon(data, true, showMessage);
			// this.bfcpFloorService.closeConnection(typeof data.error === 'object' ? data.error.message : data.error);
		}
	}

	processUserJoinedReference(data, openViduServiceRef?) {
		this.authUser = JSON.parse(localStorage.getItem('sessionUser'));

		if (data.result) {
			this.oVSessionService.setSessionId(data.result.session_id);
			if (data.result.user.user_id === this.authUser.id && this.currentMeetingInfo.owner.host_id === this.authUser.id) {
				// if host owner is you....
				this.bfcpFloorService.createFloor();
			} else if (data.result.user.user_id === this.authUser.id && this.currentMeetingInfo.owner.host_id !== this.authUser.id) {
				// if its not create by you (from other party)....

				// this.onConfigRoomJoin();
				// this.bfcpFloorService.requestFloor();
				// Confer status call
				this.bfcpFloorService.conferenceStatus();
			}
		} else if (data.error) {
			this.bfcpCloseCommon(data, true);
			// this.bfcpFloorService.closeConnection(typeof data.error === 'object' ? data.error.message : data.error);
		}
	}

	processCreateFloorResponse(data, openViduServiceRef?) {
		this.authUser = JSON.parse(localStorage.getItem('sessionUser'));
		const meetingInfo = JSON.parse(localStorage.getItem('meetingInfo_current'));
		if (data.result) {
			// if id == '0' then its means, its not my response, if there have some UUID, then its my one.
			if (data.id.toString() !== '0') {
				// this.bfcpFloorService.updateFloor(1);
				// Confer status call
				this.bfcpFloorService.setBFCPCurrentFloorLimit(data.result.limit_granted_floor);
				this.bfcpFloorService.conferenceStatus();
			}
			// init openvidu
			// this.joinSession(); // join session er por join meeting call dite hobe.
		} else if (data.error) {
			if (data.error.code === 400) {
				// Unable to add floor. Already exist.
				// So dont need to update floor.(PTV Flow)
				this.bfcpFloorService.conferenceStatus();
			} else {
				this.bfcpCloseCommon(data, true);
				// this.bfcpFloorService.closeConnection(typeof data.error === 'object' ? data.error.message : data.error);
			}
		}
	}

	processFloorStatusResponse(data, openViduServiceRef?) {
		// when someone request floor or release floor call then its call

		if (data.result) {
			// if(data.result.floor_State === 'RELEASE' || data.result.floor_State.toLowerCase() === 'release'){
			this.bfcpFloorService.floorStatus$.next(data);
			this.bfcpFloorService.setBFCPCurrentFloorLimit(data.result.limit_granted_floor);
		}
	}

	processConferenceStatusResponse(data) {
		// when your want to know the conference status for the 1st time.
		if (data.result) {
			this.bfcpFloorService.floorStatus$.next(data);
			this.bfcpFloorService.setConferenceType(data.result.conference_type);

			this.authUser = JSON.parse(localStorage.getItem('sessionUser'));

			if (data.result.floors.length > 0 && data.result.floors[0].floor_query) {
				this.bfcpFloorService.setBFCPCurrentFloorLimit(data.result.floors[0].limit_granted_floor);

				const findUserIndex = data.result.floors[0].floor_query.findIndex((user) => user.user_id === this.authUser.id);
				if (findUserIndex !== -1) {
					// Found
					if (!this.session) {
						this.onConfigRoomJoin();
					} else {
						this.commonConferenceStatusResponse(data);
					}
				} else {
					// Not Found
					this.commonConferenceStatusResponse(data);
				}
			} else {
				// its for 1st time when no user found on floor
				this.commonConferenceStatusResponse(data);
			}
			if (this.isRoomMeeting() === true) {
				if (data.result.users && data.result.users.length == 1) {
					this.callLogBindWithChat(true)
				}
			}
		}
	}
	// public commonConferenceStatusResponse(data) {
	// 	// 1. Check is there any call running/ Openvidu call session true
	// 	// 2. if no call running(1st time entry on call), then
	// 	// 		1. Call Mode: bfcp.RequestFloor() Call
	// 	// 		2. PTV Mode: Join OpenVidu - this.onConfigRoomJoin();
	// 	// 3. Else call running, then
	// 	// 		1. Call Mode: no action- jst change ptv mode and floorlimit;
	// 	// 		1. PTV Mode:

	// 	if (!this.session) {
	// 		if (this.bfcpFloorService.isModePtv()) {
	// 			if (this.meetingService.isMeetingHost()) {
	// 				if (
	// 					data.result.floors[0] &&
	// 					data.result.floors[0].floor_query &&
	// 					data.result.floors[0].floor_query.length < GlobalValue.bfcp_floor_limit_ptvMode
	// 				) {
	// 					// If host join the call 2nd time on PTV mode, then 1st check how many floor query have.
	// 					// if any floor limit free then auto request_floor to the host
	// 					this.bfcpFloorService.requestFloor();
	// 				}
	// 			} else {
	// 				this.onConfigRoomJoin();
	// 				this.offAudioVideoBoth();
	// 			}
	// 		} else {
	// 			this.bfcpFloorService.requestFloor();
	// 		}
	// 	} else {
	// 		// OV session running
	// 		if (this.bfcpFloorService.isModePtv()) {
	// 		} else {
	// 			if (!this.meetingService.isMeetingHost()) {
	// 				this.bfcpFloorService.requestFloor();
	// 			}
	// 		}
	// 	}
	// }
	public commonConferenceStatusResponse(data) {
		// 1. Check is there any call running/ Openvidu call session true
		// 2. if no call running(1st time entry on call), then
		// 		1. Call Mode: bfcp.RequestFloor() Call
		// 		2. PTV Mode: Join OpenVidu - this.onConfigRoomJoin();
		// 3. Else call running, then
		// 		1. Call Mode: no action- jst change ptv mode and floorlimit;
		// 		1. PTV Mode:

		if (!this.session) {
			if (this.bfcpFloorService.isModePtv()) {
				if (this.meetingService.isMeetingHost()) {
					if (
						data.result.floors[0] &&
						data.result.floors[0].floor_query &&
						data.result.floors[0].floor_query.length < GlobalValue.bfcp_floor_limit_ptvMode &&
						(data.result.floors[0].chair_id === this.authUser.id)
					) {
						// If host join the call 2nd time on PTV mode, then 1st check how many floor query have.
						// if any floor limit free then auto request_floor to the host
						this.bfcpFloorService.requestFloor();
						this.countDownTimer(this.bfcpFloorService)
					} else {
						this.onConfigRoomJoin();
						this.offAudioVideoBoth();
					}
				} else {
					if (data.result.floors[0].chair_id === this.authUser.id) {
						if (data.result.floors[0] && data.result.floors[0].floor_query &&
							data.result.floors[0].floor_query.length < GlobalValue.bfcp_floor_limit_ptvMode) {
							this.bfcpFloorService.requestFloor();
							this.countDownTimer(this.bfcpFloorService)
						} else {
							this.onConfigRoomJoin();
							this.offAudioVideoBoth();
						}
					} else {
						this.onConfigRoomJoin();
						this.offAudioVideoBoth();
					}
				}
				this.networkSrv.setOpenviduServerInfo(data.result.openvidu)
			} else {
				this.bfcpFloorService.requestFloor();
			}
		} else {
			// OV session running
			if (this.bfcpFloorService.isModePtv()) {
			} else {
				if (!this.meetingService.isMeetingHost()) {
					this.bfcpFloorService.requestFloor();
				}
			}
		}
	}
	// processRequestFloorResponse(data) {
	// 	// we can request floor on 3 senario.
	// 	// 1. 1st time init call when no session found
	// 	// 2. a

	// 	if (!this.session) {
	// 		// 1. 1st time init call when no session found
	// 		if (data.result) {
	// 			this.bfcpFloorService.floorStatus$.next(data);
	// 			// when result.floor_state == 'GRANTED" then call Open Vidu. other wise no action.
	// 			if (data.result.floor_state === 'GRANTED') {
	// 				this.onConfigRoomJoin();
	// 			} else if (data.result.floor_state === 'DENIED') {
	// 				this.isProgress = false;
	// 				Swal.fire(
	// 					'Warning',
	// 					!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
	// 						? 'দুঃখিত, সার্ভার এখন ব্যস্ত। অনুগ্রহ করে একটু পরে আবার চেষ্টা করুন'
	// 						: 'Sorry, Server is Busy now. Please try again later.',
	// 					'warning'
	// 				);
	// 			} else {
	// 				this.isProgress = false;
	// 				Swal.fire(
	// 					'Warning',
	// 					!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
	// 						? 'দুঃখিত, সার্ভার এখন ব্যস্ত। অনুগ্রহ করে একটু পরে আবার চেষ্টা করুন'
	// 						: 'Sorry, Server is Busy now. Please try again later.',
	// 					'warning'
	// 				);
	// 			}
	// 		} else if (data.error) {
	// 			this.isProgress = false;
	// 			if (data.error.code === 400) {
	// 				// floor does not exist
	// 				// meeting initiated but floor doesnot exist
	// 				// please call create floor it doesnt matter who joined
	// 				if (this.currentMeetingInfo.status === 'initiate') {
	// 					this.bfcpFloorService.createFloor();
	// 				}
	// 			} else {
	// 				this.bfcpCloseCommon(data, true);
	// 				// this.bfcpFloorService.closeConnection(typeof data.error === 'object' ? data.error.message : data.error);
	// 			}
	// 		}
	// 	} else {
	// 		// when already have session and it call for ptv
	// 		this.bfcpFloorService.floorStatus$.next(data);
	// 		if (this.bfcpFloorService.isModePtv()) {
	// 			if (data.result.floor_state === 'GRANTED') {
	// 				this.onAudioVideoBoth();
	// 				if (!this.meetingService.isMeetingHost()) {
	// 					this.countDownTimer(this.bfcpFloorService);
	// 				}
	// 			}
	// 		} else {
	// 		}
	// 	}
	// }
	processRequestFloorResponse(data) {
		// we can request floor on 3 senario.
		// 1. 1st time init call when no session found
		// 2. a

		if (!this.session) {
			// 1. 1st time init call when no session found
			if (data.result) {
				this.bfcpFloorService.floorStatus$.next(data);
				// when result.floor_state == 'GRANTED" then call Open Vidu. other wise no action.
				if (data.result.floor_state === 'GRANTED') {
					this.onConfigRoomJoin();
				} else if (data.result.floor_state === 'DENIED') {
					this.isProgress = false;
					Swal.fire(
						'Warning',
						!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
							? 'দুঃখিত, সার্ভার এখন ব্যস্ত। অনুগ্রহ করে একটু পরে আবার চেষ্টা করুন'
							: 'Sorry, Server is Busy now. Please try again later.',
						'warning'
					);
				} else {
					this.isProgress = false;
					Swal.fire(
						'Warning',
						!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
							? 'দুঃখিত, সার্ভার এখন ব্যস্ত। অনুগ্রহ করে একটু পরে আবার চেষ্টা করুন'
							: 'Sorry, Server is Busy now. Please try again later.',
						'warning'
					);
				}
			} else if (data.error) {
				this.isProgress = false;
				if (data.error.code === 400) {
					// floor does not exist
					// meeting initiated but floor doesnot exist
					// please call create floor it doesnt matter who joined
					if (this.currentMeetingInfo.status === 'initiate') {
						this.bfcpFloorService.createFloor();
					}
				} else {
					this.bfcpCloseCommon(data, true);
					// this.bfcpFloorService.closeConnection(typeof data.error === 'object' ? data.error.message : data.error);
				}
			}
		} else {
			// when already have session and it call for ptv
			this.bfcpFloorService.floorStatus$.next(data);
			if (this.bfcpFloorService.isModePtv()) {
				if (data.result.floor_state === 'GRANTED') {
					this.onAudioVideoBoth();
					// if (!this.meetingService.isMeetingHost()) {
					this.countDownTimer(this.bfcpFloorService);
					// }
				}
			} else {
			}
		}
	}

	processReleaseFloorResponse(data) {
		if (data.result) {
			this.bfcpFloorService.floorStatus$.next(data);

			if (data.id.toString() !== '0') {
				clearTimeout(this.countDownTimerObj);
				this.isTimerShow = false;
				this.countDownValue = '';
				this.bfcpFloorService.countDownValue$.next(this.countDownValue);
				// let elem: any = document.getElementById('countdown_timer');
				// elem.innerHTML = '';
				if (this.bfcpFloorService.isModePtv()) {
					if (data.result.floor_state === 'RELEASE') {
						this.offAudioVideoBoth();
						if (this.oVSessionService.isScreenShareEnabled()) {
							this.removeScreen()
						}
					}
				} else {
				}
			}
		}
		// my ptt button active/disable
		// other UI decoration part
	}

	processUpdateConferenceTypeRequestResponse(data) {
		if (data.result) {
			this.isUpdateConferenceTypeRequest = true;
		} else {
			this.isUpdateConferenceTypeRequest = false;
		}
	}
	processOnTransactionResponse(data) {
		if (data.result) {
			if (data.result.transaction_id === this.bfcpFloorService.getTransactionId()) {
				if (data.result.data.action === 'accept') {
					this.networkSrv.setOpenviduServerInfo(data.result.data.openvidu)
					this.spinner.hide();
				} else if (data.result.data.action === 'denied') {
					// show a notification snakbar and go to leaveSession()
					this.spinner.hide();
					this.leaveSessionFromRoomConfig();
					const showMessage =
						!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
							? 'দুঃখিত, হোস্ট আপনাকে এই সভা কক্ষে যোগদানের অনুমতি দিচ্ছে না'
							: 'Sorry, Host is not permitted you to join this meeting room';
					this.notificationService.globalNotificationShow(showMessage, 3000);
				}
			}
		}
	}
	// this is notification, send to all user
	processConferenceTypeChangedResponse(data) {
		if (data.result) {
			this.bfcpFloorService.setConferenceType(data.result.conference_type);
			if (data.result.conference_type === 'ptv') {
				this.doActionForPTVMode();
			}
			if (data.result.conference_type === 'normal') {
				this.doActionForNormalMode();
			}
		}
	}
	// public doActionForPTVMode() {
	// 	// 1st check i am host or not
	// 	if (this.currentMeetingInfo.owner.host_id !== this.authUser.id) {
	// 		this.offAudioVideoBoth();
	// 		// this.bfcpFloorService.releaseFloor();
	// 		// Show a notification snackBar for other who were already on the call.
	// 		const showMessage =
	// 			!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
	// 				? 'মিটিং এর পরিবর্তন করা হয়েছে। এখন ভিডিও বোতাম টিপে কথা বলতে হবে।'
	// 				: 'The meeting host has switched the meeting to PTV Mode. Please press the PTV button to speak.';
	// 		this.notificationService.globalNotificationShow(showMessage, 5000);
	// 	}
	// }
	public doActionForPTVMode() {
		// 1st check i am host or not
		if (this.currentMeetingInfo.owner.host_id !== this.authUser.id) {
			this.offAudioVideoBoth();
			// this.bfcpFloorService.releaseFloor();
			// Show a notification snackBar for other who were already on the call.
			const showMessage =
				!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
					? 'মিটিং এর পরিবর্তন করা হয়েছে। এখন ভিডিও বোতাম টিপে কথা বলতে হবে।'
					: 'The meeting host has switched the meeting to PTV Mode. Please press the PTV button to speak.';
			this.notificationService.globalNotificationShow(showMessage, 5000);
		} else {
			setTimeout(() => {
				if (this.chair_id === this.authUser.id) {
					this.countDownTimer(this.bfcpFloorService)
					this.onAudioVideoBoth()
				} else {
					this.offAudioVideoBoth();
				}
			}, 1000);
		}
		setTimeout(() => {
			this.floorUserLayoutHandler(this.floorQuery)
		}, 1000);
	}

	// public doActionForNormalMode() {
	// 	// 1st check i am host or not
	// 	if (this.currentMeetingInfo.owner.host_id !== this.authUser.id) {
	// 		// this.offAudioVideoBoth();
	// 		if (this.floorQuery.findIndex((id) => id.user_id === this.authUser.id) === -1) {
	// 			// Not found user on floorQuery
	// 			this.bfcpFloorService.requestFloor();
	// 		}

	// 		// Show a notification snackBar for other who were already on the call.
	// 		const showMessage =
	// 			!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
	// 				? 'মিটিং এর পরিবর্তন করা হয়েছে।'
	// 				: 'The meeting host has switched the meeting to Normal Mode.';
	// 		this.notificationService.globalNotificationShow(showMessage, 5000);

	// 		if (this.countDownTimerObj) {
	// 			clearTimeout(this.countDownTimerObj)
	// 			this.bfcpFloorService.countDownValue$.next('')
	// 		}
	// 	}
	// }
	public doActionForNormalMode() {
		// 1st check i am host or not
		// if (this.currentMeetingInfo.owner.host_id !== this.authUser.id) {
		// this.offAudioVideoBoth();
		if (this.floorQuery.findIndex((id) => id.user_id === this.authUser.id) === -1) {
			// Not found user on floorQuery
			this.bfcpFloorService.requestFloor();
		}

		// Show a notification snackBar for other who were already on the call.
		const showMessage =
			!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
				? 'মিটিং এর পরিবর্তন করা হয়েছে।'
				: 'The meeting host has switched the meeting to Normal Mode.';
		this.notificationService.globalNotificationShow(showMessage, 5000);

		if (this.countDownTimerObj) {
			clearTimeout(this.countDownTimerObj)
			this.bfcpFloorService.countDownValue$.next('')
			// }
		}
		setTimeout(() => {
			this.floorUserLayoutHandler(this.floorQuery)
		}, 1000);
	}
	// this is method callback, send to only caller user
	processChangeConferenceTypeResponse(data) {
		var showMessage
		if (data.result) {
			if (data.id.toString() !== '0') {
				//
				this.isUpdateConferenceTypeRequest = false;
				if (data.result.session_id) {
					// if session_id have then it consider as a accept request.
					// Show a notification snackBar for host
					if (this.bfcpFloorService.isModePtv()) {
						showMessage =
							!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
								? 'মিটিং পরিবর্তন করা হয়েছে। এখন ভিডিও বোতাম টিপে কথা বলতে হবে।'
								: 'Meeting is now switching to PTV Mode.';
					}

					if (!this.bfcpFloorService.isModePtv()) {
						showMessage =
							!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
								? 'মিটিং পরিবর্তন করা হয়েছে।'
								: 'Meeting is now switching to normal Mode.';
					}
					this.notificationService.globalNotificationShow(showMessage, 3000);
				}
			}
		}
	}
	countDownTimer(bfcpFloorServiceRef) {
		self = this;
		self.timeLeft = GlobalValue.ptv_mode_requestFloor_timer;
		this.isTimerShow = true;

		// let elem = document.getElementById('countdown_timer');

		this.countDownTimerObj = setInterval(function () {
			if (self.timeLeft === -1) {
				clearTimeout(this.countDownTimerObj);
				this.isTimerShow = false;
				// elem.innerHTML = '';
				this.countDownValue = '';
				bfcpFloorServiceRef.countDownValue$.next(this.countDownValue);
				bfcpFloorServiceRef.releaseFloor();
			} else {
				// elem.innerHTML = timeLeft + ' seconds remaining';
				this.countDownValue = 'Time Left: ' + self.timeLeft + 's';
				bfcpFloorServiceRef.countDownValue$.next(this.countDownValue);
				if (self.timeLeft < 5) {
					const mp3Source = '<source src="../../../../assets/sound/single_beep.mp3" type="audio/mpeg">';
					const embedSource =
						'<embed hidden="true" autostart="true" loop="false" src="../../../../assets/sound/single_beep.mp3">';
					document.getElementById('sound').innerHTML = '<audio autoplay="autoplay">' + mp3Source + embedSource + '</audio>';
				}
				self.timeLeft--;
			}
		}, 1000);
	}
	increaseTimer() {
		let value = 30;
		this.timeLeft += value;
	}
	bfcpCloseCommon(data, isCallLeaveSession?: boolean, showMessage?: string) {
		this.bfcpFloorService.closeConnection(typeof data.error === 'object' ? data.error.message : data.error);

		if (isCallLeaveSession) {
			this.leaveSessionFromRoomConfig();
		}

		if (showMessage !== '' || showMessage !== null) {
			this.notificationService.globalNotificationShow(showMessage, 3000);
		}
	}
	toggleAudioVideoForPtv() {
		// this.currentFloorStatus = result;
		// RELEASE = audio or video off.. you can ptt with press the button.
		// REQUESTING = audio or video mood on. (for me)
		// GRANTED = audio or video off.. but you cannot ptt with press the button.
		// if (this.floorState_Custom === 'RELEASE') {
		// } else if (this.floorState_Custom === 'REQUESTING') {
		// } else if (this.floorState_Custom === 'GRANTED') {
		// }
		this.toggleCam();
		this.toggleMic();
	}

	offAudioVideoBoth() {
		this.oVSessionService.publishVideo(false);

		this.oVSessionService.publishWebcamAudio(false);
		this.oVSessionService.publishScreenAudio(false);
	}

	onAudioVideoBoth() {
		this.hasVideoDevices = this.oVDevicesService.hasVideoDeviceAvailable();
		this.hasAudioDevices = this.oVDevicesService.hasAudioDeviceAvailable();

		if (this.hasVideoDevices) {
			this.oVSessionService.publishVideo(true);
		}

		if (this.hasAudioDevices) {
			this.oVSessionService.publishWebcamAudio(true);
			this.oVSessionService.publishScreenAudio(false);
		}
	}

	// action = accept/denied
	changeConferenceType($event) {
		if ($event.action.toLowerCase() === 'accept') {
			let type = $event.type ? $event.type : 'ptv'
			this.bfcpFloorService.changeConferenceTypeAccept(type);
		} else if ($event.action.toLowerCase() === 'denied') {
			this.bfcpFloorService.changeConferenceTypeDenied();
		}
		this.isUpdateConferenceTypeRequest = false;
	}

	// Click from join button form room-config
	joinMeetingRestApi() {
		const meetingInfo: any = JSON.parse(localStorage.getItem('meetingInfo_current'));
		if (meetingInfo.tag === 'room-box' || meetingInfo.tag === 'room-box-meeting') {
			meetingInfo.status = 'initiate';
			this.isProgress = true;
			this.meetingService.getMeetingInfo$.next(meetingInfo);
			meetingInfo.incall = true;
			localStorage.setItem('last_in_call', JSON.stringify(meetingInfo));
			// Meeting info set
			this.bfcpFloorService.connect();
			this.xamppChat();
			// this.isProgress = false;
		} else {
			//previous code for regular meeting
			this.isProgress = true;
			let body;
			const meetingPassword = this.oVSessionService.getMeetingPassword();
			const meetingInfo = JSON.parse(localStorage.getItem('meetingInfo_current'));
			if (this.currentMeetingInfo.owner.host_id === this.authUser.id) {
				// If Host
				body = {
					meeting_code: this.currentMeetingInfo.meeting_code
				};
			} else {
				body = {
					meeting_code: this.currentMeetingInfo.meeting_code,
					my_email: this.authUser.email,
					meeting_password: meetingPassword
				};
			}
			this.meetingService.joinMeeting(body).subscribe(
				(result) => {
					console.log('Success Form Join Meeting,', result);
					if (result.status === 'ok') {
						// Meeting info set
						let meetingInfo = JSON.parse(localStorage.getItem('meetingInfo_current'));
						meetingInfo.meeting_password = result.result.meeting_password;
						meetingInfo.users = result.result.users;
						meetingInfo.status = result.result.status;
						localStorage.setItem('meetingInfo_current', JSON.stringify(meetingInfo));
						this.meetingService.getMeetingInfo$.next(meetingInfo);

						meetingInfo.incall = true;
						localStorage.setItem('last_in_call', JSON.stringify(meetingInfo));
						// Meeting info set
						this.bfcpFloorService.connect();
						this.xamppChat();
					}
					if (result.code === 200) {
						const message =
							!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
								? result.message.bn
								: result.message.en;
						// Swal.fire('Warning', message, 'warning');
						this.waitForHost(message)
						this.isProgress = false;
					}
				},
				(err) => {
					if (err.error.code === 400) {
						const message =
							!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
								? err.error.message.bn
								: err.error.message.en;
						Swal.fire('Error', message, 'warning');
						this.isProgress = false;
					}
					console.log('Error From join Meeting', err);
					this.isProgress = false;
				}
			);
		}

	}
	async leaveMeetingRestApi(): Promise<any> {
		let lastInCall: any = JSON.parse(localStorage.getItem('last_in_call'));
		if (lastInCall) {
			let body;
			body = {
				meeting_code: lastInCall.meeting_code
			};

			this.meetingService.leaveMeeting(body).subscribe(
				(result: any) => {
					console.log('Success Form Leave Meeting,', result);
					if (result.status === 'ok') {
					}
					// this.meetingService.getMeetingInfo$.next(null);
					// localStorage.removeItem('meetingInfo_current');
					// localStorage.removeItem('last_in_call');
					// if (result.code === 200) {
					// 	Swal.fire('Notice', result.message.en, 'warning');
					// }
				},
				(err) => {
					// if (err.error.code === 400) {
					// 	Swal.fire('Error', err.error.message.en, 'warning');
					// }
					// this.meetingService.getMeetingInfo$.next(null);
					// localStorage.removeItem('meetingInfo_current');
					console.log('Error From Leave Meeting', err);
				}
			);
		}
	}

	xamppChat(meetingData?) {
		let meetingInfo;
		if (!meetingData) {
			meetingInfo = JSON.parse(localStorage.getItem('meetingInfo_current'));
		} else {
			meetingInfo = meetingData;
		}

		this.selectedGroup.isgroup = true;
		this.selectedGroup.user_name = meetingInfo.meeting_name;
		this.selectedGroup.group_name = meetingInfo.meeting_name;
		this.selectedGroup.user_id = meetingInfo.id;
		this.selectedGroup.group_id = meetingInfo.id;
		this.selectedGroup.is_active = meetingInfo.is_active;
		this.selectedGroup.conferance_id = meetingInfo.id;
		this.selectedGroup.conferance_name = meetingInfo.meeting_name;
		this.selectedGroup.conferance_type = 'group';
		this.selectedGroup.active_class_name = 'active-listItem';
		this.selectedGroup.company_id = meetingInfo.company_id;
		// this.selectedGroup.is_company_admin = this.sUser.is_company_admin;
		this.selectedGroup.created_by = meetingInfo.created_by;
		// this.selectedGroup.conference_timing = e.conference_timing;
		// this.selectedGroup.tags = e.tags;
		this.xmppChatService.chats = [];
		this.xmppChatService.pageNo = 1;
		this.xmppChatService.chatListAdd(this.xmppChatService.chats);
		this.xmppChatService.connectChatRoom(this.selectedGroup.group_id);
		this.xmppChatService.setRoomStatus(
			this.selectedGroup.group_id + '@conference.' + GlobalValue.host,
			this.selectedGroup.group_id,
			'online working',
			'online'
		);
		this.xmppChatService.ClearUnread(this.selectedGroup.group_id + '@conference.' + GlobalValue.host);
		// this.groupService.groupInfo(this.selectedGroup);

		this.xmppChatService.onSelected(this.selectedGroup);
		this.xmppChatService
			.getConferanceMessages(this.selectedGroup.group_id + '@conference.' + GlobalValue.host, this.xmppChatService.pageNo)
			.subscribe(
				(result) => {
					const r = result.resultset;
					this.xmppChatService.chatProgressListner.next(false);
					if (r == null) {
						return;
					}
					// if (r.length == 0) {
					// 	if (e.is_pinned) {
					// 		CreateConferenceComponentDialog.prototype.addToRecentMessageList(e, this.chatService);
					// 	}
					// }
					if (r.length <= 0 || r.length <= 99) {
						this.xmppChatService.chatLoadMoreButton$.next(false);
					} else {
						this.xmppChatService.chatLoadMoreButton$.next(true);
					}

					// r.sort(function (z, y) {
					//   return z.timestamp - y.timestamp;
					// });
					let msg;
					r.forEach((element) => {
						//  var forwarded = element.xml.toString().getElementsByTagName('forwarded');
						element.getDataFromService = true; // this flag will track that, this data comes from rest api.
						this.xmppChatService.conMessageParse(element);
						if (!msg) {
							msg = element;
						}
					});

					if (msg != null) {
						msg.stamp = msg.timestamp;
						msg.user_id = msg.username;
						msg.room = msg.username;

						msg.message = msg.txt;
						msg.username = msg.nick;
						msg.isgroup = true;
						msg.company_id = meetingInfo.company_id;
						msg.group_owner = meetingInfo.owner.host_id;
						// this.xmppChatService.AddtoHistory(msg, 'fromSelect_seen');
					}
				},
				(err) => this.xmppChatService.chatProgressListner.next(false)
			);
	}
	onConfigRoomJoin() {
		this.hasVideoDevices = this.oVDevicesService.hasVideoDeviceAvailable();
		this.hasAudioDevices = this.oVDevicesService.hasAudioDeviceAvailable();
		this.showConfigRoomCard = false;
		this.subscribeToLocalUsers();
		this.subscribeToRemoteUsers();
		this.mySessionId = this.oVSessionService.getSessionId();

		setTimeout(() => {
			this.openviduLayout = new OpenViduLayout();
			this.openviduLayoutOptions = this.utilsSrv.getOpenviduLayoutOptions();
			this.openviduLayout.initLayoutContainer(document.getElementById('layout'), this.openviduLayoutOptions);
			this.checkSizeComponent();
			this.joinToSession();
		}, 50);
	}

	joinToSession() {
		this.oVSessionService.initSessions();
		this.session = this.oVSessionService.getWebcamSession();
		this._session.emit(this.session);
		this.sessionScreen = this.oVSessionService.getScreenSession();
		this.subscribeToStreamCreated();
		this.subscribeToStreamDestroyed();
		this.subscribeToStreamPropertyChange();
		this.subscribeToNicknameChanged();
		this.subscribeSignal();
		// this.subscribeToMuteRemoteUserMobile();
		// this.subscribeToMuteRemoteUser();
		// this.subscribeToUnmuteRemoteUser();
		this.chatService.setChatComponent(this.chatSidenav);
		this.chatService.subscribeToChat();
		this.subscribeToChatComponent();
		this.subscribeToReconnection();
		this.subscribeToConnectionCreated();

		this.connectToSession();
		this.spinner.hide()
		localStorage.setItem('in_call', 'yes') // set item to local storage (Jahid)

		if (this.isRoomMeeting() === true && this.getCurrentMeetingInfo().chair_id === this.getSessionUserId()) {
			if (this.getMeetingUsers().length > 0) {
				this.notifyRoomUser(this.notifyRoomUserModelGenerator(this.getMeetingUsers()))
			}
		}
	}

	leaveSessionFromRoomConfig() {
		this.leaveSession('roomConfig');
	}
	async leaveSession(callFrom?, meeting_url?) {
		const selectedMeetingInfo: any = JSON.parse(localStorage.getItem('meetingInfo_current'));
		this.log.d('Leaving session...');

		// my Code, all logic are here
		await this.leaveMeetingRestApi();
		if (this.session) {
			this.bfcpFloorService.releaseFloor();
			this.bfcpFloorService.closeConnection('From Leave Session Call');
		}
		// my Code, all logic are here

		if (!callFrom) {
			if (this.isRoomMeeting() === true) {
				if (this.remoteUsers.length == 0) {
					this.callLogBindWithChat(false)
				}

				if(this.recodingList.length > 0 && this.getMeetingUsers().length > 0){
					this.sendRecordingToRoomUser(this.notifyRoomUserModelGenerator(this.getMeetingUsers()))
				}
			}
		}

		this.oVSessionService.disconnect();

		this._leaveSession.emit();

		if (this.countDownTimerObj) {
			clearTimeout(this.countDownTimerObj)
			this.bfcpFloorService.countDownValue$.next('')
		}

		if (window.opener) {
			setTimeout(x => {
				window.close();
			}, 1000);
			return false;
		}

		this.redirectAfterLeave(callFrom, meeting_url, selectedMeetingInfo)
	}

	guest_signout() {
		this.messagingService.unregisteredDevice(this.accountService.currentUser.id).subscribe(
			(result) => {
				console.log(result);
				this.router.navigate(['']);
			},
			(err) => {
				console.log(err);
			}
		);
		const res = this.accountService.signOut();
		if (res) {
			console.log('logout success');
			this.xmppChatService.disconnect();
		}
	}

	onNicknameUpdate(nickname: string) {
		this.oVSessionService.setWebcamName(nickname);
		this.sendNicknameSignal(nickname);
	}

	toggleMic() {
		if (this.oVSessionService.isWebCamEnabled()) {
			this.oVSessionService.publishWebcamAudio(!this.oVSessionService.hasWebcamAudioActive());
			return;
		}
		this.oVSessionService.publishScreenAudio(!this.oVSessionService.hasScreenAudioActive());
	}

	async toggleCam() {
		const isVideoActive = !this.oVSessionService.hasWebcamVideoActive();

		// Disabling webcam
		// if (this.oVSessionService.areBothConnected()) {
		// 	this.oVSessionService.publishVideo(isVideoActive);
		// 	this.oVSessionService.disableWebcamUser();
		// 	this.oVSessionService.unpublishWebcam();
		// 	return;
		// }
		// // Enabling webcam
		// if (this.oVSessionService.isOnlyScreenConnected()) {
		// 	const hasAudio = this.oVSessionService.hasScreenAudioActive();

		// 	await this.oVSessionService.publishWebcam();
		// 	this.oVSessionService.publishScreenAudio(false);
		// 	this.oVSessionService.publishWebcamAudio(hasAudio);
		// 	this.oVSessionService.enableWebcamUser();
		// }
		// Muting/unmuting webcam
		this.oVSessionService.publishVideo(isVideoActive);
	}

	async toggleScreenShare() {
		// Disabling screenShare
		if (this.oVSessionService.areBothConnected()) {
			this.removeScreen();
			return;
		}

		// Enabling screenShare
		if (this.oVSessionService.isOnlyWebcamConnected()) {
			const screenPublisher = this.initScreenPublisher();

			screenPublisher.once('accessAllowed', (event) => {
				// Listen to event fired when native stop button is clicked
				screenPublisher.stream
					.getMediaStream()
					.getVideoTracks()[0]
					.addEventListener('ended', () => {
						this.log.d('Clicked native stop button. Stopping screen sharing');
						this.toggleScreenShare();
					});
				this.log.d('ACCESS ALOWED screenPublisher');
				this.oVSessionService.enableScreenUser(screenPublisher);
				this.oVSessionService.publishScreen();
				// if (!this.oVSessionService.hasWebcamVideoActive()) {
				// 	// Disabling webcam when no video found / show only default icon
				// 	this.oVSessionService.disableWebcamUser();
				// 	this.oVSessionService.unpublishWebcam();
				// }
			});

			screenPublisher.once('accessDenied', (event) => {
				this.log.w('ScreenShare: Access Denied');
			});

			return;
		}

		// Disabling screnShare and enabling webcam
		const hasAudio = this.oVSessionService.hasScreenAudioActive();
		await this.oVSessionService.publishWebcam();
		this.oVSessionService.publishScreenAudio(false);
		this.oVSessionService.publishWebcamAudio(hasAudio);
		this.oVSessionService.enableWebcamUser();
		this.removeScreen();
	}

	toggleSpeakerLayout() {
		if (!this.oVSessionService.isScreenShareEnabled()) {
			this.isAutoLayout = !this.isAutoLayout;

			this.log.d('Automatic Layout ', this.isAutoLayout ? 'Disabled' : 'Enabled');
			if (this.isAutoLayout) {
				this.subscribeToSpeachDetection();
				return;
			}
			this.log.d('Unsubscribe to speach detection');
			this.session.off('publisherStartSpeaking');
			this.resetAllBigElements();
			this.updateOpenViduLayout();
			return;
		}
		this.log.w('Screen is enabled. Speach detection has been rejected');
	}

	onReplaceScreenTrack(event) {
		const resulation = this.oVDevicesService.getVideoResulation();
		const frameRate = this.oVDevicesService.getVideoFrameRate();
		this.oVSessionService.replaceScreenTrack(resulation, frameRate);
	}

	checkSizeComponent() {
		this.compact = document.getElementById('room-container')?.offsetWidth <= 790;
		this.sidenavMode = this.compact ? 'over' : 'side';
	}

	onToggleVideoSize(event: { element: HTMLElement; connectionId?: string; resetAll?: boolean }) {
		const element = event.element;
		if (!!event.resetAll) {
			this.resetAllBigElements();
		}

		this.utilsSrv.toggleBigElementClass(element);

		// Has been mandatory change the user zoom property here because of
		// zoom icons and cannot handle publisherStartSpeaking event in other component
		if (!!event?.connectionId) {
			if (this.oVSessionService.isMyOwnConnection(event.connectionId)) {
				this.oVSessionService.toggleZoom(event.connectionId);
			} else {
				this.remoteUsersService.toggleUserZoom(event.connectionId);
			}
		}
		this.updateOpenViduLayout();
	}

	toolbarMicIconEnabled(): boolean {
		if (this.oVSessionService.isWebCamEnabled()) {
			return this.oVSessionService.hasWebcamAudioActive();
		}
		return this.oVSessionService.hasScreenAudioActive();
	}

	private async connectToSession(): Promise<void> {
		let webcamToken: string;
		let screenToken: string;
		// Webcomponent or Angular Library
		if (!!this.externalConfig) {
			if (this.externalConfig.hasTokens()) {
				this.log.d('Received external tokens from ' + this.externalConfig.getComponentName());
				webcamToken = this.externalConfig.getWebcamToken();
				// Only connect screen if screen sharing feature is available
				screenToken = this.ovSettings?.hasScreenSharing() ? this.externalConfig.getScreenToken() : undefined;
			}
		}

		webcamToken = webcamToken ? webcamToken : await this.getToken();
		// Only get screentoken if screen sharing feature is available
		if (!screenToken && this.ovSettings?.hasScreenSharing()) {
			screenToken = await this.getToken();
		}

		if (webcamToken || screenToken) {
			await this.connectBothSessions(webcamToken, screenToken);

			if (this.oVSessionService.areBothConnected()) {
				this.oVSessionService.publishWebcam();
				this.oVSessionService.publishScreen();
			} else if (this.oVSessionService.isOnlyScreenConnected()) {
				this.oVSessionService.publishScreen();
			} else {
				this.oVSessionService.publishWebcam();
			}
			// !Deprecated
			this._joinSession.emit();

			this.updateOpenViduLayout();
			// this.joinMeetingRestApi();
			if (this.bfcpFloorService.isModePtv()) {
				this.floorUserLayoutHandler(this.floorQuery)
			}
		}
	}

	private async connectBothSessions(webcamToken: string, screenToken: string) {
		const metaData = {
			isTeacher: this.currentMeetingInfo.owner.host_id === this.authUser.id ? true : false,
			user_id: this.authUser.id,
			gender: this.authUser.gender,
			profilePicUrl: this.authUser.profile_pic,
			email: this.authUser.email
		};
		try {
			await this.oVSessionService.connectWebcamSession(webcamToken, metaData);
			await this.oVSessionService.connectScreenSession(screenToken, metaData);

			this.localUsers[0].getStreamManager().on('streamPlaying', () => {
				(<HTMLElement>this.localUsers[0].getStreamManager().videos[0].video).parentElement.classList.remove('custom-class');
			});
		} catch (error) {
			this._error.emit({ error: error.error, messgae: error.message, code: error.code, status: error.status });
			this.log.e(
				!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
					? 'এই মুহূর্তে মিটিং এ সংযোগ দেয়া সম্ভব হচ্ছে না'
					: 'There was an error connecting to the session:',
				error.code,
				error.message
			);
			this.utilsSrv.showErrorMessage(
				!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
					? 'এই মুহূর্তে মিটিং এ সংযোগ দেয়া সম্ভব হচ্ছে না'
					: 'There was an error connecting to the session:',
				error?.error || error?.message
			);
		}
	}

	private subscribeToStreamCreated() {
		this.session.on('streamCreated', (event: StreamEvent) => {
			this.log.d('streamCreated', event);
			const connectionId = event.stream.connection.connectionId;

			if (this.oVSessionService.isMyOwnConnection(connectionId)) {
				return;
			}
			// Some remote users are not connecting properly. Please join again.
			// if (!event.stream) {
			// 	this.notificationService.globalNotificationShow('Some remote users are not connecting properly. Please join again.', 5000);
			// }

			Object.assign(event.stream.connection, { time: Math.round(new Date().getTime() / 1000) }) // assign new stream time to stream object (Jahid)
			Object.assign(event.stream.connection, { is_stream_available: true }) // assign new stream available flag to stream object (Jahid)

			const subscriber: Subscriber = this.session.subscribe(event.stream, undefined);
			this.remoteUsersService.add(event, subscriber);
			this.sendNicknameSignal(this.oVSessionService.getWebcamUserName(), event.stream.connection);

			//send recording started signal to others
			let connection = [];
			let type = "isRecordingStarted";
			const data = this.oVSessionService.getMyOwnConnectionId();
			// const data = "from:"+this.oVSessionService.getMyOwnConnectionId() + "user_name:" + this.authUser.user_name.toString();
			this.networkSrv.sendSignal(this.oVSessionService.getSessionId(), connection, type, data).subscribe(
				(result) => {
					console.log('signal service from recording', result);
				},
				(err) => {
					console.log('signal service from recording', err);
				}
			);
		});
	}

	private subscribeToStreamDestroyed() {
		this.session.on('streamDestroyed', (event: StreamEvent) => {
			const connectionId = event.stream.connection.connectionId;
			if (event.reason === "networkDisconnect") {
				this.remoteUsersService.removeUserByConnectionId(connectionId);
				if (event.stream.typeOfVideo !== 'SCREEN') {
					Object.assign(event.stream.connection, { time: Math.round(new Date().getTime() / 1000) }) // assign destroyed stream time to stream object (Jahid)
					Object.assign(event.stream.connection, { is_stream_available: false }) // assign new stream available flag to stream object (Jahid)
					event.stream.streamManager.stream.videoActive = false
					const subscriber: Subscriber = this.session.subscribe(event.stream, undefined);
					this.remoteUsersService.add(event, subscriber, event.reason);
				}
			} else {
				this.remoteUsersService.removeUserByConnectionId(connectionId);
				// event.preventDefault();
			}
		});
	}

	private subscribeToConnectionCreated() {
		this.session.on('connectionCreated', (event: ConnectionEvent) => {
			this.log.d('connectionCreated', event);
			// event.preventDefault();
			this.autoRecording()		
		});
	}
	// Emit publisher to webcomponent
	emitPublisher(publisher: Publisher) {
		this._publisher.emit(publisher);
	}

	private subscribeToStreamPropertyChange() {
		this.session.on('streamPropertyChanged', (event: StreamPropertyChangedEvent) => {
			const connectionId = event.stream.connection.connectionId;
			if (this.oVSessionService.isMyOwnConnection(connectionId)) {
				return;
			}
			if (event.changedProperty === 'videoActive') {
				this.remoteUsersService.updateUsers();
			}
			if (event.changedProperty === 'audioActive') {
				this.remoteUsersService.updateUsers();
			}
		});
	}

	private subscribeToNicknameChanged() {
		this.session.on('signal:nicknameChanged', (event: any) => {
			const connectionId = event.from.connectionId;
			if (this.oVSessionService.isMyOwnConnection(connectionId)) {
				return;
			}
			const nickname = JSON.parse(event.data).nickname;
			this.remoteUsersService.updateNickname(connectionId, nickname);
		});
	}

	private subscribeSignal() {
		this.session.on('signal', (event: any) => {
			console.log(event);
			if (event.type === 'signal:mute') {
				this.toggleMic();
				this.notificationService.globalNotificationShow('Host mute your mic');
			}
			if (event.type === 'mute') {
				this.toggleMic();
				this.notificationService.globalNotificationShow('Host mute your mic');
			}
			if (event.type === 'signal:unmute') {
				this.toggleMic();
				this.notificationService.globalNotificationShow('Host unmute your mic');
			}

			if (event.type === 'signal:muteFromMobileUser') {
				// this.notificationService.globalNotificationShow('Host unmute your mic');
				const connectionId = event.data;
				this.muteUnmuteFromMobileUser(connectionId, false);
			}

			if (event.type === 'signal:unmuteFromMobileUser') {
				// this.notificationService.globalNotificationShow('Host unmute your mic');
				const connectionId = event.data;
				this.muteUnmuteFromMobileUser(connectionId, true);
			}

			if (event.type === 'signal:videoOnFromMobileUser') {
				// this.notificationService.globalNotificationShow('Host unmute your mic');
				const connectionId = event.data;
				this.videoOnOffFromMobileUser(connectionId, true);
			}

			if (event.type === 'signal:videoOffFromMobileUser') {
				// this.notificationService.globalNotificationShow('Host unmute your mic');
				const connectionId = event.data;
				this.videoOnOffFromMobileUser(connectionId, false);
			}

			if (event.type === 'signal:recordingStarted') {
				let connId = event.data.split("from:")[1].split("user_name:")[0];
				let recorderName = event.data.split("from:")[1].split("user_name:")[1]

				let text = recorderName + " is recording the session";
				if (localStorage.getItem('selected_lang') === 'bn') {
					text = recorderName + " কল রেকর্ডিং করছে";
				}
				localStorage.setItem("isRecordingStarted", "true");
				localStorage.setItem("recordingOwner", recorderName);
				localStorage.setItem("gotRecordingResponse", "true");
				if (this.oVSessionService.isMyOwnConnection(connId)) {
					return;
				}
				document.getElementById('recording-start-opponent-state').innerText = text;
				document.getElementById('recording-start-opponent-state').style.display = "block";
				document.getElementById('startrecording').style.display = "none";
			}

			if (event.type === 'signal:recordingStopped') {
				document.getElementById('recording-start-opponent-state').style.display = "none";
				document.getElementById('startrecording').style.display = "inline-block";
				localStorage.setItem("isRecordingStarted", "false");
				localStorage.setItem("recordingOwner", "");
				localStorage.setItem("gotRecordingResponse", "false");
				localStorage.setItem("recordingid", "");
			}

			if (event.type === 'signal:isRecordingStarted') {
				let response = "";
				// if (this.oVSessionService.isMyOwnConnection(event.data)) {
				// 	return;
				// }
				if (localStorage.getItem("isRecordingStarted") === "true") {
					response = "from:" + this.oVSessionService.getMyOwnConnectionId() + "user_name:" + localStorage.getItem("recordingOwner");
				}

				let connection = event.data;
				let type = "recordingResponse";
				// console.log("recording response: "+ response);
				this.networkSrv.sendSignal(this.oVSessionService.getSessionId(), connection, type, response).subscribe(
					(result) => {
						console.log('signal service from recording', result);
					},
					(err) => {
						console.log('signal service from recording', err);
					}
				);
			}

			if (event.type === 'signal:recordingResponse') {
				let connId = event.data.split("from:")[1].split("user_name:")[0];
				let recorderName = event.data.split("from:")[1].split("user_name:")[1]

				let text = recorderName + " is recording the session";
				if (localStorage.getItem('selected_lang') === 'bn') {
					text = recorderName + " কল রেকর্ডিং করছে";
				}
				// if (this.oVSessionService.isMyOwnConnection(connId)) {
				// 	return;
				// }
				if (recorderName === this.authUser.user_name) {
					return;
				}
				// if(localStorage.getItem("isRecordingStarted") === "true"){
				// 	return;
				// }
				// console.log("recording response signal: " + text);
				if (localStorage.getItem("gotRecordingResponse") != "true") {
					document.getElementById('recording-start-opponent-state').innerText = text;
					document.getElementById('recording-start-opponent-state').style.display = "block";
					document.getElementById('startrecording').style.display = "none";
					localStorage.setItem("isRecordingStarted", "true");
					localStorage.setItem("recordingOwner", recorderName);
					localStorage.setItem("gotRecordingResponse", "true");
				}
			}
		});
	}
	public muteUnmuteFromMobileUser(connectionId, audioActive: boolean) {
		this.remoteUsers.forEach((user) => {
			if (connectionId === user.getConnectionId()) {
				let userStremManager: StreamManager;
				userStremManager = user.getStreamManager();
				userStremManager.stream.audioActive = audioActive;
				user.setStreamManager(userStremManager);
				this.remoteUsersService.updateUsers();
			}
		});
	}

	public videoOnOffFromMobileUser(connectionId, videoActive: boolean) {
		this.remoteUsers.forEach((user) => {
			if (connectionId === user.getConnectionId()) {
				let userStremManager: StreamManager;
				userStremManager = user.getStreamManager();
				userStremManager.stream.videoActive = videoActive;
				user.setStreamManager(userStremManager);
				this.remoteUsersService.updateUsers();
			}
		});
	}

	private subscribeToMuteRemoteUserMobile() {
		this.session.on('mute', (event: any) => {
			console.log('subscribeToMuteRemoteUserMobile');
		});
	}
	private subscribeToSpeachDetection() {
		this.log.d('Subscribe to speach detection', this.session);
		// Has been mandatory change the user zoom property here because of
		// zoom icons and cannot handle publisherStartSpeaking event in other component
		this.session.on('publisherStartSpeaking', (event: PublisherSpeakingEvent) => {
			const someoneIsSharingScreen = this.remoteUsersService.someoneIsSharingScreen();
			if (!this.oVSessionService.isScreenShareEnabled() && !someoneIsSharingScreen) {
				const elem = event.connection.stream.streamManager.videos[0].video;
				const element = this.utilsSrv.getHTMLElementByClassName(elem, LayoutType.ROOT_CLASS);
				this.resetAllBigElements();
				this.remoteUsersService.setUserZoom(event.connection.connectionId, true);
				this.onToggleVideoSize({ element });
			}
		});
	}

	private removeScreen() {
		this.oVSessionService.disableScreenUser();
		this.oVSessionService.unpublishScreen();
	}

	private subscribeToChatComponent() {
		this.chatSubscription = this.chatService.toggleChatObs.subscribe((opened) => {
			const timeout = this.externalConfig ? 300 : 0;
			this.updateOpenViduLayout(timeout);
		});
	}

	private subscribeToReconnection() {
		this.session.on('reconnecting', () => {

			this.spinnerBGColor = '#000000' // set spinner color and text if internet drop (Jahid)
			this.spinnerText = 'Trying to reconnect the meeting'
			this.spinner.show()
			this.networkDropCounterHandler()

			this.log.w('Connection lost: Reconnecting');
			this.isConnectionLost = true;
			this.utilsSrv.showErrorMessage(
				'Trying to reconnect',
				!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
					? 'মিটিং এ পুনরায় সংযোগ দেয়ার চেষ্টা করা হচ্ছে|'
					: 'Trying to reconnect to the meeting.',
				true
			);
		});
		this.session.on('reconnected', () => {
			this.log.w('Connection lost: Reconnected');
			this.isConnectionLost = false;
			this.utilsSrv.closeDialog();
			this.networkDropIntervalClear()
			this.leaveSession(null, (JSON.parse(localStorage.getItem('meetingInfo_current')).meeting_url || true)); // leave then reconnect after internet back(Jahid)
		});
		this.session.on('sessionDisconnected', (event: SessionDisconnectedEvent) => {
			if (event.reason === 'networkDisconnect') {
				this.utilsSrv.closeDialog();
				// You lost your connection to the meeting
				// 'আপনি মিটিংয়ে আপনার সংযোগটি হারিয়েছেন'
				const message =
					!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
						? 'আপনি মিটিংয়ে আপনার সংযোগটি হারিয়েছেন'
						: 'You lost your connection to the meeting.';
				this.notificationService.globalNotificationShow(message);
				this.networkDropIntervalClear()
				this.leaveSession(null, (JSON.parse(localStorage.getItem('meetingInfo_current')).meeting_url || true)); // leave then reconnect after internet back(Jahid)
			}
		});
	}

	private initScreenPublisher(): Publisher {
		const videoSource = ScreenType.SCREEN;
		const willThereBeWebcam = this.oVSessionService.isWebCamEnabled() && this.oVSessionService.hasWebcamVideoActive();
		const hasAudio = willThereBeWebcam ? false : this.oVSessionService.hasWebcamAudioActive();
		const resulation = this.oVDevicesService.getVideoResulation();
		const frameRate = this.oVDevicesService.getVideoFrameRate();
		const properties = this.oVSessionService.createProperties(videoSource, undefined, true, false, false, resulation, frameRate);

		try {
			return this.oVSessionService.initScreenPublisher(undefined, properties);
		} catch (error) {
			this.log.e(error);
			this.utilsSrv.handlerScreenShareError(error);
		}
	}

	private async getToken(): Promise<string> {
		this.log.d('Generating tokens...');
		try {
			return await this.networkSrv.getToken(this.mySessionId);
		} catch (error) {
			this._error.emit({ error: error.error, messgae: error.message, code: error.code, status: error.status });
			this.log.e(
				!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
					? ' কথা বলার সুযোগ দেয়া গেল না,যান্ত্রিক গোলযোগের জন্য'
					: 'Cannot give you the floor to talk, due to an error:',
				error.status,
				error.message
			);
			this.utilsSrv.showErrorMessage(
				!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
					? ' কথা বলার সুযোগ দেয়া গেল না,যান্ত্রিক গোলযোগের জন্য'
					: 'Cannot give you the floor to talk, due to an error:',
				error.error || error.message
			);
		}
	}

	private sendNicknameSignal(nickname: string, connection?: Connection) {
		const signalOptions: SignalOptions = {
			data: JSON.stringify({ nickname }),
			type: 'nicknameChanged',
			to: connection ? [connection] : undefined
		};
		this.session.signal(signalOptions);
	}

	// Mute/Unmute remote user forcefully.
	muteUnmute($event) {
		this.muteUnmuteSignal($event.data, $event.connection.stream.connection);
	}
	muteUnmuteSignal(data: string, connection: Connection) {
		console.log(data, connection);
		const signalOptions: SignalOptions = {
			data: 'mute and unmute data',
			type: data,
			to: connection ? [connection] : undefined
		};
		this.session.signal(signalOptions);
	}

	private updateOpenViduLayout(timeout?: number) {
		if (!!this.openviduLayout) {
			if (!timeout) {
				this.openviduLayout.updateLayout();
				return;
			}
			setTimeout(() => {
				this.openviduLayout.updateLayout();
			}, timeout);
		}
	}

	private resetAllBigElements() {
		this.utilsSrv.removeAllBigElementClass();
		this.remoteUsersService.resetUsersZoom();
		this.oVSessionService.resetUsersZoom();
	}

	private subscribeToLocalUsers() {
		this.oVUsersSubscription = this.oVSessionService.OVUsers.subscribe((users) => {
			this.localUsers = users;
			this.updateOpenViduLayout();
		});
	}

	private subscribeToRemoteUsers() {
		this.remoteUsersSubscription = this.remoteUsersService.remoteUsers.subscribe((users) => {
			this.remoteUsers = [...users];
			this.updateOpenViduLayout();
		});
	}

	//PTV mode floor user (bfcp) userLayout show bigger and rest of are small (Jahid)
	private floorUserLayoutHandler(floorQuery) {
		if (floorQuery.length > 0) {
			this.resetAllBigElements()
			floorQuery.map((f_user) => {
				this.remoteUsers.map((r_user) => {
					if (f_user.user_id === JSON.parse(r_user.streamManager.stream.connection.options.metadata).user_id) {
						var remoteUser = document.getElementById(r_user.streamManager.stream.connection.options.id)
						if (!!remoteUser) remoteUser.click()
					}
				})
				if (f_user.user_id === this.authUser.id) {
					var localUser = document.getElementById('local')
					if (!!localUser) localUser.click()
				}
			})
		} else {
			this.resetAllBigElements()
		}
	}

	// coutdown timer after internet drop (Jahid)
	networkDropCounterHandler() {
		let counterRepeat = 1
		this.interval = setInterval(() => {
			console.log('tst', this.counter)
			if (this.counter > 0) { // couter decrement from 10 to 0
				this.counter--;
			} else {
				if (counterRepeat < 4) { // coutdown repate 3 times
					counterRepeat++
					this.counter = 10;
				} else {
					this.networkDropIntervalClear() // if internet didn't get back then clear interval and redirect to the room or dashboard
					const selectedMeetingInfo: any = JSON.parse(localStorage.getItem('meetingInfo_current'));
					if (selectedMeetingInfo.tag === 'room-box') {
						// this.router.navigate(['dashboard/room-box']).then((x) => {
						window.location.reload()
						// })
					} else {
						// this.router.navigate(['/dashboard/home']).then((x) => {
						window.location.reload()
						// })
					}
				}
			}
		}, 1000)
	}

	//Countdown timer for room meeting initiator who is not owner of the room (Jahid)
	countDownTimerForHost(event) {
		if (event === 'ptv') {
			this.countDownTimer(this.bfcpFloorService)
			setTimeout(() => {
				this.onAudioVideoBoth()
			}, 1000);

		} else {
			if (this.countDownTimerObj) {
				clearTimeout(this.countDownTimerObj);
				this.isTimerShow = false;
				this.countDownValue = '';
				this.bfcpFloorService.countDownValue$.next(this.countDownValue);
			}
		}
	}

	//Countdown timer clear for network dropped (Jahid)
	networkDropIntervalClear() {
		if (this.interval) {
			clearTimeout(this.interval)
			this.counter = ''
			this.interval = undefined
		}
	}
	setCallInitiatorId(chair_id) {
		let meetingInfo = JSON.parse(localStorage.getItem('meetingInfo_current'));
		Object.assign(meetingInfo, { chair_id: chair_id });
		localStorage.setItem('meetingInfo_current', JSON.stringify(meetingInfo));
		this.meetingService.callInitiatorId = chair_id
	}

	async stopRecordingBeforeLeave(selectedMeetingInfo) {
		//recording stoppped during session disconnect
		try {
			let elemStart = document.getElementById('startrecording');
			let elemStop = document.getElementById('stoprecording');
			let recordingId = localStorage.getItem("recordingid");
			console.log("recording service before leave: " + recordingId);
			// this.networkSrv.stopRecording(localStorage.getItem("recordingid").toString()).subscribe(
			// 	(result) => {
			// 		console.log('recording stop service', result);
			// 		if(result.status === "stopped" || result.status === "ready")
			// 		{
			// this.recordingStopped = true;
			elemStop.style.display = "none";
			elemStart.style.display = 'inline-block';
			// this.isDisabled = false;

			//text show/hide
			document.getElementById('recording-start-state').style.display = "none";
			document.getElementById('recording-started-state').style.display = "none";
			document.getElementById('recording-start-opponent-state').style.display = "none";

			localStorage.setItem("isRecordingStarted", "false");
			localStorage.setItem("recordingOwner", "");
			localStorage.setItem("gotRecordingResponse", "false");
			localStorage.setItem("recordingid", "");

			let rowId = "";
			if (localStorage.getItem("rowId") != null) {
				rowId = localStorage.getItem("rowId").toString();
			}
			//recording json file read 

			// let recObj = this.readRecordingInfoFromZipFile("Downloads");													
			let fileName = "";
			if (selectedMeetingInfo.conference_name == null || selectedMeetingInfo.conference_name == "") {
				fileName = recordingId;
			}
			else {
				fileName = selectedMeetingInfo.conference_name
			}

			//update recording data	
			this.readRecordingInfoFromZipFile(recordingId, fileName)
				.then((x: any) => {
					console.log("shuru unzip response: part")
					console.log(x);
					let users = x.user_ids;
					let details = JSON.stringify(x.details);
					let postModel = {
						"recording_id": recordingId,
						"status": "ready",
						"session_id": recordingId,
						"meeting_id": selectedMeetingInfo.id,
						"name": fileName,
						"id": rowId,
						"user_ids": users,
						"details": details
					}
					this.recordingService.post(postModel).subscribe(res => {
						if (res.status === "ok") {
							console.log("Updated Successfully")
						}
					})
				})
			// },
			// (err) =>{
			// 	console.log(err);
			// }
			// );	
			// send recording stopped signal to others
			let connection = [];
			let type = "recordingStopped";
			const data = this.authUser.user_name + ' is stopped the call';
			this.networkSrv.sendSignal(this.oVSessionService.getSessionId(), connection, type, data).subscribe(
				(result) => {
					console.log('signal service from recording', result);
				},
				(err) => {
					console.log('signal service from recording', err);
				}
			);

			// 		else{

			// 		}
			// 	},
			// 	(err) => {
			// 		console.log('recording stop service', err);
			// 		setInterval(function(){
			// 			document.getElementById('recording-failed-state').style.display = "block";
			// 		}, 5000); 				
			// 	}
			// );			
		} catch (error) {
			console.log(error);
		}
	}

	readRecordingInfoFromZipFile(recordingId, file_name) {
		return new Promise((resolve, reject) => {
			let recordingObj = {
				"user_ids": [],
				"details": []
			}

			this.unzipperService.DownloadandUnzipFiles(recordingId, file_name + ".zip").subscribe(
				(x) => {
					if (x.status === 200) {
						if (x.result != "") {
							x.result.files.forEach(element => {
								let detailsObj = {
									"user_id": "",
									"streamId": ""
								}
								detailsObj.streamId = element.streamId;
								if (element.clientData != null || element.clientData != "") {
									let obj = JSON.parse(element.clientData);
									recordingObj.user_ids.push(obj.clientData);
									detailsObj.user_id = obj.clientData;
									console.log(detailsObj);
								}
								recordingObj.details.push(detailsObj);
							});
							resolve(recordingObj);
						}
					}
				},
				(err) => {
					reject(err);
				}
			);
		});


		// } catch (error) {
		// 	console.log("error from readRecordingInfoFromZipFile" + error);
		// 	return null;
		// }

	}

	notifyRoomUser(users) {
		this.meetingService.notify(users).subscribe((result) => {
			if (result.status == 'ok') {
				console.log(result)
			}
		}, (error) => {
			console.log(error)
		})
	}

	isRoomMeeting(): boolean {
		return this.meetingService.isRoomMeeting()
	}

	getMeetingUsers(): [] {
		return this.meetingService.getMeetingUsers()
	}

	notifyRoomUserModelGenerator(users) {
		return this.meetingService.notifyRoomUserModelGenerator(users)
	}

	getCurrentMeetingInfo() {
		return this.meetingService.getCurrentMeetingInfo()
	}

	getSessionUserId() {
		return this.meetingService.getSessionUserId()
	}

	callLogBindWithChat(is_call_started: boolean) {
		if (is_call_started) {
			if (this.getCurrentMeetingInfo().chair_id === this.getSessionUserId()) {
				this.xmppChatService.sendgroupmessageInlineCallLog(this.getCurrentMeetingInfo(), "Call started#Call started");
			}
		} else {
			this.xmppChatService.sendgroupmessageInlineCallLog(this.getCurrentMeetingInfo(), "Call ended#Call ended");
		}
	}

	record(record){
		this.recodingList.push(window.location.origin + '/#/playback?meeting_id=' + record.meeting_id + '&session_id=' + record.session_id )
	}

	sendRecordingToRoomUser(users){
		this.meetingService.notify(users, this.recodingList).subscribe((result) => {
			if(result.status == 'ok'){
				console.log(result)
			}
		}, (error) => {
			console.log(error)
		})
	}

	isMeetingAutoRecord(){
		return this.meetingService.isMeetingAutoRecord()
	}

	isCallInitiator(){
		return this.meetingService.isCallInitiator()
	}

	waitForHost(message){
		if(message == 'Please provide password.' || message == 'দয়া করে পাসওয়ার্ড দিন।')
			Swal.fire('Warning', message, 'warning');
			else this.isWaitForHost = true
	}

	autoRecording(){
		if(this.isMeetingAutoRecord()){
			if(this.isCallInitiator()){
					const startRecordingID = document.getElementById('startrecording')
					if(!!startRecordingID){
						startRecordingID.click()
					}
			}
		}
	}

	joinAfterReconnectByAutoBtnClick(meeting_url?){
		var time: number = 0
		if(typeof meeting_url === 'string'){
			time = 7000
		}else {
			time = 5000
		}
		setTimeout(() => {
			const joinBtn = document.getElementById('joinBtn')
			if (!!joinBtn) {
				joinBtn.click()
			}
		}, time);
	}

	removeUtilItemFromStorage(){
		if (localStorage.hasOwnProperty('in_call')) {
			localStorage.removeItem('in_call')
		}

		if (localStorage.hasOwnProperty("meeting_password")) { 
			localStorage.removeItem('meeting_password')
		}
	}

	redirectAfterLeave(callFrom, meeting_url, selectedMeetingInfo){
		if (selectedMeetingInfo.tag === 'room-box' || selectedMeetingInfo.tag === 'room-box-meeting') {
			if (selectedMeetingInfo.tag === 'room-box-meeting') {
				if (selectedMeetingInfo.redirectTo === 'global_schedule') {
					this.router.navigate(['/dashboard/schedule']);
				} else if (selectedMeetingInfo.redirectTo === 'box_schedule') {
					this.router.navigate(['dashboard/room-box/details/' + selectedMeetingInfo.meeting_id]).then((x) => {
						if (!meeting_url) {
							this.removeUtilItemFromStorage() // normal meeting leave remove local stroage item (Jahid)
						} else {
							this.router.navigate(['/meeting/room-box/0/0']).then((x) => { //redirect room meeting then connect by btn click (Jahid)
								this.joinAfterReconnectByAutoBtnClick(meeting_url)
							})
						}
					})
				}

				this.xmppChatService.selectedGroup = selectedMeetingInfo;
				this.roomBoxServices.isRoomScheduleSelected$.next(true);
			} else {
				this.router.navigate(['dashboard/room-box/details/' + selectedMeetingInfo.id]).then((x) => {
					if (!meeting_url) {
						 this.removeUtilItemFromStorage() // normal meeting leave remove local stroage item (Jahid)
					} else {
						this.router.navigate(['/meeting/room-box/0/0']).then((x) => { //redirect room meeting then connect by btn click (Jahid)
							this.joinAfterReconnectByAutoBtnClick(meeting_url)
						})
					}
				});
			}
		} else {
			if (this.accountService.currentUser && this.accountService.currentUser.role_name === 'UnRegisteredGuest') {
				return this.guest_signout();
			}
			if (callFrom === 'roomConfig') {
				this.router.navigate(['/dashboard/home']);
			} else {
				this.router
					.navigate(['/dashboard/home'])
					.then((x) => {
						if (!!x) {
							if (!meeting_url) {
								this.removeUtilItemFromStorage() // normal meeting leave remove local stroage item (Jahid)
								window.location.reload();
							} else {
								this.router.navigate([meeting_url.split('#')[1]]).then((x) => { //redirect meeting then connect by btn click (Jahid)
									this.joinAfterReconnectByAutoBtnClick(meeting_url)
								}).catch((err) => {
									console.log(err)
								})
							}
						}
					})
					.catch((err) => {
						console.log(err);
					});
			}
		}
	}
}
