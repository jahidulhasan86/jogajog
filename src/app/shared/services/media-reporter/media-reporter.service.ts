import { Injectable } from '@angular/core';
import { map, catchError, flatMap, mergeMap, toArray, tap, switchMap, concatMap } from 'rxjs/operators';
import { Observable, throwError, Subject, BehaviorSubject, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalValue } from '../../../global';

@Injectable({
  providedIn: 'root'
})
export class MediaReporterService {
	mediaReportUrl = `${GlobalValue.media_report_Service_Url}`;
	sUser: any;
  constructor(private http: HttpClient) {}

  getRunningSessionDetails() {
		this.sUser = JSON.parse(localStorage.getItem('sessionUser'));
		console.log('<========Get Meeting Info service called========>');
		const headers = new HttpHeaders().set('Content-Type', 'application/json');

		return this.http
			.get(this.mediaReportUrl + '/reports/status?token=' + this.sUser.access_token, { headers: headers })
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

	getServerDetails() {
		this.sUser = JSON.parse(localStorage.getItem('sessionUser'));
		console.log('<========Get Meeting Info service called========>');
		const headers = new HttpHeaders().set('Content-Type', 'application/json');

		return this.http
			.get(this.mediaReportUrl + 'reports/bfcp/info?token=' + this.sUser.access_token, { headers: headers })
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
}
