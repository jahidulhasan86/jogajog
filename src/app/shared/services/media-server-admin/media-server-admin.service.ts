import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GlobalValue } from '../../../global';
const uuidv1 = require('uuid/v1');

let socket;

@Injectable({
	providedIn: 'root'
})
export class MediaServerAdminService {
	public onConferenceEventMessage$ = new BehaviorSubject<any>(null);
	onConferenceEventMessageObserver = this.onConferenceEventMessage$.asObservable();
	public socket$ = new BehaviorSubject<any>(null);
	socket$Observer = this.socket$.asObservable();
	authUser: any;
	webSocketUrl: string;
	constructor() { }

	connect() {
		this.authUser = JSON.parse(localStorage.getItem('sessionUser'));
		const self = this;
		this.webSocketUrl = GlobalValue.media_admin_websocket_Url + '?token=' + this.authUser.access_token;
		socket = new WebSocket(this.webSocketUrl);

		socket.onopen = function (e) {
			const data = {
				'method': 'OnSocketOpen',
			};
			self.onMessageFormFloorSocket(data);
		};

		socket.onmessage = function (event) {
			const data = JSON.parse(event.data);
			console.log('socket: onMessage', data);

			if (data.method) {
				self.onConferenceEventMessage$.next(data);
			}
		};

		socket.onclose = function (event) {
			if (event.wasClean) {
				console.log('socket: close cleanly, code=' + event.code + ' reason=' + event.reason);
			} else {
				// e.g. server process killed or network down
				// event.code is usually 1006 in this case
				console.log('socket: close: Connection died - server process killed or network down');

				console.log('[close] Connection died');
			}
		};

		socket.onerror = function (error) {
			alert(`[error] `);
		};
	}


	subcribeToEvents(events) {
		console.log('Event Subscription: fired');
		const data = {
			'jsonrpc': '2.0',
			'id': 100,
			'method': 'SubscribeEvents',
			'params': {
				'events': events
			}
		};
		this.isSocketOpened(JSON.stringify(data), function () {
			console.log('subscription pram send! ');
		});
	}

	isSocketOpened(message, callback) {
		this.waitForSession(function () {
			socket.send(message);
			if (typeof callback !== 'undefined') {
				callback();
			}
		}, 1000);
	}

	waitForSession(callback, interval) {
		if (socket.readyState === 1) {
			callback();
		} else {
			const that = this;
			// optional: implement backoff for interval here
			setTimeout(function () {
				that.waitForSession(callback, interval);
			}, interval);
		}
	}

	onMessageFormFloorSocket(data) {
		this.onConferenceEventMessage$.next(data);
	}

	closeConnection(reason?) {
		console.log('Close connection call');
		socket.close(1000, reason);
	}
}
