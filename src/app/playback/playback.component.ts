/*

 * Copyright (c) 2004-2020 by Protect Together Inc.

 * All Rights Reserved

 * Protect Together Inc Confidential

 */

import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { Session } from 'openvidu-browser';
import { OpenViduLayout, OpenViduLayoutOptions } from '../shared/layout/openvidu-layout';
import { UserModel } from '../shared/models/user-model';
import { MatDialog } from '@angular/material/dialog';
// Services
import { UnzipperService } from '../shared/services/unzipper/unzipper.service';
import { MatSidenav } from '@angular/material/sidenav';
import { AccountService } from '../shared/services/account/account.service';
import Swal from 'sweetalert2';
import { GlobalValue } from '../global';
import { GlobalService } from '../shared/services/global/global.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { fil } from 'date-fns/locale';
import { RecordingService } from '../shared/services/recording/recording.service'

let self;
@Component({
	selector: 'app-playback',
	templateUrl: './playback.component.html',
	styleUrls: ['./playback.component.css']
})
export class PlaybackComponent implements OnInit, OnDestroy {
	sidenavMode: 'side' | 'over' = 'side';
	lightTheme: boolean;
	currentMeetingInfo: any;
	authUser: any;
	meetingId: string;
	sessionId: string;
	spinnerText: string;
	spinnerBGColor = 'rgba(13,12,12,0.8)';
	spinnerType = 'ball-clip-rotate-multiple'
	files = [];
	constructor(
		private router: Router,
		private unzipperService: UnzipperService,
		private dialog: MatDialog,
		private accountService: AccountService,
		private route: ActivatedRoute,
		private spinner: NgxSpinnerService,
		private recordingService : RecordingService
	) {
		
	}
	 ngOnInit() {		
		this.spinner.show();
		this.authUser = JSON.parse(localStorage.getItem('sessionUser'));
		// this.accountService.userLoginChecker().subscribe((result) => {
		// 	// this.isUserLoggedIn = result;
		// });		
		this.route.queryParams.subscribe(params => {
			this.meetingId = params['meeting_id'];
			this.sessionId = params['session_id'];
		});
		this.files = [];
		let object = {
			"user" : "",
			"stream" : ""
		}
		let Name = "Test";

		this.recordingService.getRecordingByMeetingandSessionId(this.meetingId, this.sessionId).subscribe((x) =>{
			if(x.status == "ok")
			{
			  let url = "";
			  this.spinner.hide();
			  if(x.resultset){
				x.resultset.forEach(element => {
					url = element.recording_url;
					Name = element.name;
					if(element.details != "")
					{
						let obj = JSON.parse(element.details);					
						if(obj){
							obj.forEach(user => {
								url = url + user.streamId + ".webm";
								object.user = user.user_id;
								object.stream = url;
								this.files.push(url);
								url = element.recording_url;
							});
						}
					}				
				});
		      }
			}
		})		
	}
	ngOnDestroy() {
		
	}

}
