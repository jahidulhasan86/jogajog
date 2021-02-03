import { Injectable } from '@angular/core';
import { map, catchError, flatMap, mergeMap, toArray, tap, switchMap, concatMap } from 'rxjs/operators';
import { Observable, throwError, Subject, BehaviorSubject, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalValue } from '../../../global';

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  getServerInfo = `http://localhost:3000/getSystemDetails`;
  constructor(private http: HttpClient) { }

  getServerDetails() {
		const headers = new HttpHeaders().set('Content-Type', 'application/json');
		// headers.append('Authorization', token);
		// let options = new RequestOptions({ headers: headers }); // Create a request option

		return this.http
			.get(this.getServerInfo)
			.pipe(
				map((serverDetails: any) => {
					return serverDetails;
				}),
				catchError((error: Response) => {
					console.log('getServerInfo error: ' + error);
					return throwError(error);
				})
			);
	}
}
