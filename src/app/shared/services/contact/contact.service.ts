import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { MatSidenav } from '@angular/material/sidenav';
import { ILogger } from '../../types/logger-type';
import {  throwError, Subject, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalValue } from '../../../global';
import { map, catchError, flatMap, mergeMap, toArray, tap, switchMap, concatMap } from 'rxjs/operators';
import { AuthService, FacebookLoginProvider, GoogleLoginProvider } from 'angularx-social-login';
@Injectable({
	providedIn: 'root'
})
export class ContactService {
	
	contactUrl = `${GlobalValue.alert_circel_Service_Url}/contacts`;
	//contactUrl = 'http://localhost:4002/api/v1/contacts';

	constructor(private http: HttpClient, private authService: AuthService) {
		//this.currentUser = JSON.parse(localStorage.getItem('sessionUser'));
	}	

	getContacts(): Observable<any> {
		console.log('<========get contacts service called========>');
		//const headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization','eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBfaWQiOiI4YjhjMWNlOS1kMTEwLTRjM2YtOTM5Yy1lYWJmZTZlMDQ5ZTYiLCJjb21wYW55X2lkIjoiZDE3YjVkM2YtNTY1YS00ZDViLTg4MTUtZTU1NmI3Y2Y5MGVkIiwiZW1haWwiOiJmYWltLnN1c3RAZ21haWwuY29tIiwicHJvZmlsZV9pZCI6IjIiLCJwcm92aWRlciI6ImZhY2Vib29rIiwidXNlcl9pZCI6ImFlZmU4NDQxLTVhNDUtNGI5My1iMDE3LWY1ODliYjc2ZTZhZCIsInVzZXJfbmFtZSI6ImZhaW0uc3VzdF8xNTk0Mjk1MjE1ODA1IiwiaWQiOiJhZWZlODQ0MS01YTQ1LTRiOTMtYjAxNy1mNTg5YmI3NmU2YWQiLCJhdWQiOlsiY29tcGFueTpkMTdiNWQzZi01NjVhLTRkNWItODgxNS1lNTU2YjdjZjkwZWQiLCJhcHA6OGI4YzFjZTktZDExMC00YzNmLTkzOWMtZWFiZmU2ZTA0OWU2Il0sImNvbXBhbnlfbmFtZSI6IkhhbWFkIEludGVybmF0aW9uYWwgQWlycG9ydCIsImFwcF9uYW1lIjoiQWlycG9ydCBDb25uZWN0IiwianRpIjoiZmI5YmNkYjEtYjZlMC00M2YxLWIzODEtYjAzMmRkOTIzNzdiIiwiaWF0IjoxNTk0Mjk2OTgyLCJpc3MiOiJvYXV0aC5zdXJyb3VuZGFwcHMiLCJzdWIiOiJhZWZlODQ0MS01YTQ1LTRiOTMtYjAxNy1mNTg5YmI3NmU2YWQifQ.Tv6-SSl14kOaOw9Zj1Dc0XyM7sTwuVKZzydRJSZ4ZtQuyK1bmfnTaiDhCwCod7vk4v25-jXekPJ7ATxgVbQcazpe9u4lqKYKvJzVYen_cj889OrbiXRZ4CwHDAnRgsBbfPGWMer1Ujworj1h8ga87ijzpIH4wRxFRPDicysFtVJWaze-fJOJumxT5DwrKQkrsbqUr1n3AMuW1epIT2qFPgKRiAVu9zBWH5hb7h1ZAGwe31ryBUzS-oB0nionIJM2f0Cm_XKQWc6RFdTeFIU-t3-PlVJf3_yGU7GOoS2RTvDzvXr1Wce_ZZ6FMcYwLTcFWVdeIA89OXgijADnoh2Oag');
		//const body = JSON.stringify({ email: email, name: display_name, app_id: GlobalValue.app_id, company_id: GlobalValue.company_id });
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				Authorization: JSON.parse(localStorage.getItem('token'))
			})
		};
		
		return this.http.get(this.contactUrl , httpOptions).pipe(
			map((x: any) =>{
				console.log(x);
			 	return x.result;
			}
			),
			catchError((error: Response) => {
				return throwError(error);
			})
		);
	}
	addContact(name: string,
		//position: number;
		email: string,
		mobile_number: string): Observable<any> {
		console.log('<========add contact service called========>');
		//const headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization','eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBfaWQiOiI4YjhjMWNlOS1kMTEwLTRjM2YtOTM5Yy1lYWJmZTZlMDQ5ZTYiLCJjb21wYW55X2lkIjoiZDE3YjVkM2YtNTY1YS00ZDViLTg4MTUtZTU1NmI3Y2Y5MGVkIiwiZW1haWwiOiJmYWltLnN1c3RAZ21haWwuY29tIiwicHJvZmlsZV9pZCI6IjIiLCJwcm92aWRlciI6ImZhY2Vib29rIiwidXNlcl9pZCI6ImFlZmU4NDQxLTVhNDUtNGI5My1iMDE3LWY1ODliYjc2ZTZhZCIsInVzZXJfbmFtZSI6ImZhaW0uc3VzdF8xNTk0Mjk1MjE1ODA1IiwiaWQiOiJhZWZlODQ0MS01YTQ1LTRiOTMtYjAxNy1mNTg5YmI3NmU2YWQiLCJhdWQiOlsiY29tcGFueTpkMTdiNWQzZi01NjVhLTRkNWItODgxNS1lNTU2YjdjZjkwZWQiLCJhcHA6OGI4YzFjZTktZDExMC00YzNmLTkzOWMtZWFiZmU2ZTA0OWU2Il0sImNvbXBhbnlfbmFtZSI6IkhhbWFkIEludGVybmF0aW9uYWwgQWlycG9ydCIsImFwcF9uYW1lIjoiQWlycG9ydCBDb25uZWN0IiwianRpIjoiZmI5YmNkYjEtYjZlMC00M2YxLWIzODEtYjAzMmRkOTIzNzdiIiwiaWF0IjoxNTk0Mjk2OTgyLCJpc3MiOiJvYXV0aC5zdXJyb3VuZGFwcHMiLCJzdWIiOiJhZWZlODQ0MS01YTQ1LTRiOTMtYjAxNy1mNTg5YmI3NmU2YWQifQ.Tv6-SSl14kOaOw9Zj1Dc0XyM7sTwuVKZzydRJSZ4ZtQuyK1bmfnTaiDhCwCod7vk4v25-jXekPJ7ATxgVbQcazpe9u4lqKYKvJzVYen_cj889OrbiXRZ4CwHDAnRgsBbfPGWMer1Ujworj1h8ga87ijzpIH4wRxFRPDicysFtVJWaze-fJOJumxT5DwrKQkrsbqUr1n3AMuW1epIT2qFPgKRiAVu9zBWH5hb7h1ZAGwe31ryBUzS-oB0nionIJM2f0Cm_XKQWc6RFdTeFIU-t3-PlVJf3_yGU7GOoS2RTvDzvXr1Wce_ZZ6FMcYwLTcFWVdeIA89OXgijADnoh2Oag');
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				Authorization: JSON.parse(localStorage.getItem('token'))
			})
		};
		
		const body = JSON.stringify({ email: email, name: name, app_id: GlobalValue.app_id, company_id: GlobalValue.company_id ,mobile_number: mobile_number});	
	
		return this.http.post(this.contactUrl ,body, httpOptions).pipe(
			map((x: any) => x),
			catchError((error: Response) => {
				return throwError(error);
			})
		);
	}		
	
}
