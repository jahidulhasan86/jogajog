import { Component, OnInit, AfterViewInit } from '@angular/core';
import { GlobalValue } from 'src/app/global';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-support-service',
  templateUrl: './support-services.component.html',
  styleUrls: []
})
export class SupportServicesComponent implements OnInit, AfterViewInit {
	public contactModel = {
		email: '',
		subject: '',
		message: ''
	};
  globalValue: any;
  constructor() { }

  ngOnInit(): void {
    this.globalValue = GlobalValue;
  }

  ngAfterViewInit() {
  }
  

  contactUs() {
		setTimeout(() => {
			let contactUsElem: any;
			contactUsElem = document.getElementById('ContactUsLink');
			contactUsElem.click();
			this.scrollTop('pageId');
		}, 100);
	}

	scrollTop(id) {
		let scrollHere: any;
		scrollHere = document.getElementById(id);
		let rect = scrollHere.getBoundingClientRect();
		window.scrollTo(rect.x, rect.y);
	}

	sendMessage(type) {
		if(type == 'customer_support'){
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
				const mail_subject = this.globalValue.currentBuild === 'en' ? 'Jagajag - Customer Support' : 'Jogajog - Customer Support';
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
		else{
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
				const mail_subject = this.globalValue.currentBuild === 'en' ? 'Jagajag - Community Feedback' : 'Jogajog - Community Feedback';
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

}
