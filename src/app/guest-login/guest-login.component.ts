import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { AccountService } from '../shared/services/account/account.service';
import Swal from 'sweetalert2';
import { Router, Route } from '@angular/router';
import { HostMeetingComponent } from '../host-meeting/host-meeting.component';
import { NotificationService } from '../shared/services/notifications/notification.service';
import { MessagingService } from '../shared/services/messaging/messaging.service';
import { XmppChatService } from '../shared/services/xmpp-chat/xmpp-chat.service';
import { RegisterComponent } from 'src/app/register/register.component';
import { CookieService } from 'ngx-cookie-service';
import { GlobalValue } from '../global';
import { MeetingService } from '../shared/services/meeting/meeting.service';
import { FormControl, Validators } from '@angular/forms';


@Component({
	selector: 'app-guest-login',
	templateUrl: './guest-login.component.html',
	styleUrls: ['./guest-login.component.css']
})
export class GuestLoginComponent implements OnInit {
	public loginModel = {
		email: '',
		display_name: ''		
	};
	isLoggedIn = false;

	destinationRoute: any;
	isRememberChecked: boolean;
	globalValue: any;
	emailFormControl = new FormControl('', [Validators.required, Validators.email,Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]);

	constructor(
		private accountService: AccountService,
		public dialogRef: MatDialogRef<GuestLoginComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private router: Router,
		private dialog: MatDialog,
		private notificationService: NotificationService,
		private messagingService: MessagingService,
		private xmppChatService: XmppChatService,
		private cookieService: CookieService,
		private meetingService : MeetingService
	) {
		this.globalValue = GlobalValue;
	}

	ngOnInit(): void {
		
		this.destinationRoute = this.data ? this.data.destinationRoute : null;
		if (this.destinationRoute) {
			if (this.destinationRoute.data !== 'default') {
				localStorage.setItem('destinationRoute', JSON.stringify(this.destinationRoute));
			}
		}
		
	}	

	signIn() {
		if(this.emailFormControl.invalid) return
		this.accountService.guestLogin(this.loginModel.email, this.loginModel.display_name).subscribe(
			(result) => {
				if (result.status === 'ok') {
					console.log('guestLogin', result);
					this.deleteCookies();
					this.notificationService.globalNotificationShow('Successfully logged In');

					this.pubsubAndXamppRegistration();
					// this.firebaseNotificationPermission();

					this.clearLoginModel();
					this.closeDialog();

					// For route where he came
					const destinationRoute = JSON.parse(localStorage.getItem('destinationRoute'));
					if (destinationRoute) {
						if (destinationRoute.type === 'url') {
							this.router.navigate([destinationRoute.data]);
							localStorage.removeItem('destinationRoute');
						} else if (destinationRoute.type === 'string') {
							if (destinationRoute.data === 'host_a_meeting') {
								this.hostMeetingDialog();
								localStorage.removeItem('destinationRoute');
							}
						}
					} else {
						this.router.navigate(['']);
					}
				}
			},
			(err) => {
				console.log(err);
				this.loginErrorHandler(err);
			}
		);
	}

	async pubsubAndXamppRegistration() {
		// Rules: 1st call chatRegistration, then call pubsubRegistration, dont change the flow.
		await this.chatRegistration(this.accountService.currentUser.user_name, this.accountService.currentUser.password);
		await this.pubsubRegistration(this.accountService.currentUser.id, this.accountService.currentUser.password);
	}

	async chatRegistration(user_name, password): Promise<any> {
		this.xmppChatService.chatRegistration(user_name, password).subscribe(
			(result) => {
				if (result.status === 'ok') {
					console.log('working chat registration', result);
				}
			},
			(err) => {
				console.log('error in working chat registration', err);
			}
		);
	}

	async pubsubRegistration(user_id, password): Promise<any> {
		this.xmppChatService.pubsubRegistration(user_id, password).subscribe(
			(result) => {
				if (result.status === 'ok') {
					console.log('pubsub registration', result);
					setTimeout(() => {
						this.connectXampp();
						this.firebaseNotificationPermission();
					}, 1000);
				}
			},
			(err) => {
				console.log(err);
			}
		);
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

	closeDialog(eventFireFrom?) {
		this.dialogRef.close();
		if (eventFireFrom === 'crossBtn') {
			this.router.navigate(['/']);
		}
	}

	clearLoginModel() {
		Object.keys(this.loginModel).forEach((key) => (this.loginModel[key] = ''));
	}

	loginErrorHandler(err) {
		console.log(err);
		if (err.status === 400) {
			Swal.fire({
				icon: 'warning',
				title: 'Login error',
				text: err.error.message.en
			});
		} else {
			Swal.fire({
				icon: 'warning',
				title: 'Login error',
				text: 'Server not found'
			});
		}
	}

	hostMeetingDialog() {
		const lDialog = this.dialog.open(HostMeetingComponent, {
			disableClose: false,
			panelClass: 'hostMeetingDialog',
			width: '50%'
		});
	}

	registerDialog() {
		this.closeDialog();
		// this.accountService.registerDialogOpen$.next(true);
		// this.accountService.registerDialogOpen$.next(false);
		const rDialog = this.dialog.open(RegisterComponent, {
			disableClose: true,
			panelClass: 'registerDialog',
			width: '50%'
		});
	}

	async firebaseNotificationPermission() {
		await this.messagingService.requestPermission();
		this.messagingService.receiveMessage();
	}

	eventKeyPress(event) {
		if (event && event.keyCode === 13) {
			this.signIn();
		}
	}

	onChange(e) {
		// console.log(e)
		this.isRememberChecked = e;
	}
	
	deleteCookies() {
		if (this.cookieService.check('remember_me')) {
			this.cookieService.delete('remember_me');
		}
	}
}
