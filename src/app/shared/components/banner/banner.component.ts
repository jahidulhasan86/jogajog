import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService } from '../../services/account/account.service';
import { MatDialog } from '@angular/material/dialog';
//import { LoginComponent } from 'src/app/login/login.component';
import { LoginHeaderComponent } from 'src/app/login-header/login-header.component';

import { HostMeetingComponent } from 'src/app/host-meeting/host-meeting.component';
import { LearnTogetherComponent } from 'src/app/learn-together/learn-together.component';
import { GlobalValue } from 'src/app/global';
import Swal from 'sweetalert2';
import * as CryptoJS from 'crypto-js';
import { RoomBoxService } from '../../services/room-box/room-box.service';
// import { } from '../../../../assets/img/lt-logo-v2.png'


import * as data from 'home/system.json';

@Component({
	selector: 'app-banner',
	templateUrl: './banner.component.html',
	styleUrls: []
})
export class BannerComponent implements OnInit {
	globalValue: any;
	SlideOptions = {
		items: 3,
		loop: true,
		autoplay: false,
		lazyLoad: true,
		merge: true,
		dots: false,
		video: true,
		responsive: {
			0: {
				items: 1
			},
			600: {
				items: 2
			}
		}
	};
	isUserLoggedIn: boolean;

	popularRoomData: any = (data as any).default;
	roomData:any;
	discussionData:any;

	dataObj = {
		learnTogether: {
			logo: 'assets/img/lt-logo-v2.png',
			heading_bn: 'লার্ন টুগেদার',
			heading_en: 'Learn Together',
			heading_text_bn: 'একটি অনলাইন শিক্ষার প্ল্যাটফরম যেখানে শিক্ষক ভিডিও - নির্ভর লেকচার দিতে পারে|',
			heading_text_en: 'Online learning platform where teachers can deliver live video-based lectures.',
			text_bn: 'শিক্ষাপ্রতিষ্ঠানের জন্য, দূরবর্তী ই-লার্নিং এবং অনলাইন পরীক্ষার জন্য এক-মাত্র সমাধান',
			text_en: 'For Educational Institutions, one-stop solution for remote e-learning and online testing',
			video: '',
			image: '../../assets/images/learnscreenshoot.PNG',
			playstore_link: '',
			web_link: 'learnTogether'
		},
		teamTogether: {
			logo: 'assets/images/ProtectTogether.png',
			heading_bn: 'টিম টুগেদার',
			heading_en: 'Team Together',
			heading_text_bn: 'টিমের সদস্যদের মনিটর এবং যোগাযোগ করুন|',
			heading_text_en: 'Collaborate, monitor and interact with your team',
			text_bn: 'টিম এর সহযোগিতা, নিরাপত্তা আর দক্ষতা বাড়ান পুশ টু টক,সতর্কবার্তা এবং অবস্থান নির্দেশনার মাধ্যমে|',
			text_en: 'Work together with your team by tracking, altering and group communications with Push-to-Talk  ',
			video: '',
			image: '../../assets/images/teamscreenshoot.PNG',
			playstore_link: '',
			web_link: 'teamTogether'
		},
		medi_sheba: {
			logo: '',
			heading_bn: '',
			heading_en: 'Medi-Connect',
			heading_text_bn: '',
			heading_text_en: '',
			text_en: '',
			text_bn: '',
			video: '',
			image: '',
			playstore_link: '',
			web_link: ''
		},
		alert_family: {
			logo: '',
			heading_bn: '',
			heading_en: 'Alert Family',
			heading_text_bn: '',
			heading_text_en: '',
			text_en: '',
			text_bn: '',
			video: '',
			image: '',
			playstore_link: '',
			web_link: ''
		}
	};
	bnEnLanguageCheck: any;
	authUser: any;
	keys = '$Ue0ugMTAAARrNokdEEiaz';
	encryptPtedPass: any;
	publicRoomBoxs: any;

	constructor(private _ngZone: NgZone, private router: Router, private accountService: AccountService, private dialog: MatDialog,
		 private roomBoxService: RoomBoxService) {
		this.globalValue = GlobalValue;
		console.log(data);
		//this.popularRoomData = data;
		
	
	}

	ngOnInit(): void {
		//this.getAllPopularPublicConferences()
		this.accountService.userLoginChecker().subscribe((result) => {
			this.isUserLoggedIn = result;
		});
		//this.bnEnLanguageCheck = (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn')
		this.accountService.getLanguage().subscribe((result) => {
			this.bnEnLanguageCheck = result;
		});
		this.authUser = JSON.parse(localStorage.getItem('sessionUser'));
		if(this.isUserLoggedIn){
			this.encryptPtedPass = this.encryptPass(this.authUser.password)
		}	
		this.setRoomAndDisucssionData();	
	
	}

	//The set method is use for encrypt the value.
	encryptPass(value){
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
	//The get method is use for decrypt the value.
	//   get(value){
	// 	var key = CryptoJS.enc.Utf8.parse(this.keys);
	// 	var iv = CryptoJS.enc.Utf8.parse(this.keys);
	// 	var decrypted = CryptoJS.DES.decrypt(value, key, {
	// 		keySize: 128 / 8,
	// 		iv: iv,
	// 		mode: CryptoJS.mode.CBC,
	// 		padding: CryptoJS.pad.Pkcs7
	// 	});
	// return decrypted.toString(CryptoJS.enc.Utf8);
	// }
	
	public goToVideoCall() {
		this.accountService.isRequiredRegistration = '0';

		this._ngZone.run(() => {
			this.router.navigate(['/meeting']);
		});
		// this.router.navigate(['/meeting']);
		// window.location.href = window.location.origin + '#' + '/meeting';
		// window.location.reload();
	}

	hostMeeting() {
		if (this.isUserLoggedIn) {
			this.hostMeetingDialog();
		} else {
			const data = {
				type: 'string',
				data: 'host_a_meeting'
			};
			this.accountService.isRequiredRegistration = '1';
			this.loginDialog(data);
		}
	}

	goToRoom(){
		if (this.isUserLoggedIn) {
			this.router.navigate(['/dashboard/room-box']);
		} else {
			const data = {
				type: 'string',
				data: 'goto_room'
			};
			this.accountService.isRequiredRegistration = '1';
			this.loginDialog(data);
		}
	}

	loginDialog(data) {
		const lDialog = this.dialog.open(LoginHeaderComponent, {
			disableClose: true,
			panelClass: 'loginDialog',
			data: {
				destinationRoute: data
			}
		});
	}

	hostMeetingDialog() {
		const lDialog = this.dialog.open(HostMeetingComponent, {
			disableClose: true,
			panelClass: 'hostMeetingDialog'
		});
	}
	learnTogetherDialog(type) {
		if (type == 'learnTogether' || type == 'protectTogether') {
			this.dialog.open(LearnTogetherComponent, {
				disableClose: true,
				panelClass: 'learnTogetherDialog',
				data:
					this.globalValue.currentBuild == 'en' ||
					(this.globalValue.currentBuild == 'bn' && localStorage.getItem('selected_lang') == 'en')
						? type == 'learnTogether'
							? {
									content: {
										logo: this.dataObj.learnTogether.logo,
										heading: this.dataObj.learnTogether.heading_en,
										heading_text: this.dataObj.learnTogether.heading_text_en,
										text: this.dataObj.learnTogether.text_en,
										playstore: this.dataObj.learnTogether.playstore_link,
										web: this.dataObj.learnTogether.web_link,
										image: this.dataObj.learnTogether.image
									}
							  }
							: type == 'protectTogether'
							? {
									content: {
										logo: this.dataObj.teamTogether.logo,
										heading: this.dataObj.teamTogether.heading_en,
										heading_text: this.dataObj.teamTogether.heading_text_en,
										text: this.dataObj.teamTogether.text_en,
										playstore: this.dataObj.teamTogether.playstore_link,
										web: this.dataObj.teamTogether.web_link,
										image: this.dataObj.teamTogether.image
									}
							  }
							: type == 'mediSheba'
							? {
									content: {
										logo: this.dataObj.medi_sheba.logo,
										heading: this.dataObj.medi_sheba.heading_en,
										heading_text: this.dataObj.medi_sheba.heading_text_en,
										text: this.dataObj.medi_sheba.text_en,
										playstore: this.dataObj.medi_sheba.playstore_link,
										web: this.dataObj.medi_sheba.web_link,
										image: this.dataObj.medi_sheba.image
									}
							  }
							: type == 'alertFamily'
							? {
									content: {
										logo: this.dataObj.alert_family.logo,
										heading: this.dataObj.alert_family.heading_en,
										heading_text: this.dataObj.alert_family.heading_text_en,
										text: this.dataObj.alert_family.text_en,
										playstore: this.dataObj.alert_family.playstore_link,
										web: this.dataObj.alert_family.web_link,
										image: this.dataObj.alert_family.image
									}
							  }
							: {}
						: type == 'learnTogether'
						? {
								content: {
									logo: this.dataObj.learnTogether.logo,
									heading: this.dataObj.learnTogether.heading_bn,
									heading_text: this.dataObj.learnTogether.heading_text_bn,
									text: this.dataObj.learnTogether.text_bn,
									playstore: this.dataObj.learnTogether.playstore_link,
									web: this.dataObj.learnTogether.web_link,
									image: this.dataObj.learnTogether.image
								}
						  }
						: type == 'protectTogether'
						? {
								content: {
									logo: this.dataObj.teamTogether.logo,
									heading: this.dataObj.teamTogether.heading_bn,
									heading_text: this.dataObj.teamTogether.heading_text_bn,
									text: this.dataObj.teamTogether.text_bn,
									playstore: this.dataObj.teamTogether.playstore_link,
									web: this.dataObj.teamTogether.web_link,
									image: this.dataObj.teamTogether.image
								}
						  }
						: type == 'mediSheba'
						? {
								content: 'protectTogether'
						  }
						: type == 'alertFamily'
						? {
								content: 'protectTogether'
						  }
						: {}
			});
		} else {
			Swal.fire({
				title:
					!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn'
						? 'শীঘ্রই আসবে| আপনি যদি প্রাইভেট ডেমোর ব্যাপারে আগ্রহী হোন তাহলে আমাদের সাথে যোগাযোগ করুন|'
						: 'Coming Soon. If you are interested in a private demo, please contact us.',
				showConfirmButton: false
			});
		}
	}

	goToVirtualClassRoom(){
	
		if (this.isUserLoggedIn) {
			// console.log('userInfo',this.authUser)
			// console.log(this.authUser.user_name,this.authUser.password)
			window.open('https://www.school.jogajog.com.bd/Signin?access_token=' + this.authUser.access_token + '&type=cross_launch' + '&p=' + this.encryptPtedPass,'_blank')
		} else {
			const data = {
				type: 'string',
				data: 'goto_vitual_class_room'
			};
			this.accountService.isRequiredRegistration = '1';
			this.loginDialog(data);
		}
	}

	getAllPopularPublicConferences(){
		/* this.roomBoxService._getAllPublicConferences().subscribe(result =>{
			if(result.status == 'ok'){
				// console.log('All publicRoom',result.resultset)
				this.publicRoomBoxs = result.resultset
			}
		},	
			err=>{
			console.log(err)
		}) */

		/* this.fileService.getPopularRooms().subscribe(result =>{
			console.log(result);
			if(result && result.length>0){
				// console.log('All publicRoom',result.resultset)
				this.publicRoomBoxs = result;
			}
		},	
			err=>{
			console.log(err)
		}) */

		//this.fileService.getData();
	}


	joinPublicRoom(room){
		console.log(room)
		if(!!room.settings){
			if(room.settings.isAdmissionCheck === "true"){
				let ids = []
				ids.push(room.id)
				this.roomBoxService._assignUsersToPublicConference(ids).subscribe(result=>{
					if(result){
						Swal.fire({
							icon: 'success',
							title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'সার্বজনীন রুমে যোগদানের অনুরোধ সফলভাবে পাঠানো হয়েছে' : 'Public room join request sent successfully',
							timer: 3000
						});	
						
						this.publicRoomBoxs.forEach((element ,index)=> {
							if(element.id == room.id){
							  this.publicRoomBoxs.splice(index, 1);
							}
						  });
					}
				},
				 (err) =>{
					Swal.fire({
						icon: 'error',
						title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'কিছু ভুল হয়েছে!' : 'Something Went Wrong!',
						timer: 3000
					});
				 }
				);
			}
			else{
				this.router.navigate(['dashboard/room-box/details/' + room.id]);
			}
		}

		else{
			console.log('isAdmissionCheck property does not exist')
		}
	
	}
	setRoomAndDisucssionData(){
	this.roomData=	this.popularRoomData.filter(x=>x.type==='room');
	this.discussionData = this.popularRoomData.filter(x=> x.type ==='discussion');
	}
	navigate(obj){
		if(obj.type ==='room'){
			this.router.navigate(['dashboard/room-box/details/' + obj.room_id]);
		}else if(obj.type == 'discussion'){
			this.router.navigate(['dashboard/room-box/details/',{id:obj.room_id, root_discussion_id:obj.root_discussion_id, message_body:obj.message_body,subject:obj.subject,creator:obj.creator, created:obj.created}])
		}

	}


}
