import { Injectable } from '@angular/core';
import { map, catchError, flatMap, mergeMap, toArray, tap, switchMap, concatMap } from 'rxjs/operators';
import { Observable, throwError, Subject, BehaviorSubject, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalValue } from '../../../global';
import { settings } from 'cluster';
import { trackByHourSegment } from 'angular-calendar/modules/common/util';

@Injectable({
  providedIn: 'root'
})
export class RoomBoxService {
  token: any;
  currentUser: any;
  private getConferencesByUserIdUrl = `${GlobalValue.video_hub_Service_Url}/conference/getAllRoomBoxByUserId`;
  private getAllConferencesUrl = `${GlobalValue.video_hub_Service_Url}/conference`;
  private getSingleConferenceUrl = `${GlobalValue.video_hub_Service_Url}/conference/getConferenceById`;
  private addConferenceUrl = `${GlobalValue.video_hub_Service_Url}/conference/addConference`;
  public addUsersToExistingConferenceUrl = `${GlobalValue.video_hub_Service_Url}/conference/addUsersToExistingConference`;
  public updateConferenceNameUrl = `${GlobalValue.video_hub_Service_Url}/conference/updateConferenceName`;
  private deleteUsersFromExistingConferenceUrl = `${GlobalValue.video_hub_Service_Url}/conference/deleteUsersFromConference`;
  private getAllPublicConferencesUrl = `${GlobalValue.video_hub_Service_Url}/conference/getAllPublicRoomBox?tags=public`;
  private assignUsersPublicConferencesUrl = `${GlobalValue.video_hub_Service_Url}/public_room/assignPublicRoomsToUser`;
  private replyConferencesJoinUrl = `${GlobalValue.video_hub_Service_Url}/public_room/replyRequest`;
  private deleteConferenceUrl = `${GlobalValue.video_hub_Service_Url}/conference/deleteConference`;
  private getRequestedConferencesJoinUrl = `${GlobalValue.video_hub_Service_Url}/public_room/getAllRequestedRoomBox`;
  private inviteRoomURL: string = `${GlobalValue.alert_circel_Service_Url}/companies/inviteRoom`;
  // private inviteRoomURL: string = 'http://localhost:4002/api/v1/companies/inviteRoom';
  public allConferenceList$ = new BehaviorSubject<any>([]);
  allConferenceListCast = this.allConferenceList$.asObservable();
  //private companyInfo = new BehaviorSubject<any>('')
  public muPublicConferenceList$ = new BehaviorSubject<any>([]);
  myPublicConferenceListCast = this.muPublicConferenceList$.asObservable();
  private notifications = new BehaviorSubject<any>([]);
  notificationCast = this.notifications.asObservable();
  private allNotifications = new BehaviorSubject<any>([]);
  allNotificationsCast = this.allNotifications.asObservable();
  public isRoomScheduleSelected$ = new BehaviorSubject<boolean>(false);
  isRoomScheduleSelectedObserver = this.isRoomScheduleSelected$.asObservable();
  acceptRoomInvitationURL: string = `${GlobalValue.alert_circel_Service_Url}/companies/invite/acceptRoomInvitation`;
  roomUsers$ = new BehaviorSubject<any>(null);
	roomUsersObserver = this.roomUsers$.asObservable();
  constructor(private http: HttpClient) {
    this.token = localStorage.getItem('token');
    this.currentUser = JSON.parse(localStorage.getItem('sessionUser'));
  }

  _addConference(conferenceName: any, tags: any, userList?: string[], deviceList?: string[], region?: any, conferenceType?: any, conferenceMode?: boolean, isAllowContributor?: boolean, isPinned?: boolean, geofenceList?, setting?: any,autoRecording?:any) {
    this.currentUser = JSON.parse(localStorage.getItem('sessionUser'));
    var currentUserInfo;
    console.log('<======== Add Conference Service Called========>')
    const tempList = userList;
    const pList = userList;
    pList.map((x: any) => {
      delete x.metadata;
      delete x.app_id;
      delete x.app_name;
      delete x.company_id;
      delete x.company_name;
      delete x.created;
      delete x.position;
      delete x.role;
      delete x.role_id;
      delete x.updated;
      delete x.contact;
      delete x.profile_pic;
      // delete x.email;
      delete x.isChecked;
    })
    currentUserInfo = {
      user_id: this.currentUser.id,
      user_name: this.currentUser.user_name,
      email: this.currentUser.email,
     // profile_pic: this.currentUser.profile_pic ? this.currentUser.profile_pic : '',
      // contact: this.currentUser.contact ? this.currentUser.contact : ''
    }
    pList.push(currentUserInfo);
    var name = conferenceName

    var req = {
      'conference_name': name,
      'users': pList,
      'devices': deviceList,
      'region': region,
      'conference_type': conferenceType,
      'is_pinned': isPinned,
      'is_allow_contributor': isAllowContributor,
      'geofences': geofenceList ? geofenceList : null,
      'tags': tags,
      'settings': setting,
      'auto_recording': autoRecording
    }


    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: JSON.parse(localStorage.getItem('token'))
      })
    };
    return this.http.post(this.addConferenceUrl + '?token=' + this.currentUser.access_token, req, httpOptions)
      .pipe(
        map((result: Response) => {
          req.users = [];
          return result;
        }),
        map(x => {
          console.log(' from Add Conference function', x);
          return x;
        }),
        catchError((error: Response) => {
          return throwError(error);
        })
      )
  }

  _getAllConferenceByUserId(conferenceType?, tags?) {
    const group_tag_setting = GlobalValue.group_tag_settings.toString();
    if (!conferenceType) {
      conferenceType = ''
    }
    if (!tags) {
      tags = 'group';
    }

    this.currentUser = JSON.parse(localStorage.getItem('sessionUser'));
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: JSON.parse(localStorage.getItem('token'))
      })
    };
    //const profile_pic = this.currentUser.profile_pic ? this.currentUser.profile_pic : '';
    //const contact = this.currentUser.contact ? this.currentUser.contact : '';
    return this.http.get(this.getConferencesByUserIdUrl + '?user_id=' + this.currentUser.id + '&user_name=' + this.currentUser.user_name + '&email=' + this.currentUser.email  + '&conference_type=' + conferenceType + '&tags=' + tags + '&token=' + this.currentUser.access_token, httpOptions)
      .pipe(
        map((x: any) => {
          return x;
        }),
        map(x => {
          var resultList = [];
          if (x.resultset && tags && tags == 'public') {
            this.muPublicConferenceList$.next(x.resultset);
          }
          if (x.code === 200) {
            this.allConferenceList$.next([])
          } else {
            resultList = x.resultset;
            if (!conferenceType) {
              for (let i = 0; i < resultList.length; i++) {
                if (resultList[i].conference_type == '1') {
                  resultList.splice(i, 1);
                  i--;
                }
              }
            }
            this.allConferenceList$.next(resultList);
          }
          return x;
        }),
        catchError((error: Response) => {
          return throwError(error);
        })
      )
  }

  _getAllPublicConferences() {
    const group_tag_setting = GlobalValue.group_tag_settings.toString();

    this.currentUser = JSON.parse(localStorage.getItem('sessionUser'));
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: JSON.parse(localStorage.getItem('token'))
      })
    };

    return this.http.get(this.getAllPublicConferencesUrl, httpOptions)
      .pipe(
        map((x: any) => {
          return x;
        }),
        /*  map(x => {
           var resultList = [];
           if (x.code === 200) {
             this.allConferenceList$.next([])
           } else {
             resultList = x.resultset;
             
             this.allConferenceList$.next(resultList);
           }
           return x;
         } )*/
        catchError((error: Response) => {
          return throwError(error);
        })
      )
  }

  _getSingleConferenceById(conferenceId: any) {
    console.log('<===========Single conference get service is fired============>')
    this.currentUser = JSON.parse(localStorage.getItem('sessionUser'));
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: JSON.parse(localStorage.getItem('token'))
      })
    };
    return this.http.get(this.getSingleConferenceUrl + '?id=' + conferenceId, httpOptions)
      .pipe(
        map(x => x),
        catchError((error: Response) => {
          return throwError(error);
        })
      )
  }//


  _addUsersToExistingConference(conferenceId: any, userList?: any[]) {
    this.currentUser = JSON.parse(localStorage.getItem('sessionUser'));
    console.log('<======== Add Users To Existing Conference Service Called========>')
 
    userList.forEach(x=>{
      // delete x.created;
      // delete x.created_by;
      // delete x.id;
      // delete x.mobile_number;
      // delete x.name;
      // delete x.updated;
      // delete x.app_id;
      delete x.tag;
      delete x.contact
      delete x.profile_pic
      
    })

    let req = {
      'id': conferenceId,
      'users': userList
    }
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: JSON.parse(localStorage.getItem('token'))
      })
    };
    return this.http.post(this.addUsersToExistingConferenceUrl + '?token=' + this.currentUser.access_token, req, httpOptions)
      .pipe(
        map((result: Response) => {
          return result;
        }),
        map(x => {
          console.log(' from Add Users To Existing Conference function', x);
          return x;
        }),
        catchError((error: Response) => {
          console.log('errr',error)
          return throwError(error)
        })
      )
  }

  _assignUsersToPublicConference(ids: any) {
    this.currentUser = JSON.parse(localStorage.getItem('sessionUser'));
    console.log('<======== Add Users To Existing Conference Service Called========>')
    let req = {
      'ids': ids,

    }
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: JSON.parse(localStorage.getItem('token'))
      })
    };
    return this.http.post(this.assignUsersPublicConferencesUrl, req, httpOptions)
      .pipe(
        map((result: Response) => {
          return result;
        }),
        map(x => {
          console.log(' from Add Users To Existing Conference function', x);
          return x;
        }),
        catchError((error: Response) => {
          return throwError(error)
        })
      )
  }


  _updateConferenceName(conferenceId: any, conferenceName) {
    this.currentUser = JSON.parse(localStorage.getItem('sessionUser'));
    console.log('<======== Update Conference Name Service Called========>')

    let req = {
      'conference_id': conferenceId,
      'conference_name': conferenceName
    }

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: JSON.parse(localStorage.getItem('token'))
      })
    };
    return this.http.post(this.updateConferenceNameUrl + '?token=' + this.currentUser.access_token, req, httpOptions)
      .pipe(
        map((result: Response) => {
          return result;
        }),
        map(x => {
          console.log(' from Update Conference Name function', x);
          return x;
        }),
        catchError((error: Response) => {
          return throwError(error)
        })
      )
  }

  _deleteUsersFromExistingConference(conferenceId, userList) {
    var user = [];
    this.currentUser = JSON.parse(localStorage.getItem("sessionUser"));
    console.log("<======== Delete Users To Existing Conference Service Called========>")
    // user.push({ user_id: userList.user_id });
    console.log('ulllll',userList)
    let req = {
      "id": conferenceId,
      "users": userList
    }
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: JSON.parse(localStorage.getItem('token'))
      })
    };
    return this.http.post(this.deleteUsersFromExistingConferenceUrl + '?token=' + this.currentUser.access_token, req, httpOptions)
      .pipe(
        map((x:any) => {
          console.log(" from Delete users From Existing Conference function", x);
          return x;
        }),
        catchError((error: Response) => {
          return throwError(error);
        })
      )
  }

  _replyRequest(payload, action) {

    var user = [];
    this.currentUser = JSON.parse(localStorage.getItem("sessionUser"));
    console.log("<======== Delete Users To Existing Conference Service Called========>")
    // user.push({ user_id: userList.user_id });
    let req = {
      "room_id": payload.id,
      "requested_by_id": payload.user_id,
      "action_type": action

    }
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: JSON.parse(localStorage.getItem('token'))
      })
    };
    return this.http.post(this.replyConferencesJoinUrl, req, httpOptions)
      .pipe(
        map((result: Response) => {
          return result;
        }),
        map(x => {
          console.log(" reply accept/reject function", x);
          return x;
        }),
        catchError((error: Response) => {
          return throwError(error);
        })
      )
  }

  _getAllRequestedConferences(roomId?) {
    let id = false;
    if (!roomId) {
      roomId = "";
    } else {
      id = true;
    }

    this.currentUser = JSON.parse(localStorage.getItem('sessionUser'));
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: JSON.parse(localStorage.getItem('token'))
      })
    };

    return this.http.get(this.getRequestedConferencesJoinUrl + '?room_id=' + roomId, httpOptions)
      .pipe(
        map((x: any) => {
          return x;
        }),

        tap((x) => {
          if (id) {
            this.notifications.next(x.resultset);
          } else {
            this.allNotifications.next(x.resultset);
          }

        }),

        catchError((error: Response) => {
          return throwError(error);
        })
      )
  }

  _deleteConference(conferenceId) {
    var user = [];
    this.currentUser = JSON.parse(localStorage.getItem("sessionUser"));
    console.log("<======== Delete  Conference Service Called========>")
    // user.push({ user_id: userList.user_id });
    let req = {
      "id": conferenceId
    }
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: JSON.parse(localStorage.getItem('token'))
      })
    };
    return this.http.post(this.deleteConferenceUrl, req, httpOptions)
      .pipe(
        map((result: Response) => {
          return result;
        }),
        map(x => {
          console.log("from Delete conference", x);
          return x;
        }),
        catchError((error: Response) => {
          return throwError(error);
        })
      )
  }

  inviteRoom(conferenceInfo, participantModel) {
    console.log("<======== Invite room service called========>")

    this.currentUser = JSON.parse(localStorage.getItem("sessionUser"));

    let req = {
      emails: [],
      invitation_type: "room_invitation",
      type_id: this.currentUser.company_id,
      invitation_medium: "email",
      conference_id: conferenceInfo.id,
      conference_name: conferenceInfo.conference_name
    }

    participantModel.map((x) => {
      if (x.email) {
        req.emails.push(x.email)
      }
    })
    console.log('invite from contact', req)

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: JSON.parse(localStorage.getItem('token'))
      })
    };
    return this.http.post(this.inviteRoomURL, req, httpOptions)
      .pipe(
        map((result: any) => result),
        catchError((error: Response) => {
          return throwError(error);
        })
      )
  }

  acceptRoomInvitation(roomInvitation) {
    console.log('<========Accept company invitation service called========>');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: JSON.parse(localStorage.getItem('token'))
      })
    };

    const body = {
      company_id: roomInvitation.data.company_id,
      app_id: roomInvitation.data.app_id,
      invitation_id: roomInvitation.data.id
    }

    return this.http.post(this.acceptRoomInvitationURL, body, httpOptions).pipe(
      map((x: any) => x),
      catchError((error: Response) => {
        return throwError(error);
      })
    );
  }

}

