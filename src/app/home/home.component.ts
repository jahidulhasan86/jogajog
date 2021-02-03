import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';
import { AccountService } from '../shared/services/account/account.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { MatDialog } from '@angular/material/dialog';
import { RegisterComponent } from '../register/register.component';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: []
})
export class HomeComponent implements OnInit {
	public roomForm: FormControl;
	public version = require('../../../package.json').version;
	helper: JwtHelperService;

	constructor(private router: Router, public formBuilder: FormBuilder, public accountService: AccountService, private route: ActivatedRoute, private dialog: MatDialog) { }

	ngOnInit() {
		const randomName = uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals], separator: '-' });
		this.roomForm = new FormControl(randomName, [Validators.minLength(4), Validators.required]);
		this.route.queryParams.subscribe((result) => {
			if (!!result.token) {
				const decodedToken = this.tokenDecoder(result.token)
				if (!!decodedToken) {
					console.log(decodedToken)
					this.registerDialog(decodedToken)
				}
			}
		})
	}

	tokenDecoder(token) {
		this.helper = new JwtHelperService();
		return JSON.parse(this.helper.urlBase64Decode(token));
	}

	registerDialog(data) {
		this.dialog.open(RegisterComponent, {
			disableClose: true,
			panelClass: 'registerDialog',
			data: data
		});
	}
}
