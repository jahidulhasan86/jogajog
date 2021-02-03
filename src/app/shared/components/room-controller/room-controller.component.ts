/*

 * Copyright (c) 2004-2020 by Protect Together, Inc.

 * All Rights Reserved

 * Protect Together Confidential

 */
import { Component, OnInit, Input, EventEmitter, Output, HostListener, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { UtilsService } from '../../services/utils/utils.service';
import { VideoFullscreenIcon } from '../../types/icon-type';
import { OvSettingsModel } from '../../models/ovSettings';
import { ChatService } from '../../services/chat/chat.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { UserModel } from '../../models/user-model';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { MeetingInfoComponent } from '../../../meeting-info/meeting-info.component';
import { GlobalService } from '../../services/global/global.service';
import { GlobalValue } from 'src/app/global';
import { OpenViduSessionService } from '../../services/openvidu-session/openvidu-session.service';
import { NetworkService } from '../../services/network/network.service';
import { BfcpFloorService } from '../../services/bfcp-floor/bfcp-floor.service';
import { MeetingService } from '../../services/meeting/meeting.service';
import { RecordingConfigModel } from '../../models/recordingConfig';
import { RecordingService } from '../../services/recording/recording.service'
import {UnzipperService} from '../../services/unzipper/unzipper.service'
import { de } from 'date-fns/locale';
import { resolve } from 'path';
import { error } from 'protractor';

 

export class TooltipListPipe implements PipeTransform {
	transform(lines: string[]): string {
		let list = '';

		lines.forEach((line) => {
			list += '• ' + line + '\n';
		});

		return list;
	}
}

@Component({
	selector: 'app-room-controller',
	templateUrl: './room-controller.component.html',
	styleUrls: ['./room-controller.component.css']
})
export class RoomControllerComponent implements OnInit, OnDestroy {
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

	@Input() currentFloorStatus: any;
	@Input() floorState_Custom: string;

	@Input() isTimerShow: boolean;
	@Input() recordingConfig = new RecordingConfigModel();

	@Output() micButtonClicked = new EventEmitter<any>();
	@Output() camButtonClicked = new EventEmitter<any>();
	@Output() screenShareClicked = new EventEmitter<any>();
	@Output() layoutButtonClicked = new EventEmitter<any>();
	@Output() leaveSessionButtonClicked = new EventEmitter<any>();
	@Output() xamppChat = new EventEmitter<any>();

	@Output() toggleAudioVideoForPtvClicked = new EventEmitter<any>();

	@Output() increaseTimer = new EventEmitter<any>();

	@Output() record = new EventEmitter<any>();
	newMessagesNum: number;
	private chatServiceSubscription: Subscription;

	fullscreenIcon = VideoFullscreenIcon.BIG;

	participantsNames: string[] = [];
	globalValue: any;
	isCallModePtv: boolean;
	isMeetingHost: boolean;
	countDownValue: string;
	enableRecording: boolean;
	recordingStarted: boolean;
	authUser = JSON.parse(localStorage.getItem('sessionUser'));
	recordingId: string;
	recordingStopped: boolean;
	meetingInfo: any;
	elemStart: any;
	elemStop: any;
	isDisabled: boolean;

	@Input()
	set participants(participants: UserModel[]) {
		this.participantsNames = [];
		participants.forEach((user) => {
			if (!user.isScreen()) {
				this.participantsNames.push(user.getNickname());
			}
		});
		this.participantsNames = [...this.participantsNames];
	}

	private subscriptions: Array<Subscription> = [];
	private isCallModePtvCastSubs: Subscription;
	private countDownValueSubs: Subscription;
	constructor(
		private utilsSrv: UtilsService,
		private chatService: ChatService,
		private dialog: MatDialog,
		public globalService: GlobalService,
		public openViduSessionService: OpenViduSessionService,
		public networkService: NetworkService,
		public bfcpFloorService: BfcpFloorService,
		public meetingService: MeetingService,
		private recordingService : RecordingService,
		private unzipperService : UnzipperService
	) {
		this.chatServiceSubscription = this.chatService.messagesUnreadObs.subscribe((num) => {
			this.newMessagesNum = num;
		});
		this.globalValue = GlobalValue;
	}

	ngOnInit() {
		this.isCallModePtvCastSubs = this.bfcpFloorService.isCallModePtvCast.subscribe((result) => {
			this.isCallModePtv = result;
		});
		this.enableRecording = true;
		this.recordingStarted = false;
		this.meetingInfo = JSON.parse(localStorage.getItem('meetingInfo_current'));
		this.isMeetingHost = this.meetingService.isMeetingHost();

		this.countDownValueSubs = this.bfcpFloorService.countDownValueCast.subscribe((result) => {
			if (result !== '' || result !== null) {
				// console.log(this.countDownValue);
				this.countDownValue = result;
			}
		});
		this.isDisabled = false;
	}

	ngOnDestroy(): void {
		this.chatServiceSubscription.unsubscribe();
		this.isCallModePtvCastSubs.unsubscribe();
		this.countDownValueSubs.unsubscribe();
		this.subscriptions.forEach((subscription: Subscription) => {
			subscription.unsubscribe();
		});
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
	leaveSession() {
		Swal.fire({
			title:
				!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
					? 'আপনি কি এই মুহূর্তে মিটিং ত্যাগ করতে চান?'
					: 'Do you want to leave this meeting?',
			// imageUrl: 'assets/images/logout.jpg',
			icon: 'info',
			showCancelButton: true,
			confirmButtonColor: '#F4AD20',
			cancelButtonColor: '#d33',
			confirmButtonText: !!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn' ? 'হ্যাঁ' : 'Yes',
			cancelButtonText:
				!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn' ? 'না' : 'No, Thanks'
		}).then((result) => {
			if (result.value) {
				this.leaveSessionButtonClicked.emit();
			}
		});
	}

	loadParticipents() {
		this.xamppChat.emit();
		if (this.chatService.isChatOpened()) {
			this.globalService.callScreenSideNavShowData$.next('participants');
		} else {
			this.globalService.callScreenSideNavShowData$.next('participants');
			this.chatService.toggleChat();
		}
	}

	toggleFullscreen() {
		this.utilsSrv.toggleFullscreen('videoRoomNavBar');
		this.fullscreenIcon = this.fullscreenIcon === VideoFullscreenIcon.BIG ? VideoFullscreenIcon.NORMAL : VideoFullscreenIcon.BIG;
	}

	public showMeetingInfo() {
		const meetingInfoDialog = this.dialog.open(MeetingInfoComponent, {
			disableClose: false,
			panelClass: 'meetingInfoDialog',
			width: '50%',
			data: {
				meetingInfo: this.meetingInfo
			}
		});
	}

	ownMuteUnmute(type) {
		// console.log('userMuteUnmuteClick');
		// this.muteUnmuteClick.emit({
		// 	data: type,
		// 	connection: connectionId
		// });
		const sessionId = this.openViduSessionService.getSessionId();
		let connection = [];
		const myConnectionId = this.openViduSessionService.getMyOwnConnectionId();
		const data = myConnectionId;
		this.networkService.sendSignal(sessionId, connection, type, data).subscribe(
			(result) => {
				console.log('signal service', result);
			},
			(err) => {
				console.log('signal service', err);
			}
		);
	}
	toggleAudioVideoForPtv(data: string) {
		if (data === 'RELEASE') {
			this.bfcpFloorService.releaseFloor();
		} else if (data === 'REQUESTING') {
			this.bfcpFloorService.requestFloor();
		} else {
			this.floorNotAvailableMsg()
		}
	}

	increaseTimerClick() {
		this.increaseTimer.emit();
	}

	private floorNotAvailableMsg() {
		Swal.fire({
			title:
				!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
					? 'দুঃখিত, অন্যদের কথা এখনো শেষ হয় নি | অনুগ্রহ-পূর্বক মাইক ফ্রি হওয়া পর্যন্ত অপেক্ষা করুন|'
					: 'Sorry, the others are not done talking. Please wait until the mic frees up.',
			icon: 'info',
			showConfirmButton: false,
			timer: 3000
		})
	}

	// Recording features
	startRecording() {	
		const sessionId = this.openViduSessionService.getSessionId();
		this.recordingConfig.setSession(sessionId.toString());
		let ovip = this.networkService.getOpenviduServerUrl();

		this.recordingConfig.setName(this.meetingInfo.conference_name);
		// this.recordingConfig.setOutputMode("INDIVIDUAL");
		this.isDisabled = true;
		document.getElementById('recording-start-state').style.display = "block";
		try {
			this.elemStart = document.getElementById('startrecording');		
			this.elemStop = document.getElementById('stoprecording');
			this.networkService.startRecording(this.recordingConfig, ovip).subscribe(
				(result) => {				
					if(result.status === "started"){
						this.recordingStarted = true;
						this.recordingStopped = false;
						this.recordingConfig.setRecordingId(result.id);
						
						this.elemStart.style.display = 'none';
						this.elemStop.style.display = 'inline-block';
	
						document.getElementById('recording-start-state').style.display = "none";
						document.getElementById('recording-started-state').style.display = "block";
						// let ovip = "bd.mediaserver.jagajag.com";
						
						console.log(ovip);
						//save recording data
						localStorage.setItem("recordingid", this.recordingConfig.getrecordingId().toString());
						let fileName = "";
						
						if(this.meetingInfo.conference_name==null || this.meetingInfo.conference_name== "")
						{
							fileName = this.recordingConfig.getrecordingId().toString();
						}
						else{
							fileName = this.meetingInfo.conference_name
						}	
						let postModel = {
							"recording_id": result.id,
							"status": result.status,
							"session_id": result.id,
							"meeting_id": this.meetingInfo.id,
							"name": fileName,
							"ov_ip": ovip,							
							"recording_url": ovip + "/recordings/" + result.id + "/"
						}
						this.recordingService.post(postModel).subscribe(res => {
							if(res.status === "ok")
							{
								console.log("successfully save recording data");
								if(res.result != null)
								{
									localStorage.setItem("rowId", res.result.id);
								}
							}
						})
	
						//send recording started signal to others
						let connection = [];
						let type = "recordingStarted";				
						const data = "from:"+this.openViduSessionService.getMyOwnConnectionId() + "user_name:" + this.authUser.user_name.toString();
						this.networkService.sendSignal(sessionId, connection, type, data).subscribe(
							(result) => {
								console.log('signal service from recording', result);
							},
							(err) => {
								console.log('signal service from recording', err);															
							}
						);
					}
					else{
						this.isDisabled = false;
						document.getElementById('recording-start-state').style.display = "none";
						setInterval(function(){
							document.getElementById('recording-failed-state').style.display = "block";
						}, 5000); 
					}
				},
				(err) => {
					this.isDisabled = false;
					console.log('recording start service', err);
					this.elemStart.style.display = 'inline-block';
					this.elemStop.style.display = 'none';
					document.getElementById('recording-start-state').style.display = "none";
					document.getElementById('recording-started-state').style.display = "none";
				}
			);
		} catch (error) {
			this.isDisabled = false;
			document.getElementById('recording-start-state').style.display = "none";
			setInterval(function(){
				document.getElementById('recording-failed-state').style.display = "block";
			}, 5000); 
		}	
	}
	stopRecording() {	
		try {
			this.elemStart = document.getElementById('startrecording');		
			this.elemStop = document.getElementById('stoprecording');
			this.networkService.stopRecording(this.recordingConfig.getrecordingId().toString()).subscribe(
				(result) => {
					console.log('recording stop service', result);
					if(result.status === "stopped" || result.status === "ready")
					{
						this.recordingStopped = true;
						this.elemStop.style.display = "none";
						this.elemStart.style.display = 'inline-block';
						this.isDisabled = false;
						
						//text show/hide
						document.getElementById('recording-start-state').style.display = "none";
						document.getElementById('recording-started-state').style.display = "none";
						document.getElementById('recording-start-opponent-state').style.display = "none";

						let rowId = "";
						if(localStorage.getItem("rowId")!=null)
						{
							rowId = localStorage.getItem("rowId").toString();
						}
						//recording json file read 
						
						// let recObj = this.readRecordingInfoFromZipFile("Downloads");					
						let fileName = "";
						
						if(this.meetingInfo.conference_name==null || this.meetingInfo.conference_name== "")
						{
							fileName = this.recordingConfig.getrecordingId().toString();
						}
						else{
							fileName = this.meetingInfo.conference_name
						}							
						// this.unzipperService.DownloadandUnzipFiles(this.recordingConfig.getrecordingId().toString(), fileName + ".zip")
						// .then((x:any) =>{
						// // .subscribe(
						// // 	(x) => {
						// 	console.log(x);
						// 		if(x.status === 200)
						// 		{	
						// 			if(x.result != "")
						// 			{										
						// 				x.result.files.forEach(element => {	
						// 					let detailsObj = {
						// 						"user_id": "",
						// 						"streamId": ""
						// 					}							
						// 					detailsObj.streamId = element.streamId;
						// 					if(element.clientData!=null || element.clientData!=""){
						// 						let obj = JSON.parse(element.clientData);
						// 						recordingObj.user_ids.push(obj.clientData);
						// 						detailsObj.user_id = obj.clientData;												
						// 						recordingObj.details.push(detailsObj);	
						// 						detailsarray.push(detailsObj);											
						// 					}											
						// 				});										
										//update recording data	
										this.readRecordingInfoFromZipFile(this.recordingConfig.getrecordingId().toString(), fileName)					
										.then((x: any) =>{
											console.log("shuru unzip response: part")
											console.log(x);
											// x = JSON.parse(x);
											let users = x.user_ids;
											let details = JSON.stringify(x.details);
											let postModel = {
												"recording_id": result.id,
												"status": result.status,
												"session_id": result.id,
												"meeting_id": this.meetingInfo.id,
												"name": fileName,
												"id": rowId,											
												"user_ids": users,
												"details": details
											}
											this.recordingService.post(postModel).subscribe(res => {
												if(res.status === "ok")
												{
													console.log("Updated Successfully")
													this.record.emit(res.result)
												}
											})
										})
										
								// 	}
								// }
							// });

						
						// send recording stopped signal to others
						let connection = [];
						let type = "recordingStopped";				
						const data = this.authUser.user_name + ' is stopped the call';
						this.networkService.sendSignal(this.recordingConfig.getSessionId(), connection, type, data).subscribe(
							(result) => {
								console.log('signal service from recording', result);
							},
							(err) => {
								console.log('signal service from recording', err);
							}
						);						
					}
					else{
	
					}
				},
				(err) => {
					console.log('recording stop service', err);
					setInterval(function(){
						document.getElementById('recording-failed-state').style.display = "block";
					}, 5000); 				
				}
			);
		} catch (error) {
			
		}
				
	}

	readRecordingInfoFromZipFile(recordingId, file_name)
	{
		return new Promise((resolve, reject) => {
			let recordingObj = {
				"user_ids": [],
				"details": []
			}
			
			this.unzipperService.DownloadandUnzipFiles(recordingId, file_name + ".zip", this.networkService.getOpenviduServerUrl()).subscribe(
				(x) => {
					if(x.status === 200)
					{	
						if(x.result != "")
						{
							x.result.files.forEach(element => {		
								let detailsObj = {
									"user_id": "",
									"streamId": ""
								}							
								detailsObj.streamId = element.streamId;
								if(element.clientData!=null || element.clientData!=""){
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
}
