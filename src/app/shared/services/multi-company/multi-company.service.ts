import { Injectable } from '@angular/core';
import { map, catchError, flatMap, mergeMap, toArray, tap, switchMap, concatMap } from 'rxjs/operators';
import { Observable, throwError, Subject, BehaviorSubject, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalValue } from '../../../global';

@Injectable({
  providedIn: 'root'
})
export class MultiCompanyService {
  private getCompaniesByUserURL = GlobalValue.alert_circel_Service_Url + '/user/companies';
  private saveUserSessionURL = `${GlobalValue.alert_circel_Service_Url}/session/saveUserSession`;
  private getTokenURL = `${GlobalValue.alert_circel_Service_Url}/account/token`;
  private getCompanyInfoURL = `${GlobalValue.alert_circel_Service_Url}/companies`;
  private getCompanyEmployeeURL = GlobalValue.alert_circel_Service_Url + '/companies/applications/users?fetch_com_employees=true';
  private inviteEmployeeURL = `${GlobalValue.alert_circel_Service_Url}/companies/inviteEmployee`;
  private getNotificationsURL = `${GlobalValue.notification_url}/notifications?notif_types=['13', 'room_invitation', 'meeting_schedule', 'public_room_join_request']&&actions=['company_invitation', 'room_invitation', 'meeting_schedule', 'public_room_join_request']`
  private acceptCompanyInvitationURL = `${GlobalValue.alert_circel_Service_Url}/companies/invite/accept`
  private declineCompanyInvitationURL = `${GlobalValue.alert_circel_Service_Url}/companies/invite/decline`;
  private companyInfo = new BehaviorSubject<any>('')
  private notifications = new BehaviorSubject<any>([])
  notificationCast = this.notifications.asObservable()
  private companies = new BehaviorSubject<any>([])
  companiesCast = this.companies.asObservable()
  roomInvitations = new BehaviorSubject<any>([])
  roomInvitationsCast = this.roomInvitations.asObservable()

  constructor(private http: HttpClient) { }

  inviteEmployee(members): Observable<any> {
    console.log('<========Invite employee service called========>');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: JSON.parse(localStorage.getItem('token'))
      })
    };

    const body = {
      "emails": members,
      "invitation_type": "company",
      "type_id": JSON.parse(localStorage.getItem('sessionUser')).company_id,
      "invitation_medium": "email"
    }

    return this.http.post(this.inviteEmployeeURL, body, httpOptions).pipe(
      map((x: any) => x),
      catchError((error: Response) => {
        return throwError(error);
      })
    );
  }

  getCompaniesByUser() {
    console.log('<========Get companies by user called========>');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: JSON.parse(localStorage.getItem('token'))
      })
    };
    return this.http.get(this.getCompaniesByUserURL, httpOptions).pipe(
      map((x: any) => {
        let modifyResult = {
          status: x.status,
          code: x.code,
          resultset: []
        }
        x.resultset.some((x) => {
          if (x.company_id != 'd17b5d3f-565a-4d5b-8815-e556b7cf90ed') modifyResult.resultset.push(x)
        })
        return modifyResult
      }),
      tap((x) => this.companies.next(x.resultset)),
      catchError((error: Response) => {
        return throwError(error);
      })
    );
  }

  saveUserSession(id) {
    console.log("<======== Save user session service called========>")
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: JSON.parse(localStorage.getItem('token'))
      })
    }
    return this.http.post(this.saveUserSessionURL, { last_company_id: id }, httpOptions)
      .pipe(
        map((x: any) => x),
        concatMap((x) => {
          return of(x).pipe(
            mergeMap((x) => {

              const getTokenBody = {
                app_id: GlobalValue.app_id,
                company_id: id,
                access_token: JSON.parse(localStorage.getItem('token'))
              };

              console.log('<========Get token service service is called========>');
              return this.http.post(this.getTokenURL, getTokenBody, { headers: new HttpHeaders().set('Content-Type', 'application/json') }).pipe(
                map((x: Response) => x),
                tap((x: any) => {

                  const { access_token, app_id, company_id, is_company_admin, role } = x.result;
                  const sessionUser = JSON.parse(localStorage.getItem('sessionUser'))

                  Object.assign(sessionUser, {
                    access_token: access_token,
                    app_id: app_id,
                    company_id: company_id,
                    is_company_admin: is_company_admin,
                    role: !role ? { role_name: "individual", role_type: "1" } : role,
                  });

                  Object.assign(sessionUser.user_session, {
                    last_company_id: id
                  });

                  localStorage.setItem('sessionUser', JSON.stringify(sessionUser));
                  localStorage.setItem('profile_pic', JSON.stringify(sessionUser.profile_pic));
                  localStorage.setItem('token', JSON.stringify(sessionUser.access_token));

                  // this.currentUser = user_info;
                  // this.userLoginGenerator(!!localStorage.getItem('sessionUser'));
                })
              );
            })
          );
        }),
        catchError((error: Response) => {
          return throwError(error)
        })
      )
  }

  getCompanyInfo(id) {
    console.log('<========Get company info service called========>');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: JSON.parse(localStorage.getItem('token'))
      })
    };
    return this.http.get(`${this.getCompanyInfoURL}?id=${id}`, httpOptions).pipe(
      map((x: any) => x),
      tap((x) => {
        if (!!x) {
          localStorage.setItem('company_information', JSON.stringify(x.result))
          this.companyInfo.next(JSON.parse(localStorage.getItem('company_information')))
        }
      }),
      catchError((error: Response) => {
        return throwError(error);
      })
    );
  }

  getCompanyInformation() {
    return this.companyInfo.asObservable()
  }

  getCompanyEmployee() {
    console.log('<========Get company employee service called========>');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: JSON.parse(localStorage.getItem('token'))
      })
    };
    return this.http.get(this.getCompanyEmployeeURL, httpOptions).pipe(
      map((x: any) => {
        let count = 1
        x.resultset.forEach(employee => {
          Object.assign(employee, {
            position: count++,
            contact: !employee.contact ? 'N/A' : employee.contact
          })
        });
        return x
      }),
      catchError((error: Response) => {
        return throwError(error);
      })
    );
  }

  getNotifications() {
    console.log('<========Get notifications employee service called========>');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: JSON.parse(localStorage.getItem('token'))
      })
    };
    return this.http.get(this.getNotificationsURL, httpOptions).pipe(
      map((x: any) => {
        let modifyResult = {
          status: x.status,
          resultset: []
        }
        x.resultset.forEach(invitation => {
          if (!invitation.is_next_action_taken) modifyResult.resultset.push(invitation)
        });
        return modifyResult
      }),
      tap((x) => {
        const companyInvitation = []
        const roomInvitation = []
        x.resultset.forEach((invitation) => {
          if (invitation.data.action === 'company_invitation') {
            companyInvitation.push(invitation)
          } else if (invitation.data.action === 'room_invitation') {
            invitation.requested_by_name = invitation.data.inviter_user_name,
              invitation.room_name = invitation.data.conference_name
            invitation.action = invitation.data.action
            roomInvitation.push(invitation)
          } else if(invitation.data.action == 'meeting_schedule') {
            invitation.requested_by_name = invitation.data.schedule_creator_name,
            invitation.meeting_name = invitation.data.meeting_name
            invitation.room_name = invitation.data.room_name
            invitation.action = invitation.data.action
            roomInvitation.push(invitation)
          }else{

          }
        })
        this.notifications.next(companyInvitation)
        this.roomInvitations.next(roomInvitation)
      }),
      catchError((error: Response) => {
        return throwError(error);
      })
    );
  }

  acceptCompanyInvitation(companyInvitation, isfrom_payload?: boolean) {
    console.log('<========Accept company invitation service called========>');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: JSON.parse(localStorage.getItem('token'))
      })
    };

    const body = {
      company_id: isfrom_payload ? companyInvitation.company_id : companyInvitation.data.company_id,
      app_id: isfrom_payload ? companyInvitation.app_id : companyInvitation.data.app_id,
      invitation_id: isfrom_payload ? companyInvitation.id : companyInvitation.data.id
    }

    return this.http.post(this.acceptCompanyInvitationURL, body, httpOptions).pipe(
      map((x: any) => x),
      catchError((error: Response) => {
        return throwError(error);
      })
    );
  }

  declineCompanyInvitation(companyInvitation) {
    console.log('<========Decline company invitation service called========>');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: JSON.parse(localStorage.getItem('token'))
      })
    };

    const body = {
      company_id: companyInvitation.data.company_id,
      app_id: companyInvitation.data.app_id,
      invitation_id: companyInvitation.data.id
    }

    return this.http.post(this.declineCompanyInvitationURL, body, httpOptions).pipe(
      map((x: any) => x),
      catchError((error: Response) => {
        return throwError(error);
      })
    );
  }

  defaultCompany() {
    const sessionUser = JSON.parse(localStorage.getItem('sessionUser'));
    if (sessionUser.company_id !== '78430815-ddfc-415e-9c5c-d10185da8d77' && sessionUser.company_id !== '5e146eab-3d84-421b-8748-e0563daf5c24') {
      return false
    } else {
      return true
    }
  }

  saveSeenNotifs(notifIds) {
    console.log('Save Seen Notifs service called')

    if(notifIds.length == 0) return throwError('no id found')
    
    let req = {
      notifIds : notifIds
    }

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: JSON.parse(localStorage.getItem('token'))
      })
    };

    var url = GlobalValue.notification_url + "/notifications/updateSeen?token=" + JSON.parse(localStorage.getItem('token'))
    return this.http.post(url,req, httpOptions).pipe(
      map((x) =>x),
      catchError((error: Response) => {
        return throwError(error);
      })
    )
  }
}
