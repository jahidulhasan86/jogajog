import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { AccountService } from '../shared/services/account/account.service';
import { MatDialog } from '@angular/material/dialog';
//import { LoginComponent } from 'src/app/login/login.component';
import { LoginHeaderComponent } from 'src/app/login-header/login-header.component';

import { GuestLoginComponent } from 'src/app/guest-login/guest-login.component';
@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private router: Router, public accountService: AccountService, private dialog: MatDialog) {}

	canActivate(route: ActivatedRouteSnapshot) {
		const loginOpen = route.data.loginOpen;
		if (this.accountService.loggedIn()) {
			return true;
		} else {
			if (loginOpen) {
				let path = '';
				if (route.routeConfig.path === 'meeting') {
					path = '/meeting';
					this.loginDialog(path);			
				}				
				else {
					route.url.forEach((element) => {
						path += element + '/';
					});
					this.accountService.isRequiredRegistration = route.params.isRequiredRegistration
					this.loginDialog(path);
				}
				
			} else {
				this.router.navigate(['']);
			}
			return false;
		}
	}

	loginDialog(url) {
		const lDialog = this.dialog.open(LoginHeaderComponent, {
			disableClose: true,
			panelClass: 'loginDialog',
			width: '50%',
			data: {
				destinationRoute: {
					type: 'url',
					data: url
				}
			}
		});
	}
}
