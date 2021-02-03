import { Injectable } from '@angular/core';
// import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { map, catchError, flatMap, mergeMap, toArray, tap, switchMap, concatMap } from 'rxjs/operators';
import { Observable, throwError, Subject, BehaviorSubject, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalValue } from '../../../global';

@Injectable({
  providedIn: 'root'
})
export class PaymentCoreService {
  paymentApi = `${GlobalValue.payment_api_url}/payments/process`;
  currentUser: any = null;
  constructor(private http: HttpClient) {
		this.currentUser = JSON.parse(localStorage.getItem('sessionUser'));
	}

	processPayment(body, overlapping?) {
		// tslint:disable-next-line:no-console
	console.log('<========Process Payment Service called========>');
		const overlappingFlag = overlapping ? true : false;
		const headers = new HttpHeaders().set('Content-Type', 'application/json');
		return this.http.post(this.paymentApi + '?overlapping=' + overlappingFlag, body, { headers: headers }).pipe(
			map((x: any) => x),
			catchError((error: Response) => {
				return throwError(error);
			})
		);
	}
}
