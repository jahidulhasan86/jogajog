import { Component, OnInit, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as $ from 'jquery';
//import { LoginComponent } from 'src/app/login/login.component';
import { LoginHeaderComponent } from 'src/app/login-header/login-header.component';
import { AccountService } from '../../services/account/account.service';
import Swal from 'sweetalert2';
import { RegisterComponent } from 'src/app/register/register.component';
import { MessagingService } from '../../services/messaging/messaging.service';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { NotificationService } from '../../services/notifications/notification.service';
import { XmppChatService } from '../../services/xmpp-chat/xmpp-chat.service';
import { GlobalValue } from 'src/app/global';

import isElectron from "is-electron";
import { filter } from 'rxjs/operators';
import { MultiCompanyService } from '../../services/multi-company/multi-company.service';
import { RoomBoxService } from '../../services/room-box/room-box.service';
declare var require: any
const FileSaver = require('file-saver');

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: []
})
export class HeaderComponent implements OnInit, AfterViewInit {
	isElectronRunning = isElectron();
	isUserLoggedIn: boolean;
	authUser = JSON.parse(localStorage.getItem('sessionUser'));
	pushMessage: any;
	globalValue: any;
	urlEnd: any;
	notifications: any;
	notificationRooms: any;
	isMatBadgeHidden: boolean = true;
	roomInvitations: any;
	company_information = {
		company_name: '',
		logo: ''
	}
	currentUser: any;
	isCompanyMembersTabShow: boolean;
	unseenNotifications = [];

	constructor(
		private dialog: MatDialog,
		private accountService: AccountService,
		private messagingService: MessagingService,
		private notificationService: NotificationService,
		private xmppChatService: XmppChatService,
		public router: Router, private activatedRoute: ActivatedRoute,
		private multiCompanyService: MultiCompanyService,
		private roomBoxService: RoomBoxService,
		private acServices: AccountService
	) {
		this.globalValue = GlobalValue;

		router.events.subscribe((routerEvent: any) => {
			this.urlEnd = routerEvent.url
		});
	}

	setBackImg() {
		let doc = document.getElementsByClassName('i-search')
		if (doc && doc.length > 0)
			for (var i = 0; i < doc.length; i++) {
				let baseURI = doc[i].baseURI
				let obj = doc[i] as HTMLElement
				obj.style.backgroundImage = 'url(' + baseURI + '/assets/img/icon/Search_Icon.png)';
			}

		doc = document.getElementsByClassName('i-desktop')
		if (doc && doc.length > 0)
			for (var i = 0; i < doc.length; i++) {
				let baseURI = doc[i].baseURI
				let obj = doc[i] as HTMLElement
				obj.style.backgroundImage = 'url(' + baseURI + '/assets/img/icon/desktop.png)';
			}

		doc = document.getElementsByClassName('i-hand')
		if (doc && doc.length > 0)
			for (var i = 0; i < doc.length; i++) {
				let baseURI = doc[i].baseURI
				let obj = doc[i] as HTMLElement
				obj.style.backgroundImage = 'url(' + baseURI + '/assets/img/icon/hand.png)';
			}

		doc = document.getElementsByClassName('i-mic')
		if (doc && doc.length > 0)
			for (var i = 0; i < doc.length; i++) {
				let baseURI = doc[i].baseURI
				let obj = doc[i] as HTMLElement
				obj.style.backgroundImage = 'url(' + baseURI + '/assets/img/icon/mic.png)';
			}

		doc = document.getElementsByClassName('i-speaker')
		if (doc && doc.length > 0)
			for (var i = 0; i < doc.length; i++) {
				let baseURI = doc[i].baseURI
				let obj = doc[i] as HTMLElement
				obj.style.backgroundImage = 'url(' + baseURI + '/assets/img/icon/speaker.png)';
			}

		doc = document.getElementsByClassName('i-chat')
		if (doc && doc.length > 0)
			for (var i = 0; i < doc.length; i++) {
				let baseURI = doc[i].baseURI
				let obj = doc[i] as HTMLElement
				obj.style.backgroundImage = 'url(' + baseURI + '/assets/img/icon/chat.png)';
			}

		doc = document.getElementsByClassName('i-video-camera')
		if (doc && doc.length > 0)
			for (var i = 0; i < doc.length; i++) {
				let baseURI = doc[i].baseURI
				let obj = doc[i] as HTMLElement
				obj.style.backgroundImage = 'url(' + baseURI + '/assets/img/icon/video-camera.png)';
			}

		doc = document.getElementsByClassName('register_area')
		if (doc && doc.length > 0)
			for (var i = 0; i < doc.length; i++) {
				let baseURI = doc[i].baseURI
				let obj = doc[i] as HTMLElement
				obj.style.backgroundImage = 'url(' + baseURI + '/assets/img/geometric-bg.png)';
			}

		doc = document.getElementsByClassName('banner_bg')
		if (doc && doc.length > 0)
			for (var i = 0; i < doc.length; i++) {
				let baseURI = doc[i].baseURI
				let obj = doc[i] as HTMLElement
				obj.style.backgroundImage = 'url(' + baseURI + '/assets/img/background-pattern.png)';
			}
	}
	ngOnInit(): void {
		setTimeout(() => {
			console.log('homePageNotifications',this.notificationRooms)
		}, 1000);
		this.authUser = JSON.parse(localStorage.getItem('sessionUser'));
		this.stickyHeader();
		this.searchToggle();
		this.accountService.userLoginChecker().subscribe((result) => {
			this.isUserLoggedIn = result;
		});

		this.accountService.getAuthUserInfo().subscribe((result) => {
			this.authUser = result;
		});


		this.messagingService.onTokenChange$.subscribe((token) => {
			if (token) {
				if (this.accountService.currentUser) {
					this.messagingService.updateToken(this.accountService.currentUser.id, token).subscribe((result) => {
						console.log(result);
					});
				}
			}
		});
	
		if (this.authUser) {
			this.connectXampp();
		}

	if(!!this.isUserLoggedIn){
		this.getCompaniesByUser();

		this.getNotifications();

		this.getRoomNotifications();

		this.multiCompanyService.getCompanyInformation().subscribe((result) => {
			if (!!result) {
				this.company_information.company_name = result.company_name
				this.company_information.logo = result.logo
				this.companyMembersTabHandler(result)
			}
		});

		this.multiCompanyService.notificationCast.subscribe((result) => {
			if (!!result) {
				this.notifications = result
				// this.notificationBadgeHandler(result)
			}
		})

		this.roomBoxService.allNotificationsCast.subscribe((result) => {
			if (!!result) {
				if(this.notificationRooms && this.notificationRooms.length > 0 ){
					this.notificationRooms = [...this.roomInvitations, ...result];
				}else{
					this.notificationRooms = result
				}
				// this.notificationBadgeHandler(result)
			}
		});

		this.multiCompanyService.roomInvitationsCast.subscribe((result) => {
			if (!!result) {
					this.roomInvitations = result
					this.notificationRooms = this.roomInvitations
					// this.notificationBadgeHandler(result)
			}
		})

		this.messagingService.currentMessageCast.subscribe((result) => {
			if (!!result) {
				this.pushNotification(result)
			}
		})
	
	}

	}

	ngAfterViewInit() {
		this.languageTabSelector()
		if (this.isElectronRunning) this.setBackImg()

	}

	stickyHeader() {
		$(window).on('scroll', function () {
			const scroll = $(window).scrollTop();
			if (scroll < 400) {
				$('#sticky-header').removeClass('sticky');
				$('#back-top').fadeIn(500);
			} else {
				$('#sticky-header').addClass('sticky');
				$('#back-top').fadeIn(500);
			}
		});
	}

	searchToggle() {
		$(document).ready(function () {
			// toggle Search btn
			$('#search_area').hide();
			$('#btn-search').click(function () {
				$('#search_area').toggle('fast');
			});
		});
	}

	loginDialog() {
		this.accountService.isRequiredRegistration = '1'
		const lDialog = this.dialog.open(LoginHeaderComponent, {
			disableClose: true,
			panelClass: 'loginDialog',
			data: {
				destinationRoute: {
					type: 'string',
					data: 'default'
				}
			}
		});
	}

	registerDialog() {
		const rDialog = this.dialog.open(RegisterComponent, {
			disableClose: true,
			panelClass: 'registerDialog'
		});
	}

	signOut() {
		const currentUserId = this.accountService.currentUser.id;
		Swal.fire({
			title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'আপনি কি লগ-আউট করতে ইচ্ছুক?' : 'Do you want to logout?',
			imageUrl: 'assets/images/logout.jpg',
			showCancelButton: true,
			confirmButtonColor: '#F4AD20',
			cancelButtonColor: '#d33',
			confirmButtonText: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'হ্যাঁ' : 'Yes',
			cancelButtonText: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'না' : 'No, Thanks'
		}).then((result) => {
			if (result.value) {
				this.messagingService.unregisteredDevice(currentUserId).subscribe(
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
		});
	}

	connectXampp() {
		setTimeout(() => {
			const userStore = JSON.parse(localStorage.getItem('sessionUser'));
			const user = { username: userStore.user_name, password: userStore.password, user_id: userStore.id };
			this.xmppChatService.checkConnection(user);
			let globalRetryValue = 0;
			this.xmppChatService.onConnect$.subscribe((onConnect) => {
				console.log('globalRetryValue: ', globalRetryValue);
				if (onConnect === false) {
					globalRetryValue++;
					if (globalRetryValue <= 5) {
						this.xmppChatService.checkConnection(user);
					}
				} else {
					globalRetryValue = 0;
				}
			});
		}, 3000);
	}

	test() {
		this.router.navigate(['/'], { fragment: 'support' });
	}

	languageChanger(language) {
		this.accountService.setLanguage(language)
		localStorage.setItem('selected_lang', language)
	}

	languageTabSelector() {
		setTimeout(() => {
			const selected_lang = document.getElementById((!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'en') ? 'enID' : 'bnID') as HTMLInputElement
			if (selected_lang) selected_lang.click()
		}, 50);
	}

	goToSolutions() {
		this.router.navigate(['/solutions']).then((x) => {
			if (x) {
				setTimeout(() => {
					$('html,body').animate({
						scrollTop: $(".scroll_for_solution").offset().top
					}, 'slow');
				}, 50);
			}
		})
	}

	contactUs() {
		this.router.navigate(['/contactus'])
		setTimeout(() => {
			document.getElementById('ContactUsLink').click()
			$('html,body').animate({
				scrollTop: $("#ContactUsLink").offset().top
			}, 'slow');

		}, 200);
	}

	downloadPdf(pdfUrl: string, pdfName: string) {
		// const pdfUrl = '../../../../assets/sample.pdf';
		// const pdfName = 'your_pdf_file';
		FileSaver.saveAs(pdfUrl, pdfName);
	}

	getCompanyInfo(id) {
		this.multiCompanyService.getCompanyInfo(id).subscribe(
			(result) => {
				if (result.status == 'ok') {
					console.log(result);
				}
			},
			(err) => {
				console.log(err);
			}
		);
	}

	getCompaniesByUser() {
		this.multiCompanyService.getCompaniesByUser().subscribe((result) => {
			if (result.status == 'ok') {
				console.log(result)
			}
		}, err => {
			console.log(err)
		})
	}

	getNotifications() {
		this.multiCompanyService.getNotifications().subscribe((result) => {
			if (result.status == 'ok') {
				console.log(result)
				this.notificationBadgeHandler(this.getUnseenNotification(result.resultset))
			}
		}, err => {
			console.log(err)
		})
	}

	getRoomNotifications() {
		this.roomBoxService._getAllRequestedConferences().subscribe((result) => {
			if (result.status == 'ok') {
				console.log(result)
			}
		}, err => {
			console.log(err)
		})
	}

	menuOpened() {
		if(this.notifications.length == 0){
			const comInvID = document.getElementById('comInvID')
			if(!!comInvID) comInvID.style.display = 'none'
		}

		if(this.notificationRooms.length == 0){
			const roomInvID = document.getElementById('roomInvID')
			if(!!roomInvID) roomInvID.style.display = 'none'
		}

		if(this.notifications.length == 0 &&  this.notificationRooms.length == 0){
			const comInvID = document.getElementById('comInvID')
			if(!!comInvID) comInvID.style.display = 'block'
		}

		this.isMatBadgeHidden = true
		this.saveSeenNotifications()
	}

	pushNotification(result) {
		let payload = result.data.payload ? JSON.parse(result.data.payload) : null
		if (result.data.type == '13') {
			this.companyPushNotificationHandler(payload);
		} else if (result.data.type == 'public_room_accept_request' || result.data.type == 'public_room_reject_request' || result.data.type == 'room_invitation') {
			this.roomPushNotificationHandler(payload, result.data.type);
		} else if (result.data.type == 'public_room_join_request') {
			this.getNotifications()
			this.getRoomNotifications();
		} else if (result.data.type == 'reminder') {
			if(!localStorage.hasOwnProperty('in_call'))
			this.reminderHandler(payload)
		}else if(result.data.type == 'meeting_schedule'){
			this.getNotifications()
			this.getRoomNotifications()
		}
	}

	roomPushNotificationHandler(payload, type) {
		this.messagingService.currentMessageCast.next(null);
		this.roomBoxService._getAllConferenceByUserId('2','public').subscribe(r=>console.log(r));
		if (type === 'public_room_accept_request') {
			Swal.fire({
				icon: 'success',
				text: payload.owner + ' has accepted your request to join room  ' + payload.conference_name,
				timer: 2000
			});

		} else if (type == 'public_room_reject_request') {
			Swal.fire({
				title: 'Room Request Rejected',
				text: `your request to join  ${payload.conference_name} has been rejected. Do you want to resend?`,
				icon: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#F4AD20',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Resend',
				cancelButtonText: 'No, Thanks'
			}).then((result) => {
				if (result.value) {
					this.resend(payload);
			
				}
			});
		} else if (type == 'room_invitation') {
			Swal.fire({
				title: 'Room invitation',
				text: `${payload.inviter_user_name} invited to you from ${payload.conference_name} room. Do you accept it?`,
				icon: 'info',
				showCancelButton: true,
				confirmButtonColor: '#F4AD20',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Yes',
				cancelButtonText: 'No, Thanks'
			}).then((result) => {
				if (result.value) {
					  this.acceptRoomInvitation(payload)
					  setTimeout(() => {
						this.router.navigate(['/dashboard/room-box']);
					  }, 1000);
				}
			});
		}
	}

	resend(room) {
		let ids = [room.id];
		this.roomBoxService._assignUsersToPublicConference(ids).subscribe(result => {
			if (result) {
				Swal.fire({
					icon: 'success',
					text: 'request resubmitted',
					timer: 2000
				});
			} else {
				Swal.fire({
					icon: 'success',
					text: 'failed to resubmit',
					timer: 2000
				});
			}
		});
	}
	companyPushNotificationHandler(payload) {
		if (payload.action == 'company_invitation') {
			this.getNotifications()
			this.companyInvitationPopup(payload)
		}
	}

	companyInvitationPopup(payload) {
		console.log('companyInvite', payload)
		Swal.fire({
			title: 'Company Invitation',
			text: `${payload.inviter_user_name} invited to you from ${payload.company_name}. Do you accept it?`,
			icon: 'info',
			showCancelButton: true,
			confirmButtonColor: '#F4AD20',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes',
			cancelButtonText: 'No, Thanks'
		}).then((result) => {
			if (result.value) {
				this.acceptCompanyInvitation(payload)
			} else {

			}
		})
	}

	acceptCompanyInvitation(payload) {
		this.multiCompanyService.acceptCompanyInvitation(payload, true).subscribe((result) => {
			if (result.status == 'ok') {
				console.log(result)
				this.getCompaniesByUser()
				this.getNotifications()
				this.errorSuccessMsgHandler(result,payload)

			}
		}, err => {
			console.log(err)
			this.errorSuccessMsgHandler(err,payload)
		})
	}
	errorSuccessMsgHandler(result,payload) {
		if (result.status == 'ok') {
			Swal.fire({
				icon: 'success',
				text: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? payload.company_name +' কোম্পানিতে আমন্ত্রণ গৃহীত হয়েছে' : 'Invitation Accepted to join company ' + payload.company_name,
				timer: 2000
			});

		} else {
			Swal.fire({
				icon: 'warning',
				text: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'আমন্ত্রণ গ্রহণ করা হয়নি' : 'Failed to accept invitation',
				timer: 2000
			});
		}
	}


	private notificationBadgeHandler(result) {
		if (result.length > 0) this.isMatBadgeHidden = false
		else this.isMatBadgeHidden = true
	}

	private companyMembersTabHandler(result) {
		if (result.id == '78430815-ddfc-415e-9c5c-d10185da8d77' || result.id == '5e146eab-3d84-421b-8748-e0563daf5c24')
			this.isCompanyMembersTabShow = false
		else this.isCompanyMembersTabShow = true
		this.currentUser = JSON.parse(localStorage.getItem('sessionUser'));
	}


	reminderHandler(payload) {
		Swal.fire({
			title: 'Room Join Reminder',
			text: !!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
			? "রুম " + payload.meeting_name + " এর মিটিং শুরু হয়ে গেছে | আপনি কি এখন যোগদান করতে পারবেন?"
			: "The meeting has already been started for the room " + payload.meeting_name + ". Can you please join now?",
			showCancelButton: true,
			confirmButtonColor: '#F4AD20',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes',
			cancelButtonText: 'No, Thanks',
			padding: '1em'
		}).then((result) => {
			if (result.value) {
				this.router.navigate(['/dashboard/room-box/details/' + payload.meeting_code]).then((x) => {
					setTimeout(() => {
						const liveMtnBN = document.getElementById('liveMtnBN')
						if(!!liveMtnBN) liveMtnBN.click()
					}, 1000);
				}).catch((x) => {
					console.log(x)
				})
			}
		})
	}

	acceptRoomInvitation(payload) {
		console.log('RNotification',payload)
		const roomInvitation = {
			data: payload
		}
		this.roomBoxService.acceptRoomInvitation(roomInvitation).subscribe((result) => {
		  if (result.status == 'ok') {
			console.log(result)
			this.addUsersToExistingConference(roomInvitation)
		  }
		}, err => {
		  console.log(err)
		})
	  }
	
	  addUsersToExistingConference(roomInvitation) {
		const authUser = JSON.parse(localStorage.getItem('sessionUser'));
		let userList = []
		let currentUserInfo = {
		  user_id: authUser.id,
		  user_name: authUser.user_name,
		  email: authUser.email
		}
		userList.push(currentUserInfo)
		this.roomBoxService._addUsersToExistingConference(roomInvitation.data.conference_id, userList).subscribe((result) => {
		  if (result) {
			console.log(result)
		  }
		}, err => {
		  console.log(err)
		})
	  }

	  cInvAcceptedEEmitter(e){
		if(e == true){
			this.getCompaniesByUser()
		}
	  }

	  saveSeenNotifications(){
		this.multiCompanyService.saveSeenNotifs(this.getNotificationsId()).subscribe((result: any) => {
			if(result.status == 'ok'){
			  console.log(result)
			}
		}, (error) => {
			console.log(error)
		})
	}

	getNotificationsId(){
		let ids = []
		this.unseenNotifications.some((notification) => {
		  if(!!notification && !notification.is_seen && notification.is_seen !== undefined){
			  ids.push(notification.notification_id)
		  }
		})
		return ids
	}

	getUnseenNotification(notifications){
		  notifications.some((notification) => {
			  if(!!notification && !notification.is_seen){
				  this.unseenNotifications.push(notification)
			  }
		  })
		  return this.unseenNotifications
	}
	
}
