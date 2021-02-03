import { Injectable } from '@angular/core';
import { Observable, throwError, Subject, BehaviorSubject } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class GlobalService {
	// Current Tab
	currentTab = new BehaviorSubject(null);
	currentSelectedTab = this.currentTab.asObservable();

	// Detect Call Type
	isIncommingCall = new BehaviorSubject(false);
	isItIncommingCall = this.isIncommingCall.asObservable();

	// Detect Outgoing Call State
	ogCallState = new BehaviorSubject('Dialing..');
	ogCallStateObserver = this.ogCallState.asObservable();

	// Listen Server Status
	xmppAuth = new BehaviorSubject(false);
	xmppAuthObserver = this.xmppAuth;

	pubsubNodeServer = new BehaviorSubject(false);
	pubsubNodeServerObserver = this.pubsubNodeServer;

	notificationServer = new BehaviorSubject(false);
	notificationServerObserver = this.notificationServer;

	videoEngineServer = new BehaviorSubject(true);
	videoEngineServerObserver = this.videoEngineServer;

	serverStatusIconCUpdater = new BehaviorSubject('warn');
	serverStatusIconObserver = this.serverStatusIconCUpdater;

	public showLeftPart_WithOutMenu$ = new BehaviorSubject<boolean>(false);
	showLeftPart_WithOutMenuCast = this.showLeftPart_WithOutMenu$.asObservable();

	public sensorIntervalState$ = new BehaviorSubject<string>('start');
	sensorIntervalStateCast = this.sensorIntervalState$.asObservable();

	public show_fullScreenView$ = new BehaviorSubject<boolean>(false);
	show_fullScreenViewCast = this.show_fullScreenView$.asObservable();

	public whichFullScreenView$ = new BehaviorSubject<string>(null);
	whichFullScreenViewCast = this.whichFullScreenView$.asObservable();

	public grid_view_status$ = new BehaviorSubject<boolean>(false);
	grid_view_statusCast = this.grid_view_status$.asObservable();

	public connectionDropUpStatusShowHide$ = new BehaviorSubject<any>(null);
	connectionDropUpStatusShowHideCast = this.connectionDropUpStatusShowHide$.asObservable();

	public callScreenSideNavShowData$ = new BehaviorSubject<string>('chat');
	callScreenSideNavShowDataCast = this.callScreenSideNavShowData$.asObservable();

	constructor() {}
}
