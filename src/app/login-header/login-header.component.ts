import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { AccountService } from '../shared/services/account/account.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { GlobalValue } from '../global';
import { SocialUser, AuthService, GoogleLoginProvider, FacebookLoginProvider } from 'angularx-social-login';
@Component({
	selector: 'app-login-header',
	templateUrl: './login-header.component.html',
	styleUrls: ['./login-header.component.css']
})
export class LoginHeaderComponent implements OnInit {
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

	constructor(
		private accountService: AccountService,
		public dialogRef: MatDialogRef<LoginHeaderComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private router: Router,		
		private authService: AuthService
	) {
		this.globalValue = GlobalValue;
	}
	isRequiredRegistration : any
	ngOnInit(): void { 
		this.isRegularLogin = false
		if(this.accountService.isRequiredRegistration == '1') 
		{
			this.isRequiredRegistration = true
			this.isRegularLogin = true
		}
		else this.isRequiredRegistration = false

		if(this.isRequiredRegistration) document.getElementById('radBtn').style.display = 'none'
		else document.getElementById('radBtn').style.display = 'flex'

		this.destinationRoute = this.data ? this.data.destinationRoute : null;
		if (this.destinationRoute) {
			if (this.destinationRoute.data !== 'default') {
				localStorage.setItem('destinationRoute', JSON.stringify(this.destinationRoute));
			}
		}
		
		// this.authService.authState.subscribe((user) => {
		// 	console.log(user)
		// 	this.user = user;
		// 	this.loggedIn = (user != null);
		// });
	}

	isRegularLogin : any
	setLoginType(event)
	{
		if(event.target.value == 'regular_login') this.isRegularLogin = true
		else this.isRegularLogin = false
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


}
