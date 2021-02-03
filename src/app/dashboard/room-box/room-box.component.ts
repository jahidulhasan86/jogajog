import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { RoomBoxService } from '../../shared/services/room-box/room-box.service';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalValue } from '../../global';
import { AccountService } from 'src/app/shared/services/account/account.service';
import { PublicRoomComponent } from './public-room/public.room.component';
import { MessagingService } from 'src/app/shared/services/messaging/messaging.service';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
@Component({
  selector: 'app-room-box',
  templateUrl: './room-box.component.html',
  styleUrls: ['./room-box.component.scss']
})
export class RoomBoxComponent implements OnInit {
  roomBoxLists = [];
  publicRoomBoxLists = [];
  currentUser: any; 
  globalValue: any;
  bnEnLanguageCheck: any;
  tagPublicRoomBoxLists: any;

  //this is for committing
  myPublicRoomBoxLists: any;
  imgSrc = '../../../../assets/images/add icon default.png';
  imgSrcPic = '../../../../assets/images/Default Profile.png';

  notificationCount: number;
  unread: [];
  notification_count_group: any;
	
  isMatBadgeHidden: boolean = true;
	
	
notifications:[];

  @Output() participantObj = new EventEmitter<object>();
  constructor(private router: Router, private roomBoxService: RoomBoxService, private spinner: NgxSpinnerService, private accountService: AccountService, 	public messagingService: MessagingService, private dialog: MatDialog) {
	this.currentUser = JSON.parse(localStorage.getItem('sessionUser'));
   }

  ngOnInit(): void {
	$('.copyWriteFooter').css('display', 'none');
	$('#dashboardSideBar').css('z-index', '0');
	this.spinner.show();
	this.roomBoxService._getAllConferenceByUserId ('2','group').subscribe(result => {
		this.spinner.hide();
		$('#dashboardSideBar').css('z-index', '1000');
		$('.copyWriteFooter').slideDown();
			if (result.status === 'ok') {
				if (result.resultset) {
					if (result.resultset.length > 0) {
			result.resultset.map(r => {
				if (r.conference_name.length > 21) {
				r.conf_partial_text = this.showPartialText(r.conference_name, 21, '..');
				} else {
				r.conf_partial_text = r.conference_name;
				}
			});
			this.roomBoxLists = result.resultset.filter(x => x.owner === this.currentUser.user_name);
			this.publicRoomBoxLists = result.resultset.filter(x => x.owner !== this.currentUser.user_name);
			// test only

			//let  size = result.resultset;
			//this.tagPublicRoomBoxLists = this.publicRoomBoxLists;
			//this.roomBoxLists l
			//this.myPublicRoomBoxLists = this.publicRoomBoxLists;
			
			//this.publicRoomBoxLists = result.resultset.filter(x => x.owner == this.currentUser.user_name && x.tags === 'public');
						} else {
							this.spinner.hide();
			/* 	Swal.fire({
				// : 'info',
				title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'কোন রুম পাওয়া যায়নি' : 'No Room Found!',
				timer: 3000,
				showConfirmButton: false
				}); */
			}
				}
			} else {
				this.spinner.hide();
		Swal.fire({
			icon: 'error',
			title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'কিছু ভুল হয়েছে!' : 'Something Went Wrong!',
			timer: 3000,
			showConfirmButton: false
		});
		}
	},
		(err) => {
			this.spinner.hide();
				Swal.fire({
					icon: 'error',
					title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'কিছু ভুল হয়েছে!' : 'Something Went Wrong!',
					timer: 3000
				});
		});

		this.getMyPublicRooms();

		this.roomBoxService.myPublicConferenceListCast.subscribe(result=>{
			
			if (result) {
		
					if (result.length > 0) {
			result.map(r => {
				if (r.conference_name.length > 21) {
				r.conf_partial_text = this.showPartialText(r.conference_name, 21, '..');
				} else {
				r.conf_partial_text = r.conference_name;
				}
			});
			this.myPublicRoomBoxLists = result;
				
		}
	}
		});
		//this.getPublicRooms();
	/* 	this.messagingService.currentMessageCast.subscribe((result) => {
			if (!!result) this.pushNotification(result)
		}) */
		this.globalValue = GlobalValue;
		this.accountService.getLanguage().subscribe((result) => {
			this.bnEnLanguageCheck = result;
		});

		
		
		/* this.roomBoxService.notificationCast.subscribe((result) => {
			if (!!result) {
			  this.notifications = result;
			  this.notificationBadgeHandler(result)
			}
		  }); */

		
  }

  /* pushNotification(result) {
	let payload = result.data.payload ? JSON.parse(result.data.payload) : null
	 if (result.data.type == 'public_room_accept_request' || result.data.type == 'public_room_reject_request'){
		this.roomPushNotificationHandler(payload, result.data.type);
	} else if(result.data.type == 'public_room_join_request'){
		this.getRoomNotifications();
	} 
} */

/* roomPushNotificationHandler(payload,  type){
	if(type === 'public_room_accept_request'){
		Swal.fire({
			icon: 'success',
			text:  payload.user_name  +' has accepted your request to join room  '+payload.conference_name,
			timer: 2000
		  });
		
	}else if(type == 'public_room_reject_request'){
		
		Swal.fire({
			title: 'Company Invitation',
			text: `${payload.inviter_user_name}  declined your request to join  ${payload.company_name}. Do you accept it?`,
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#F4AD20',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Resend',
			cancelButtonText: 'No, Thanks'
		}).then((result) => {
			if (result.value) {
				this.resend(payload);
				// Swal.fire({
				// 	// title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'রেজিস্ট্রেশন সফল হয়েছে' : 'Registered successfully',
				// 	// text: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'ইমেইল পাঠানো হয়েছে | আপনার পরিচয় যাচাই করার করার জন্য ইমেইল এ পাঠানো লিঙ্ক এ ক্লিক করুন' : 'Email has been sent. Please click to verify your account ',
				// 	// icon: 'success',
				// 	title: 'Accepted',
				// 	icon: 'success',
	
			}
	});
}
} */


/*   private notificationBadgeHandler(result) {
	if (result.length > 0) this.isMatBadgeHidden = false
	else this.isMatBadgeHidden = true
} */


 /*  menuOpened() {
	this.isMatBadgeHidden = true;
} */



/* roomNotificationHandler(payload) {
	if (payload.action == 'public_room_join_request') {
		//this.getNotifications();
		Swal.fire({
			// : 'info',
			title: payload.user_name + 'has' + payload.action+ 'ed your request',
			timer: 3000,
			showConfirmButton: false
			});
	}
} */

  goToRoomDeteils(pObj) {
	 if(pObj.request_status == 'pending' ) {
		Swal.fire({
			// : 'info',
			title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'মডারেটরের অনুমোদনের অপেক্ষায়' : 'Waiting for moderators approval',
			timer: 3000,
			showConfirmButton: false
			});
		//return;
	 } else if(pObj.request_status == 'rejected' ) {
		
		return;
	 }
	 else{
		this.router.navigate(['dashboard/room-box/details/' + pObj.id]);

	 }
  }

  getRoomNotifications() {
	this.roomBoxService._getAllRequestedConferences().subscribe((result) => {
		if (result.status == 'ok') {
			console.log(result)
		}
	}, err => {
		console.log(err)
	})
}


  getPublicRooms(){
	this.spinner.show();

	this.roomBoxService._getAllPublicConferences ().subscribe(result => {
		this.spinner.hide();
		//$('#dashboardSideBar').css('z-index', '1000');
		//$('.copyWriteFooter').slideDown();
			if (result.status === 'ok') {
				if (result.resultset) {
					if (result.resultset.length > 0) {
			result.resultset.map(r => {
				if (r.conference_name.length > 21) {
				r.conf_partial_text = this.showPartialText(r.conference_name, 21, '..');
} else {
				r.conf_partial_text = r.conference_name;
				}
			});
			this.tagPublicRoomBoxLists = result.resultset;

			} 
				}
			} else {
		Swal.fire({
			icon: 'error',
			title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'পাবলিক রুম আনতে পারেনি' : 'could not fetch public rooms',
			timer: 3000,
			showConfirmButton: false
		});
		}
	},
		(err) => {
			this.spinner.hide();
				Swal.fire({
					icon: 'error',
					title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'পাবলিক রুম আনতে পারেনি' : 'could not fetch public rooms',
					timer: 3000
				});
		});
  }

  resend(room){ 
	  let ids = [room.id];
	this.roomBoxService._assignUsersToPublicConference(ids).subscribe(result=>{
		if(result){
			this.getMyPublicRooms();
			this.getPublicRooms();
		}
	});
  }
  getMyPublicRooms(){
	this.spinner.show();
	this.roomBoxService._getAllConferenceByUserId ('2','public').subscribe(result => {
		this.spinner.hide();
		$('#dashboardSideBar').css('z-index', '1000');
		$('.copyWriteFooter').slideDown();
		/* 	if (result.status === 'ok') {
				if (result.resultset) {
					if (result.resultset.length > 0) {
			result.resultset.map(r => {
				if (r.conference_name.length > 21) {
				r.conf_partial_text = this.showPartialText(r.conference_name, 21, '..');
				} else {
				r.conf_partial_text = r.conference_name;
				}
			});
			this.myPublicRoomBoxLists = result.resultset;
		 */	//this.publicRoomBoxLists = result.resultset.filter(x => x.owner == this.currentUser.user_name && x.tags === 'public');
					//	} 
			//	}
			}, //else {
				//this.spinner.hide();
	/* 	Swal.fire({
			icon: 'error',
			title: ' my public rooms fetch error',
			timer: 3000,
			showConfirmButton: false
		}); */
		//}
	//},
		(err) => {
			this.spinner.hide();
				Swal.fire({
					icon: 'error',
					title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'কিছু ভুল হয়েছে!' : 'Something Went Wrong!',
					timer: 3000
				});
		});


  }

  openDialogPublicRooms() {
	  this.spinner.show();
	  this.roomBoxService._getAllPublicConferences ().subscribe(result => {
		this.spinner.hide();
		//$('#dashboardSideBar').css('z-index', '1000');
		//$('.copyWriteFooter').slideDown();
			if (result.status === 'ok') {
				if (result.resultset) {
					if (result.resultset.length > 0) {
			result.resultset.map(r => {
				if (r.conference_name.length > 21) {
				r.conf_partial_text = this.showPartialText(r.conference_name, 21, '..');
} else {
				r.conf_partial_text = r.conference_name;
				}
			});
			this.tagPublicRoomBoxLists = result.resultset;
			this.openAddPublicRoomPopup();

			} 
				}
			} else {
		Swal.fire({
			icon: 'error',
			title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'পাবলিক রুম আনতে পারেনি' : 'could not fetch public rooms',
			timer: 3000,
			showConfirmButton: false
		});
		}
	},
		(err) => {
			this.spinner.hide();
				Swal.fire({
					icon: 'error',
					title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'পাবলিক রুম আনতে পারেনি' : 'could not fetch public rooms',
					timer: 3000
				});
		});
} 
	

openAddPublicRoomPopup(){

	const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    let dialogRef = this.dialog.open(PublicRoomComponent,{
      width: '640px',disableClose: true, autoFocus: false,
      height: 'auto', data: {
		dataKey: this.tagPublicRoomBoxLists
	  }} );
    
	  dialogRef.afterClosed().subscribe(y=>{
		if(y){
			let ids = [];
			y.forEach(element => {
				ids.push(element.id);
				
			});
			this.roomBoxService._assignUsersToPublicConference(ids).subscribe(result=>{
				if(result){
					//this.getMyPublicRooms();
					//this.getPublicRooms();

					y.forEach(element => {
						element.request_status='pending';
						this.myPublicRoomBoxLists.push(element);
						
					});					
				}
			});
		}

	  }); 

}		
	  

    
     
    
  

  onMouseOut() {
    this.imgSrc = '../../../../assets/images/add icon default.png';
  }
  onMouseOver() {
    this.imgSrc = '../../../../assets/images/add_icon_selected.png';
  }




  

  showPartialText(str, length, ending) {
	if (length === null) {
		length = 21;
	}
	if (ending === null) {
		ending = '..';
	}
	if (str.length > length) {
		return str.substring(0, length - ending.length) + ending;
	} else {
		return str;
	}
}

	deleteRoom(room) {
		console.log('room', room)
	  if(room.tags == "group"){
		Swal.fire({
			title:  (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? `আপনি কি রুম ${room.conference_name} মুছতে চান?` : `Do you want to delete the room ${room.conference_name} ?`,
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: "#F4AD20",
			cancelButtonColor: "#d33",
			confirmButtonText: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'হ্যাঁ' : 'Yes',
			cancelButtonText: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'না' : 'No, Thanks'
			
		  }).then(result => {
			  if(result.value){
				this.roomBoxService._deleteConference(room.id).subscribe((result) => {
				   if(result){
					this.roomBoxLists.forEach((element ,index)=> {
					  if(element.id == room.id){
						this.roomBoxLists.splice(index, 1);
					  }
					});
				   
					Swal.fire({
					  icon: 'success',
					  title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'সফলভাবে রুম-কে সরিয়ে দেয়া হয়েছে' : 'Room deleted successfully',
					  timer: 2000
					})
				   } else {
					Swal.fire({
					  icon: 'warning',
					  title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'কিছু ভুল হয়েছে!' : 'Something Went Wrong!',
					  timer: 2000
					})
				   }
				 });
			  } //
		  });
	  }
	  else {
		Swal.fire({
			title:  (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? `আপনি কি রুম ${room.conference_name} মুছতে চান?` : `Do you want to delete the room ${room.conference_name} ?`,
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: "#F4AD20",
			cancelButtonColor: "#d33",
			confirmButtonText: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'হ্যাঁ' : 'Yes',
			cancelButtonText: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'না' : 'No, Thanks'
			
		  }).then(result => {
			  if(result.value){
				this.roomBoxService._deleteConference(room.id).subscribe((result) => {
				   if(result){
					this.myPublicRoomBoxLists.forEach((element ,index)=> {
					  if(element.id == room.id){
						this.myPublicRoomBoxLists.splice(index, 1);
					  }
					});
				   
					Swal.fire({
					  icon: 'success',
					  title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'সফলভাবে রুম-কে সরিয়ে দেয়া হয়েছে' : 'Room deleted successfully',
					  timer: 2000
					})
				   } else {
					Swal.fire({
					  icon: 'warning',
					  title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'কিছু ভুল হয়েছে!' : 'Something Went Wrong!',
					  timer: 2000
					})
				   }
				 });
			  } //
		  });
	  }

	}


}
