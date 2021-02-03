import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GlobalValue } from '../../../global';
const uuidv1 = require('uuid/v1');

let socket;

@Injectable({
	providedIn: 'root'
})
export class BfcpFloorService {
	public floorWebsocketConnection$ = new BehaviorSubject<any>(null);
	floorWebsocketConnectionCast = this.floorWebsocketConnection$.asObservable();
	public onMessageFormFloorSocket$ = new BehaviorSubject<any>(null);
	onMessageFormFloorSocketCast = this.onMessageFormFloorSocket$.asObservable();
	public floorStatus$ = new BehaviorSubject<any>(null);
	floorStatusCast = this.floorStatus$.asObservable();

	public isCallModePtv$ = new BehaviorSubject<boolean>(false);
	isCallModePtvCast = this.isCallModePtv$.asObservable();

	public countDownValue$ = new BehaviorSubject<string>('');
	countDownValueCast = this.countDownValue$.asObservable();
	public isReleaseFloor = true;
	authUser: any;
	webSocketUrl: string;
	bfcpCurrentFloorLimit: number;
	currentCallMode: boolean;
	updateFloorUUID: boolean = false;
	transactionId: string;
	constructor() { }

	// Floor Socket
	/**
	 * Docs: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
	 * @memberof OpenViduService
	 */
	connect() {
		this.authUser = JSON.parse(localStorage.getItem('sessionUser'));
		const self = this;
		this.webSocketUrl = GlobalValue.floor_websocket_Url + '?token=' + this.authUser.access_token;

		// connect socket
		socket = new WebSocket(this.webSocketUrl);

		// const openViduService = openViduServiceRef ? openViduServiceRef : this.openViduService;
		this.floorWebsocketConnection$.next(socket); // save globally socket data;

		socket.onopen = function (e) {
			console.log('floor socket: connect');
			const data = {
				method: 'openConnection'
			};
			self.onMessageFormFloorSocket(data);
		};

		socket.onmessage = function (event) {
			const data = JSON.parse(event.data);
			console.log('floor socket: onMessage', data);

			if (data.method) {
				self.onMessageFormFloorSocket$.next(data);
			}
		};

		socket.onclose = function (event) {
			if (event.wasClean) {
				console.log('floor socket: close cleanly, code=' + event.code + ' reason=' + event.reason);
			} else {
				// e.g. server process killed or network down
				// event.code is usually 1006 in this case
				console.log('floor socket: close: Connection died - server process killed or network down');

				console.log('[close] Connection died');
			}
		};

		socket.onerror = function (error) {
			alert(`[error] `);
		};
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
		this.onMessageFormFloorSocket$.next(data);
	}

	closeConnection(reason?) {
		console.log('floor Socket: Close connection call');
		socket.close(1000, reason); // 1000 -	Normal Closure -	see docs: https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Status_codes
		// var openViduServiceRef = openViduServiceRef ? openViduServiceRef : this.openViduService;
		this.floorWebsocketConnection$.next(null); // socket connection null
	}

	createConference() {
		const meetingInfo = JSON.parse(localStorage.getItem('meetingInfo_current'));
		const sUser = JSON.parse(localStorage.getItem('sessionUser'));

		const uuid = uuidv1();
		const body = {
			jsonrpc: GlobalValue.jsonrpc_version, // must need to store global.ts file
			id: uuid,
			method: 'CreateConference',
			params: {
				conference_id: meetingInfo.id,
				// descriptions: 'This Conference create form Web Client',
				descriptions: meetingInfo.meeting_name,
				users: [sUser.id],
				maxParticipants: GlobalValue.bfcp_default_maximum_particepents,
				autoEnabledPtv: true
			}
		};

		this.isSocketOpened(JSON.stringify(body), function () {
			console.log('connection pram send! ');
		});

		// socket.send(JSON.stringify(body));
	}

	addUser() {
		// let conferenceInfo = JSON.parse(localStorage.getItem('CurrentConferenceInfo_for_ptt'));
		const meetingInfo = JSON.parse(localStorage.getItem('meetingInfo_current'));
		const sUser = JSON.parse(localStorage.getItem('sessionUser'));
		const uuid = uuidv1();
		const body = {
			jsonrpc: GlobalValue.jsonrpc_version, // must need to store global.ts file
			id: uuid,
			method: 'AddUser',
			params: {
				conference_id: meetingInfo.id,
				users: [sUser.id]
			}
		};

		this.isSocketOpened(JSON.stringify(body), function () {
			console.log('connection pram send! ');
		});
	}
	joinConference() {
		// let conferenceInfo = JSON.parse(localStorage.getItem('CurrentConferenceInfo_for_ptt'));
		const meetingInfo = JSON.parse(localStorage.getItem('meetingInfo_current'));
		const sUser = JSON.parse(localStorage.getItem('sessionUser'));

		const uuid = uuidv1();
		const body = {
			jsonrpc: GlobalValue.jsonrpc_version, // must need to store global.ts file
			id: uuid,
			method: 'JoinConference',
			params: {
				conference_id: meetingInfo.id
			}
		};

		// socket.send(JSON.stringify(body));
		this.isSocketOpened(JSON.stringify(body), function () { });
	}

	createFloor() {
		// let conferenceInfo = JSON.parse(localStorage.getItem('CurrentConferenceInfo_for_ptt'));
		const meetingInfo = JSON.parse(localStorage.getItem('meetingInfo_current'));
		const sUser = JSON.parse(localStorage.getItem('sessionUser'));
		const uuid = uuidv1();
		const body = {
			jsonrpc: GlobalValue.jsonrpc_version,
			id: uuid,
			method: 'CreateFloor',
			params: {
				conference_id: meetingInfo.id,
				floor_id: meetingInfo.id,
				user_id: sUser.id,
				limit_granted_floor: GlobalValue.bfcp_default_floor_limit_forCreateFloor
			}
		};

		// socket.send(JSON.stringify(body));
		this.isSocketOpened(JSON.stringify(body), function () { });
	}

	updateFloor(floorLimit: number, pushBody?) {
		if (pushBody) {
			delete pushBody.subcriberElem;
		}
		// let conferenceInfo = JSON.parse(localStorage.getItem('CurrentConferenceInfo_for_ptt'));
		const meetingInfo = JSON.parse(localStorage.getItem('meetingInfo_current'));
		const sUser = JSON.parse(localStorage.getItem('sessionUser'));
		const uuid = uuidv1();
		const body = {
			jsonrpc: GlobalValue.jsonrpc_version,
			id: uuid,
			method: 'UpdateFloor',
			params: {
				conference_id: meetingInfo.id,
				floor_id: meetingInfo.id,
				limit_granted_floor: floorLimit,
				pushBody: pushBody
			}
		};
		this.setUpdateFloorCallFlag(true);
		// socket.send(JSON.stringify(body))
		this.isSocketOpened(JSON.stringify(body), function () { });
	}

	requestFloor() {
		// let conferenceInfo = JSON.parse(localStorage.getItem('CurrentConferenceInfo_for_ptt'));
		const meetingInfo = JSON.parse(localStorage.getItem('meetingInfo_current'));
		const sUser = JSON.parse(localStorage.getItem('sessionUser'));

		this.isReleaseFloor = false;

		const uuid = uuidv1();
		const body = {
			jsonrpc: GlobalValue.jsonrpc_version,
			id: uuid,
			method: 'RequestFloor',
			params: {
				conference_id: meetingInfo.id,
				user_id: sUser.id,
				floor_id: meetingInfo.id
			}
		};

		// socket.send(JSON.stringify(body));
		this.isSocketOpened(JSON.stringify(body), function () { });
	}

	releaseFloor() {
		const meetingInfo = JSON.parse(localStorage.getItem('meetingInfo_current'));
		const sUser = JSON.parse(localStorage.getItem('sessionUser'));
		this.isReleaseFloor = true;
		const uuid = uuidv1();
		const body = {
			jsonrpc: GlobalValue.jsonrpc_version,
			id: uuid,
			method: 'ReleaseFloor',
			params: {
				conference_id: meetingInfo.id,
				user_id: sUser.id,
				floor_id: meetingInfo.id
			}
		};

		// socket.send(JSON.stringify(body));
		this.isSocketOpened(JSON.stringify(body), function () { });
	}

	conferenceStatus() {
		const meetingInfo = JSON.parse(localStorage.getItem('meetingInfo_current'));
		const sUser = JSON.parse(localStorage.getItem('sessionUser'));

		const uuid = uuidv1();
		const body = {
			jsonrpc: GlobalValue.jsonrpc_version,
			id: uuid,
			method: 'ConferenceStatus',
			params: {
				conference_id: meetingInfo.id
			}
		};

		// socket.send(JSON.stringify(body));
		this.isSocketOpened(JSON.stringify(body), function () { });
	}
	floorStatus() {
		const meetingInfo = JSON.parse(localStorage.getItem('meetingInfo_current'));
		const sUser = JSON.parse(localStorage.getItem('sessionUser'));

		const uuid = uuidv1();
		const body = {
			jsonrpc: GlobalValue.jsonrpc_version,
			id: uuid,
			method: 'FloorStatus',
			params: {
				conference_id: meetingInfo.id
			}
		};

		// socket.send(JSON.stringify(body));
		this.isSocketOpened(JSON.stringify(body), function () { });
	}

	/*
	 * actionType = accept/denied
	 */
	changeConferenceTypeAccept(conference_type: string) {
		// let conferenceInfo = JSON.parse(localStorage.getItem('CurrentConferenceInfo_for_ptt'));
		const meetingInfo = JSON.parse(localStorage.getItem('meetingInfo_current'));
		const sUser = JSON.parse(localStorage.getItem('sessionUser'));

		const uuid = uuidv1();
		const body = {
			jsonrpc: GlobalValue.jsonrpc_version, // must need to store global.ts file
			id: uuid,
			method: 'ChangeConferenceType',
			params: {
				conference_id: meetingInfo.id,
				conference_type: conference_type,
				action: 'accept'
			}
		};

		// socket.send(JSON.stringify(body));
		this.isSocketOpened(JSON.stringify(body), function () { });
	}
	changeConferenceTypeDenied() {
		// let conferenceInfo = JSON.parse(localStorage.getItem('CurrentConferenceInfo_for_ptt'));
		const meetingInfo = JSON.parse(localStorage.getItem('meetingInfo_current'));
		const sUser = JSON.parse(localStorage.getItem('sessionUser'));

		const uuid = uuidv1();
		const body = {
			jsonrpc: GlobalValue.jsonrpc_version, // must need to store global.ts file
			id: uuid,
			method: 'ChangeConferenceType',
			params: {
				conference_id: meetingInfo.id,
				action: 'denied'
			}
		};

		// socket.send(JSON.stringify(body));
		this.isSocketOpened(JSON.stringify(body), function () { });
	}
	setBFCPCurrentFloorLimit(floorLimit: number) {
		this.bfcpCurrentFloorLimit = floorLimit;
		// if (floorLimit === GlobalValue.bfcp_floor_limit_normalMode) {
		// 	this.setCallModePtv(false);
		// } else {
		// 	this.setCallModePtv(true);
		// }
	}

	getBFCPCurrentFloorLimit() {
		return this.bfcpCurrentFloorLimit;
	}
	setConferenceType(type: string) {
		if (type.toLowerCase() === 'ptv') {
			this.setCallModePtv(true);
		} else {
			this.setCallModePtv(false);
		}
	}
	setCallModePtv(callMode: boolean) {
		this.currentCallMode = callMode;
		this.isCallModePtv$.next(callMode);
	}

	isModePtv(): boolean {
		return this.currentCallMode;
	}

	isUpdateFloorCall(): boolean {
		return this.updateFloorUUID;
	}
	setUpdateFloorCallFlag(data: boolean) {
		this.updateFloorUUID = data;
	}

	setTransactionId(transaction_id: string) {
		this.transactionId = transaction_id;
	}

	getTransactionId() {
		return this.transactionId;
	}
}
