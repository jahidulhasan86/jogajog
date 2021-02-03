import { Injectable } from '@angular/core';
import { map, catchError, flatMap, mergeMap, toArray, tap, switchMap, concatMap } from 'rxjs/operators';
import { Observable, throwError, Subject, BehaviorSubject, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalValue } from '../../../global';

@Injectable({
	providedIn: 'root'
})
export class MeetingService {
	addMeetingURL = `${GlobalValue.video_hub_Service_Url}/meeting/addMeeting`;
	roomBoxmeetingScheduleUrl = `${GlobalValue.video_hub_Service_Url}/room_box`;
	leaveMeetingURL = `${GlobalValue.video_hub_Service_Url}/meeting/leaveMeeting`;
	hostMeetingURL = `${GlobalValue.video_hub_Service_Url}/meeting/addMeeting`;
	getMeetingInfoURL = `${GlobalValue.video_hub_Service_Url}/meeting/getMeetingInfo`;
	inviteMeetingURL = `${GlobalValue.video_hub_Service_Url}/meeting/invite`;
	joinMeetingURL = `${GlobalValue.video_hub_Service_Url}/meeting/joinMeeting`;
	cancelMeetingURL = `${GlobalValue.video_hub_Service_Url}/meeting/cancelMeeting`;
	getUpcomingMeetingInfoForMeURL = `${GlobalValue.video_hub_Service_Url}/meeting/getUpcomingMeetingInfoForMe`;
	getMeetingInfoForMeByTimeURL: string = `${GlobalValue.video_hub_Service_Url}/meeting/getMeetingInfoForMeByTime`;
	notifyURL: string = GlobalValue.video_hub_Service_Url + '/notify';
	sUser: any;
	public getMeetingInfo$ = new BehaviorSubject<any>(null);
	getMeetingInfoCast = this.getMeetingInfo$.asObservable();

	public getUpcomingMeetingList$ = new BehaviorSubject<any>([]);
	getUpcomingMeetingListCast = this.getUpcomingMeetingList$.asObservable();
	public getRoomBoxMeetingSchedule$ = new BehaviorSubject<any>([]);
	getRoomBoxMeetingScheduleObserver = this.getRoomBoxMeetingSchedule$.asObservable();
	count = 0;
	callInitiatorId

	constructor(private http: HttpClient) { }

	addMeeting(body): Observable<any> {
		console.log('<========Add meeting service called========>');
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				Authorization: JSON.parse(localStorage.getItem('token'))
			})
		};

		return this.http.post(this.addMeetingURL, body, httpOptions).pipe(
			map((x: Response) => x),
			catchError((error: Response) => {
				return throwError(error);
			})
		);
	}

	leaveMeeting(body) {
		console.log('<========Leave meeting service called========>');
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				Authorization: JSON.parse(localStorage.getItem('token'))
			})
		};
		return this.http.post(this.leaveMeetingURL, body, httpOptions).pipe(
			map((x: Response) => {
				// this.getMeetingInfo$.next(null);
				// localStorage.removeItem('meetingInfo_current');
				localStorage.removeItem('last_in_call');
				return x;
			}),
			catchError((error: Response) => {
				// this.getMeetingInfo$.next(null);
				// localStorage.removeItem('meetingInfo_current');
				localStorage.removeItem('last_in_call');
				return throwError(error);
			})
		);
	}

	// paramName = 'meeting_token'  or 'meeting_code'
	// paramValue = value
	getMeetingInfo(paramName, paramValue) {
		this.sUser = JSON.parse(localStorage.getItem('sessionUser'));
		console.log('<========Get Meeting Info service called========>');
		// let headers = new HttpHeaders();
		// headers.set('Content-Type', 'application/json');
		// headers.set('Authorization', this.sUser.access_token);
		const headers = new HttpHeaders().set('Content-Type', 'application/json');
		// headers.append('Authorization', token);
		// let options = new RequestOptions({ headers: headers }); // Create a request option

		return this.http
			.get(this.getMeetingInfoURL + '?' + paramName + '=' + paramValue + '&token=' + this.sUser.access_token, { headers: headers })
			.pipe(
				map((meetingInfo: any) => {
					console.log(meetingInfo);
					return meetingInfo;
				}),
				catchError((error: Response) => {
					console.log('getMeetingInfo error: ' + error);
					return throwError(error);
				})
			);
	}

	inviteMeeting(body): Observable<any> {
		// if (this.count == 0) {
		// 	body.email_list += ',' + JSON.parse(localStorage.getItem('sessionUser')).email;
		// }
		console.log('<========Invite meeting service called========>');
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				Authorization: JSON.parse(localStorage.getItem('token'))
			})
		};

		return this.http.post(this.inviteMeetingURL, body, httpOptions).pipe(
			map((x: Response) => x),
			catchError((error: Response) => {
				return throwError(error);
			})
		);
	}

	joinMeeting(body): Observable<any> {
		console.log('<========Join meeting service called========>');
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				Authorization: JSON.parse(localStorage.getItem('token'))
			})
		};

		return this.http.post(this.joinMeetingURL, body, httpOptions).pipe(
			map((x: Response) => x),
			catchError((error: Response) => {
				return throwError(error);
			})
		);
	}

	cancelMeeting(meeting_id): Observable<any> {
		console.log('<========Cancel meeting service called========>');
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				Authorization: JSON.parse(localStorage.getItem('token'))
			})
		};

		return this.http.post(this.cancelMeetingURL, meeting_id, httpOptions).pipe(
			map((x: Response) => x),
			catchError((error: Response) => {
				return throwError(error);
			})
		);
	}

	getUpcomingMeetingInfoForMe(days) {
		this.sUser = JSON.parse(localStorage.getItem('sessionUser'));
		console.log('<========Get Upcoming Meeting Info For Me service called========>');

		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				Authorization: JSON.parse(localStorage.getItem('token'))
			})
		};
		return this.http.get(this.getUpcomingMeetingInfoForMeURL + '?days=' + days, httpOptions).pipe(
			map((result: any) => {
				console.log(result);
				if (result.status === 'ok') {
					let totalMeetingList = [];
					totalMeetingList.push(...result.result.upcomings_host);
					totalMeetingList.push(...result.result.upcomings_guest);
					totalMeetingList = totalMeetingList.sort((a, b) => (a.timing.start_time > b.timing.start_time ? 1 : -1));
					this.getUpcomingMeetingList$.next(totalMeetingList);
				} else {
					this.getUpcomingMeetingList$.next([]);
				}
				return result;
			}),
			catchError((error: Response) => {
				console.log('Get Upcoming Meeting Info For Me error: ' + error);
				return throwError(error);
			})
		);
	}

	isMeetingHost(userId?): boolean {
		const meetingInfo = JSON.parse(localStorage.getItem('meetingInfo_current'));
		const authUser = JSON.parse(localStorage.getItem('sessionUser'));
		if (userId) {
			if (meetingInfo.owner.host_id === userId) {
				// If Host
				return true;
			}
			return false;
		} else if (meetingInfo.owner.host_id === authUser.id) {
			// If Host
			return true;
		}
		return false;
	}
	isCallInitiator() {
		const meetingInfo = JSON.parse(localStorage.getItem('meetingInfo_current'));
		const authUser = JSON.parse(localStorage.getItem('sessionUser'));
		if (meetingInfo.chair_id === authUser.id) {
			return true
		}
		return false
	}

	addRoomBoxMeetingSchedule(body): Observable<any> {
		console.log('<========addRoomBoxMeetingSchedule service called========>');
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				Authorization: JSON.parse(localStorage.getItem('token'))
			})
		};

		return this.http.post(this.roomBoxmeetingScheduleUrl + '/saveMeetingSchedule', body, httpOptions).pipe(
			map((x: Response) => {
				const response: any = x;
				this.getRoomBoxMeetingSchedule$.next(x);
				return x;
			}),
			catchError((error: Response) => {
				return throwError(error);
			})
		);
	}

	getSelectedBoxSchedules(room_id) {
		this.sUser = JSON.parse(localStorage.getItem('sessionUser'));
		console.log('<========getAllSchedulesByRoomBox service called========>');

		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				Authorization: JSON.parse(localStorage.getItem('token'))
			})
		};
		return this.http.get(this.roomBoxmeetingScheduleUrl + '/getAllSchedulesByRoomBox?room_id=' + room_id, httpOptions).pipe(
			map((result: any) => {
				console.log(result);
				if (result.status === 'ok') {
					let totalSchedules = [];
					totalSchedules.push(...result.resultset);
					totalSchedules = totalSchedules.sort((a, b) => (a.start_time > b.start_time ? 1 : -1));
					// this.getRoomBoxMeetingSchedule$.next(totalSchedules);
				} else {
					// this.getRoomBoxMeetingSchedule$.next([]);
				}
				return result;
			}),
			catchError((error: Response) => {
				console.log('getAllSchedulesByRoomBox error: ' + error);
				return throwError(error);
			})
		);
	}

	getAllRoomBoxSchedules() {
		this.sUser = JSON.parse(localStorage.getItem('sessionUser'));
		console.log('<========getAllRoomBoxSchedules service called========>');

		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				Authorization: JSON.parse(localStorage.getItem('token'))
			})
		};
		return this.http.get(this.roomBoxmeetingScheduleUrl + '/getAllSchedulesByRoomBox', httpOptions).pipe(
			map((result: any) => {
				console.log(result);
				if (result.status === 'ok') {
					let totalSchedules = [];
					totalSchedules.push(...result.resultset);
					totalSchedules = totalSchedules.sort((a, b) => (a.start_time > b.start_time ? 1 : -1));
					// this.getRoomBoxMeetingSchedule$.next(totalSchedules);
				} else {
					// this.getRoomBoxMeetingSchedule$.next([]);
				}
				return result;
			}),
			catchError((error: Response) => {
				console.log('getAllRoomBoxSchedules error: ' + error);
				return throwError(error);
			})
		);
	}

	getMeetingInfoForMeByTime(time) {
		this.sUser = JSON.parse(localStorage.getItem('sessionUser'));
		console.log('<========Get meeting info for me by time service called========>');

		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				Authorization: JSON.parse(localStorage.getItem('token'))
			})
		};
		return this.http.get(this.getMeetingInfoForMeByTimeURL + '?from=' + time.from + '&to=' + time.to, httpOptions).pipe(
			map((result: any) => {
				console.log(result);
				if (result.status === 'ok') {
					let totalMeetingList = [];
					totalMeetingList.push(...result.result.upcomings_host);
					totalMeetingList.push(...result.result.upcomings_guest);
					totalMeetingList = totalMeetingList.sort((a, b) => (a.timing.start_time > b.timing.start_time ? 1 : -1));
					this.getUpcomingMeetingList$.next(totalMeetingList);
				} else {
					this.getUpcomingMeetingList$.next([]);
				}
				return result;
			}),
			catchError((error: Response) => {
				console.log('Get meeting info for me by time error: ' + error);
				return throwError(error);
			})
		);
	}

	notify(users, recodingList?) {
		console.log('<========Notify service called========>');
		const meetingInfo: any = JSON.parse(localStorage.getItem('meetingInfo_current'));
		let body = {
			"users": users,
			"data": {
				"company_id": meetingInfo.company_id,
				"app_name": GlobalValue.app_name,
				"meeting_name": meetingInfo.meeting_name,
				"meeting_code": meetingInfo.meeting_url ? meetingInfo.meeting_code : meetingInfo.conferance_id,
				"meeting_password": meetingInfo.meeting_password
			},
			"email": {
				"subject": !recodingList ? "Reminder" : "Meeting Records",
				"template": !recodingList ? "notify" : "notify_recording",
				"from": GlobalValue.currentBuild == "en" ? "Jagajag<comms@sensor.buzz>" : "Jogajog<comms@sensor.buzz>",
				"context": {
					"messageText": !recodingList ? meetingInfo.meeting_url ? "The meeting has already been started. Can you please join now?" : 'The meeting has already been started for the room ' + meetingInfo.meeting_name + '. Can you please join now?' : 'Thanks for attending the meeting ' + meetingInfo.meeting_name + '. You can access the meeting recording by clicking here.',
					"owner": {
						"host_name": meetingInfo.owner.host_name
					},
					"meeting_name": meetingInfo.meeting_name,
					"meeting_code": meetingInfo.meeting_url ? meetingInfo.meeting_code : meetingInfo.conferance_id,
					"meeting_password": meetingInfo.meeting_password,
					"meeting_url": !recodingList ? meetingInfo.meeting_url ? meetingInfo.meeting_url : window.location.origin + '/#/dashboard/room-box/details/' + meetingInfo.conferance_id + '?url=true' : null,
					"recording_list": recodingList ? recodingList : null
				}
			},
			"push": {
				"type": !recodingList ? "reminder" : "recording_list",
				"meeting_name": meetingInfo.meeting_name,
				"meeting_code": meetingInfo.meeting_url ? meetingInfo.meeting_code : meetingInfo.conferance_id,
				"meeting_password": meetingInfo.meeting_password
			}
		}
		console.log(body)
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				Authorization: JSON.parse(localStorage.getItem('token'))
			})
		};
		return this.http.post(this.notifyURL, body, httpOptions).pipe(
			map((x: any) => x),
			catchError((error: Response) => {
				return throwError(error);
			})
		);
	}

	getSessionUserId() {
		if (localStorage.hasOwnProperty('sessionUser'))
			return JSON.parse(localStorage.getItem('sessionUser')).id;
	}

	getCurrentMeetingInfo() {
		if (localStorage.hasOwnProperty('meetingInfo_current')) {
			return JSON.parse(localStorage.getItem('meetingInfo_current'))
		}
	}

	getMeetingUsers(): [] {
		if (localStorage.hasOwnProperty('meetingInfo_current')) {
			return JSON.parse(localStorage.getItem('meetingInfo_current')).users
		}
	}

	isRoomMeeting(): boolean {
		if (localStorage.hasOwnProperty('meetingInfo_current')) {
			if (!JSON.parse(localStorage.getItem('meetingInfo_current')).meeting_url) {
				return true
			} else {
				return false
			}
		}
	}

	notifyRoomUserModelGenerator(users: []) {
		const newModel = []
		users.map((e: any) => {
			if (e.user_id !== this.getSessionUserId()) {
				Object.assign(e, { id: e.user_id, notify_methods: ["push", "email"] })
				delete e.user_id
				delete e.user_name
				delete e.email
				newModel.push(e)
			}
		})
		return newModel
	}
}