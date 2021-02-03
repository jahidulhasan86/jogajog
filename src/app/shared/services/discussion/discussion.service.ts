import { Injectable } from '@angular/core';
import { map, catchError, flatMap, mergeMap, toArray, tap, switchMap, concatMap } from 'rxjs/operators';
import { Observable, throwError, Subject, BehaviorSubject, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalValue } from '../../../global';

@Injectable({
	providedIn: 'root'
})
export class DiscussionService {
	private addNewDiscussionURL = `${GlobalValue.video_hub_Service_Url}/discussion/addNew`;
	private editDiscussionURL = `${GlobalValue.video_hub_Service_Url}/discussion/edit`;
	private deleteDiscussionURL = `${GlobalValue.video_hub_Service_Url}/discussion/delete`;
	private addReplyURL = `${GlobalValue.video_hub_Service_Url}/discussion/addReply`;
	private getByRoomIdURL = `${GlobalValue.video_hub_Service_Url}/discussion/getByRoomId?`;
	private getByRootDiscussionIdURL = `${GlobalValue.video_hub_Service_Url}/discussion/getByRootDiscussionId?`;
	private removeCommentUrl= `${GlobalValue.video_hub_Service_Url}/discussion`
	
	sUser: any;
	getByRoomId$ = new BehaviorSubject<any>(null);
	getByRoomIdCast = this.getByRoomId$.asObservable();

	isDiscussionDetailsSelected$ = new BehaviorSubject<boolean>(false);
	isDiscussionDetailsSelectedObserver = this.isDiscussionDetailsSelected$.asObservable();

	selectedDiscussion$ = new BehaviorSubject<any>(null);
	selectedDiscussionObserver = this.selectedDiscussion$.asObservable();
	discussions$ = new BehaviorSubject<any>(null);
	discussionsObserver = this.discussions$.asObservable();
	currentIndex$ = new BehaviorSubject<any>(null);
	currentIndexObserver = this.currentIndex$.asObservable();
	
	getAllReply$ = new BehaviorSubject<any>(null);
	getAllReplyCast = this.getAllReply$.asObservable();
	currentUser: any;

	constructor(private http: HttpClient) {}

	addNewDiscussion(body): Observable<any> {
		console.log('<========Add new discussion service called========>');
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				Authorization: JSON.parse(localStorage.getItem('token'))
			})
		};
		// this.addNewDiscussionURL = 'http://localhost:3600/api/v1/discussion/addNew'
		return this.http.post(this.addNewDiscussionURL, body, httpOptions).pipe(
			map((x: Response) => x),
			catchError((error: Response) => {
				return throwError(error);
			})
		);
	}

	//edit
	editDiscussion(body): Observable<any> {
		console.log('<========edit discussion service called========>');
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				Authorization: JSON.parse(localStorage.getItem('token'))
			})
		};
		// this.addNewDiscussionURL = 'http://localhost:3600/api/v1/discussion/addNew'
		return this.http.post(this.editDiscussionURL, body, httpOptions).pipe(
			map((x: Response) => x),
			catchError((error: Response) => {
				return throwError(error);
			})
		);
	}

	//delete

	deleteDiscussion(body): Observable<any> {
		console.log('<========Delete discussion service called========>');
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				Authorization: JSON.parse(localStorage.getItem('token'))
			})
		};
		// this.addNewDiscussionURL = 'http://localhost:3600/api/v1/discussion/addNew'
		return this.http.post(this.deleteDiscussionURL, body, httpOptions).pipe(
			map((x: Response) => x),
			catchError((error: Response) => {
				return throwError(error);
			})
		);
	}

	addReply(body): Observable<any> {
		console.log('<========Add reply service called========>');
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				Authorization: JSON.parse(localStorage.getItem('token'))
			})
		};

		return this.http.post(this.addReplyURL, body, httpOptions).pipe(
			map((x: Response) => x),
			catchError((error: Response) => {
				return throwError(error);
			})
		);
	}

	getByRoomId( room_id) {
		this.sUser = JSON.parse(localStorage.getItem('sessionUser'));
		console.log('<========Get By Room Id Info service called========>');
		const headers = new HttpHeaders().set('Content-Type', 'application/json');
		// this.getByRoomIdURL = 'http://localhost:3600/api/v1/discussion/getByRoomId?'
		// console.log(this.getByRoomIdURL + 'room_id=' + room_id)
		return this.http
			.get(this.getByRoomIdURL + 'room_id=' + room_id + '&token=' + this.sUser.access_token, { headers: headers })
			.pipe(
				map((meetingInfo: any) => {
					console.log(meetingInfo);
					this.getByRoomId$.next(meetingInfo)
					return meetingInfo;
				}),
				catchError((error: Response) => {
					console.log('getByRoomId error: ' + error);
					return throwError(error);
				})
			);
	}
	
	/** 
	 * root_discussion_id is the id of main discussion
	*/
	getByRootDiscussionId( root_discussion_id) {
		this.sUser = JSON.parse(localStorage.getItem('sessionUser'));
		console.log('<========Get By Root Discussion Id service called========>');
		const headers = new HttpHeaders().set('Content-Type', 'application/json');

		return this.http
			.get(this.getByRootDiscussionIdURL + 'root_discussion_id=' + root_discussion_id + '&token=' + this.sUser.access_token, { headers: headers })
			.pipe(
				map((objMainAndReplies: any) => {
					console.log(objMainAndReplies);
					this.getAllReply$.next(objMainAndReplies)
					return objMainAndReplies;
				}),
				catchError((error: Response) => {
					console.log(' getByRootDiscussionId error: ' + error);
					return throwError(error);
				})
			);
	}


	
	deleteComment(commentData) {
		this.currentUser = JSON.parse(localStorage.getItem('sessionUser'));
		console.log('<========Delete comment service called========>');
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				Authorization: JSON.parse(localStorage.getItem('token'))
			})
		};
		// let url = `${this.removeCommentUrl}/${commentData.root_discussion_id}/comments/${commentData.id}/remove`
		return this.http.post(`${this.removeCommentUrl}/${commentData.root_discussion_id}/comments/${commentData.id}/remove?token=${this.currentUser.access_token}`,httpOptions).pipe(
			map((x: any) =>{
				console.log(x)
				return x
			}),
			catchError((error: Response) => {
				return throwError(error);
			})
		);
	}


}
