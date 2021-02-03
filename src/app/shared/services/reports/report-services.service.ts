import { Injectable } from '@angular/core';
import { map, catchError, flatMap, mergeMap, toArray, tap, switchMap, concatMap } from 'rxjs/operators';
import { Observable, throwError, Subject, BehaviorSubject, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalValue } from '../../../global';

@Injectable({
  providedIn: 'root'
})
export class ReportServicesService {
  token: any;
  currentUser: any;
  getMeetingActivityInfoUrl = `${GlobalValue.video_hub_Service_Url}/meeting/getMeetingActivityLog`;
  constructor(private http: HttpClient) {
  this.token = localStorage.getItem('token');
  this.currentUser = JSON.parse(localStorage.getItem('sessionUser'));
  }
  
  getMeetingActivityInfo(dayCount) {
  const headers = new HttpHeaders().set('Content-Type', 'application/json');
	// headers.append('Authorization', this.token);

		return this.http
			.get(this.getMeetingActivityInfoUrl + '?days=' + dayCount + '&token=' + this.currentUser.access_token)
			.pipe(
				map((activityInfo: any) => {
					return activityInfo;
				}),
				catchError((error: Response) => {
					console.log('getMeetingActivityInfo error: ' + error);
					return throwError(error);
				})
			);
	}
}

