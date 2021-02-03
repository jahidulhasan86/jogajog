import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { GlobalValue } from 'src/app/global';

@Component({
	selector: 'app-home-contant',
	templateUrl: './home-contant.component.html',
	styleUrls: []
})
export class HomeContantComponent implements OnInit {
	public contactModel = {
		company_name: '',
		email: ''
	}
	globalValue: any
	serviceOptions = {
		items: 3,
		loop: false,
		autoplay: false,
		lazyLoad: true,
		merge: true,
		dots: true,
		margin: 50,
		responsive: {
			0: {
				items: 1
			},
			600: {
				items: 3
			},
			1000: {
				items: 4
			}
		}
	};

	ngOnInit(): void {
		// const osIn 	= require('os-utils');
		// osIn.cpuUsage(function(v) {
		// 	// tslint:disable-next-line:no-console
		// 	console.log( 'CPU Usage (%): ' + v );
		// });
		// si.cpu()
		// // tslint:disable-next-line:no-console
		// .then(data => console.log(data))
		// // tslint:disable-next-line:no-console
		// .catch(error => console.error(error));

	this.globalValue = GlobalValue
	}

	infoSubmit(type) {
		if (type == 'reg') {
			Swal.fire({
				html: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? '<span>ফর্ম জমা হয়নি | দয়া করে আমাদেরকে সরাসরি ইমেইল করুন এই ঠিকানায় <a href="#">info@jagajag.com</a></span>' : '<span>There was an error submitting the form. Please email us directly at <a href="#">info@jagajag.com</a></span>',
				showConfirmButton: false
			})
		} else {
			Swal.fire({
				title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'শীঘ্রই আসবে|আপনি যদি প্রাইভেট ডেমোর ব্যাপারে আগ্রহী হোন তাহলে আমাদের সাথে যোগাযোগ করুন|' : 'Coming Soon. If you are interested in a private demo, please contact us',
				showConfirmButton: false
			})
		}
	}

	sendMessage() {
		if (!this.contactModel.company_name) {
			Swal.fire({
				icon: 'warning',
				text:
					!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
						? 'অনুগ্রহপূর্বক কোম্পানির নাম দিন'
						: 'Please enter company name first!'
			});
			return;
		}
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
	
		  const send_sms_url = 'https://hub.sensor.buzz/mailer/api/v1/email/send';
		  // const receiver_email =  'alerthotel@protect2gether.com';
		//    const receiver_email = 'tech@jagajag.com';
		     const receiver_email = 'sales@jagajag.com';	  
		//    const receiver_email =  'ashraful.ru37@gmail.com';
		  const mail_subject = this.globalValue.currentBuild === 'en' ? 'Jagajag - Registering Business for our Enterprise Offering' : 'Jogajog - Registering Business for our Enterprise Offering';
		  const app_name = this.globalValue.currentBuild === 'en'  ? 'Jagajag' : 'Jogajog';
		  const htmlBody =
		  '<div style="border: 2px solid green;border-radius: 10px; padding: 1%;">'
		  + '<p style="font-size: 1.7vw; font-weight: bold;text-decoration: underline;">' + 'Following Company wants to Register Business for our Enterprise Offering</p>'
		  + '<p style="font-size: 1.4vw;"><b style="margin-right:2%">Company Name:</b>' + this.contactModel.company_name + ' </p>'
		  + '<p style="font-size: 1.4vw;"><b style="margin-right:2%">Email Address:</b>' + this.contactModel.email + ' </p>'
		  + '</div>';
		//   const htmlBody2 =
		//   '<div style="border: 2px solid green;border-radius: 10px; padding: 1%;">'
		//   + '<p style="font-size: 1.7vw; font-weight: bold;text-decoration: underline;">' + 'নিচের কোম্পানি আমাদের এন্টারপ্রাইজ অফারে নিবন্ধন করতে চাচ্ছে</p>'
		//   + '<p style="font-size: 1.4vw;"><b style="margin-right:2%">কোম্পানির নাম :</b>' + this.contactModel.company_name + ' </p>'
		//   + '<p style="font-size: 1.4vw;"><b style="margin-right:2%">ইমেইল ঠিকানা :</b>' + this.contactModel.email + ' </p>'
		//   + '</div>';
	
		  const body = {
			email : receiver_email,
			subject : mail_subject,
			appName : app_name,
			body : htmlBody
		  };
		  $.post(send_sms_url, body , function (data, status) {
			console.log('License Sent success:', status)
			
		  });
		  Swal.fire({
			title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'সাবমিট সফল হয়েছে' : 'Submitted successfully',
			icon: 'success',
		});
		
		  this.contactModel = {
			company_name : null,
	        email : null,
	    };
		//   setTimeout(() => {
		// 	this.confirmationShow = false;
		//   }, 5000);
	
		// const receiver_email =  'tonmoyrudra1@gmail.com';
		// const mail_subject = 'AlertHotel - Contact Us';
		// const app_name = 'Alert Hotel';
		// const body = 'Test';
		// this.globalServices._sendEmail(receiver_email, mail_subject, app_name, body)
		//   .subscribe(result =>{
		//     console.log('success', result);
		//   }, err => {
		//     console.log('error', err);
		//   });
	
		
	  }
}
