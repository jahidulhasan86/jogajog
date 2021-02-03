import { Component, OnInit } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent, MatChipList } from '@angular/material/chips';
import { MultiCompanyService } from '../../../shared/services/multi-company/multi-company.service';
import { RoomBoxService } from '../../../shared/services/room-box/room-box.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { AccountService } from 'src/app/shared/services/account/account.service';
import { GlobalValue } from '../../../global'
import { ContactService } from 'src/app/shared/services/contact/contact.service';
import { Router } from '@angular/router';
export interface userObj {
	name: string;
}

@Component({
	selector: 'app-create-room',
	templateUrl: './create-room.component.html',
	styleUrls: ['./create-room.component.scss']
})


export class CreateRoomComponent implements OnInit {
	disabled= true;
	visible = true;
	selectable = true;
	removable = true;
	addOnBlur = true;
	sessionUserName = '';
	roomBoxName = '';
	publicRoom = false;
	isRoomHidden = false;
	participantHidden = false;
	selected = false;
	auto_recording= false;
	readonly separatorKeysCodes: number[] = [ENTER, COMMA];
	userObj: userObj[] = [];
	participantModel: string[] = [];
	participantPreview: string[] = [];
	showPreview: boolean;
	participants = [];
	show: number;
	counter: number;
	bnEnLanguageCheck: any;
	globalValue: any
	isDefaultCompany: boolean;
	constructor(private spinner: NgxSpinnerService, private multiCompanyService: MultiCompanyService, private roomBoxService: RoomBoxService, private accountService: AccountService, private contactService: ContactService, private router: Router) {
		const sessionUser = JSON.parse(localStorage.getItem('sessionUser'));
		this.sessionUserName = sessionUser.user_name;
		this.showPreview = false;
	}

	ngOnInit(): void {
		const sessionUser = JSON.parse(localStorage.getItem('sessionUser'));
		this.counter = 0;
		this.toggleParticipants();
		$('#dashboardSideBar').css('z-index', '0');
		this.spinner.show();

		if (!this.multiCompanyService.defaultCompany()) {
			this.getCompanyEmployee()
			this.isDefaultCompany = false
		} else {
			this.getContacts()
			this.isDefaultCompany = true
		}

		this.show = 2;
		this.globalValue = GlobalValue;
		this.accountService.getLanguage().subscribe((result) => {
			this.bnEnLanguageCheck = result;
		});
	}

	toggleParticipants() {
		const self = this;
		$(document).ready(function () {
			$('#show_hide, .pemail').click(function () {
				$('#toggle_participants_list').toggle('fast', function () {
					if ($('#toggle_participants_list:visible').length === 0) {
						$('.btn-container').css('margin-top', '2%');
						// $('#hr-margin').css('margin-top', '-2%');
						self.participantModel.map(function (x, i) {
							if (i > 1) {
								$('#' + i).hide();
								self.showPreview = true;
								$('#count').show();
							}

						})
					} else {
						let pList = document.getElementById('toggle_participants_list');
						$('.btn-container').css('margin-top', pList.clientHeight +8+ 'px');
						// $('#hr-margin').css('margin-top', '1%');
						$('#count').hide();
						self.showPreview = false;
						self.participantModel.map(function (x, i) {
							if (i > 1) {
								$('#' + i).show();
							}
							$('#count').hide();
						})
					}
				})
			});
		});
	}

	OnChange(event, data, isHost) {
		if(!isHost){
			if (event) {
				if (this.participantModel) {
					var index = this.participantModel.indexOf(data.email);
					if (index === -1) {
						this.participantModel.push(data);
						this.participants.push(data);
						if (this.participantPreview.length !== 2) {
							this.participantPreview.push(data);
						}
					}
				}
				else {
					this.participantModel.push(data);
					this.participants.push(data);
				}
			}
			else {
				this.participants.splice(this.participants.findIndex(function (i) {
					return i === data.email;
				}), 1);
				this.participantModel.splice(this.participantModel.findIndex(function (i) {
					return i === data.email;
				}), 1);

				this.userObj.forEach((user: any) => {
					if(user.email === data.email){
						delete user.host
					}
				})
			}
	
			
		}else{
			this.participantModel.some((participant: any) => {
				if(participant.email === data.email){
					if(event) Object.assign(participant, {host: true})
					else delete participant.host
				}
			})
		}
	}

	add(event: MatChipInputEvent): void {
		const input = event.input;
		const value = event.value;

		// Add our fruit
		if ((value || '').trim()) {
			// this.userObj.push({ name: value.trim() });
		}

		// Reset the input value
		if (input) {
			input.value = '';
		}
	}

	remove(obj: any): void {
		const index = this.participantModel.indexOf(obj);
		const indexUserObj = this.userObj.indexOf(obj);
		if (index >= 0) {
			this.participantModel.splice(index, 1);
			obj.isChecked = false;
			this.userObj[indexUserObj] = obj;
		}

		this.userObj.forEach((user: any) => {
			if(user.email === obj.email){
				delete user.host
			}
		})
	}

	_addRoomIntoBox() {
		if ($('#toggle_participants_list:visible').length > 0 && this.participantModel.length > 0 && this.roomBoxName.trim() !== '') {
			$('.mat-chip-list-wrapper').click();
		}
		const roomBoxName = this.roomBoxName.trim();
		var tags = 'group';
		if (this.publicRoom) {
			tags = 'public'
		}
		let settings = { isRoomHidden: 'false', isParticipantsHidden: 'false', isAdmissionCheck: 'true' };
		if (this.participantHidden) {
			settings.isParticipantsHidden = 'true';
		}
		if (this.isRoomHidden) {
			settings.isRoomHidden = 'true';
		}
		//const tags = 'group';
		let participants = this.participantModel;
		const roomType = '2';
		// if (this.participantModel.length === 0) {
		// 	Swal.fire({
		// 	icon: 'info',
		// 	title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'প্রথমে একজন অংশগ্রহণকারী সিলেক্ট করুন': 'Select a Participant First!',
		// 	timer: 3000,
		// 	showConfirmButton: false
		// 	})
		// 	return;
		// }

		if (this.isDefaultCompany && this.participantModel.length > 0) {
			participants = []
		}		

		if (!this.roomBoxName) {
			Swal.fire({
				icon: 'info',
				title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'রুমের নাম খালি থাকতে পারবে না' : 'Room Name Can Not Be Empty!',
				timer: 3000,
				showConfirmButton: false
			})
			return;
		}
		$('#dashboardSideBar').css('z-index', '0');
		this.spinner.show();
		this.roomBoxService._addConference(roomBoxName, tags, participants, [], null, roomType, false, false, false, null, settings,this.auto_recording).subscribe(
			(result: any) => {
				this.spinner.hide();
				$('#dashboardSideBar').css('z-index', '1000');

				if (this.participantModel.length > 0) {
					const sessionUser = JSON.parse(localStorage.getItem("sessionUser"));
					this.participantModel.forEach((x: any) => {
						if (x.email === sessionUser.email) {
							this.participantModel = []
						}
					})
				}

				if (this.isDefaultCompany && this.participantModel.length > 0) {
					this.inviteRoomByContact(result.result, this.participantModel)
				}

				if (result) {
					this.roomBoxName = '';
					this.participantModel = [];
					Swal.fire({
						icon: 'success',
						title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'রুম তৈরি সফল হয়েছে' : 'Room Created Successfully',
						timer: 3000,
						showConfirmButton: false
					})
				} else {
					this.participantModel = [];
					Swal.fire({
						icon: 'error',
						title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'কিছু ভুল হয়েছে!' : 'Something Went Wrong!.',
						timer: 3000,
						showConfirmButton: false
					});
				}
			},
			(err) => {
				this.spinner.hide();
				Swal.fire({
					icon: 'error',
					title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'কিছু ভুল হয়েছে!' : 'Something Went Wrong!.',
					timer: 3000
				});
			});
	}

	resetField() {
		this.participantModel = [];
		this.roomBoxName = '';
		this.userObj.map((x: any) => {
			if (x.isChecked) {
				x.isChecked = false;
			}
		})
	}

	publicSelected(event) {
		var checked = event.checked;
		if (checked) {
			this.selected = true;
		} else {
			this.selected = false;
			this.publicRoom = false;
			this.participantHidden = false;
			this.isRoomHidden = false;
		}
	}
	getCompanyEmployee() {
		const currentUser = JSON.parse(localStorage.getItem('sessionUser'));
		this.multiCompanyService.getCompanyEmployee().subscribe(x => {
			this.spinner.hide();
			$('#dashboardSideBar').css('z-index', '1000');
			if (x.code === 200) {
				this.userObj = [];
				if (x.resultset) {
					if (x.resultset.length > 0) {
						x.resultset.map(user => {

							if (!user.profile_pic) {
								user.profile_pic = '';
							}
							if (!user.contact || user.contact === 'N/A') {
								user.contact = '';
							}
							user.isChecked = false;
							if (user.email !== currentUser.email) {
								this.userObj.push(user);
							}

						});
					}
				} else {
					Swal.fire({
						// icon: 'info',
						title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'সিলেক্টেড কোম্পানির জন্য কোন সদস্য পাওয়া যায়নি ' : 'No Member Found For Selected Company.',
						timer: 3000,
						showConfirmButton: false
					})
				}
			} else {
				Swal.fire({
					icon: 'error',
					title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'কিছু ভুল হয়েছে!' : 'Something Went Wrong!.',
					timer: 3000,
					showConfirmButton: false
				});
			}
		},
			(err) => {
				this.spinner.hide();
				Swal.fire({
					icon: 'error',
					title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'কিছু ভুল হয়েছে!' : 'Something Went Wrong!.',
					timer: 3000
				});
			});
	}

	getContacts() {
		const currentUser = JSON.parse(localStorage.getItem('sessionUser'));
		this.contactService.getContacts().subscribe((result) => {
			if (result) {
				this.spinner.hide();
				$('#dashboardSideBar').css('z-index', '1000');
				console.log(result)
				result.forEach(contact => {
					if (contact.email !== currentUser.email) {
						this.userObj.push(contact)
					}
				});
			}
		}, err => {
			this.spinner.hide();
			console.log(err)
		});
	}

	inviteRoomByContact(conferenceInfo, participantModel) {
		this.roomBoxService.inviteRoom(conferenceInfo, participantModel).subscribe((result) => {
			if (result.status == 'ok') {
				console.log(result)
				this.router.navigate(['/dashboard/room-box'])
			}
		}, err => {
			console.log(err)
		})
	}
}


