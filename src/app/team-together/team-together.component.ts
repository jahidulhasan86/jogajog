import { Component, OnInit, AfterViewInit } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
	selector: 'app-team-together',
	templateUrl: './team-together.component.html',
	styleUrls: ['./team-together.component.scss']
})
export class TeamTogetherComponent implements OnInit {

	constructor() { }

	ngOnInit(): void {
		this.searchToggle()
	}

	ngAfterViewInit() {
		setTimeout(() => {
			$('html,body').animate({
			  scrollTop: $(".header-area").offset().top
			}, 'fast');
		  }, 200);
	}

	searchToggle() {
		$(document).ready(function () {
			// toggle Search btn
			$('#search_area').hide();
			$('#btn-search').click(function () {
				$('#search_area').toggle('fast');
			});
		});
	}

	contactWithUs() {
		Swal.fire('To access Team Together with your jagajag account, please contact with us.')
	}

	contact_with() {
		Swal.fire('Coming Soon. If you are interested in a private demo, please contact with us.')
	}

}
