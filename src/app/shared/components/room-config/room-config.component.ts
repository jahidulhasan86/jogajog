import { Component, OnInit, Output, EventEmitter, Input, HostListener, OnDestroy, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { UserModel } from '../../models/user-model';
import { NicknameMatcher } from '../../forms-matchers/nickname';
import { UtilsService } from '../../services/utils/utils.service';
import { Publisher } from 'openvidu-browser';
import { ActivatedRoute, Params } from '@angular/router';
import { OpenViduSessionService } from '../../services/openvidu-session/openvidu-session.service';
import { IDevice, CameraType } from '../../types/device-type';
import { DevicesService } from '../../services/devices/devices.service';
import { Subscription, from } from 'rxjs';
import { AvatarType } from '../../types/chat-type';
import { LoggerService } from '../../services/logger/logger.service';
import { ILogger } from '../../types/logger-type';
import { ScreenType } from '../../types/video-type';
import { ExternalConfigModel } from '../../models/external-config';
import { OvSettingsModel } from '../../models/ovSettings';
import { StorageService } from '../../services/storage/storage.service';
import { Router } from '@angular/router';
import { MeetingService } from '../../services/meeting/meeting.service';
import Swal from 'sweetalert2';
import { GlobalValue, video_resulation } from 'src/app/global';
import { AccountService } from '../../services/account/account.service';
import { MessagingService } from '../../services/messaging/messaging.service';
import { XmppChatService } from '../../services/xmpp-chat/xmpp-chat.service';
import { timeInterval } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';

let self;
@Component({
	selector: 'app-room-config',
	templateUrl: './room-config.component.html',
	styleUrls: ['./room-config.component.css']
})
export class RoomConfigComponent implements OnInit, OnDestroy {
	private readonly USER_NICKNAME = 'jagajagCallNickname';
	@ViewChild('bodyCard') bodyCard: ElementRef;

	@Input() externalConfig: ExternalConfigModel;
	@Input() ovSettings: OvSettingsModel;
	@Input() isProgress;
	@Output() join = new EventEmitter<any>();
	@Output() leaveSession = new EventEmitter<any>();

	// Webcomponent event
	@Output() publisherCreated = new EventEmitter<any>();

	@Input() isWaitForHost: boolean

	mySessionId: string;

	cameras: IDevice[];
	microphones: IDevice[];
	camSelected: IDevice;
	micSelected: IDevice;
	isVideoActive = true;
	isAudioActive = true;
	// volumeValue = 100;
	oVUsersSubscription: Subscription;
	localUsers: UserModel[] = [];
	randomAvatar: string;
	videoAvatar: string;
	avatarSelected: AvatarType;
	columns: number;

	nicknameFormControl = new FormControl('', [Validators.required]);
	roomNameFormControl = new FormControl('', [Validators.required]);
	passwordFormControl = new FormControl('', []);
	matcher = new NicknameMatcher();
	hasVideoDevices: boolean;
	hasAudioDevices: boolean;
	showConfigCard: boolean;
	private log: ILogger;
	sUser: any;
	isParamValue: boolean;
	validMeetingInfo = false;
	is_req_password: any = false;
	meetingToken: any;
	globalValue: any;
	videoResulation: string;
	videoFrameRate: number;
	videoResulationType: string;
	hideMeetindId: boolean;
	meeting_password: any;
	isPopedOut: boolean;
	isWaitForHostInterval: NodeJS.Timeout;
	currentMeetingInfo: any;
	constructor(
		private route: ActivatedRoute,
		private utilsSrv: UtilsService,
		public oVSessionService: OpenViduSessionService,
		private oVDevicesService: DevicesService,
		private loggerSrv: LoggerService,
		private storageSrv: StorageService,
		private router: Router,
		private accountService: AccountService,
		private messagingService: MessagingService,
		private xmppChatService: XmppChatService,
		private meetingService: MeetingService,
		private spinner: NgxSpinnerService
	) {
		this.log = this.loggerSrv.get('RoomConfigComponent');
		this.globalValue = GlobalValue;
		this.hideMeetindId = false;
		this.isPopedOut = false;
	}

	@HostListener('window:beforeunload')
	beforeunloadHandler() {
		this.close();
	}

	async ngOnInit() {
		this.sUser = JSON.parse(localStorage.getItem('sessionUser'));
		this.subscribeToUsers();
		this.setNicknameForm();
		this.setRandomAvatar();
		this.columns = window.innerWidth > 900 ? 2 : 1;
		this.getParams();
		await this.oVDevicesService.initDevices();
		this.setDevicesInfo();
		this.initwebcamPublisher();

		if (window.opener) {
			this.isPopedOut = true;
			$('#roomConfig').css('display', 'none');
			$('#dashboardSideBar').css('z-index', '0');
			this.spinner.show();
			const checkExistVideo = setInterval(function () {
				const joinButton = document.getElementById('joinBtn');
				if (joinButton) {
					joinButton.click();
					clearInterval(checkExistVideo);
				}
			}, 100);
		  }
		// publisher.on('streamAudioVolumeChange', (event: any) => {
		//   this.volumeValue = Math.round(Math.abs(event.value.newValue));
		// });
		this.removeUtilCallItemFromStorage()
	}

	ngOnChanges(changes: SimpleChanges) {
		if(this.isWaitForHost){
			if(this.isWaitForHostInterval){
				clearTimeout(this.isWaitForHostInterval)
			}
			this.autoRoomJoinAfterHostJoined()
		}
	}

	ngOnDestroy() {
		this.oVUsersSubscription.unsubscribe();
	}

	async onCameraResulationChange(res: string) {
		// const resulation = video_resulation[res].resulation;
		// const frameRate = video_resulation[res].frameRate;

		// const micStorageDevice = this.micSelected?.device || undefined;
		// const camStorageDevice = this.camSelected?.device || undefined;

		// const videoSource = this.hasVideoDevices ? camStorageDevice : false;
		// const audioSource = this.hasAudioDevices ? micStorageDevice : false;

		// await this.oVSessionService.changeResulation(videoSource, audioSource, resulation, frameRate);
		// // Publish Webcam
		// this.oVSessionService.publishVideo(true);
		// this.isVideoActive = true;

		// // Set and Get Video Resulation & FrameRate
		// this.oVDevicesService.setVideoResulationType(res);
		// this.oVDevicesService.setVideoResulation(video_resulation[res].resulation); // save resulation globally
		// this.oVDevicesService.setVideoFrameRate(video_resulation[res].frameRate); // save framerate globally
		// this.videoResulationType = this.oVDevicesService.getVideoResulationType();
		// this.videoResulation = this.oVDevicesService.getVideoResulation();
		// this.videoFrameRate = this.oVDevicesService.getVideoFrameRate();
		// return;
		this.oVSessionService.destryoWebcamUser();

		this.oVDevicesService.setVideoResulation(video_resulation[res].resulation);
		this.oVDevicesService.setVideoFrameRate(video_resulation[res].frameRate);
		this.oVDevicesService.setVideoResulationType(res);
		this.videoResulationType = this.oVDevicesService.getVideoResulationType();
		this.videoResulation = this.oVDevicesService.getVideoResulation();
		this.videoFrameRate = this.oVDevicesService.getVideoFrameRate();

		this.initwebcamPublisher();
	}
	async onCameraSelected(event: any) {
		const videoSource = event?.value;
		if (!!videoSource) {
			// Is New deviceId different from the old one?
			if (this.oVDevicesService.needUpdateVideoTrack(videoSource)) {
				const mirror = this.oVDevicesService.cameraNeedsMirror(videoSource);
				const resulation = this.oVDevicesService.getVideoResulation();
				const frameRate = this.oVDevicesService.getVideoFrameRate();
				await this.oVSessionService.replaceTrack(videoSource, null, mirror, resulation, frameRate);
				this.oVDevicesService.setCamSelected(videoSource);
				this.camSelected = this.oVDevicesService.getCamSelected();
			}
			// Publish Webcam
			this.oVSessionService.publishVideo(true);
			this.isVideoActive = true;
			return;
		}
		// Unpublish webcam
		this.oVSessionService.publishVideo(false);
		this.isVideoActive = false;
	}

	async onMicrophoneSelected(event: any) {
		const audioSource = event?.value;

		if (!!audioSource) {
			// Is New deviceId different than older?
			if (this.oVDevicesService.needUpdateAudioTrack(audioSource)) {
				console.log(this.camSelected);
				const mirror = this.oVDevicesService.cameraNeedsMirror(this.camSelected.device);
				const resulation = this.oVDevicesService.getVideoResulation();
				const frameRate = this.oVDevicesService.getVideoFrameRate();
				await this.oVSessionService.replaceTrack(null, audioSource, mirror, resulation, frameRate);
				this.oVDevicesService.setMicSelected(audioSource);
				this.micSelected = this.oVDevicesService.getMicSelected();
			}
			// Publish microphone
			this.publishAudio(true);
			this.isAudioActive = true;
			return;
		}
		// Unpublish microhpone
		this.publishAudio(false);
		this.isAudioActive = false;
	}

	toggleCam() {
		this.isVideoActive = !this.isVideoActive;
		this.oVSessionService.publishVideo(this.isVideoActive);

		if (this.oVSessionService.areBothConnected()) {
			this.oVSessionService.disableWebcamUser();
			this.oVSessionService.publishScreenAudio(this.isAudioActive);
			// !this.subscribeToVolumeChange(<Publisher>this.localUsers[0].getStreamManager());
		} else if (this.oVSessionService.isOnlyScreenConnected()) {
			// (<Publisher>this.localUsers[0].getStreamManager()).off('streamAudioVolumeChange');
			this.oVSessionService.enableWebcamUser();
		}
	}

	toggleScreenShare() {
		if (this.oVSessionService.areBothConnected()) {
			this.oVSessionService.disableScreenUser();
			return;
		}

		if (this.oVSessionService.isOnlyWebcamConnected()) {
			const screenPublisher = this.initScreenPublisher();

			screenPublisher.on('accessAllowed', (event) => {
				screenPublisher.stream
					.getMediaStream()
					.getVideoTracks()[0]
					.addEventListener('ended', () => {
						this.log.d('Clicked native stop button. Stopping screen sharing');
						this.toggleScreenShare();
					});
				this.oVSessionService.enableScreenUser(screenPublisher);
				if (!this.oVSessionService.hasWebcamVideoActive()) {
					this.oVSessionService.disableWebcamUser();
				}
			});

			screenPublisher.on('accessDenied', (event) => {
				this.log.w('ScreenShare: Access Denied');
			});
			return;
		}
		this.oVSessionService.enableWebcamUser();
		this.oVSessionService.disableScreenUser();
	}

	toggleMic() {
		this.isAudioActive = !this.isAudioActive;
		this.publishAudio(this.isAudioActive);
	}

	takePhoto() {
		this.oVSessionService.setWebcamAvatar();
		this.videoAvatar = this.oVSessionService.getWebCamAvatar();
		this.oVSessionService.setAvatar(AvatarType.VIDEO);
	}

	setNicknameForm() {
		// if (this.externalConfig) {
		// 	this.nicknameFormControl.setValue(this.externalConfig.getNickname());
		// 	return;
		// }
		// const nickname = this.storageSrv.get(this.USER_NICKNAME) || this.utilsSrv.generateNickname();
		let userName: any;
		if (this.sUser) {
			userName = this.sUser.user_name;
		}
		if (this.sUser.role_name == 'UnRegisteredGuest') userName = this.sUser.first_name;
		this.nicknameFormControl.setValue(userName);
	}
	eventKeyPress(event) {
		if (event && event.keyCode === 13 && this.roomNameFormControl.valid && this.nicknameFormControl.valid) {
			// this.joinSession();
		} else {
			if (!this.isParamValue) {
				setTimeout(() => {
					const roomName: string = this.roomNameFormControl.value.replace(/ /g, '-'); // replace white spaces by -
					if (roomName.length === 13) {
						this.roomNameFormControl.setValue(roomName);
						this.setSessionName('meeting_code', roomName);
					} else {
						this.validMeetingInfo = false;
					}
				}, 50);
			}
		}
	}

	onResize(event) {
		this.columns = event.target.innerWidth > 900 ? 2 : 1;
	}

	// updateVolumeColor(): string {
	// 	// max = 0 / min = 100
	// 	if (this.volumeValue <= 20) {
	// 		return 'warn';
	// 	} else if (this.volumeValue > 20 && this.volumeValue <= 35) {
	// 		return 'accent';
	// 	} else if (this.volumeValue > 35) {
	// 		return 'primary';
	// 	}
	// }

	joinSession() {
		if (this.passwordFormControl) {
			this.meeting_password = this.passwordFormControl.value ? this.passwordFormControl.value : localStorage.getItem('meeting_password')
			this.oVSessionService.setMeetingPassword(this.meeting_password); // tonmoy
			if (this.meeting_password) {
				localStorage.setItem('meeting_password', this.meeting_password)
			}
		}
		if (this.roomNameFormControl.valid && this.nicknameFormControl.valid) {
			// this.localUsers.forEach(user => {
			// 	user.getStreamManager().off('streamAudioVolumeChange');
			// });
			// if (this.avatarSelected === AVATAR_TYPE.RANDOM) {
			// 	this.localUsers[0].removeVideoAvatar();
			// }
			// if (this.localUsers[1]) {
			// 	this.localUsers[1].setUserAvatar(this.localUsers[0].getAvatar());
			// }
			this.oVSessionService.setWebcamName(this.nicknameFormControl.value);
			this.storageSrv.set(this.USER_NICKNAME, this.nicknameFormControl.value);
			this.join.emit();
		}
		this.scrollToBottom();
	}

	close() {
		this.leaveSession.emit();
		this.showConfigCard = false;

		if (this.accountService.currentUser && this.accountService.currentUser.role_name == 'UnRegisteredGuest') this.guest_signout();
	}

	guest_signout() {
		this.messagingService.unregisteredDevice(this.accountService.currentUser.id).subscribe(
			(result) => {
				console.log(result);
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

	setAvatar(avatar: string) {
		// !! REFACTOR
		const avatarType = avatar === AvatarType.VIDEO ? AvatarType.VIDEO : AvatarType.RANDOM;
		if ((avatarType === AvatarType.RANDOM && this.randomAvatar) || (avatarType === AvatarType.VIDEO && this.videoAvatar)) {
			this.avatarSelected = avatarType;
			// if (avatarType === AVATAR_TYPE.RANDOM) {
			//   this.localUsers[0].setUserAvatar(this.randomAvatar);
			// }
		}
	}

	private setDevicesInfo() {
		this.hasVideoDevices = this.oVDevicesService.hasVideoDeviceAvailable();
		this.hasAudioDevices = this.oVDevicesService.hasAudioDeviceAvailable();
		this.microphones = this.oVDevicesService.getMicrophones();
		this.cameras = this.oVDevicesService.getCameras();
		this.camSelected = this.oVDevicesService.getCamSelected();
		this.micSelected = this.oVDevicesService.getMicSelected();
		this.videoResulationType = this.oVDevicesService.getVideoResulationType();
		this.videoResulation = this.oVDevicesService.getVideoResulation();
		this.videoFrameRate = this.oVDevicesService.getVideoFrameRate();
		// For
		// setTimeout(() => {
		// 	if (!this.hasVideoDevices) {
		// 		let configCardCameraButtonElem: any;
		// 		configCardCameraButtonElem = document.getElementById('configCardCameraButton');
		// 		if (configCardCameraButtonElem) {
		// 			configCardCameraButtonElem.click();
		// 			configCardCameraButtonElem.setAttribute('disabled', 'true');
		// 			configCardCameraButtonElem.setAttribute('style', 'cursor: not-allowed;');
		// 			configCardCameraButtonElem.setAttribute('title', 'No Camera Device Found. Please check your browser Permission.');
		// 		}
		// 	}
		// }, 500);
		let timeIntervalCount = 0;
		self = this;
		const setIntervalObj = setInterval(function () {
			if (!self.hasVideoDevices) {
				let configCardCameraButtonElem: any;
				configCardCameraButtonElem = document.getElementById('configCardCameraButton');
				if (configCardCameraButtonElem) {
					configCardCameraButtonElem.click();
					configCardCameraButtonElem.setAttribute('disabled', 'true');
					configCardCameraButtonElem.setAttribute('style', 'cursor: not-allowed;');
					configCardCameraButtonElem.setAttribute('title', 'No Camera Device Found. Please check your browser Permission.');
				}
				timeIntervalCount++;
				if (timeIntervalCount > 5) {
					clearInterval(setIntervalObj);
				}
			}
		}, 500);
	}

	private setSessionName(paramName, paramValue) {
		this.meetingService.getMeetingInfo(paramName, paramValue).subscribe(
			(result: any) => {
				if (result.status === 'ok') {
					if (
						this.accountService.currentUser &&
						this.accountService.currentUser.role_name == 'UnRegisteredGuest' &&
						result.result.isRequiredRegistration == '1'
					) {
						Swal.fire({
							title:
								!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
									? 'কেবল নিবন্ধিত ব্যবহারকারীরা এই সভায় যোগ দিতে পারবেন। দয়া করে নিবন্ধন করুন।'
									: 'Only registered users can join this meeting. Please register at first.',
							imageUrl: 'assets/images/logout.jpg',
							showCancelButton: false,
							confirmButtonColor: '#F4AD20',
							confirmButtonText:
								!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn' ? 'ঠিক আছে' : 'Ok'
						}).then((result) => {
							if (result.value) {
								this.close();
							}
						});
					}

					localStorage.setItem('meetingInfo_current', JSON.stringify(result.result));
					this.currentMeetingInfo = result.result
					this.meetingService.getMeetingInfo$.next(result.result);
					this.roomNameFormControl.setValue(result.result.meeting_code); // to show only view
					// this.mySessionId = result.result.id; // original session Id.
					// this.oVSessionService.setSessionId(this.mySessionId);
					this.validMeetingInfo = true;

					if (result.result.owner.host_id === this.sUser.id) {
						this.is_req_password = false;
					} else if (result.result.is_req_password === '0') {
						this.is_req_password = false;
					} else {
						this.is_req_password = true;
					}
				} else if (result.code === 200) {
					if (result.message.en === 'Company for this meeting is not matched.') {
						Swal.fire({
							icon: 'error',
							title: 'Company Miss Match',
							text:
								!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
									? result.message.bn
									: result.message.en
						});
					}
					this.oVSessionService.setSessionId(null);
					this.validMeetingInfo = false;
				} else {
					this.oVSessionService.setSessionId(null);
					this.validMeetingInfo = false;
				}
			},
			(err) => {
				console.log(err);
				if (err.error.code === 400) {
					// this.utilsSrv.showErrorMessage('Meeting Not Found', err.error.message.en, false);
					// Swal.fire({
					// 	icon: 'error',
					// 	title: 'Meeting Not Found',
					// 	text: 'Something went wrong!'
					// });
				}
				localStorage.setItem('meetingInfo_current', null);
				this.meetingService.getMeetingInfo$.next(null);
				this.oVSessionService.setSessionId(null);
				this.validMeetingInfo = false;
			}
		);
	}

	private setRoomBoxSessionName() {
		const selectedMeetingInfo = JSON.parse(localStorage.getItem('meetingInfo_current'));
		// this.meetingService.getMeetingInfoCast.subscribe((result) => {
		if (selectedMeetingInfo) {
			// localStorage.setItem('meetingInfo_current', JSON.stringify(result));
			// this.meetingService.getMeetingInfo$.next(result);
			this.roomNameFormControl.setValue(selectedMeetingInfo.meeting_code); // to show only view
			this.mySessionId = selectedMeetingInfo.id; // original session Id.
			this.oVSessionService.setSessionId(this.mySessionId);
			this.validMeetingInfo = true;

			if (selectedMeetingInfo.owner.host_id === this.sUser.id) {
				this.is_req_password = false;
			} else if (selectedMeetingInfo.is_req_password === '0') {
				this.is_req_password = false;
			} else {
				this.is_req_password = true;
			}
		} else {
			this.oVSessionService.setSessionId(null);
			this.validMeetingInfo = false;
		}
		// });
	}

	getParams() {
		this.route.params.subscribe((params: Params) => {
			// if any param found then go to else part. and if no param found then go to if part
			if (Object.keys(params).length === 0 && params.constructor === Object) {
				console.log('params is empty!');
				this.isParamValue = false;
				this.is_req_password = true;
				// see joinSession()
			} else {
				if (params.token !== 'room-box') {
					this.hideMeetindId = false;
					this.isParamValue = true;
					this.meetingToken = params.token;
					this.is_req_password = params.is_req_password === '1' ? true : false;
					this.setSessionName('meeting_token', this.meetingToken);
				} else if (params.token === 'room-box') {
					this.hideMeetindId = true;
					this.isParamValue = true;
					this.is_req_password = params.is_req_password === '1' ? true : false;
					this.setRoomBoxSessionName();
				}
			}
		});
	}
	private setRandomAvatar() {
		this.randomAvatar = this.utilsSrv.getOpenViduAvatar();
		this.oVSessionService.setAvatar(AvatarType.RANDOM, this.randomAvatar);
		this.avatarSelected = AvatarType.RANDOM;
	}

	private scrollToBottom(): void {
		try {
			this.bodyCard.nativeElement.scrollTop = this.bodyCard.nativeElement.scrollHeight;
		} catch (err) { }
	}

	private initScreenPublisher(): Publisher {
		const videoSource = ScreenType.SCREEN;
		const willThereBeWebcam = this.oVSessionService.isWebCamEnabled() && this.oVSessionService.hasWebcamVideoActive();
		const hasAudio = willThereBeWebcam ? false : this.isAudioActive;
		const properties = this.oVSessionService.createProperties(
			videoSource,
			undefined,
			true,
			hasAudio,
			false,
			this.videoResulation,
			this.videoFrameRate
		);

		try {
			return this.oVSessionService.initScreenPublisher(undefined, properties);
		} catch (error) {
			this.log.e(error);
			this.utilsSrv.handlerScreenShareError(error);
		}
	}

	private publishAudio(audio: boolean) {
		this.oVSessionService.isWebCamEnabled()
			? this.oVSessionService.publishWebcamAudio(audio)
			: this.oVSessionService.publishScreenAudio(audio);
	}

	private subscribeToUsers() {
		this.oVUsersSubscription = this.oVSessionService.OVUsers.subscribe((users) => {
			this.localUsers = users;
		});
	}

	private initwebcamPublisher() {
		const micStorageDevice = this.micSelected?.device || undefined;
		const camStorageDevice = this.camSelected?.device || undefined;

		const videoSource = this.hasVideoDevices ? camStorageDevice : false;
		const audioSource = this.hasAudioDevices ? micStorageDevice : false;
		const publishAudio = this.hasAudioDevices ? this.isAudioActive : false;
		const publishVideo = this.hasVideoDevices ? this.isVideoActive : false;
		const mirror = this.camSelected && this.camSelected.type === CameraType.FRONT;
		const resulation = this.oVDevicesService.getVideoResulation();
		const frameRate = this.oVDevicesService.getVideoFrameRate();
		const properties = this.oVSessionService.createProperties(
			videoSource,
			audioSource,
			publishVideo,
			publishAudio,
			mirror,
			resulation,
			frameRate
		);
		const publisher = this.oVSessionService.initCamPublisher(undefined, properties);
		this.handlePublisherSuccess(publisher);
		this.handlePublisherError(publisher);
	}

	private emitPublisher(publisher) {
		this.publisherCreated.emit(publisher);
	}

	private handlePublisherSuccess(publisher: Publisher) {
		publisher.once('accessAllowed', async () => {
			if (this.oVDevicesService.areEmptyLabels()) {
				await this.oVDevicesService.initDevices();
				if (this.hasAudioDevices) {
					const audioLabel = publisher.stream.getMediaStream().getAudioTracks()[0].label;
					this.oVDevicesService.setMicSelected(audioLabel);
				}

				if (this.hasVideoDevices) {
					const videoLabel = publisher.stream.getMediaStream().getVideoTracks()[0].label;
					this.oVDevicesService.setCamSelected(videoLabel);
				}
				this.setDevicesInfo();
			}
			// Emit publisher to webcomponent and angular-library
			this.emitPublisher(publisher);

			if (this.ovSettings.isAutoPublish()) {
				this.joinSession();
				return;
			}
			this.showConfigCard = true;
		});
	}

	private handlePublisherError(publisher: Publisher) {
		publisher.once('accessDenied', (e: any) => {
			let message: string;
			if (e.name === 'DEVICE_ACCESS_DENIED') {
				message =
					!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
						? 'মিডিয়া ডিভাইসের অনুমতি পাওয়া যায়নি'
						: 'Access to media devices was not allowed.';
			}
			if (e.name === 'NO_INPUT_SOURCE_SET') {
				message =
					!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
						? 'কোন ভিডিও বা অডিও ডিভাইস পাওয়া যায়নি|অনুগ্রহপূর্বক অন্ততপক্ষে একটি ডিভাইসের সাথে সংযুক্ত হোন|'
						: 'No video or audio devices have been found. Please, connect at least one.';
			}
			this.utilsSrv.showErrorMessage(e.name.replace(/_/g, ' '), message, true);
			this.log.e(e.message);
		});
	}

	autoRoomJoinAfterHostJoined(){
		const self = this
		this.isWaitForHostInterval = setInterval(function(){ 
			self.joinSession()
		}, 10000);
	}

	removeUtilCallItemFromStorage(){
		if (localStorage.hasOwnProperty("in_call")){
			localStorage.removeItem('in_call')
		}
	
		if (localStorage.hasOwnProperty("recordingOwner")){
			localStorage.removeItem('recordingOwner')
		}
	
		if (localStorage.hasOwnProperty("gotRecordingResponse")){
			localStorage.removeItem('gotRecordingResponse')
		}
	
		if (localStorage.hasOwnProperty("isRecordingStarted")){
			localStorage.removeItem('isRecordingStarted')
		}
	
		if (localStorage.hasOwnProperty("recordingid")){
			localStorage.removeItem('recordingid')
		}
	
		if (localStorage.hasOwnProperty("rowId")){
			localStorage.removeItem('rowId')
		}
		
	  }
}
