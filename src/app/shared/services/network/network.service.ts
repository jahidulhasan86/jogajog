import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError as observableThrowError, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { LoggerService } from '../logger/logger.service';
import { ILogger } from '../../types/logger-type';
import { GlobalValue } from '../../../global';
@Injectable({
	providedIn: 'root'
})
export class NetworkService {
	private log: ILogger;
	private baseHref: string;

	private openviduServerUrl = 'https://103.78.248.66';
	private openviduSecret = 'SSB_2019';
	private serverInfo: any

	constructor(private http: HttpClient, private loggerSrv: LoggerService) {
		this.log = this.loggerSrv.get('NetworkService');
		this.baseHref = '/' + (!!window.location.pathname.split('/')[1] ? window.location.pathname.split('/')[1] + '/' : '');
	}

	async getToken(sessionId: string): Promise<string> {
		if (!!this.serverInfo.uri && !!this.serverInfo.secret) {
			const _sessionId = await this.createSession(sessionId);
			return await this.createToken(_sessionId);
		}
		try {
			this.log.d('Getting token from backend');
			return await this.http
				.post<any>(this.baseHref + 'call', { sessionId })
				.toPromise();
		} catch (error) {
			if (error.status === 404) {
				throw { status: error.status, message: 'Cannot connect with backend. ' + error.url + ' not found' };
			}
			throw error;
		}
	}

	createSession(sessionId: string): Promise<string> {
		return new Promise((resolve, reject) => {
			const body = JSON.stringify({ customSessionId: sessionId });
			const options = {
				headers: new HttpHeaders({
					Authorization: 'Basic ' + btoa('OPENVIDUAPP:' + this.serverInfo.secret),
					'Content-Type': 'application/json'
				})
			};
			return this.http
				.post<any>(this.serverInfo.uri + '/api/sessions', body, options)
				.pipe(
					catchError((error) => {
						if (error.status === 409) {
							resolve(sessionId);
						}
						if (error.statusText === 'Unknown Error') {
							reject({ status: 401, message: 'ERR_CERT_AUTHORITY_INVALID' });
						}
						return observableThrowError(error);
					})
				)
				.subscribe((response) => {
					resolve(response.id);
				});
		});
	}

	createToken(sessionId: string): Promise<string> {
		return new Promise((resolve, reject) => {
			console.log(JSON.stringify({ session: sessionId }));
			const body = JSON.stringify({ session: sessionId });
			const options = {
				headers: new HttpHeaders({
					Authorization: 'Basic ' + btoa('OPENVIDUAPP:' + this.serverInfo.secret),
					'Content-Type': 'application/json'
				})
			};
			return this.http
				.post<any>(this.serverInfo.uri + '/api/tokens', body, options)
				.pipe(
					catchError((error) => {
						reject(error);
						return observableThrowError(error);
					})
				)
				.subscribe((response) => {
					this.log.d(response);
					resolve(response.token);
				});
		});
	}

	// sendSignal(sessionId: string, to: string[], type: string, data: string): Promise<string> {
	// 	return new Promise((resolve, reject) => {
	// 		const body = { session: sessionId, to: to, type: type, data: data };
	// 		const options = {
	// 			headers: new HttpHeaders({
	// 				Authorization: 'Basic ' + btoa('OPENVIDUAPP:' + GlobalValue.openvidu_server_secret),
	// 				'Content-Type': 'application/json'
	// 			})
	// 		};
	// 		return this.http
	// 			.post<any>(GlobalValue.openvidu_server_Url + '/api/signal', body, options)
	// 			.pipe(
	// 				catchError((error) => {
	// 					reject(error);
	// 					return observableThrowError(error);
	// 				})
	// 			)
	// 			.subscribe((response) => {
	// 				this.log.d(response);
	// 				resolve(response);
	// 			});
	// 	});
	// }

	sendSignal(sessionId: string, to: string[], type: string, data: string): Observable<any> {
		console.log('<========sendSignal service called========>');
		console.log({ session: sessionId, to: to, type: type, data: data });
		const body = JSON.stringify({ session: sessionId, to: to, type: type, data: data });
		const httpOptions = {
			headers: new HttpHeaders({
				Authorization: 'Basic ' + btoa('OPENVIDUAPP:' + this.serverInfo.secret),
				'Content-Type': 'application/json'
			})
		};

		return this.http.post(this.serverInfo.uri + '/api/signal', body, httpOptions).pipe(
			map((x: Response) => x),
			catchError((error: Response) => {
				return throwError(error);
			})
		);
	}

	startRecording(recordingConfig, ovip): Observable<any> {
		console.log('<========Recording start service called========>');
		const body = JSON.stringify(recordingConfig);
		console.log("Recording start service: " + body)
		const httpOptions = {
			headers: new HttpHeaders({
				Authorization: 'Basic ' + btoa('OPENVIDUAPP:' + GlobalValue.openvidu_server_secret),
				'Content-Type': 'application/json'
			})
		};

		return this.http.post(ovip + '/api/recordings/start', body, httpOptions).pipe(
			map((x: Response) => x),
			catchError((error: Response) => {
				return throwError(error);
			})
		);
	}

	stopRecording(recordingId): Observable<any> {
		console.log('<========Recording stop service called========>');
		const body = JSON.stringify(recordingId);	
		const httpOptions = {
			headers: new HttpHeaders({
				Authorization: 'Basic ' + btoa('OPENVIDUAPP:' + GlobalValue.openvidu_server_secret),
				'Content-Type': 'application/json'
			})
		};

		return this.http.post(this.getOpenviduServerUrl() + '/api/recordings/stop/'+recordingId, body, httpOptions).pipe(
			map((x: Response) => x),
			catchError((error: Response) => {
				return throwError(error);
			})
		);
	}
	setOpenviduServerInfo(serverInfo){
		this.serverInfo = serverInfo
	}

	getOpenviduServerUrl(){
		return this.serverInfo.uri
	}
}
