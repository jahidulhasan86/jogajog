import { Component, OnInit, ChangeDetectorRef, OnDestroy, HostListener, AfterViewInit } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import * as $ from 'jquery';
import { AccountService } from '../shared/services/account/account.service';
import Swal from 'sweetalert2';
import { MessagingService } from '../shared/services/messaging/messaging.service';
import { XmppChatService } from '../shared/services/xmpp-chat/xmpp-chat.service';
import { GlobalValue } from '../global';
import { TranslateService } from '@ngx-translate/core';
import { MultiCompanyService } from '../shared/services/multi-company/multi-company.service';
import { RoomBoxService } from '../shared/services/room-box/room-box.service'
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProfileComponent } from '../dashboard/profile/profile.component'
// import { SettingsComponent } from './settings/settings.component';

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
	mobileQuery: MediaQueryList;
	currentUser: any;
	company_information = {
		company_name: '',
		logo: ''
	}
	private _mobileQueryListener: () => void;
	fullyear: number;
	globalValue: any;
	bnEnLanguageCheck: any;
	notifications: any;
	notificationRooms: any;
	isMatBadgeHidden: boolean = true;
	isCompanyMembersTabShow: boolean;
	roomInvitations: any;
	unseenNotifications = [];

	constructor(
		changeDetectorRef: ChangeDetectorRef,
		media: MediaMatcher,
		public router: Router,
		public acServices: AccountService,
		public messagingService: MessagingService,
		public xmppChatService: XmppChatService,
		private translate: TranslateService,
		private multiCompanyService: MultiCompanyService,
		private roomBoxService: RoomBoxService, 
		public dialog: MatDialog
	) {
		// Sidenav media Query
		this.mobileQuery = media.matchMedia('(max-width: 600px)');
		this._mobileQueryListener = () => changeDetectorRef.detectChanges();
		this.mobileQuery.addListener(this._mobileQueryListener);
		// Sidenav media Query
		this.globalValue = GlobalValue;
	}

	@HostListener('window:beforeunload')
	beforeunloadHandler() {
		// this.router.navigate(['/Main']);
	}
	@HostListener('window:resize', ['$event'])
	onResize(event) {
		this.UiModification();
	}

	ngOnInit(): void {
		setTimeout(() => {
			console.log('Notifications',this.notificationRooms)
		}, 1000);
		this.fullyear = new Date().getFullYear();
		this.globalValue = GlobalValue;
		this.UiModification();
		const sessionUser = localStorage.getItem('sessionUser');
		if (sessionUser) {
			this.currentUser = JSON.parse(sessionUser);
			this.getCompanyInfo(this.currentUser.company_id);
		}

		this.getCompaniesByUser();

		this.getNotifications();

		this.getRoomNotifications();

		this.acServices.getLanguage().subscribe((result) => {
			this.bnEnLanguageCheck = result;
			if (result != '') this.translate.use(result);
		});

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

		this.xmppChatService.onChatHistory$.subscribe((chat) => {
			const userStore = JSON.parse(localStorage.getItem('sessionUser'));
			if (chat.isgroup) {
				// if(chat.username){
				if (userStore.user_name !== chat.username) {
					chat.isnew = true;
					console.log('from left panel add history group')
					this.xmppChatService.AddtoHistory(chat);
					if (this.xmppChatService.selectedGroup.user_name !== chat.username) {
						this.playSound();
					}
				}
				else {
					this.xmppChatService.AddtoHistory(chat);
				}
				// }
			} else {
				if (chat.username) {
					if (userStore.user_name !== chat.username) {
						chat.isnew = true;
						console.log('from left panel add history')
						this.xmppChatService.AddtoHistory(chat);
						if (this.xmppChatService.selectedGroup.user_name !== chat.username) {
							this.playSound();
						}
					}
				}
			}
		});
	}

	ngOnDestroy(): void {
		this.mobileQuery.removeListener(this._mobileQueryListener);
	}

	ngAfterViewInit() {
		this.UiModification();
	}

	UiModification() {
		const header_height = $('#admin-header').height();
		$('#admin-sidenav-full-page').css('height', window.innerHeight - (header_height + 10));
		const footer_height = $('#copyWriteFooterId').height();
		$('#setSideBarHeight').css('height', window.innerHeight - (footer_height + header_height +30));
		let count = 0;
		const timeIntervalObj = setInterval(function () {
			const dashboardSideBarHeight = $('#dashboardSideBar').height();
			const userPanelPartHeight = $('.userPanelPart').height();
			const sideNavFooterHeight = $('#sideNavFooter').height();

			$('.menuList').css({ height: dashboardSideBarHeight - (userPanelPartHeight + sideNavFooterHeight + 60), overflow: 'auto' });

			count++;
			if (count >= 5) {
				clearInterval(timeIntervalObj);
			}
		}, 1000);
	}

	signOut() {
		const currentUserId = this.acServices.currentUser.id;
		Swal.fire({
			title:
				!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
					? 'আপনি কি লগ-আউট করতে ইচ্ছুক?'
					: 'Do you want to logout?',
			imageUrl: 'assets/images/logout.jpg',
			showCancelButton: true,
			confirmButtonColor: '#F4AD20',
			cancelButtonColor: '#d33',
			confirmButtonText: !!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn' ? 'হ্যাঁ' : 'Yes',
			cancelButtonText:
				!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn' ? 'না' : 'No, Thanks'
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
				const res = this.acServices.signOut();
				if (res) {
					console.log('logout success');
					this.router.navigate(['']);
					this.xmppChatService.disconnect();
				}
			}
		});
	}

	languageChanger() {
		if (localStorage.getItem('selected_lang') == 'bn') {
			this.acServices.setLanguage('en');
			localStorage.setItem('selected_lang', 'en');
		} else {
			this.acServices.setLanguage('bn');
			localStorage.setItem('selected_lang', 'bn');
		}
	}

	aboutUs() {
		Swal.fire({
			imageUrl:
				this.globalValue.currentBuild == 'en'
					? 'assets/images/logoEn.png'
					: !!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') == 'bn'
						? 'assets/images/jagajag_logo_with_bangla_text.png'
						: 'assets/images/logoBn.png',
			html:
				this.globalValue.currentBuild == 'en'
					? '<span style="color: #585050; font-size: 15px; position: relative; top: -15px;">One Stop Communications</span><p style="position: relative; font-size: 14px; top: -9px;">Jagajag version 0.0.1</p><p style="position: relative; font-size: 11px; top: -9px; font-weight: 400;">Copyright © 2020 Protect Together Inc., All rights reserved.</p><p style="text-decoration:underline;"><a style="color:blue" href="https://docs.google.com/document/d/1_eRXMNiQHeEPNKewPUTNfnf_gmpb-P5LQo8DqOFlJMs/edit" target="_blank">Release Note</a></p>'
					: !!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') == 'bn'
						? '<span style="color: #585050; font-size: 15px; position: relative; top: -15px;">সংযোগ - সদা, সর্বত্র, নিরাপদে</span><p style="position: relative; font-size: 14px; top: -9px;">যোগাযোগ ভার্সন ০.০.১</p><p style="position: relative; font-size: 11px; top: -9px; font-weight: 400;">© ২০২০ সর্বস্বত্ব সংরক্ষিত, বেঙ্গল মোবাইল কিউএ সলিউশন লিমিটেড</p><p style="text-decoration:underline;"><a style="color:blue" href="https://docs.google.com/document/d/1sHVEdq6LAlKKdo2nj9R94TH6CR_9FLQB60GNrC3nyLw/edit" target="_blank">রিলিজ নোট</a></p>'
						: '<span style="color: #585050; font-size: 15px; position: relative; top: -15px;">One Stop Communications</span><p style="position: relative; font-size: 14px; top: -9px;">Jogajag version 0.0.1</p><p style="position: relative; font-size: 11px; top: -9px; font-weight: 400;">Copyright © 2020 Bengal Mobile QA Solution Limited, All rights reserved.</p><p style="text-decoration:underline;"><a style="color:blue" href="https://docs.google.com/document/d/1sHVEdq6LAlKKdo2nj9R94TH6CR_9FLQB60GNrC3nyLw/edit" target="_blank">Release Note</a></p>',
			showConfirmButton: false,
			imageWidth: 135,
			padding: '2em',
			width: 400
		});
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
		this.multiCompanyService.getNotifications().subscribe((result: any) => {
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
					// Swal.fire({
					// 	// title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'রেজিস্ট্রেশন সফল হয়েছে' : 'Registered successfully',
					// 	// text: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'ইমেইল পাঠানো হয়েছে | আপনার পরিচয় যাচাই করার করার জন্য ইমেইল এ পাঠানো লিঙ্ক এ ক্লিক করুন' : 'Email has been sent. Please click to verify your account ',
					// 	// icon: 'success',
					// 	title: 'Accepted',
					// 	icon: 'success',

				}
			});
		} else if (type == 'room_invitation') {
			if(payload.action == 'accept_room_invitation'){
				return
			}
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

	// openSettingsDialouge(){
	// 	const settingDialog = this.dialog.open(SettingsComponent,{
	// 		disableClose: true,
	// 		width: '50%',
	// 	});
	// }
	openProfile(){
		const dialogRef = this.dialog.open(ProfileComponent, {
		  height: '90%'
		});
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

	playSound(filename?) {
		const mp3Source = '<source src="../../assets/sound/notification.mp3" type="audio/mpeg">';
		const oggSource = '<source src="../../assets/sound/notification.ogg" type="audio/ogg">';
		const embedSource = '<embed hidden="true" autostart="true" loop="false" src="../../assets/sound/notification.mp3">';
		document.getElementById('sound').innerHTML = '<audio autoplay="autoplay">' + mp3Source + oggSource + embedSource + '</audio>';
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
		  email: authUser.email,
		  // profile_pic: authUser.profile_pic ? authUser.profile_pic : '',
		  // contact: authUser.contact ? authUser.contact : ''
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
