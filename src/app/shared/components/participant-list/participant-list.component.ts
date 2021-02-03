import { Component, OnInit, AfterViewInit, Input, EventEmitter, Output, HostListener, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { NetworkService } from '../../services/network/network.service';
import { OpenViduSessionService } from '../../services/openvidu-session/openvidu-session.service';
import { VideoFullscreenIcon } from '../../types/icon-type';
import { OvSettingsModel } from '../../models/ovSettings';
import { ChatService } from '../../services/chat/chat.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { UserModel } from '../../models/user-model';
import * as $ from 'jquery';
import { GlobalService } from '../../services/global/global.service';
import { AccountService } from '../../services/account/account.service';
import { GlobalValue } from 'src/app/global';

@Component({
	selector: 'app-participant-list',
	templateUrl: './participant-list.component.html',
	styleUrls: ['./participant-list.component.scss']
})
export class ParticipantListComponent implements OnInit, AfterViewInit {
	participantsNames: string[] = [];
	localUsers: any[];
	@Output() muteUnmuteClick = new EventEmitter<any>();
	meetingInfo_current: any;
	authUser: any;
	userFilter: any = { nickname: '' };
	bnEnLanguageCheck: any;
	globalValue: any;

	@Input()
	set localuser(localusers: UserModel[]) {
		this.localUsers = [];
		localusers.forEach((user) => {
			if (!user.isScreen()) {
				// $('#profileImage').text(intials);
				const userData: any = {
					nickname: user.getNickname(),
					connection: user.getStreamManager(),
					connectionId: user.getConnectionId(),
					is_audio: user.isAudioActive(),
					is_video: user.isVideoActive(),
					shortname: user.getNickname().charAt(0) + user.getNickname().charAt(1),
					is_screenShare: user.isScreen()
				};
				this.localUsers.push(userData);
			}
		});
		// this.participantsNames = [...this.participantsNames];
	}

	@Input()
	set participants(participants: UserModel[]) {
		this.participantsNames = [];
		participants.forEach((user) => {
			if (!user.isScreen()) {
				const userData: any = {
					nickname: user.getNickname(),
					connection: user.getStreamManager(),
					connectionId: user.getConnectionId(),
					is_audio: user.isAudioActive(),
					is_video: user.isVideoActive(),
					shortname: user.getNickname().charAt(0) + user.getNickname().charAt(1),
					randomNumber: this.getRandomNumber(),
					is_screenShare: user.isScreen()
				};
				this.participantsNames.push(userData);
			}
		});
		// this.participantsNames = [...this.participantsNames];
	}

	constructor(
		public networkService: NetworkService,
		public openViduSessionService: OpenViduSessionService,
		public chatService: ChatService,
		public globalService: GlobalService,
		private accountService: AccountService
	) {
		this.authUser = JSON.parse(localStorage.getItem('sessionUser'));
		this.meetingInfo_current = JSON.parse(localStorage.getItem('meetingInfo_current'));
	}
	@HostListener('window:resize', ['$event'])
	onResize(event) {
		this.uiUpdate();
	}
	ngOnInit(): void {
		this.authUser = JSON.parse(localStorage.getItem('sessionUser'));
		this.meetingInfo_current = JSON.parse(localStorage.getItem('meetingInfo_current'));
		this.accountService.getLanguage().subscribe((result) => {
			this.bnEnLanguageCheck = result;
		});
		this.globalValue = GlobalValue;
	}

	ngAfterViewInit() {
		this.uiUpdate();
	}

	userMuteUnmuteClick(type, connectionId) {
		// console.log('userMuteUnmuteClick');
		// this.muteUnmuteClick.emit({
		// 	data: type,
		// 	connection: connectionId
		// });
		const sessionId = this.openViduSessionService.getSessionId();
		let connection = [connectionId];
		const data = 'mute and unmute data';
		this.networkService.sendSignal(sessionId, connection, type, data).subscribe(
			(result) => {
				console.log('signal service', result);
			},
			(err) => {
				console.log('signal service', err);
			}
		);
	}

	uiUpdate() {
		const toolbar_header = $('.toolbar_header').height();
		const room_controller = $('#room-controller').height(); // footer part
		const windowHeight = window.innerHeight;
		const middleHeight = windowHeight - (toolbar_header + room_controller);
		const listHeaderHeight = $('.ListHeader').height() + 32;
		const listSearchHeight = $('.ListSearch').height() + 32;
		if (document.getElementsByClassName('participantsPart')) {
			$('.participantsPart').css({ height: middleHeight - 20 + 'px' });
		}
		if (document.getElementsByClassName('listPart')) {
			$('.listPart').css({ height: middleHeight - (listHeaderHeight + listSearchHeight + 50) + 'px', overflow: 'auto' });
		}
	}

	getRandomNumber() {
		return Math.floor(Math.random() * 8);
	}

	closeSideNav() {
		this.globalService.callScreenSideNavShowData$.next('close');
		this.chatService.toggleChat();
	}
}
