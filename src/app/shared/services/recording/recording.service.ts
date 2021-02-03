import { Injectable } from '@angular/core';
import { map, catchError, flatMap, mergeMap, toArray, tap, switchMap, concatMap } from 'rxjs/operators';
import { Observable, throwError, Subject, BehaviorSubject, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalValue } from '../../../global';
// import {needle} from ''

@Injectable({
  providedIn: 'root'
})
export class RecordingService {
  postRecording = `${GlobalValue.video_hub_Service_Url}/recording`;
  getRecording = `${GlobalValue.video_hub_Service_Url}/recording/getRecordings`;
  sessionUser: any;
  getRecordingByMeetinIdURL: string = GlobalValue.video_hub_Service_Url + '/recording/getRecordingByMeetingId';
  
  constructor(private http: HttpClient) { }
  getRecordings(username?,meetingid?,sessionid?) {
		this.sessionUser = JSON.parse(localStorage.getItem('sessionUser'));
	
		console.log('<========Get Recordings service called========>' );
		let headers = new HttpHeaders();
		headers.set('Content-Type', 'application/json');

		return this.http
			.get(this.getRecording + '?user_id=' + username + '&meeting_id=' + meetingid + '&session_id=' + sessionid +'&token='+this.sessionUser.access_token, { headers: headers })
			.pipe(
				map((recordings: any) => {
					console.log(recordings);
					return recordings;
				}),
				catchError((error: Response) => {
					console.log('get Recordings error: ' + error);
					return throwError(error);
				})
			);
	}

	getRecordingByMeetingandSessionId(meetingid, sessionid) {
		this.sessionUser = JSON.parse(localStorage.getItem('sessionUser'));
	
		console.log('<========Get Recordings service called========>');
		let headers = new HttpHeaders();
		headers.set('Content-Type', 'application/json');

		return this.http
			.get(this.getRecording + '?meeting_id=' + meetingid + '&session_id=' + sessionid +'&token='+this.sessionUser.access_token, { headers: headers })
			.pipe(
				map((recordings: any) => {
					console.log(recordings);
					return recordings;
				}),
				catchError((error: Response) => {
					console.log('get Recordings error: ' + error);
					return throwError(error);
				})
			);
	}


	post(body): Observable<any> {
		console.log('<========Add Recording service called========>');
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				Authorization: JSON.parse(localStorage.getItem('token'))
			})
		};

		return this.http.post(this.postRecording, body, httpOptions).pipe(
			map((x: Response) => x),
			catchError((error: Response) => {
				return throwError(error);
			})
		);
	}

	getRecordingByMeetingId(meetingid){
		this.sessionUser = JSON.parse(localStorage.getItem('sessionUser'));
	
		console.log('<========Get Recordings by meeting id service called========>');
		
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				Authorization: JSON.parse(localStorage.getItem('token'))
			})
		};

		return this.http.get(this.getRecordingByMeetinIdURL + '?meeting_id=' + meetingid, httpOptions).pipe(
				map((x: any) => {
					if(!!x){
						x.resultset.map((record) => {
							Object.assign(record, { url : window.location.origin + "#/" + "playback?" + "meeting_id=" + record.meeting_id + "&session_id=" + record.session_id})
						})
						return x
					}
				}),
				catchError((error: Response) => {
					return throwError(error);
				})
			);
	}
}
