import { Component, OnInit, Inject } from '@angular/core';
import { AccountService } from '../shared/services/account/account.service';
import { GlobalValue } from '../global';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { LoginComponent } from '../login/login.component';
import { LoginHeaderComponent } from 'src/app/login-header/login-header.component';
import { FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
	selector: 'app-register',
	templateUrl: './register.component.html',
	styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
	public registerModel = {
		user_name: '',
		email: '',
		password: '',
		app_id: '',
		company_id: '',
		company_name: '',
		app_name: '',
		is_public: false

	};
	globalValue: any;
	emailFormControl = new FormControl('', [Validators.required, Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]);

	constructor(
		private accountService: AccountService,
		public dialogRef: MatDialogRef<RegisterComponent>,
		private dialog: MatDialog,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {
		this.globalValue = GlobalValue;

	}

	ngOnInit(): void {
		console.log('register')
		this.registerModel.app_id = this.data ? this.data.app_id : GlobalValue.app_id;
		this.registerModel.company_id = this.data ? this.data.type_id : GlobalValue.company_id;
		this.registerModel.company_name = this.data ? this.data.type_name : GlobalValue.company_name;
		this.registerModel.app_name = GlobalValue.app_name;
		this.registerModel.email = this.data ? this.data.email : '';


		(!!this.data && this.data.invitation_type == 'company') ? Object.assign(this.registerModel, {
			metadata: {
				company_employee: [this.data.type_id]
			}
		}) : null
	}
	register() {
		if (this.emailFormControl.invalid) return

		const overlapping = false;
		this.accountService.signup(this.registerModel, overlapping).subscribe((result) => {
			if (result.status == 'ok') {
				Swal.fire({
					title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'রেজিস্ট্রেশন সফল হয়েছে' : 'Registered successfully',
					text: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'ইমেইল পাঠানো হয়েছে | আপনার পরিচয় যাচাই করার করার জন্য ইমেইল এ পাঠানো লিঙ্ক এ ক্লিক করুন' : 'Email has been sent. Please click to verify your account ',
					icon: 'success',
				});
				this.closeDialog();

				if (!!this.data && this.data.invitation_type == 'room_invitation') {
					this.accountService.isRequiredRegistration = '1'
					Object.assign(this.data, { user_name: this.registerModel.user_name})
					this.loginDialog(this.data)
				}
			}
		}, (err) => {
			console.log(err);
			if (err.error.code == 400) {
				Swal.fire({
					title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? err.error.message.bn : err.error.message.en,
					icon: 'warning',
					timer: 3000,
				});
			} else {
				Swal.fire({
					title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'অনুগ্রহ পূর্বক আবার চেষ্টা করুন' : 'Error! Plese try again later.',
					icon: 'warning',
					timer: 3000,
				});
			}
		}
		);
	}
	closeDialog() {
		this.dialogRef.close();
	}

	loginDialog(data?) {
		this.closeDialog();
		const lDialog = this.dialog.open(LoginHeaderComponent, {
			disableClose: true,
			panelClass: 'loginDialog',
			data: data ? data : null
		});
	}
}
