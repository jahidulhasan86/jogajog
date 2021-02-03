
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, Inject, NgZone, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MeetingService } from '../shared/services/meeting/meeting.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { NotificationService } from '../shared/services/notifications/notification.service';
import { GlobalValue } from '../global';
import { data } from 'jquery';
import { CustomMailComponent } from '../custom-mail/custom-mail.component';
import { FormControl } from '@angular/forms';
import { Observable, forkJoin } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { ContactService } from '../shared/services/contact/contact.service';
import { MultiCompanyService } from '../shared/services/multi-company/multi-company.service'
import { Contact } from '../dashboard/contacts/contacts.component'
@Component({
	selector: 'app-invite-meeting',
	templateUrl: './invite-meeting.component.html',
	styleUrls: ['./invite-meeting.component.scss']
})
export class InviteMeetingComponent implements OnInit, OnDestroy, AfterViewInit {
	inviteMeetingModel = {
		meeting_code: '',
		meeting_url: '',
		meeting_name: '',
		meeting_password: '',
		invitation_type: 'meeting',
		invitation_medium: 'email',
		email_list: '',
		hasCustomMessage: false,
		customMessageText: ''
	};

	globalValue: any;
	pushData: any;
	bnEnLanguageCheck: boolean;
	separatorKeysCodes: number[] = [ENTER, COMMA];
	visible = true;
	selectable = true;
	
	removable = true;
	contactCtrl = new FormControl();
	filteredContacts: Observable<Contact[]>;
	contacts: Contact[] = [];
	allContacts: Contact[] = new Array();
	fetchMembers: boolean = false;
	@ViewChild('emailInput') emailInput: ElementRef<HTMLInputElement>;
	@ViewChild('auto') matAutocomplete: MatAutocomplete;
	emailList:any;

	mailMessageData: any = {
		messageTitle: 'You have been invited to join in a meeting on Jagajag.',
		customMessageText: '',
		meetingInfo: {},
		isPreviewMode: false,
		isCustomMessage: false,
		cancelButtonText: 'Cancel Invitation',
		parent: this,
		notificationService: this.notificationService,
		meetingService: this.meetingService
	};
	currentUser: any;
	checkbox_checked: boolean;


	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialogRef: MatDialogRef<InviteMeetingComponent>,
		private dialog: MatDialog,
		private meetingService: MeetingService,
		private router: Router,
		private _ngZone: NgZone,
		private notificationService: NotificationService,
		private contactService: ContactService,
		private multicompanyService: MultiCompanyService
	) {

		/* this.contactService.getContacts().subscribe((result) => {
		 // this.contacts = result;
			/* result.array.forEach(element => {
				this.allContacts.push(element.email);
			});	 
			var contacts = this.allContacts;
				contacts.push(entry.email);
			});
		}); */

		//multiple services contact and member call using combine latest

		this.getContactsAndMembers();

		//after check will be uncommented
		this.checkIfUserBelongsToSameCompany();
		if (this.fetchMembers) {

			this.getContactsAndMembers();
		} else {

			this.contactService.getContacts().subscribe((result) => {
				//this.contacts = result;
				this.allContacts = result;
				this.allContacts.forEach(element => {
					element.type = "Contact";
				});
			});
		}

		this.filteredContacts = this.contactCtrl.valueChanges.pipe(
			startWith(null),
			map((contact: string | null) => contact ? this._filter(contact) : this.allContacts.slice()));

		this.globalValue = GlobalValue;
		this.currentUser = JSON.parse(localStorage.getItem('sessionUser'));
	
	

	}

	ngOnInit(): void {
		console.log('invite meeting');
		this.mailMessageData.isCustomMessage = false;
		this.inviteMeetingModel.meeting_url = this.data.meeting_url;
		this.inviteMeetingModel.meeting_code = this.data.meeting_code;
		this.inviteMeetingModel.meeting_password = this.data.meeting_password;
		this.inviteMeetingModel.meeting_name = this.data.meeting_name;
		this.inviteMeetingModel.email_list = "";
		this.pushData = this.data;
		this.mailMessageData.meetingInfo = this.data;


		// **** Tonmoy Comment out it, and do it on custom-mail.html by pipe oparator
		// this.mailMessageData.meetingInfo.timing.start_time = new Date(
		// 	parseInt(this.mailMessageData.meetingInfo.timing.start_time)
		// ).toLocaleString();
		this.bnEnLanguageCheck = !!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn';
		this.checkbox_checked = false;
	}

	ngAfterViewInit() {
	}
	ngOnDestroy() {
	}

	
	inviteMeeting() {
		if(!this.emailInput.nativeElement.value && !this.inviteMeetingModel.email_list) return;
		console.log(this.emailInput.nativeElement.value);
		let emailRemainder = this.emailInput.nativeElement.value;
		if(emailRemainder){
			this.inviteMeetingModel.email_list = this.inviteMeetingModel.email_list == "" ? emailRemainder : this.inviteMeetingModel.email_list + "," + emailRemainder;
		}
		
		
		this.meetingService.inviteMeeting(this.inviteMeetingModel).subscribe(
			(result) => {
				if (result.status == 'ok') {
					this.inviteMeetingModel.email_list = '';
					this.emailInput.nativeElement.value='';
					this.contacts = [];
					this.checkbox_checked = false;
					this.meetingService.count = 1;
					Swal.fire({
						icon: 'success',
						title:
							!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
								? 'অংশগ্রহণকারীদের ইমেইল ঠিকানায় আমন্ত্রণ সফলভাবে পাঠান হয়েছে'
								: 'Invitation successfully sent to participants email',
						timer: 3000
					});
				}
			},
			(err) => {
				console.log(err);
				this.meetingErrorHandler(err);
			}
		);
	}

	meetingErrorHandler(err) {
		if (err.status === 400) {
			Swal.fire({
				icon: 'warning',
				title:
					!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
						? ' প্রয়োজনীয় তথ্য পূরণ করা হয়নি'
						: 'Required field missing',
				text: err.error.message.en
			});
		} else {
			Swal.fire({
				icon: 'warning',
				title:
					!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
						? 'আমন্ত্রণ সফল হয়নি'
						: 'Invite meeting error',
				text:
					!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
						? 'সার্ভার পাওয়া যায়নি'
						: 'Server not found'
			});
		}
	}

	closeDialog() {
		this.dialogRef.close();
		this.meetingService.count = 0;
	}

	clearInviteMeetingModel() {
		Object.keys(this.inviteMeetingModel).forEach((key) => (this.inviteMeetingModel[key] = ''));
	}

	getSecondPart(str) {
		return str.split('#')[1];
		// return str.split(window.location.origin)[1];
	}

	copyLink() {
		const copyText = document.getElementById('meetingURL') as HTMLInputElement;
		copyText.select();
		copyText.setSelectionRange(0, 99999);
		document.execCommand('copy');
		this.notificationService.globalNotificationShow(
			localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') == 'bn'
				? 'মিটিং এর লিঙ্ক কপি করা হয়েছে '
				: 'Copied Meeting URL'
		);
	}

	cancelMeeting() {
		Swal.fire({
			title:
				!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
					? 'এই মিটিংটি স্থায়ী ভাবে মুছে যাবে|আপনি কি মুছে ফেলার জন্য নিশ্চিত?'
					: 'This meeting will be deleted permanently. Are you sure you want to remove it?',
			icon: 'info',
			showCancelButton: true,
			confirmButtonColor: '#F4AD20',
			cancelButtonColor: '#d33',
			confirmButtonText: !!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn' ? 'হ্যাঁ' : 'Yes',
			cancelButtonText:
				!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn' ? 'না' : 'No, Thanks'
		}).then((result) => {
			if (result.value) {
				this.meetingService.cancelMeeting({ meeting_id: this.data.id }).subscribe(
					(result) => {
						if (result.status === 'ok') {
							console.log(result);
							this.closeDialog();
							this.clearInviteMeetingModel();
							this.meetingService.getUpcomingMeetingInfoForMe('10').subscribe();
						}
					},
					(err) => {
						console.log(err);
						this.meetingErrorHandler(err);
					}
				);
			}
		});
	}

	joinMeetingNow() {
		this.closeDialog();
		this.clearInviteMeetingModel();
		const meetingURL = this.getSecondPart(this.data.meeting_url);
		// this.router.navigate([`/${meetingURL}`]);
		// console.log(meetingURL);

		// window.location.href = window.location.origin + '#' + meetingURL;
		// window.location.reload();

		this._ngZone.run(() => {
			this.router.navigate([meetingURL]);
		});
	}

	openMailMessagePopup() {
		// this.mailMessageData.meetingInfo.timing.start_time = new Date(
		// 	parseInt(this.mailMessageData.meetingInfo.timing.start_time)
		// ).toLocaleString();
		const dialogRef = this.dialog.open(CustomMailComponent, {
			disableClose: true,
			minWidth: '750px',
			minHeight: '455px',
			data: {
				mmodel: this.mailMessageData
			}
		});
	}
	openCustomMailMessagePopup(isChecked) {
		if (isChecked) {
			this.openMailMessagePopup();
		} else {
			this.data.mmodel.isCustomMessage = false;
		}
	}

	private _filter(value: any): Contact[] {
		if (typeof value === 'string') {
			const filterValue = value.toLowerCase();

			return this.allContacts.filter(contact => contact.name.toLowerCase().indexOf(filterValue) === 0);


		} else {
			return this.allContacts.filter(contact => contact.name.toLowerCase().indexOf(value.name.toLowerCase()) === 0);

		}
	}
	add(event: MatChipInputEvent): void {
		const input = event.input;
		const value = event.value;

		// Add our fruit
		if ((value || '').trim()) {
			this.contacts.push(new Contact(value.trim(), value.trim()));
			this.inviteMeetingModel.email_list = this.inviteMeetingModel.email_list == "" ? value : this.inviteMeetingModel.email_list + "," + value;
		}

		// Reset the input value
		if (input) {
			input.value = '';
		}

		this.contactCtrl.setValue(null);
	}

	remove(email: Contact): void {
		var conacts = this.contacts;
		/* const index = this.contacts.forEach(element => {
				let match= element.name == email;
				if(match){
					return conacts.indexOf(element); 
				}else{
					return -1;
				}
		});; */
		let index = -1;
		for (var val of this.contacts) {
			if (val.name == email.name) {
				index = this.contacts.indexOf(val);
				break;
			}
		}

		if (index >= 0) {
		     if( this.contacts[index].email == this.currentUser.email){
				this.checkbox_checked = false;
			 }
			this.contacts.splice(index, 1);
			
		}
		var emails = this.inviteMeetingModel.email_list.split(',');
		const emailIndex = emails.indexOf(email.email);
		emails.splice(emailIndex, 1);
		var model = this.inviteMeetingModel;
		model.email_list = "";
		emails.forEach(function (entry) {

			model.email_list = model.email_list == "" ? model.email_list + entry : model.email_list + "," + entry;

		});
	}

	sendMeCopy(event) {
		console.log(this.currentUser)
		console.log('checkbox', event.checked); //true or false
		if (event.checked) {
			this.contacts.push(new Contact(this.currentUser.email, this.currentUser.email))
			this.inviteMeetingModel.email_list = this.inviteMeetingModel.email_list == "" ? this.currentUser.email : this.inviteMeetingModel.email_list + "," + this.currentUser.email;
		}
		else {
			this.contacts.forEach((element, index) => {
				if (element.email == this.currentUser.email) {
					this.contacts.splice(index, 1);
				}
			});
		}
	}

	selected(event: MatAutocompleteSelectedEvent): void {
		let name = event.option.viewValue;
		console.log(name);
		var indexSpace = name.lastIndexOf(" ");
		//var names = name.split(" ");
		let nameFilter = name.substring(0, indexSpace);

		const result = this.allContacts.find(function (data) {
			return nameFilter == data.name;
		});
		if (this.contacts.includes(result)) return;
		this.contacts.push(result);
		this.inviteMeetingModel.email_list = this.inviteMeetingModel.email_list == "" ? this.inviteMeetingModel.email_list + result.email : this.inviteMeetingModel.email_list + "," + result.email;
		this.emailInput.nativeElement.value = '';
		this.contactCtrl.setValue(null);
	}

	checkIfUserBelongsToSameCompany() {
		var defaultCompany = GlobalValue.company_id;
		let user = localStorage.getItem('sessionUser');
		var userObject = JSON.parse(user);
		var userSession = userObject.user_session;
		if (defaultCompany != userObject.company_id) {
			this.fetchMembers = true;
		} else {
			this.fetchMembers = false;
		}
	}

	getCompanyMembers() {
		this.multicompanyService.getCompanyEmployee().subscribe((result) => {
			var contacts = this.contacts;
			result.foreach(function (x) {
				console.log(x);
			});
		});
	}

	getContactsAndMembers() {
		const contact = this.contactService.getContacts();
		const member = this.multicompanyService.getCompanyEmployee();
		let contacts = this.allContacts;
		forkJoin([contact, member]).subscribe(result => {
			this.allContacts = result[0];
			this.allContacts.forEach(data => {
				//data.name = data.name + "--------{Contact}"
				data.type = "Contact"
			});
			if (result[1]) {
				result[1].resultset.forEach(data => {
					this.allContacts.push(new Contact(data.user_name, data.email, "Member"));
				})
			}
		})

	}
}


@Component({
	templateUrl: './modal-custom-mail-message.html'
})
export class CustomMailDialogComponent implements OnInit {
	globalValue: any;
	constructor(
		public dialogRef: MatDialogRef<CustomMailDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private router: Router
	) { }
	ngOnInit(): void {
		this.data.mmodel.isPreviewMode = false;
		this.data.mmodel.cancelButtonText = 'Cancel Invitation';
		$('.hideInPreview').css('display', 'block');
		const target = document.getElementById('invitationText');
		const self = this;
		document.addEventListener(
			'input',
			function (event) {
				const targetArea: any = event;
				if (targetArea.target.nodeName.toLowerCase() !== 'textarea') {
					return;
				}
				self._handleTextAreaSize(event.target);
			},
			false
		);
	}
	closeDialog(): void {
		const pData = this.data.parent;
		this.data.mmodel.isCustomMessage = false;
		this.dialogRef.close();
		this.dialogRef.afterClosed().subscribe((result) => {
			$('#cCheck').prop('checked', false);
			this.data.mmodel.parent.closeDialog();
			this.data.mmodel.parent.router.navigate(['/dashboard/home']);
		});
	}

	showMessagePreview() {
		this.data.mmodel.isPreviewMode = true;
		const customMessage = $('#invitationText').val();
		this.data.mmodel.customMessageText = customMessage === '' ? this.data.mmodel.messageTitle : customMessage;
		$('.closePreview').css('display', 'block');
		$('.hideInPreview').css('display', 'none');
	}
	closeMessagePreview() {
		this.data.mmodel.isPreviewMode = false;
		this.data.mmodel.isCustomMessage = false;
		$('.closePreview').css('display', 'none');
		$('.hideInPreview').css('display', 'block');
	}
	closeOnDialogSubmit() {
		const customMessage = $('#invitationText').val().toString().trim();
		const emailAddresses = $('#inviteeMail').val().toString().trim();
		this.data.mmodel.parent.inviteMeetingModel.email_list = emailAddresses;
		if (customMessage === '' && emailAddresses) {
			Swal.fire({
				text: 'Are you sure to send invitation without custom message?',
				icon: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Yes',
				cancelButtonText: 'No'
			}).then((result) => {
				if (result.value) {
					this.data.mmodel.parent.inviteMeetingModel.hasCustomMessage = false;
					this.data.mmodel.parent.inviteMeetingModel.customMessageText = this.data.mmodel.messageTitle;
					this.inviteMeeting();
					// this.dialogRef.close();
				}
			});
		} else if (emailAddresses === '') {
			Swal.fire({
				icon: 'info',
				title: 'Enter email address to send.',
				timer: 3000
			});
			return;
		} else {
			this.data.mmodel.parent.inviteMeetingModel.hasCustomMessage = true;
			this.data.mmodel.parent.inviteMeetingModel.customMessageText = customMessage;
			this.inviteMeeting();
			// this.dialogRef.close();
		}
	}

	copyLink() {
		const copyText = document.getElementById('meetingURL') as HTMLInputElement;
		copyText.select();
		copyText.setSelectionRange(0, 99999);
		document.execCommand('copy');
		this.data.mmodel.notificationService.globalNotificationShow(
			localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
				? 'মিটিং এর লিঙ্ক কপি করা হয়েছে '
				: 'Copied Meeting URL'
		);
	}

	inviteMeeting() {
		this.data.mmodel.meetingService.inviteMeeting(this.data.mmodel.parent.inviteMeetingModel).subscribe(
			(result) => {
				if (result.status == 'ok') {
					this.data.mmodel.parent.inviteMeetingModel.email_list = '';
					this.data.mmodel.meetingService.count = 1;
					this.data.mmodel.cancelButtonText = 'Done';
					Swal.fire({
						icon: 'success',
						title:
							!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
								? 'অংশগ্রহণকারীদের ইমেইল ঠিকানায় আমন্ত্রণ সফলভাবে পাঠান হয়েছে'
								: 'Invitation successfully sent to participants email',
						timer: 3000
					});
				}
			},
			(err) => {
				console.log(err);
				this.data.mmodel.parent.meetingErrorHandler(err);
			}
		);
	}

	_handleTextAreaSize(field) {
		field.style.height = 'inherit';
		var computed = window.getComputedStyle(field);
		var height =
			parseInt(computed.getPropertyValue('border-top-width'), 10) +
			parseInt(computed.getPropertyValue('padding-top'), 10) +
			field.scrollHeight +
			parseInt(computed.getPropertyValue('padding-bottom'), 10) +
			parseInt(computed.getPropertyValue('border-bottom-width'), 10);
		field.style.height = height + 'px';
	}

}
