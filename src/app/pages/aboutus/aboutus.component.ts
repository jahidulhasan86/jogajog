import { Component, OnInit } from '@angular/core';
import { GlobalValue } from '../../global';
import { ActivatedRoute, Params } from '@angular/router';
import Swal from 'sweetalert2';
import { AccountService } from 'src/app/shared/services/account/account.service';

@Component({
	selector: 'app-about',
	templateUrl: './aboutus.component.html',
	styleUrls: []
})
export class AboutusComponent implements OnInit {
	globalValue: any;
	public contactModel = {
		email: '',
		subject: '',
		message: ''
		// attachedFile: ''

	};
	file2: any;
	bnEnLanguageCheck: any;
	constructor(public route: ActivatedRoute, private accountService: AccountService) {
		this.globalValue = GlobalValue;
	}

	ngOnInit(): void {
		this.accountService.getLanguage().subscribe((result)=>{
			this.bnEnLanguageCheck = result
	  })
	}

	// infoSubmit() {
	// 	Swal.fire({
	// 		html: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? '<span>ফর্ম জমা হয়নি|দয়া করে আমাদেরকে সরাসরি ইমেইল করুন এই ঠিকানায় <a href="#">info@jagajag.com</a></span>' : '<span>There was an error submitting the form. Please email us directly at <a href="#">info@jagajag.com</a></span>',
	// 		showConfirmButton: false
	// 	})
	// }

	// onFileChange(event) {
	// 	if (event) {
	// 		this.file2 = event.target.files[0];
	// 	}
	// 	else {
	// 		console.log('No file chossen')
	// 	}
	// 	console.log('chooseFile', this.file2)
	// }
	sendMessage(){
		if (!this.contactModel.email) {
			Swal.fire({
				icon: 'warning',
				text:
					!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
						? 'অনুগ্রহপূর্বক ইমেইল ঠিকানা দিন'
						: 'Please enter email first!'
			});
			return;
		} 
		if (!this.contactModel.message) {
			Swal.fire({
				icon: 'warning',
				text:
					!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
						? 'অনুগ্রহপূর্বক বার্তা দিন'
						: 'Please enter message  first!'
			});
			return;
		} 
			const send_sms_url = 'https://hub.sensor.buzz/mailer/api/v1/email/send';
			const receiver_email = 'tech@jagajag.com';
			// const receiver_email = 'ashraful.ru37@gmail.com';
			const mail_subject = this.globalValue.currentBuild === 'en' ? 'Jagajag - User Queries' : 'Jogajog - User Queries';
			const app_name = this.globalValue.currentBuild === 'en' ? 'Jagajag' : 'Jogajog';
			const htmlBody =
				'<div style="border: 2px solid green;border-radius: 10px; padding: 1%;">'
				+ '<p style="font-size: 1.7vw; font-weight: bold;text-decoration: underline;">' + mail_subject + ' </p>'
				+ '<p *ngIf="!this.contactModel.subject" style="font-size: 1.4vw;"><b style="margin-right:2%">Subject:</b>' + this.contactModel.subject + ' </p>'
				+ '<p style="font-size: 1.4vw;"><b style="margin-right:2%">Email Address:</b>' + this.contactModel.email + ' </p>'
				+ '<p *ngIf="!this.contactModel.message" style="font-size: 1.4vw;"><b style="margin-right:2%">Message:</b>' + this.contactModel.message + ' </p>'
				+ '</div>';

			const body = {
				email: receiver_email,
				subject: mail_subject,
				appName: app_name,
				body: htmlBody
			};
			$.post(send_sms_url, body, function (data, status) {
				console.log('License Sent success:', status)

			});
			Swal.fire({
				title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'সাবমিট সফল হয়েছে' : 'Submitted successfully',
				icon: 'success',
			});

			this.contactModel = {
				subject: null,
				email: null,
				message: null
			};
	}




}
