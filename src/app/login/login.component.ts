/*

 * Copyright (c) 2004-2020 by Protect Together Inc.

 * All Rights Reserved

 * Protect Together Inc Confidential

 */

/* 
 
 Single sign in, Social login (Facebook, Google), Recaptcha Challenge, Cross launch and others util services related code here.  
 
*/

import { Component, OnInit, Inject } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { AccountService } from '../shared/services/account/account.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { HostMeetingComponent } from '../host-meeting/host-meeting.component';
import { NotificationService } from '../shared/services/notifications/notification.service';
import { MessagingService } from '../shared/services/messaging/messaging.service';
import { XmppChatService } from '../shared/services/xmpp-chat/xmpp-chat.service';
import { RegisterComponent } from 'src/app/register/register.component';
import { CookieService } from 'ngx-cookie-service';
import * as CryptoJS from 'crypto-js';
import { GlobalValue } from '../global';
import { SocialUser, AuthService, GoogleLoginProvider, FacebookLoginProvider } from 'angularx-social-login';
import { RoomBoxService } from '../shared/services/room-box/room-box.service';
import { ForgetPasswordComponent } from '../forget-password/forget-password.component';
@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
	public loginModel = {
		user_name: '',
		password: ''
	};
	isLoggedIn = false;
	destinationRoute: any;
	isRememberChecked: boolean;
	globalValue: any;
	private user: SocialUser;
	private loggedIn: boolean;
	hasCompleteRecaptcha: boolean;
	authUser: any;
	encryptedPass: any;
	keys = '$Ue0ugMTAAARrNokdEEiaz';
	autUser: any;
	constructor(
		private accountService: AccountService,
		public dialogRef: MatDialogRef<LoginComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private router: Router,
		private dialog: MatDialog,
		private notificationService: NotificationService,
		private messagingService: MessagingService,
		private xmppChatService: XmppChatService,
		private cookieService: CookieService,
		private authService: AuthService,
		private spinner: NgxSpinnerService,
		private roomboxService: RoomBoxService
	) {
		this.globalValue = GlobalValue;
	}
	ngOnInit(): void {
		this.authUser = JSON.parse(localStorage.getItem('sessionUser'));
		this.hasCompleteRecaptcha = true; //no challenges  for trunk#1
		// this.spinner.show();
		this.destinationRoute = this.data ? this.data.destinationRoute : null;
		if (this.destinationRoute) {
			if (this.destinationRoute.data !== 'default') {
				localStorage.setItem('destinationRoute', JSON.stringify(this.destinationRoute));
			}
		}

		if (!!this.data && this.data.invitation_type === 'room_invitation') {
			this.loginModel.user_name = this.data.user_name
		}

		this.rememberMe();

		// this.authService.authState.subscribe((user) => {
		// 	console.log(user);
		// 	this.user = user;
		// 	this.loggedIn = user != null;
		// });

		// this.encryptedPass = this.encryptPass(this.authUser.password)
		// console.log('ccccc',this.encryptedPass)
	}

	encryptPass(value) {
		var key = CryptoJS.enc.Utf8.parse(this.keys);
		var iv = CryptoJS.enc.Utf8.parse(this.keys);
		var encrypted = CryptoJS.DES.encrypt(CryptoJS.enc.Utf8.parse(value.toString()), key,
			{
				keySize: 128 / 8,
				iv: iv,
				mode: CryptoJS.mode.CBC,
				padding: CryptoJS.pad.Pkcs7
			});
		return encrypted.toString();
	}

	// signIn() {
	// 	if (!this.loginModel.user_name) {
	// 		Swal.fire({
	// 			icon: 'info',
	// 			text:
	// 				!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
	// 					? 'অনুগ্রহপূর্বক ইউজারনেম দিন'
	// 					: 'Please enter username first!'
	// 		});
	// 		return;
	// 	}
	// 	if (!this.loginModel.password) {
	// 		Swal.fire({
	// 			icon: 'info',
	// 			text:
	// 				!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
	// 					? 'অনুগ্রহপূর্বক পাসওয়ার্ড দিন'
	// 					: 'Please enter password first!'
	// 		});
	// 		return;
	// 	}
	// 	if (!this.hasCompleteRecaptcha) {
	// 		Swal.fire({
	// 			icon: 'info',
	// 			text: 'Please complete the recaptcha challenge first!'
	// 		});
	// 		return;
	// 	}
	// 	this.spinner.show();
	// 	this.accountService.signIn(this.loginModel.user_name, this.loginModel.password).subscribe(
	// 		(result) => {
	// 			if (result.status === 'ok') {
	// 				this.spinner.hide();
	// 				console.log('sign in then get token', result);
	// 				if (this.isRememberChecked == true) {
	// 					// localStorage.setItem('remember_me', JSON.stringify(remember_me)) // local storage
	// 					this.createCookies(this.loginModel.user_name, this.loginModel.password);
	// 				} else {
	// 					// localStorage.removeItem("remember_me") // local storage
	// 					this.deleteCookies();
	// 				}
	// 				this.notificationService.globalNotificationShow(
	// 					!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
	// 						? 'লগইন সফল হয়েছে'
	// 						: 'Successfully logged In'
	// 				);

	// 				this.pubsubAndXamppRegistration();
	// 				// this.firebaseNotificationPermission();

	// 				this.clearLoginModel();
	// 				this.closeDialog();

	// 				// For route where he came
	// 				const destinationRoute = JSON.parse(localStorage.getItem('destinationRoute'));
	// 				if (destinationRoute) {
	// 					if (destinationRoute.type === 'url') {
	// 						this.router.navigate([destinationRoute.data]);
	// 						localStorage.removeItem('destinationRoute');
	// 					} else if (destinationRoute.type === 'string') {
	// 						if (destinationRoute.data === 'host_a_meeting') {
	// 							this.hostMeetingDialog();
	// 							localStorage.removeItem('destinationRoute');
	// 						}
	// 						if(destinationRoute.data === 'goto_room'){
	// 							this.router.navigate(['/dashboard/room-box']);
	// 							localStorage.removeItem('destinationRoute');
	// 						}
	// 					}
	// 				} else {
	// 					this.router.navigate(['/dashboard/home']);
	// 				}
	// 			}
	// 		},
	// 		(err) => {
	// 			this.spinner.hide();
	// 			console.log(err);
	// 			this.loginErrorHandler(err);
	// 		}
	// 	);
	// }
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
				title:
					!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
						? 'লগইন সফল হয়নি'
						: 'Login error',
				text:
					!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
						? err.error.message.bn
						: err.error.message.en
			});
		} else {
			Swal.fire({
				icon: 'warning',
				title:
					!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
						? 'লগইন সফল হয়নি'
						: 'Login error',
				text:
					!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
						? 'সার্ভার পাওয়া যায়নি'
						: 'Server not found'
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
			// this.signIn();
			this.signIn0Auth()
		}
	}
	onChange(e) {
		// console.log(e)
		this.isRememberChecked = e;
	}
	rememberMe() {
		// cookies
		if (this.cookieService.check('remember_me')) {
			const encrypted_pass: string = this.cookieService.get('remember_me');
			const bytes = CryptoJS.AES.decrypt(encrypted_pass.toString(), 'securityKey');
			const remember_me = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
			this.loginModel.user_name = remember_me.user_name;
			this.loginModel.password = remember_me.password;
			this.isRememberChecked = true;
		} else {
			this.isRememberChecked = false;
		}
	}
	createCookies(user_name, password) {
		const remember_me = {
			user_name: user_name,
			password: password
		};
		const remember_me_encrypted = CryptoJS.AES.encrypt(JSON.stringify(remember_me), 'securityKey');
		this.cookieService.set('remember_me', remember_me_encrypted, 7);
	}
	deleteCookies() {
		if (this.cookieService.check('remember_me')) {
			this.cookieService.delete('remember_me');
		}
	}
	signInWithGoogle(): void {
		this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then((x) => {
			if (!!x) {
				console.log(x)
				this.socialSignIn(x)
			}
		}).catch((err) => {
			console.log(err)
		})
	}
	signInWithFB(): void {
		this.authService.signIn(FacebookLoginProvider.PROVIDER_ID).then((x) => {
			if (!!x) {
				console.log(x)
				this.socialSignIn(x)
			}
		})
			.catch((x) => {
				console.log(x)
			})
	}
	// Social login (Facebook and Google) implementation here (Jahid)
	socialSignIn(x) {
		this.accountService.socialSignIn(x).subscribe((result) => {
			if (result.status == 'ok') {
				console.log(result)
				this.notificationService.globalNotificationShow((!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'লগইন সফল হয়েছে' : 'Successfully logged In');
				this.closeDialog();
				this.router.navigate(['/dashboard/home']);
				this.pubsubAndXamppRegistration();
			}
		}, err => {
			console.log(err)
			this.loginErrorHandler(err);
		})
	}
	onRecaptchaLoad() {
		this.spinner.hide();
		$('.angular-google-recaptcha-container').css('margin-left', '23%');
		$('.angular-google-recaptcha-container').css('margin-bottom', '15px');
		console.log('Google reCAPTCHA loaded and is ready for use!');
	}
	onRecaptchaError() {
		console.log('Something went long when loading the Google reCAPTCHA');
	}

	// OAuth implementation start here (Jahid)
	signIn0Auth() {
		if (!this.loginModel.user_name) {
			Swal.fire({
				icon: 'info',
				text:
					!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
						? 'অনুগ্রহপূর্বক ইউজারনেম দিন'
						: 'Please enter username first!'
			});
			return;
		}
		if (!this.loginModel.password) {
			Swal.fire({
				icon: 'info',
				text:
					!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
						? 'অনুগ্রহপূর্বক পাসওয়ার্ড দিন'
						: 'Please enter password first!'
			});
			return;
		}
		if (!this.hasCompleteRecaptcha) {
			Swal.fire({
				icon: 'info',
				text: 'Please complete the recaptcha challenge first!'
			});
			return;
		}
		this.spinner.show();
		this.accountService.token0Auth(this.loginModel.user_name.toLowerCase(), this.loginModel.password).subscribe(
			(result) => {
				if (result.status === 'ok') {
					console.log(result);
					this.userAuthorizationHandler(result.result, this.loginModel).then((result) => {
						if (result) {
							console.log(result)
							this.spinner.hide();
							if (this.isRememberChecked == true) {
								// localStorage.setItem('remember_me', JSON.stringify(remember_me)) // local storage
								this.createCookies(this.loginModel.user_name, this.loginModel.password);
							} else {
								// localStorage.removeItem("remember_me") // local storage
								this.deleteCookies();
							}
							this.notificationService.globalNotificationShow(
								!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
									? 'লগইন সফল হয়েছে'
									: 'Successfully logged In'
							);

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
									this.autUser = JSON.parse(localStorage.getItem('sessionUser'));
									this.encryptedPass = this.encryptPass(this.autUser.password)
									//  console.log('encryptedPasss',this.encryptedPass)
									if (destinationRoute.data === 'host_a_meeting') {
										this.hostMeetingDialog();
										localStorage.removeItem('destinationRoute');
									}
									if (destinationRoute.data === 'goto_room') {
										this.router.navigate(['/dashboard/room-box']);
										localStorage.removeItem('destinationRoute');
									}
									if (destinationRoute.data === 'goto_vitual_class_room') {

										// console.log('aaa',this.authUser)
										// window.open('http://localhost:4005/Signin?access_token=' + this.authUser.access_token + '&type=cross_launch','_blank')
										window.open('https://learn.protect2gether.com/Signin?access_token=' + this.autUser.access_token + '&type=cross_launch' + '&p=' + this.encryptedPass, '_blank')
										localStorage.removeItem('destinationRoute');
									}
								}
							} else {
								if (!!this.data && this.data.invitation_type === 'room_invitation') {
									this.addUsersToExistingConference()
								}
								this.router.navigate(['/dashboard/home']);
							}
						}

					}).catch((err) => {
						console.log(err)
						this.spinner.hide();
					})
				}
			},
			(err) => {
				this.spinner.hide();
				console.log(err);
				this.loginErrorHandler(err);
			}
		);
	}
	authorize(result, loginModel) {
		return new Promise((resolve, reject) => {
			this.accountService.authorize(result, loginModel).subscribe((result) => {
				if (result.status == 'ok') {
					resolve(result)
				}
			}, err => {
				console.log(err)
				reject(err)
			})
		})
	}
	userAuthorizationHandler(result, loginModel) {
		if (result.authorized) {
			return this.authorize(result, loginModel)
		} else {
			return this.continueWithUserPopup(result, loginModel)
		}
	}
	continueWithUserPopup(x, loginModel) {
		return new Promise((resolve, reject) => {
			Swal.fire({
				title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'আপনি কি ' + loginModel.user_name + ' দিয়ে কন্টিনিউ করতে ইচ্ছুক?' : 'Do you want to continue with the user ' + loginModel.user_name,
				imageUrl: 'assets/images/continue-png.png',
				showCancelButton: true,
				confirmButtonColor: '#F4AD20',
				cancelButtonColor: '#d33',
				imageWidth: 65,
				padding: '1em',
				confirmButtonText: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'হ্যাঁ' : 'Yes',
				cancelButtonText: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'না' : 'No, Thanks'
			}).then((result) => {
				if (result.value) {
					this.authorize(x, loginModel).then((x) => {
						resolve(x)
					}).catch((err) => {
						reject(err)
					})
				} else {
					reject(result.isDismissed)
				}
			});
		})
	}

	addUsersToExistingConference() {
		this.authUser = JSON.parse(localStorage.getItem('sessionUser'));
		let userList = []
		let currentUserInfo = {
			user_id: this.authUser.id,
			user_name: this.authUser.user_name,
			email: this.authUser.email,
			// profile_pic: this.authUser.profile_pic ? this.authUser.profile_pic : '',
			// contact: this.authUser.contact ? this.authUser.contact : ''
		}
		userList.push(currentUserInfo)
		this.roomboxService._addUsersToExistingConference(this.data.conference_id, userList).subscribe((result) => {
			if (result) {
				console.log(result)
			}
		}, err => {
			console.log(err)
		})
	}

	forgetPassword(){
		const rDialog = this.dialog.open(ForgetPasswordComponent, {
			disableClose: true,
			panelClass: 'registerDialog',
			width: '50%'
		});

		rDialog.afterClosed().subscribe(result=>{
			if(result){
				this.accountService.forgetPassword({email:result}).subscribe(result=>{
					if(result && result.status == 'ok'){
						Swal.fire({
							icon: 'success',
							title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'পাসওয়ার্ড রিসেট লিঙ্কটি আপনার ইমেলটিতে প্রেরণ করা হয়েছে' : 'Password Reset Link is sent to your email',
							text: ''
							
						});						
					}
				},
				err=>{
					console.log(err);
					if(err.error
					 && err.error.message){
						Swal.fire({
							icon: 'warning',
							title:
								err.error.message.en,
							text: ''
							
						});	
					}
				});
			}
		})

	}
}
