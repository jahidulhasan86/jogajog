import { Component, OnInit } from '@angular/core';
import { AccountService } from './shared/services/account/account.service';
import { Title, Meta } from '@angular/platform-browser';
import { GlobalValue } from './global';
import { TranslateService } from '@ngx-translate/core';
import { NetworkStatusAngularService } from 'network-status-angular';
import { MeetingService } from './shared/services/meeting/meeting.service';
import {environment} from '../environments/environment';
@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: []
})
export class AppComponent implements OnInit {
	title = 'OpenVidu Call';
	browserLang: string;
	globalValue;
	network_drop_time: number;
	network_up_time: number;
	connectionUpAndDownDifference: number;

	constructor(
		private accountService: AccountService,
		private titleService: Title,
		private translate: TranslateService,
		private networkStatusAngularService: NetworkStatusAngularService,
		private meetingService: MeetingService,
		private meta: Meta
	) {
		this.globalValue = GlobalValue;
		this.translateConfiguration();
		this.meta.addTags([
			{ name: 'version', content: environment.appVersion },
			// ...
		  ]);
	}
	ngOnInit(): void {
		this.titleService.setTitle(GlobalValue.title_name);
		this.accountService.userLoginGenerator(!!localStorage.getItem('sessionUser'));
		this.accountService.getLanguage().subscribe((result) => {
			if (result != '') {
				this.translate.use(result);

				if (this.globalValue.currentBuild == 'bn') {
					if (result == 'en') {
						this.globalValue.app_logo = '../../../../assets/images/logoBn.png';
						this.titleService.setTitle('Jogajog');
					} else {
						this.titleService.setTitle('যোগাযোগ');
						this.globalValue.app_logo = '../../../../assets/images/jagajag_logo_with_bangla_text.png';
					}
				}
			}
		});
		
		this.networkStatusAngularService.status.subscribe((status) => {
			if (status) {
				console.log('Network back');
				this.network_up_time = 0;
				this.network_up_time = Math.round(new Date().getTime() / 1000); // output comes in second
				console.log('networkStatusAngularService', status, this.network_up_time);
				this.connectionUpAndDownDifference = this.network_up_time - this.network_drop_time;

				if (Number.isNaN(this.connectionUpAndDownDifference)) { // NaN check, because when reload the page the drop_time become null.
					setTimeout(() => {
						this.leaveMeetingRestApi();
					}, 15000);
				}
			} else {
				console.log('Network Gone');
				this.network_drop_time = 0;
				this.network_drop_time = Math.round(new Date().getTime() / 1000); // output comes in second
				console.log('networkStatusAngularService', status, this.network_drop_time);
				this.removeUtilCallItemFromStorage()
			}
		});

		this.removeUtilCallItemFromStorage(true)

	}
	leaveMeetingRestApi() {
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
				},
				(err) => {
					console.log('Error From Leave Meeting', err);
				}
			);
		}
	}
	translateConfiguration() {
		this.translate.addLangs(['en', 'bn']);

		if (this.globalValue.currentBuild == 'bn') {
			this.translate.setDefaultLang(!!localStorage.getItem('selected_lang') ? localStorage.getItem('selected_lang') : 'bn');
		} else {
			this.translate.setDefaultLang(!!localStorage.getItem('selected_lang') ? localStorage.getItem('selected_lang') : 'en');
		}

		this.browserLang = this.translate.getDefaultLang();

		if (this.globalValue.currentBuild == 'bn') {
			this.translate.use(this.browserLang.match(/en|bn/) ? this.browserLang : 'bn');
		} else {
			this.translate.use(this.browserLang.match(/en|bn/) ? this.browserLang : 'en');
		}

		this.accountService.setLanguage(this.browserLang);
	}

	removeUtilCallItemFromStorage(isRefresh?){

		if(isRefresh){
			if (localStorage.hasOwnProperty("meeting_password")) {
				localStorage.removeItem('meeting_password')
			}
			
			if(localStorage.hasOwnProperty('in_call')){
				localStorage.removeItem('in_call')
			}
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
