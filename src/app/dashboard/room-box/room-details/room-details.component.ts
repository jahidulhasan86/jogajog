import { Component, OnInit, Input, EventEmitter, Output, HostListener, OnDestroy, ViewChild, ElementRef, ViewContainerRef, ComponentRef, ComponentFactoryResolver, ReflectiveInjector } from '@angular/core';
import { ChatService } from 'src/app/shared/services/chat/chat.service';
import {MatDialog} from '@angular/material/dialog';
import { ChattingComponent } from '../../../chatting/chatting.component';
import { Subscription } from 'rxjs';
import { GlobalValue } from '../../../global';
import { GlobalService } from '../../../shared/services/global/global.service';
import { NotificationService } from '../../../shared/services/notifications/notification.service';
import { XmppChatService } from '../../../shared/services/xmpp-chat/xmpp-chat.service';
import { RoomBoxService } from '../../../shared/services/room-box/room-box.service';
import { MeetingService } from '../../../shared/services/meeting/meeting.service';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { UpdateRoomBoxComponent } from './update-room-box/update-room-box.component';
import { AccountService } from 'src/app/shared/services/account/account.service';
import { MessagingService } from '../../../shared/services/messaging/messaging.service';
import {DiscussionComponent} from '../discussion/discussion.component'
@Component({
	selector: 'app-room-details',
	templateUrl: './room-details.component.html',
	styleUrls: ['./room-details.component.scss']
})
export class RoomDetailsComponent implements OnInit {
	// @Output() xamppChat = new EventEmitter<any>();
	// @ViewChild('chatComponent') chatComponent: ChatComponent;
	@ViewChild('messagecontainer', { read: ViewContainerRef }) entry: ViewContainerRef;

	@ViewChild('roomName') searchElement: ElementRef;

	@ViewChild('discussion') discusComp:  DiscussionComponent;
	@ViewChild('placeHolder', {read: ViewContainerRef}) private _placeHolder: ElementRef;

	callScreenSideNavShowData: string;
	selectedGroup: any = {};
	chatlist = [];
	isChatSelected = false;
	isResourceSelected = false;
	isRecordingSelected = false;
	isDiscussionSelected = false;
	selectedRoom: any;
	currentUser: any;
	selectedRoomDetails: any;
	private subscriptions: Array<Subscription> = [];
	notificationCount: number;
	unread: [];
	notification_count_group: any;
	roomId: string;	
	globalValue: any;
	bnEnLanguageCheck: any;
	
	notifications:any;
	isMatBadgeHidden: boolean = true;
	 params:any;
	scheduleSelected = false;

	constructor(private router: Router, private activatedRoute: ActivatedRoute, private roomBoxService: RoomBoxService,
		private chatService: ChatService, private globalService: GlobalService,
		private xmppChatService: XmppChatService, private spinner: NgxSpinnerService,
		public dialog: MatDialog,
		private meetingService: MeetingService,
		public messagingService: MessagingService,
		private _cmpFctryRslvr: ComponentFactoryResolver,

		private accountService: AccountService) {
			this.currentUser = JSON.parse(localStorage.getItem('sessionUser'));
		 }

	 ngOnInit() {
		this.scrollToTop();
		this.notificationCount = 0;
		this.activatedRoute.params.subscribe(param => {
			const id = param.id;
			this.selectedRoom = id;
			if(param.message_body){
				this.params = param;
				this.isDiscussionSelected = true;
				this.isChatSelected = false;	
			}	
		});

		this.activatedRoute.queryParams.subscribe((result) => {
			console.log(result)
			if(result.url == 'true'){
				setTimeout(() => {
					const liveMtnBN = document.getElementById('liveMtnBN')
					if(!!liveMtnBN) liveMtnBN.click()
				}, 1000);
			}
		})

		this.globalValue = GlobalValue;
		this.accountService.getLanguage().subscribe((result) => {
		this.bnEnLanguageCheck = result;
	});
	this._getSelectedRoomDetails();	
		/* if(this.params && this.params.message_body){
			await this._getSelectedRoomDetails();
			this.isDiscussionSelected = true;
			this.discusComp.navigateDetails({root_discussion_id:this.params.root_discussion_id, message_body: this.params.message_body, subject: this.params.subject},0);
		} */

	//     // Chat
		this.xmppChatService.onChatHistory$.subscribe((chat) => {
			//$('.roomname').focus();
			const userStore = JSON.parse(localStorage.getItem('sessionUser'));
			if (chat.isgroup) {
			  // if(chat.username){
			  if (userStore.user_name !== chat.username) {
				chat.isnew = true;
				console.log('from left panel add history group')
				this.xmppChatService.AddtoHistory(chat);
				if (this.selectedGroup.user_name !== chat.username) {
				  this.playSound();
				}
			  } else {
				//$('.roomname').focus();
				this.xmppChatService.AddtoHistory(chat);
			  }
			  // }
			} else {
				$('.roomname').focus();
			  if (chat.username) {
				if (userStore.user_name !== chat.username) {
				  chat.isnew = true;
				  console.log('from left panel add history')
				  this.xmppChatService.AddtoHistory(chat);
				  if (this.selectedGroup.user_name !== chat.username) {
					this.playSound();
				  }
				}
			  }
			}
		  });
		  this.xmppChatService.onNotification$.subscribe((notification) => {

				$('.roomname').focus();
				if (notification) {
					if (!this.isChatSelected) {
						this.notificationCount++;
						return;
					}
				}

				this.getNotifications();
			//   });
			// this.notificationCount = notification.length;
			// if(notification !== 'recentChangeOnType'){
			this.xmppChatService.notification_count = 0;
			this.xmppChatService.notification_count_group = 0;
			this.xmppChatService.notification_count_Total = 0;
			const msgHistory = this.xmppChatService.latestMessage; // JSON.parse(localStorage.getItem('history'));
			for (const key in msgHistory) {
			  if (msgHistory.hasOwnProperty(key)) {
				const history = msgHistory[key];
				if (history.isviewed === false && history.count > 0) {
				  if (history.room) {
					this.xmppChatService.notification_count_group++;
					this.xmppChatService.notification_count_Total++;
				  } else {
					this.xmppChatService.notification_count++;
					this.xmppChatService.notification_count_Total++;
				  }
				}
			  }
			}
			});

	this.roomBoxService.isRoomScheduleSelectedObserver.subscribe(x =>{
		if (x) {
			this.scheduleSelected = true;
		} else {
			this.scheduleSelected = false;
		}
	});

	/* this.messagingService.currentMessageCast.subscribe((result) => {
		console.log(result);
		if (!!result) this.pushNotification(result)
	});
	 */

    this.roomBoxService.notificationCast.subscribe((result) => {
		console.log('RoomN',result)
		if (!!result) {
		  this.notifications = result;
		  this.notificationBadgeHandler(result)
		}
	  });

}

private notificationBadgeHandler(result) {
	if (result.length > 0) this.isMatBadgeHidden = false
	else this.isMatBadgeHidden = true
}

getNotifications() {
	
	this.roomBoxService._getAllRequestedConferences(this.selectedRoomDetails.id).subscribe((result) => {
		if (result.status == 'ok') {
			console.log(result);
			
		}
	}, err => {
		console.log(err)
	})
}
menuOpened() {
	this.isMatBadgeHidden = true
}

reload(){	

	this.discusComp.ngOnInit();
	//for chat refresh
}
ngOnDestroy(): void {
	this.messagingService.currentMessage.next(null);
}
pushNotification(result) {
	let payload = result.data.payload ? JSON.parse(result.data.payload) : null
	if (result.data.type == 'public_room_join_request') this.roomNotificationHandler(payload)
}
roomNotificationHandler(payload) {
	if (payload.action == 'public_room_join_request') {
		//this.getNotifications();
		this.roomJoinRequestPopup(payload)
	}
}

roomJoinRequestPopup(payload) {
	console.log('room join request',payload)
	Swal.fire({
		title: 'Request to join this room',
		text: `${payload.user_name} wants to join  ${payload.conference_name}. Do you accept him/her?`,
		icon: 'warning',
		showCancelButton: true,
		confirmButtonColor: '#F4AD20',
		cancelButtonColor: '#d33',
		confirmButtonText: 'Yes',
		cancelButtonText: 'No, Thanks'
	}).then((result) => {
		if (result.value) {
			this.replyJoinRequest(payload,'accept');
			
		} else {
			this.replyJoinRequest(payload,'reject');
		}
	})
}


replyJoinRequest(payload, action) {
	this.roomBoxService._replyRequest(payload, action).subscribe((result) => {
	  if (result.status) {
		  this.getNotifications();
		console.log(result);
		this.errorSuccessMsgHandler(result, action);
	  }
	}, err => {
	  console.log(err)
	  this.errorSuccessMsgHandler(err)
	})
  }

  errorSuccessMsgHandler(result, actionType?) {
	if (result.status === 'ok' && actionType === 'accept') {
		this._getSelectedRoomDetails();
	  Swal.fire({
		icon: 'success',
		text: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'আমন্ত্রণ গৃহীত হয়েছে' : 'Room Join Request Accepted.',
		timer: 2000
	  });
	 
	} else if (result.status === 'ok' && actionType === 'reject') {
		this._getSelectedRoomDetails();
		Swal.fire({
		  icon: 'success',
		  text: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'আমন্ত্রণ গৃহীত হয়েছে' : 'Room Join Request Rejected.',
		  timer: 2000
		});
	   
	  } else {
	  Swal.fire({
		icon: 'warning',
		text: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'আমন্ত্রণ গ্রহণ করা হয়নি' : 'Something Went Wrong.',
		timer: 2000
	  });
	}
  }

playSound(filename?) {
	const mp3Source = '<source src="../../../../assets/sound/notification.mp3" type="audio/mpeg">';
	const oggSource = '<source src="../../../../assets/sound/notification.ogg" type="audio/ogg">';
	const embedSource = '<embed hidden="true" autostart="true" loop="false" src="../../../../assets/sound/notification.mp3">';
	document.getElementById('sound').innerHTML = '<audio autoplay="autoplay">' + mp3Source + oggSource + embedSource + '</audio>';
  }

	updateSelectedDom(event, dom) {
		$('.btn-selector').removeClass('btn-primary').addClass('btn-normal');
		$(event.target.classList.add('btn-primary'));
		if (dom === 'chat') {
			this.notificationCount = 0;
			this.isChatSelected = true;
			this.isResourceSelected = false;
			this.isRecordingSelected = false;
			this.isDiscussionSelected = false;
			this.xmppChatService.isChatTabSelected.next(true);
		} else if (dom === 'resource') {
			this.isChatSelected = false;
			this.isResourceSelected = true;
			this.isRecordingSelected = false;
			this.isDiscussionSelected = false;
			this.xmppChatService.isChatTabSelected.next(false);
		} else if (dom === 'recording') {
			this.isChatSelected = false;
			this.isResourceSelected = false;
			this.isRecordingSelected = true;
			this.isDiscussionSelected = false;
			this.xmppChatService.isChatTabSelected.next(false);
			// Swal.fire({
			// 	// icon: 'info',
			// 	title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'এই অ্যাকাউন্টে প্রিমিয়াম বৈশিষ্ট্যটি এখনও চালু হয়নি' : 'Premium feature not enabled yet on this account.',
			// 	timer: 3000,
			// 	showConfirmButton: false
			// });
		} else if (dom === 'discussion') {
			this.isChatSelected = false;
			this.isResourceSelected = false;
			this.isRecordingSelected = false;
			this.isDiscussionSelected = true;

		}
	}

	 _getSelectedRoomDetails() {
		$('#dashboardSideBar').css('z-index', '0');
		this.spinner.show();
		this.roomBoxService._getSingleConferenceById(this.selectedRoom).subscribe((result: any) => {
			this.spinner.hide();
			$('#dashboardSideBar').css('z-index', '1000');
			$('.roomname').focus();
			if (result.status === 'ok') {
				if (result) {
					this.selectedRoomDetails = result.result;
					this.roomId = this.selectedRoomDetails.id;
					this.xmppChatService.selectedGroup = this.selectedRoomDetails;
					this.isChatSelected = true;
					this.roomBoxService.roomUsers$.next(result.result.users);
					if(this.params && this.params.root_discussion_id){
						this.isChatSelected = false;
						this.isDiscussionSelected = true;
						this.discusComp.roomId = this.roomId;
						this.discusComp.navigateDetails({root_discussion_id:this.params.root_discussion_id, message_body: this.params.message_body, subject: this.params.subject,creator:this.params.creator,created:this.params.created},0);
						//let cmp = this.createComponent(this._placeHolder, DiscussionComponent);

    // set inputs..
    
					
					}
				}
			} else {
				this.spinner.hide();
				Swal.fire({
					icon: 'error',
					title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'কিছু ভুল হয়েছে!' : 'Something Went Wrong!',
					timer: 3000
				});
			}
		},
		(err) => {
			this.spinner.hide();
				Swal.fire({
					icon: 'error',
					title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'কিছু ভুল হয়েছে!' : 'Something Went Wrong!',
					timer: 3000
				});
		});
	}

	

	initiateLiveMeeting(mInfo) {
		mInfo.isRequiredRegistration = '0';
		mInfo.is_private = '0';
		mInfo.is_req_password = '0';
		mInfo.meeting_name = mInfo.conference_name;
		mInfo.owner = {host_id: mInfo.created_by, host_name: mInfo.owner};
		mInfo.timing = {'start_time' : ''};
		mInfo.timing.start_time = new Date().toString();
		mInfo.end_time = '';
		mInfo.meeting_id = mInfo.id;
		mInfo.meeting_code = Math.floor(1000000000000 + Math.random() * 9000000000000);
		mInfo.emailList = [];
		mInfo.tag = 'room-box';
		mInfo.advance_options = [{allow_share_screen: 'Everyone'}];
		// 
		localStorage.setItem('meetingInfo_current', JSON.stringify(mInfo));
		this.meetingService.getMeetingInfo$.next(mInfo);
		this.router.navigate(['/meeting/room-box' + '/' + mInfo.is_req_password + '/'
		+ mInfo.isRequiredRegistration]).then(function() {

		});
	}

	initiateMeetingSchedule(mInfo) {
		this.roomBoxService.isRoomScheduleSelected$.next(true);
	}

	fetchUnreadMessageGroupWise_Group() {
		// fetch unread message by group wise and show notifications badge
		const msgHistory = this.xmppChatService.latestMessage; // JSON.parse(localStorage.getItem('history'));
		for (const key in msgHistory) {
		  if (msgHistory.hasOwnProperty(key)) {
			const history = msgHistory[key];
			let chatSingleNotif: any;
			chatSingleNotif = document.getElementById(
			  'cCounter'
			);
			// console.log(history) // off by jahid
			if (history.isviewed === false) {
			  // this.chatServices.notification_count++;
			  if (history.count > 0) {
				if (chatSingleNotif) {
				  chatSingleNotif.style.display = '';
				  chatSingleNotif.innerHTML = history.count;
				}
			  }
			} else {
			  if (chatSingleNotif) {
				chatSingleNotif.style.display = 'none';
				chatSingleNotif.innerHTML = history.count;
			  }
			}
		  }
		}
	  }

	openDialog(target) {
		this.dialog.open(UpdateRoomBoxComponent, {
		  minWidth: '700px',
		  data: {
			selectedRoom: this.selectedRoomDetails,
			target: target
		  }
		});
	  }
    deleteSelectedUser(user){
		if(user){
			Swal.fire({
				title:  (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? `আপনি কি  ${user.user_name} মুছতে চান?` : `Do you want to remove  ${user.user_name} ?`,
				icon: 'warning',
				showCancelButton: true,
				confirmButtonColor: "#F4AD20",
				cancelButtonColor: "#d33",
				confirmButtonText: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'হ্যাঁ' : 'Yes',
				cancelButtonText: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'না' : 'No, Thanks'
				
			  }).then(result => {
				  if(result.value){
			        this._deleteSelected(user)
				  } //
			  });
		}

	}
	  _deleteSelected(user) {
		if (user.user_id) {
			const users = [];
			users.push(user);
			this.spinner.show()
			this.roomBoxService._deleteUsersFromExistingConference(this.selectedRoom, users).subscribe((x: any) => {
			  this.spinner.hide()
				if (x.result) {
				this._getSelectedRoomDetails();
				Swal.fire({
					icon: 'success',
					title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'ইউজার-কে সরিয়ে দেয়া হয়েছে' : 'User Removed Successfully!',
					timer: 3000,
					showConfirmButton: false
				  });  
			  } else {
				Swal.fire({
				  icon: 'error',
				  title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'কিছু ভুল হয়েছে!' : 'Something Went Wrong!',
				  timer: 3000,
				  showConfirmButton: false
				});
			  }
	
			},
			(err) => {
				this.spinner.hide();
					Swal.fire({
						icon: 'error',
						title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'কিছু ভুল হয়েছে!' : 'Something Went Wrong!',
						timer: 3000
					});
			});
		  } else {
			// Swal.fire({
			//   // icon: 'info',
			//   title: 'No Changes Found!',
			//   timer: 3000,
			//   showConfirmButton: false
			// });
		  }
	  }

	  scrollToTop() {
		document.body.scrollTop = 0;
		document.documentElement.scrollTop = 0;
	  }
}
