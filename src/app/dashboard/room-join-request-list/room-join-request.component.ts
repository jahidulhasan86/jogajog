import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { MultiCompanyService } from 'src/app/shared/services/multi-company/multi-company.service';
import Swal from 'sweetalert2';
import { RoomBoxService } from 'src/app/shared/services/room-box/room-box.service';

@Component({
  selector: 'room-join-request-list',
  templateUrl: './room-join-request.component.html',
  styleUrls: ['./room-join-request.component.scss']
})
export class RoomJoinRequestComponent implements OnInit {

  @Input() notificationsList: any
  notifications = [];
  isMatBadgeHidden: boolean = true;
  constructor(private roomBoxService: RoomBoxService) { }
  ngOnChanges(changes: SimpleChanges) {
    console.log('Changes....',changes)
    this.notifications = changes.notificationsList.currentValue
  
  console.log('mmmmm',this.notifications)
  }
  ngOnInit(): void {
  // console.log('nnnn',this.notifications)
  }

  private notificationBadgeHandler(result) {
    if (result.length > 0) this.isMatBadgeHidden = false
    else this.isMatBadgeHidden = true
  }
  acceptRequest(request) {
    request.id = request.room_id;
    request.user_id = request.requested_by;
    this.roomBoxService._replyRequest(request, 'accept').subscribe((result) => {
      if (result.status) {
        for (let i = 0; i < this.notifications.length; i++) {
          if (this.notifications[i].id === request.id) {
            this.notifications.splice(i, 1);

            break;
          }
          // console.log(result)

        }
        this.roomBoxService._getAllRequestedConferences().subscribe(result => {
          console.log(result);
        })
        this.errorSuccessMsgHandler(result, 'request accepted');
      }
    }, err => {
      console.log(err)
      this.errorSuccessMsgHandler(err, 'accept');
    })
  }
  rejectRequest(request) {
    request.id = request.room_id;
    request.user_id = request.requested_by;
    this.roomBoxService._replyRequest(request, 'reject').subscribe((result) => {
      console.log('rp',result)
      if (result.status) {
        for (let i = 0; i < this.notifications.length; i++) {
          if (this.notifications[i].id === request.id) {
            this.notifications.splice(i, 1);
            break;
          }

        }
        this.roomBoxService._getAllRequestedConferences().subscribe(result => {
          console.log(result);
        })
        this.errorSuccessMsgHandler(result, 'request rejected');

      }
    }, err => {
      console.log(err)
      this.errorSuccessMsgHandler(err, 'reject')
    })
  }
  errorSuccessMsgHandler(result, type) {
    if (result.status == 'ok') {
      Swal.fire({
        icon: 'success',
        text: type,
        timer: 2000
      });
    } else {
      Swal.fire({
        icon: 'warning',
        text: 'Failed to ' + type + ' request',
        timer: 2000
      });
    }
  }

  acceptRoomInvitation(roomInvitation) {
    console.log('RNotification',roomInvitation)
    this.roomBoxService.acceptRoomInvitation(roomInvitation).subscribe((result) => {
      if (result.status == 'ok') {
        console.log(result)
        this.addUsersToExistingConference(roomInvitation)

        for (let i = 0; i < this.notifications.length; i++) {
          if (this.notifications[i].id === roomInvitation.id) {
            this.notifications.splice(i, 1);
            break;
          }
        }
        
        this.errorSuccessMsgHandler(result, 'request accepted');
      }
    }, err => {
      console.log(err)
    })
  }

  addUsersToExistingConference(roomInvitation) {
    const authUser = JSON.parse(localStorage.getItem('sessionUser'));
    let userList = []
    let currentUserInfo = {
      user_id: authUser.id,
      user_name: authUser.user_name,
      email: authUser.email,
      // profile_pic: authUser.profile_pic ? authUser.profile_pic : '',
      // contact: authUser.contact ? authUser.contact : ''
    }
    userList.push(currentUserInfo)
    this.roomBoxService._addUsersToExistingConference(roomInvitation.data.conference_id, userList).subscribe((result) => {
      if (result) {
        console.log(result)
      }
    }, err => {
      console.log(err)
    })
  }
}
