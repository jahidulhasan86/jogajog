import { Component, OnInit, Input, HostListener } from '@angular/core';
import { UserModel } from '../../models/user-model';
import { GlobalValue } from '../../../global';
import { Router, ActivatedRoute } from '@angular/router';
import * as $ from 'jquery';
import Swal from 'sweetalert2';
import { AccountService } from '../../services/account/account.service';
@Component({
	selector: 'app-footer',
	templateUrl: './footer.component.html',
	styleUrls: []
})
export class FooterComponent implements OnInit {
	@Input() lightTheme: boolean;

	participantsNames: string[] = [];
	fullyear: number;
	globalValue: any;
	currentLang: any;

	constructor(public router: Router, private accountService: AccountService) { }

	@HostListener('window:resize', ['$event'])
	sizeChange(event) { }

	ngOnInit() {
		this.fullyear = new Date().getFullYear();
		this.globalValue = GlobalValue;
		this.accountService.getLanguage().subscribe((result) => {
			this.currentLang = result
		})
	}

	@Input()
	set participants(participants: UserModel[]) {
		this.participantsNames = [];
		participants.forEach((user) => {
			if (user.isCamera()) {
				this.participantsNames.push(user.getNickname());
			}
		});
		this.participantsNames = [...this.participantsNames];
	}

	whoWeAre() {
		setTimeout(() => {
			let contactUsElem: any;
			contactUsElem = document.getElementById('WhoWeAreLink');
			let whoWeAreElem: any;
			whoWeAreElem = document.getElementById('WhoWeAre');
			if (whoWeAreElem.classList[1] !== 'show') {
				contactUsElem.click();
			}
			this.scrollTop('scrollHere');
		}, 50);
		// this.router.navigate(['/aboutus'], { fragment: 'WhoWeAre' });
	}
	developmentServices() {
		setTimeout(() => {
			let contactUsElem: any;
			contactUsElem = document.getElementById('DevelopmentServicesLink');
			contactUsElem.click();
			this.scrollTop('scrollHere');
		}, 100);
		// this.router.navigate(['/aboutus'], { fragment: 'DevelopmentServices' });
	}

	contactUs() {
		setTimeout(() => {
			let contactUsElem: any;
			contactUsElem = document.getElementById('ContactUsLink');
			contactUsElem.click();
			this.scrollTop('scrollHere');
			// this.router.navigate(['/aboutus'], { fragment: 'ContactUsLink' });
		}, 100);
	}

	scrollTop(id) {
		let scrollHere: any;
		scrollHere = document.getElementById(id);
		let rect = scrollHere.getBoundingClientRect();
		window.scrollTo(rect.x, rect.y);
		// $("#scrollHere").animate({ scrollTop: 0 }, "fast");
		// let scrollHere: any;
		// scrollHere = document.getElementById('scrollHere');
		// // scrollHere.scrollTop = 0;
		// scrollHere.body.scrollTop = 0; // For Safari
		// scrollHere.documentElement.scrollTop = 0;
	}

	goSupportService(index) {
		setTimeout(() => {
			let contactUsElem: any;
			contactUsElem = document.getElementById(index == 1 ? 'communityFeedbackTab' : 'PrivacySecurityTab');
			if (index != 0) contactUsElem.click();

			if (index == 0) {
				var te = document.getElementById('supportCenterTab');
				let whoWeAreElem: any;
				whoWeAreElem = document.getElementById('SupportCenter');
				if (whoWeAreElem.classList[1] !== 'show') {
					te.click();
				}
			}

			this.scrollTop('support_scrollHere');
		}, 50);
	}

	// goToProduct(){
	// 	// index == 1 ? window.open("https://learn.protect2gether.com", "_blank") : index == 2 ? window.open("http://protect2gether.com", "_blank") : ''
	// 	//  index == 1 ? this.router.navigate(['/learnTogether']) : index == 2 ? this.router.navigate(['/teamTogether']) : '';

	// 	this.scrollTop('scroll_top');


	// }

	goToProduct(type) {

		setTimeout(() => {
			if (type == 'learnTogether') {
				this.scrollTop('scrolltop_learnTogether');
			}
			if (type == 'teamTogether') {
				this.scrollTop('scrolltop_teamTogether');
			}
		}, 100);
	}

	iosUpcoming() {
		Swal.fire({
			title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'শীঘ্রই আসবে|' : 'Coming Soon.',
			showConfirmButton: false
		})
	}

	infoSubmit() {
		Swal.fire({
			title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'শীঘ্রই আসবে|আপনি যদি প্রাইভেট ডেমোর ব্যাপারে আগ্রহী হোন তাহলে আমাদের সাথে যোগাযোগ করুন|' : 'Coming Soon. If you are interested in a private demo, please contact us',
			showConfirmButton: false
		})
	}
}
